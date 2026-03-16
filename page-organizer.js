const { useState, useEffect, useRef, useCallback } = React;

// --- Icon Components ---
const Icons = {
    Shield: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    ),
    Upload: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
    ),
    Download: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    ),
    Rotate: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
    ),
    Trash: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
    ),
    Undo: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
    ),
    Moon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    ),
    Sun: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    ),
    GripVertical: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
    ),
};

// --- Individual Page Thumbnail Card ---
function PageCard({ page, index, onRotate, onDelete, onRestore, onDragStart, onDragOver, onDrop }) {
    return (
        <div
            draggable={!page.deleted}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
            className={`relative group rounded-xl border-2 transition-all duration-200 select-none
                ${page.deleted
                    ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-lg cursor-grab active:cursor-grabbing'
                }`}
            style={{ minWidth: 140 }}
        >
            {/* Drag Handle */}
            {!page.deleted && (
                <div className="absolute top-1 left-1 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Icons.GripVertical />
                </div>
            )}

            {/* Page Number Badge */}
            <div className="absolute top-1 right-1 bg-gray-800/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                {page.originalIndex + 1}
            </div>

            {/* Thumbnail */}
            <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden p-2">
                <img
                    src={page.thumbnailUrl}
                    alt={`Page ${page.originalIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-center gap-1 p-1.5 border-t border-gray-100 dark:border-gray-700">
                {page.deleted ? (
                    <button
                        onClick={() => onRestore(page.originalIndex)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Restore page"
                    >
                        <Icons.Undo /> Restore
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => onRotate(page.originalIndex)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Rotate 90°"
                        >
                            <Icons.Rotate /> Rotate
                        </button>
                        <button
                            onClick={() => onDelete(page.originalIndex)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Remove page"
                        >
                            <Icons.Trash /> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    const [theme, setTheme] = useState('light');
    const [isWasmLoaded, setIsWasmLoaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [pdfBytes, setPdfBytes] = useState(null);       // Original Uint8Array
    const [fileName, setFileName] = useState('');
    const [pages, setPages] = useState([]);                // Array of { originalIndex, rotation, deleted, thumbnailUrl }
    const [isRendering, setIsRendering] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

    // --- Theme ---
    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'light';
        setTheme(saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
    };

    // --- WASM Init ---
    useEffect(() => {
        const initWasm = async () => {
            try {
                await wasm_bindgen('/pdf-processor/pkg/pdf_processor_bg.wasm');
                setIsWasmLoaded(true);
            } catch (e) {
                console.error('WASM init failed:', e);
            }
        };
        initWasm();
    }, []);

    // --- Drag & Drop Handlers for File Upload ---
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            loadPdf(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            loadPdf(e.target.files[0]);
        }
    };

    // --- Load PDF and render thumbnails ---
    const loadPdf = async (file) => {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF document.');
            return;
        }

        setIsRendering(true);
        setFileName(file.name);

        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        setPdfBytes(uint8);

        try {
            const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
            const rendered = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.4 }); // Low-res thumbnails
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;

                rendered.push({
                    originalIndex: i - 1,
                    rotation: 0,
                    deleted: false,
                    thumbnailUrl: canvas.toDataURL(),
                });
            }

            setPages(rendered);
        } catch (e) {
            console.error('Failed to render PDF:', e);
            alert('Error rendering PDF. The file may be corrupted or password-protected.');
        } finally {
            setIsRendering(false);
        }
    };

    // --- Page Actions ---
    const rotatePage = (originalIndex) => {
        setPages(prev => prev.map(p =>
            p.originalIndex === originalIndex
                ? { ...p, rotation: (p.rotation + 90) % 360 }
                : p
        ));
    };

    const deletePage = (originalIndex) => {
        setPages(prev => prev.map(p =>
            p.originalIndex === originalIndex ? { ...p, deleted: true } : p
        ));
    };

    const restorePage = (originalIndex) => {
        setPages(prev => prev.map(p =>
            p.originalIndex === originalIndex ? { ...p, deleted: false } : p
        ));
    };

    // --- HTML5 Drag & Drop for Reordering ---
    const handleCardDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag image slightly transparent
        e.currentTarget.style.opacity = '0.4';
    };

    const handleCardDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropTargetIndex(index);
    };

    const handleCardDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        setPages(prev => {
            const newPages = [...prev];
            const [dragged] = newPages.splice(draggedIndex, 1);
            newPages.splice(dropIndex, 0, dragged);
            return newPages;
        });

        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    const handleCardDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    // --- Apply Changes via WASM ---
    const applyChanges = async () => {
        if (!pdfBytes || !isWasmLoaded) return;

        setIsProcessing(true);

        // Build operations array in the current visual order
        const operations = pages.map(p => ({
            original_index: p.originalIndex,
            rotation: p.rotation,
            deleted: p.deleted,
        }));

        try {
            await new Promise(r => setTimeout(r, 50)); // Yield for UI
            const { reorganize_pdf } = wasm_bindgen;
            const resultBytes = reorganize_pdf(pdfBytes, JSON.stringify(operations));

            // Trigger download
            const blob = new Blob([resultBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `organized_${fileName}`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('WASM reorganize failed:', e);
            alert('Error reorganizing PDF: ' + e);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Reset ---
    const clearWorkspace = () => {
        setPdfBytes(null);
        setFileName('');
        setPages([]);
    };

    // --- Stats ---
    const activePages = pages.filter(p => !p.deleted).length;
    const deletedPages = pages.filter(p => p.deleted).length;
    const rotatedPages = pages.filter(p => p.rotation !== 0 && !p.deleted).length;

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-darker border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 sticky top-0">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="h-16 flex items-center justify-between">
                        <a href="/" className="flex items-center gap-3 cursor-pointer">
                            <div className="text-primary"><Icons.Shield /></div>
                            <span className="font-bold text-xl tracking-tight hidden sm:block">PrivacyShield Toolkit</span>
                            <span className="hidden sm:inline-flex items-center ml-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-300 dark:border-green-800">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                Offline Mode Active
                            </span>
                        </a>
                        <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
                            <a href="/" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Home</a>
                            <a href="/security.html" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Security & Trust</a>
                            <a href="/redact.html" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Redact</a>
                            <a href="/metadata-cleaner.html" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Metadata Cleaner</a>
                            <span className="px-3 py-2 text-sm font-medium rounded-md text-primary bg-primary/10">Page Organizer</span>
                        </nav>
                        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2" aria-label="Toggle Dark Mode">
                            {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
                {/* Hero Heading */}
                <div className="bg-white dark:bg-darker border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-2">Visual PDF Page Organizer</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Drag pages to reorder, rotate individual pages by 90°, or delete pages you don't need. All processing happens locally in your browser using WebAssembly.</p>
                </div>

                {/* Workspace */}
                <div className="bg-white dark:bg-darker border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden relative min-h-[500px]">

                    {/* Processing Overlay */}
                    {(isRendering || isProcessing) && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-darker/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="font-medium text-lg animate-pulse">
                                {isRendering ? 'Rendering page thumbnails...' : 'Rebuilding PDF with WASM...'}
                            </p>
                        </div>
                    )}

                    {/* File Upload Zone */}
                    {!pdfBytes ? (
                        <div
                            className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed m-4 rounded-xl transition-all duration-200 ${dragActive ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'}`}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        >
                            <div className="text-gray-400 dark:text-gray-500 mb-4"><Icons.Upload /></div>
                            <h3 className="text-xl font-semibold mb-2">Drag & Drop a PDF Here</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center max-w-md">
                                Upload a multi-page PDF to visually reorder, rotate, or remove pages.<br/>
                                All processing happens locally. {!isWasmLoaded && "(Loading WASM Engine...)"}
                            </p>
                            <label className={`text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors shadow-sm ${!isWasmLoaded ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'}`}>
                                Browse Files
                                <input type="file" className="hidden" disabled={!isWasmLoaded} accept="application/pdf" onChange={handleFileInput} />
                            </label>
                        </div>
                    ) : (
                        /* Page Grid View */
                        <div className="flex flex-col h-full">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{fileName}</span>
                                    <span className="text-gray-500">{activePages} pages</span>
                                    {deletedPages > 0 && <span className="text-red-500">{deletedPages} removed</span>}
                                    {rotatedPages > 0 && <span className="text-blue-500">{rotatedPages} rotated</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearWorkspace}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        Upload New
                                    </button>
                                    <button
                                        onClick={applyChanges}
                                        disabled={!isWasmLoaded || isProcessing || activePages === 0}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary disabled:opacity-50 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                    >
                                        <Icons.Download /> Apply & Download
                                    </button>
                                </div>
                            </div>

                            {/* Draggable Grid */}
                            <div className="p-4 flex-1 overflow-auto">
                                <div
                                    className="grid gap-4"
                                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
                                    onDragEnd={handleCardDragEnd}
                                >
                                    {pages.map((page, index) => (
                                        <PageCard
                                            key={`${page.originalIndex}-${index}`}
                                            page={page}
                                            index={index}
                                            onRotate={rotatePage}
                                            onDelete={deletePage}
                                            onRestore={restorePage}
                                            onDragStart={handleCardDragStart}
                                            onDragOver={handleCardDragOver}
                                            onDrop={handleCardDrop}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-darker border-t border-gray-200 dark:border-gray-800 py-6 text-sm text-gray-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} PrivacyShield Toolkit. All rights reserved.</p>
                    <div className="flex items-center gap-4 font-medium">
                        <a href="/security.html" className="hover:text-primary transition-colors">How it Works</a>
                        <a href="/redact.html" className="hover:text-primary transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
