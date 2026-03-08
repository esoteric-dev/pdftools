Phase 1: Week 1 – The "Privacy Shield" Launch
Don't build a complex dashboard yet. Build a high-quality Single Tool Page that acts as your temporary homepage.
The File Structure:
index.html (The Redaction Tool)
styles.css (Global styles for all future tools)
privacy.js (The logic for the redaction tool)
The "Coming Soon" Sidebar:
On your redaction page, add a sidebar or a bottom section titled "Next Week’s Tool".
Add a placeholder for "PDF Metadata Cleaner". This tells Google (and users) that the site is active and growing, which is great for SEO.
SEO Task: Submit your URL to Google Search Console immediately so Google starts indexing your "Privacy" keywords.
Phase 2: Week 2 – The Metadata Cleaner
Now you expand the structure.
Move the Homepage:
Rename your current index.html to redact.html.
Create a new index.html that serves as a Dashboard (a simple list of tools).
Add the New Tool:
Create metadata-cleaner.html.
Create metadata.js for the logic.
Internal Linking: On the redact.html page, add a button: "Done redacting? Now clean your file metadata for extra privacy." This keeps users on your site longer.
Phase 3: The Weekly Workflow
Repeat this process every 7 days. Here is a suggested schedule for the first month:
Week 3: PDF Compressor (Focus on "Secure Compression").
Week 4: Image to PDF (Focus on "Private conversion for ID cards/Passports").
Week 5: PDF Password Remover (Focus on "Unlock locally, no password sent to server").
Technical "Pro Tip" for Vercel
Since you are using Vercel, you don't need to do anything special to "add" a tool. Just:
Add the new .html file to your folder.
Update your index.html (Dashboard) with a link to the new file.
Push to GitHub. Vercel will detect the new files and update your site automatically.