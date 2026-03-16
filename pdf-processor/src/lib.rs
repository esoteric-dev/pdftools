use wasm_bindgen::prelude::*;
use lopdf::{Document, Object};

#[wasm_bindgen]
pub fn process_pdf(input_bytes: &[u8]) -> Result<Vec<u8>, JsValue> {
    // Enable better error messages in the browser console
    console_error_panic_hook::set_once();

    // Load PDF from byte array
    let mut doc = Document::load_mem(input_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;

    // 1. Remove specific metadata from Document Info
    if let Some(info_id) = doc.trailer.get(b"Info").and_then(|obj| obj.as_reference()).ok() {
        if let Ok(info_dict) = doc.get_dictionary_mut(info_id) {
            info_dict.remove(b"Producer");
            info_dict.remove(b"Creator");
            info_dict.remove(b"Author");
        }
    }

    // 2. Remove XMP metadata from the Document Catalog (if any)
    if let Some(catalog_id) = doc.trailer.get(b"Root").and_then(|obj| obj.as_reference()).ok() {
        if let Ok(catalog) = doc.get_dictionary_mut(catalog_id) {
            catalog.remove(b"Metadata");
        }
    }

    // 3. "Flatten" form fields to prevent editing
    // In PDF, making form fields ReadOnly stops interaction.
    for object in doc.objects.values_mut() {
        if let Ok(dict) = object.as_dict_mut() {
            let is_widget = dict.get(b"Subtype").and_then(|s| s.as_name()).map(|n| n == b"Widget").unwrap_or(false);
            let is_field = dict.get(b"FT").is_ok();
            
            if is_widget || is_field {
                // Set the ReadOnly bit (bit 1, which corresponds to the value 1) 
                // in the Ff (Field Flags) integer.
                let flags = dict.get(b"Ff").and_then(|f| f.as_i64()).unwrap_or(0);
                dict.set("Ff", Object::Integer(flags | 1));
            }
        }
    }

    // Save modified PDF into a new byte vector
    let mut output_bytes = Vec::new();
    doc.save_to(&mut output_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(output_bytes)
}

// --- Page Organizer: Reorder, Rotate, Delete ---

use serde::Deserialize;

#[derive(Deserialize)]
struct PageOperation {
    original_index: u32, // 0-based page index from the frontend
    rotation: i32,       // 0, 90, 180, 270
    deleted: bool,
}

#[wasm_bindgen]
pub fn reorganize_pdf(input_bytes: &[u8], operations_json: &str) -> Result<Vec<u8>, JsValue> {
    console_error_panic_hook::set_once();

    // 1. Parse the operations array from JS
    let operations: Vec<PageOperation> = serde_json::from_str(operations_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid operations JSON: {}", e)))?;

    // 2. Load the original PDF
    let mut doc = Document::load_mem(input_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // 3. Get the ordered map of original pages: { page_number(1-based) -> ObjectId }
    let original_pages = doc.get_pages();

    // 4. Build new Kids array and apply rotations
    let mut new_kids: Vec<Object> = Vec::new();

    for op in &operations {
        if op.deleted {
            continue;
        }

        let page_num = op.original_index + 1; // lopdf uses 1-based page numbers

        if let Some(&page_obj_id) = original_pages.get(&page_num) {
            // Add this page reference to the new Kids list
            new_kids.push(Object::Reference(page_obj_id));

            // Apply rotation if non-zero
            if op.rotation != 0 {
                if let Ok(page_dict) = doc.get_dictionary_mut(page_obj_id) {
                    // Read existing rotation and add the new one
                    let existing_rot = page_dict
                        .get(b"Rotate")
                        .ok()
                        .and_then(|r| r.as_i64().ok())
                        .unwrap_or(0);

                    let mut final_rot = (existing_rot + op.rotation as i64) % 360;
                    if final_rot < 0 {
                        final_rot += 360;
                    }

                    page_dict.set("Rotate", Object::Integer(final_rot));
                }
            }
        }
    }

    let new_page_count = new_kids.len() as i64;

    // 5. Find the root /Pages dictionary and replace its /Kids array and /Count
    if let Some(catalog_ref) = doc
        .trailer
        .get(b"Root")
        .and_then(|obj| obj.as_reference())
        .ok()
    {
        if let Ok(catalog) = doc.get_dictionary(catalog_ref) {
            if let Some(pages_ref) = catalog
                .get(b"Pages")
                .and_then(|obj| obj.as_reference())
                .ok()
            {
                if let Ok(pages_dict) = doc.get_dictionary_mut(pages_ref) {
                    pages_dict.set("Kids", Object::Array(new_kids));
                    pages_dict.set("Count", Object::Integer(new_page_count));
                }
            }
        }
    }

    // 6. Save and return the rebuilt PDF
    let mut output_bytes = Vec::new();
    doc.save_to(&mut output_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to save reorganized PDF: {}", e)))?;

    Ok(output_bytes)
}
