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
