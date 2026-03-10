const { useState, useEffect, useRef } = React;

// --- UI Icons (Inline SVGs) ---
const Icons = {
    Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-yellow-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const App = () => {
    const [theme, setTheme] = useState('light');
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [rawExif, setRawExif] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [cleanDataUrl, setCleanDataUrl] = useState(null);
    const [isPdf, setIsPdf] = useState(false);
    const [isWasmLoaded, setIsWasmLoaded] = useState(false);
    const [batchProgress, setBatchProgress] = useState(null);

    // --- Theme Initialization ---
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.className = storedTheme;
        document.body.className = storedTheme === 'dark' ? 'bg-dark text-gray-100' : 'bg-gray-50 text-gray-900';
    }, []);

    // --- WASM Initialization ---
    useEffect(() => {
        async function loadWasm() {
            try {
                // Initialize the globally injected `wasm_bindgen` function and point to the .wasm file 
                await wasm_bindgen('./pdf-processor/pkg/pdf_processor_bg.wasm');
                setIsWasmLoaded(true);
            } catch (err) {
                console.error("Failed to load WASM module:", err);
            }
        }
        loadWasm();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.className = newTheme;
        document.body.className = newTheme === 'dark' ? 'bg-dark text-gray-100' : 'bg-gray-50 text-gray-900';
    };

    // --- File Handling ---
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (fileList) => {
        if (fileList.length === 1) {
            processFile(fileList[0]);
        } else {
            processBatchFiles(fileList);
        }
    };

    const clearWorkspace = () => {
        setFile(null);
        setFileName('');
        setImageUrl(null);
        setRawExif({});
        setCleanDataUrl(null);
        setIsPdf(false);
    };

    const processFile = async (droppedFile) => {
        const type = droppedFile.type;
        if (type === 'application/pdf') {
            setIsPdf(true);
            processPdf(droppedFile);
            return;
        } else if (!type.startsWith('image/')) {
            alert('Please upload a valid Image (JPG/PNG) or PDF Document.');
            return;
        }

        setIsPdf(false);
        setIsProcessing(true);
        setFileName(droppedFile.name);
        setFile(droppedFile);

        const url = URL.createObjectURL(droppedFile);
        setImageUrl(url);

        // Read EXIF data first
        EXIF.getData(droppedFile, function() {
            const allMetaData = EXIF.getAllTags(this);
            // filter out massive non-readable chunks like thumbnail data if present
            const metadataToDisplay = {};
            for (let key in allMetaData) {
                if (key !== 'thumbnail' && typeof allMetaData[key] !== 'object' || Array.isArray(allMetaData[key])) {
                     metadataToDisplay[key] = String(allMetaData[key]);
                }
            }
            setRawExif(metadataToDisplay);
            
            // Immediately strip EXIF by re-rendering to Canvas
            stripMetadata(url);
        });
    };

    const stripMetadata = (sourceUrl) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Generating new data URL drops all original EXIF
            const cleanUrl = canvas.toDataURL('image/jpeg', 0.95);
            setCleanDataUrl(cleanUrl);
            setIsProcessing(false);
        };
        img.src = sourceUrl;
    };

    const processPdf = async (pdfFile) => {
        setIsProcessing(true);
        setFileName(pdfFile.name);
        setFile(pdfFile);
        
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            
            // 1. Extract real metadata using PDF-lib before scrubbing
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { updateMetadata: false });
            
            const extractedData = {};
            const title = pdfDoc.getTitle();
            const author = pdfDoc.getAuthor();
            const subject = pdfDoc.getSubject();
            const creator = pdfDoc.getCreator();
            const producer = pdfDoc.getProducer();
            
            if (title) extractedData['Title'] = title;
            if (author) extractedData['Author'] = author;
            if (subject) extractedData['Subject'] = subject;
            if (creator) extractedData['Creator'] = creator;
            if (producer) extractedData['Producer'] = producer;

            // Optional: Count form fields or annotations as "Interactive Elements"
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            if (fields.length > 0) {
                extractedData['Interactive Fields'] = `${fields.length} form inputs detected.`;
            }

            setRawExif(extractedData);

            // 2. Call into Rust WASM safely using the global export to actually scrub the file
            const uint8Array = new Uint8Array(arrayBuffer);
            const { process_pdf } = wasm_bindgen;
            const safeBytes = process_pdf(uint8Array);
            
            const blob = new Blob([safeBytes], { type: 'application/pdf' });
            const cleanUrl = URL.createObjectURL(blob);
            setCleanDataUrl(cleanUrl);
            
        } catch (e) {
            console.error(e);
            alert("Error processing PDF. The file may be corrupted or encrypted.");
        } finally {
            setIsProcessing(false);
        }
    };

    const processBatchFiles = async (fileList) => {
        setIsProcessing(true);
        setBatchProgress({ current: 0, total: fileList.length, active: true });
        
        const zip = new JSZip();
        let successCount = 0;

        for (let i = 0; i < fileList.length; i++) {
            const currentFile = fileList[i];
            setBatchProgress(prev => ({ ...prev, current: i + 1 }));
            
            // Allow React UI to render
            await new Promise(r => setTimeout(r, 50));
            
            try {
                if (currentFile.type === 'application/pdf') {
                    const arrayBuffer = await currentFile.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const { process_pdf } = wasm_bindgen;
                    const safeBytes = process_pdf(uint8Array);
                    zip.file(`scrubbed_${currentFile.name}`, safeBytes);
                    successCount++;
                } else if (currentFile.type.startsWith('image/')) {
                    const url = URL.createObjectURL(currentFile);
                    const dataUrl = await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/jpeg', 0.95));
                        };
                        img.onerror = reject;
                        img.src = url;
                    });
                    
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    zip.file(`scrubbed_${currentFile.name.split('.')[0]}.jpg`, blob);
                    successCount++;
                }
            } catch (e) {
                console.error(`Failed to process ${currentFile.name}`, e);
            }
        }
        
        if (successCount > 0) {
            setBatchProgress(prev => ({ ...prev, generatingZip: true }));
            await new Promise(r => setTimeout(r, 50)); 
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            
            setCleanDataUrl(zipUrl);
            setIsPdf(false);
            setFileName(`Batch_${successCount}_files`);
            setRawExif({
                'Batch Processing': `${successCount} files securely scrubbed and zipped.`,
                'Method': 'Client-side WebAssembly & Canvas (0 bytes sent to server)'
            });
            setImageUrl(zipUrl); // Bypass !imageUrl check
        } else {
            alert('Failed to process any files.');
        }
        
        setIsProcessing(false);
        setBatchProgress(null);
    };

    // --- Export Logic ---
    const downloadSecuredFile = () => {
        if (!cleanDataUrl) return;
        const link = document.createElement('a');
        link.href = cleanDataUrl;
        
        if (fileName.startsWith('Batch_')) {
            link.download = `${fileName}.zip`;
        } else {
            link.download = `scrubbed_${fileName.split('.')[0]}.${isPdf ? 'pdf' : 'jpg'}`;
        }
        link.click();
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-darker border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <a href="/" className="flex items-center gap-3 cursor-pointer">
                            <div className="text-primary"><Icons.Shield /></div>
                            <span className="font-bold text-xl tracking-tight hidden sm:block">PrivacyShield Toolkit</span>
                            
                            {/* Updated Badge as per AdSense E-E-A-T suggestion */}
                            <span className="hidden sm:inline-flex items-center ml-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-300 dark:border-green-800">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                Offline Mode Active: Files are processed 100% on your device
                            </span>
                        </a>
                        
                        {/* Navigation Menu */}
                        <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
                            <a href="/" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Home Toolkit</a>
                            <a href="/security.html" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Security & Trust</a>
                            <a href="/redact.html" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Redact Tool</a>
                            <span className="px-3 py-2 text-sm font-medium rounded-md text-primary bg-primary/10">Metadata Cleaner</span>
                        </nav>

                        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2" aria-label="Toggle Dark Mode">
                            {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Top Ad Banner Container */}
            <div className="max-w-7xl mx-auto w-full px-4 pt-6">
                <div className="w-full h-24 bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium">
                    Ad Container (Top Banner) - Insert Google AdSense Script Here
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
                
                {/* Dynamic View Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="bg-white dark:bg-darker border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h1 className="text-2xl font-bold mb-2">Bank-Grade Privacy Scrubber: Metadata Removal for Law & Finance</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Designed directly for legal, banking, and financial professionals. Ensure total compliance by safely removing EXIF data, GPS coordinates, and privacy-leaking PDF metadata. All scrubbing happens instantly and securely within your local browser—no uploads required.</p>
                    </div>

                    <div className="flex-1 bg-white dark:bg-darker border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-darker/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
                                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                                <p className="font-medium text-lg animate-pulse mb-4">Analyzing File Data...</p>
                                {batchProgress && (
                                    <div className="w-full max-w-sm">
                                        <div className="flex justify-between text-sm mb-1 font-semibold text-primary">
                                            <span>{batchProgress.generatingZip ? 'Zipping files...' : 'Scrubbing Batch...'}</span>
                                            <span>{batchProgress.current} / {batchProgress.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden border border-gray-300 dark:border-gray-600">
                                            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!(file || imageUrl) ? (
                            <div 
                                className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed m-4 rounded-xl transition-all duration-200 ${dragActive ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'}`}
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            >
                                <div className="text-gray-400 dark:text-gray-500 mb-4"><Icons.Upload /></div>
                                <h3 className="text-xl font-semibold mb-2">Drag & Drop Image Here</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center max-w-md">
                                    Supports JPG, PNG, and PDF. <br/>
                                    All processing happens locally in your browser. { !isWasmLoaded && "(Loading WASM Engine...)" }
                                </p>
                                <label className={`text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors shadow-sm ${!isWasmLoaded ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-emerald-600'}`}>
                                    Browse Files
                                    <input type="file" className="hidden" disabled={!isWasmLoaded} multiple accept="image/jpeg,image/png,application/pdf" onChange={handleFileInput} />
                                </label>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/2 p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center bg-gray-50 dark:bg-gray-900/50 justify-center">
                                    <h4 className="font-semibold mb-4 w-full text-left">Original File preview</h4>
                                    {fileName.startsWith('Batch_') ? (
                                        <div className="w-full h-full min-h-[300px] border-2 border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-center shadow-inner bg-white dark:bg-slate-900 border-dashed">
                                            <div className="text-primary mb-4 scale-150"><Icons.Shield /></div>
                                            <p className="font-medium text-lg text-slate-700 dark:text-slate-300 break-words max-w-[90%]">{fileName}.zip</p>
                                            <p className="text-sm mt-2 opacity-60 text-slate-500">Batch Archive Ready for Download.</p>
                                        </div>
                                    ) : isPdf ? (
                                        <div className="w-full h-full min-h-[300px] border-2 border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-center shadow-inner bg-white dark:bg-slate-900">
                                            <div className="text-red-500 mb-4 scale-150"><Icons.Upload /></div>
                                            <p className="font-medium text-lg text-slate-700 dark:text-slate-300 break-words max-w-[90%]">{fileName}</p>
                                            <p className="text-sm mt-2 opacity-60 text-slate-500">PDF Document selected for cleaning.</p>
                                        </div>
                                    ) : (
                                        <img src={imageUrl} className="max-h-[400px] w-auto drop-shadow-lg rounded-md border border-gray-300 dark:border-gray-700 object-contain" />
                                    )}
                                </div>
                                
                                <div className="w-full md:w-1/2 p-6 flex flex-col">
                                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                                        <h4 className="font-bold text-lg">Detected Private Data</h4>
                                        <button onClick={clearWorkspace} className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"><Icons.X /> Close</button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                                        {Object.keys(rawExif).length > 0 ? (
                                            <div>
                                                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 mb-4 font-semibold text-sm bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                                                    <Icons.Alert /> Warning: Found {Object.keys(rawExif).length} pieces of hidden metadata!
                                                </div>
                                                <ul className="text-sm space-y-2">
                                                    {Object.entries(rawExif).map(([key, value]) => (
                                                        <li key={key} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                                            <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                                                            <span className="text-gray-500 font-mono text-xs w-full sm:w-1/2 break-words sm:text-right">{value}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                                    <Icons.Check />
                                                </div>
                                                <h5 className="font-semibold">No metadata found</h5>
                                                <p className="text-sm text-gray-500 mt-1">This file appears to be clean already, but we will still generate a new sanitized version to be safe.</p>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={downloadSecuredFile} disabled={!cleanDataUrl} className="w-full bg-primary disabled:opacity-50 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                                        <Icons.Download /> {fileName.startsWith('Batch_') ? 'Download Batch ZIP' : (isPdf ? 'Download Cleaned PDF' : 'Download Cleaned Image')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Ad Container */}
                <div className="hidden lg:flex flex-col w-[300px] gap-6 flex-shrink-0">
                    <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium p-6 text-center sticky top-24">
                        <span>Ad Container (Sidebar)</span>
                        <span className="text-xs mt-2 opacity-70">Insert Google AdSense Script Here (e.g. 300x600 Half-page ad)</span>
                    </div>
                </div>

            </main>

            {/* Ad-Ready Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-sm text-gray-500 mt-auto bg-white dark:bg-darker">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} PrivacyShield Toolkit. All rights reserved.</p>
                    <div className="flex items-center gap-4 font-medium">
                        <a href="/security.html" className="hover:text-primary transition-colors">How it Works</a>
                        <a href="/redact.html#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="/redact.html#terms" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="/redact.html#contact" className="hover:text-primary transition-colors">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
