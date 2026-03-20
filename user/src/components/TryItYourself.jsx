import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Loader2, Code2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const TryItYourself = ({ defaultCode = 'print("Hello, World!")' }) => {
    const [code, setCode] = useState(defaultCode);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [pyodideInstance, setPyodideInstance] = useState(null);
    const [error, setError] = useState(null);

    // Load Pyodide script
    useEffect(() => {
        let isMounted = true;

        const loadPyodideSafely = async () => {
            // Check if already loading/loaded globally
            if (window.loadPyodide && !window.pyodide) {
                try {
                    const pyodide = await window.loadPyodide({
                        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
                    });
                    if (isMounted) {
                        setPyodideInstance(pyodide);
                        setIsLoading(false);
                    }
                } catch (err) {
                    if (isMounted) setError("Failed to load Python execution engine.");
                }
            } else if (window.pyodide) {
                if (isMounted) {
                    setPyodideInstance(window.pyodide);
                    setIsLoading(false);
                }
            } else {
                // Append script explicitly
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                script.async = true;
                script.onload = async () => {
                    try {
                        const pyodide = await window.loadPyodide({
                            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
                        });
                        window.pyodide = pyodide; // cache globally
                        if (isMounted) {
                            setPyodideInstance(pyodide);
                            setIsLoading(false);
                        }
                    } catch (err) {
                        if (isMounted) setError("Failed to initialize Python.");
                    }
                };
                script.onerror = () => {
                    if (isMounted) setError("Failed to fetch Pyodide script.");
                };
                document.body.appendChild(script);
            }
        };

        loadPyodideSafely();

        return () => { isMounted = false; };
    }, []);

    const handleRunCode = async () => {
        if (!pyodideInstance || !code.trim()) return;
        setIsRunning(true);
        setOutput('');

        try {
            // Set up stdout redirection
            pyodideInstance.setStdout({
                batched: (str) => {
                    setOutput((prev) => prev + str + '\n');
                }
            });

            await pyodideInstance.runPythonAsync(code);
            // If output is empty after successful run, show simple completion
            setOutput((prev) => prev || '✓ Execution finished with no output.\n');
        } catch (err) {
            setOutput((prev) => prev + '\n' + err.toString());
        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        setCode(defaultCode);
        setOutput('');
    };

    return (
        <div className="w-full my-6 bg-white dark:bg-[#1A202C] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#141923] border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <Code2 size={18} className="text-gray-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Example</span>
                </div>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">
                        <Loader2 size={12} className="animate-spin" /> Loading Python...
                    </div>
                ) : error ? (
                    <span className="text-xs text-red-500">{error}</span>
                ) : (
                    <button
                        onClick={handleReset}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                )}
            </div>

            {/* Code Editor Area */}
            <div className="p-4 bg-[#f8f9fa] dark:bg-[#0d1627]">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full min-h-[120px] bg-transparent font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 outline-none resize-none hide-scrollbar"
                    style={{ fontFamily: '"Fira Code", monospace' }}
                    spellCheck="false"
                />
            </div>

            {/* Actions Bar */}
            <div className="px-4 py-3 bg-white dark:bg-[#1A202C] border-t border-gray-200 dark:border-gray-800 flex items-center">
                <button
                    onClick={handleRunCode}
                    disabled={isLoading || isRunning}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Play size={16} fill="currentColor" />
                    )}
                    Try it Yourself »
                </button>
            </div>

            {/* Output Console (Only shows if there is output) */}
            {output && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-black/40 p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal size={14} className="text-gray-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Output</span>
                    </div>
                    <pre className="font-mono text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                        {output}
                    </pre>
                </motion.div>
            )}
        </div>
    );
};

export default TryItYourself;
