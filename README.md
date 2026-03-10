<div align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25_Offline-success?style=for-the-badge" alt="Privacy First" />
  <img src="https://img.shields.io/badge/Powered_By-WebAssembly-blue?style=for-the-badge&logo=webassembly" alt="WASM" />
  
  <h1>PrivacyShield Toolkit</h1>
  <p><strong>A zero-trust, absolute-privacy browser extension providing client-side PDF Redaction and Metadata Scrubbing.</strong></p>
  
  <p>
    <a href="https://varalabs.systems">Live Web App</a> • 
    <a href="https://varalabs.systems/security.html">How It Works</a> • 
    <a href="#support-the-project">Buy Me a Coffee</a>
  </p>
</div>

---

## 🛡️ Why PrivacyShield?

Standard PDF editors and redactors claim to be secure, but most require you to upload your incredibly sensitive files (W-2s, bank statements, legal discovery maps) to cloud servers. That is a security vulnerability waiting to happen.

PrivacyShield flips the script. By leveraging **WebAssembly (Rust)** and standard browser APIs, we process every single byte of your document **locally on your machine**. 

**The Offline Guarantee:** Load the app, turn off your Wi-Fi, and process your files. We never see your data because it never leaves your sandbox.

## ⚡ Core Tools

1. **The PDF Redactor:** Permanently flattens PDFs and destroys underlying text layers to ensure blackout rectangles cannot be bypassed.
2. **The Metadata Cleaner:** Identifies EXIF data, GPS coordinates, and creator tags in images and documents, allowing you to instantly scrub them before sharing.
3. *Batch Processor:* Securely drag-and-drop up to 50 files for instant local flattening and `.zip` export.

## 🚀 Tech Stack

- **Frontend:** Vanilla JS, React (via CDN), Tailwind CSS
- **PDF Engine:** `pdf-lib` & `pdf.js`
- **Core Processor:** Rust compiled to WebAssembly (WASM)

## 🤝 Support the Project

This project is entirely free to use. Server costs to host the WASM assets and domain logic add up over time. If PrivacyShield helped you securely process important documents or saved you money on an expensive Adobe Acrobat subscription, please consider treating me to a coffee!

<a href="https://www.buymeacoffee.com/esoteric-dev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📄 License

MIT License. See `LICENSE` for details.
