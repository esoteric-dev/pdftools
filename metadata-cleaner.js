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

    // --- Theme Initialization ---
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.className = storedTheme;
        document.body.className = storedTheme === 'dark' ? 'bg-dark text-gray-100' : 'bg-gray-50 text-gray-900';
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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const clearWorkspace = () => {
        setFile(null);
        setFileName('');
        setImageUrl(null);
        setRawExif({});
        setCleanDataUrl(null);
    };

    const processFile = async (droppedFile) => {
        const type = droppedFile.type;
        if (!type.startsWith('image/')) {
            alert('Please upload a valid Image (JPG/PNG).');
            return;
        }

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

    // --- Export Logic ---
    const downloadSecuredFile = () => {
        if (!cleanDataUrl) return;
        const link = document.createElement('a');
        link.href = cleanDataUrl;
        link.download = `scrubbed_${fileName.split('.')[0]}.jpg`;
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
                            <h1 className="font-bold text-xl tracking-tight hidden sm:block">PrivacyShield Toolkit</h1>
                            
                            {/* Updated Badge as per AdSense E-E-A-T suggestion */}
                            <span className="hidden sm:inline-flex items-center ml-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-300 dark:border-green-800">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                Offline Mode Active: Files are processed 100% on your device
                            </span>
                        </a>
                        
                        {/* Navigation Menu */}
                        <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
                            <a href="/" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Home Toolkit</a>
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
                        <h2 className="text-2xl font-bold mb-2">Metadata & GPS Cleaner</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Perfect for real estate agents. Automatically remove EXIF data, GPS coordinates, and camera info from your photos before public upload. Evaluated instantly inside your browser.</p>
                    </div>

                    <div className="flex-1 bg-white dark:bg-darker border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-darker/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                                <p className="font-medium text-lg animate-pulse">Analyzing Image Data...</p>
                            </div>
                        )}

                        {!imageUrl ? (
                            <div 
                                className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed m-4 rounded-xl transition-all duration-200 ${dragActive ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'}`}
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            >
                                <div className="text-gray-400 dark:text-gray-500 mb-4"><Icons.Upload /></div>
                                <h3 className="text-xl font-semibold mb-2">Drag & Drop Image Here</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center max-w-md">
                                    Supports JPG and PNG. <br/>
                                    All processing happens locally in your browser.
                                </p>
                                <label className="bg-primary hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors shadow-sm">
                                    Browse Image
                                    <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileInput} />
                                </label>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/2 p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center bg-gray-50 dark:bg-gray-900/50 justify-center">
                                    <h4 className="font-semibold mb-4 w-full text-left">Original Image preview</h4>
                                    <img src={imageUrl} className="max-h-[400px] w-auto drop-shadow-lg rounded-md border border-gray-300 dark:border-gray-700 object-contain" />
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
                                                <h5 className="font-semibold">No EXIF data found</h5>
                                                <p className="text-sm text-gray-500 mt-1">This image appears to be clean already, but we will still generate a new sanitized file to be safe.</p>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={downloadSecuredFile} disabled={!cleanDataUrl} className="w-full bg-primary disabled:opacity-50 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                                        <Icons.Download /> Download Cleaned Image
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
