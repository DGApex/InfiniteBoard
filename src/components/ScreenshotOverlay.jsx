import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { Check, X, Crop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScreenshotOverlay = () => {
    const { setScreenshotMode, exportBoard, contentLayerRef } = useStore();
    const [startPos, setStartPos] = useState(null); // { x, y }
    const [currentPos, setCurrentPos] = useState(null); // { x, y }
    const [isDragging, setIsDragging] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const containerRef = useRef(null);

    // Cancel on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isExporting) return;
            if (e.key === 'Escape') {
                setScreenshotMode(false);
            }
            if (e.key === 'Enter' && startPos && currentPos) {
                handleConfirm();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [startPos, currentPos, setScreenshotMode, isExporting]);

    const handleMouseDown = (e) => {
        if (isExporting) return;
        // Left click only
        if (e.button !== 0) return;
        setStartPos({ x: e.clientX, y: e.clientY });
        setCurrentPos({ x: e.clientX, y: e.clientY });
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        // Just track current mouse position even if not dragging (for guides?)
        // But mainly for dragging
        if (isDragging) {
            setCurrentPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // If click was tiny, maybe reset? keeping it simple for now.
    };

    const handleConfirm = async () => {
        if (!startPos || !currentPos || isExporting) return;

        // Calculate screen selection rect (Global window coordinates)
        const x1 = Math.min(startPos.x, currentPos.x);
        const y1 = Math.min(startPos.y, currentPos.y);
        const x2 = Math.max(startPos.x, currentPos.x);
        const y2 = Math.max(startPos.y, currentPos.y);

        const width = x2 - x1;
        const height = y2 - y1;

        if (width < 5 || height < 5) return; // Too small

        setIsExporting(true);

        try {
            // Get the actual stage from the store ref to calculate relative position
            const stage = contentLayerRef?.getStage();
            if (!stage) {
                // Fallback if stage not found (shouldn't happen)
                throw new Error("Canvas stage not found via contentLayerRef");
            }

            const stageContainer = stage.container();
            const rect = stageContainer.getBoundingClientRect();

            // Convert window coordinates to coordinates relative to the Stage container
            // This is exactly what Konva's toDataURL expects for cropping (pixels on screen)
            const localX = x1 - rect.left;
            const localY = y1 - rect.top;

            await exportBoard({
                x: localX,
                y: localY,
                width: width,   // Send screen dimensions directly
                height: height // Send screen dimensions directly
            });

            // Wait a tiny bit so user sees it finished (optional)
            await new Promise(r => setTimeout(r, 500));
            setScreenshotMode(false);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed: " + error.message);
            // Don't close screenshot mode on error so user can try again
            setIsExporting(false);
        }
    };

    const handleCancel = () => {
        if (isExporting) return;
        setScreenshotMode(false);
    };

    // Derived logic for rendering
    const selection = startPos && currentPos ? {
        x: Math.min(startPos.x, currentPos.x),
        y: Math.min(startPos.y, currentPos.y),
        width: Math.abs(currentPos.x - startPos.x),
        height: Math.abs(currentPos.y - startPos.y)
    } : null;

    const hasValidSelection = selection && selection.width > 5 && selection.height > 5;

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] select-none ${isExporting ? 'cursor-wait' : 'cursor-crosshair'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Loading Indicator */}
            {isExporting && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <div className="text-white text-xl font-bold">Saving...</div>
                    </div>
                </div>
            )}

            {/* Dark overlay logic */}
            {/* If no selection, full darken. If selection, darken everything BUT selection via giant shadow */}
            {!hasValidSelection ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                    {!isExporting && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white text-xl font-light tracking-wide bg-black/40 px-6 py-3 rounded-full backdrop-blur-md border border-white/10"
                        >
                            Click and drag to select area
                            <div className="text-xs text-zinc-400 text-center mt-1">ESC to cancel</div>
                        </motion.div>
                    )}
                </div>
            ) : (
                <div
                    className="absolute border border-tech-orange shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                    style={{
                        left: selection.x,
                        top: selection.y,
                        width: selection.width,
                        height: selection.height,
                    }}
                >
                    {/* Dimension label */}
                    <div className="absolute -top-8 left-0 text-xs text-white bg-black/60 px-2 py-1 rounded font-mono">
                        {Math.round(selection.width)} x {Math.round(selection.height)} px
                    </div>

                    {/* Action Buttons - Positioned below or inside */}
                    {!isExporting && (
                        <div
                            className="absolute -bottom-14 right-0 flex gap-2 pointer-events-auto"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                                className="bg-zinc-800 text-white p-2 rounded-full hover:bg-zinc-700 hover:text-red-400 transition-colors border border-zinc-700 shadow-lg"
                                title="Cancel (Esc)"
                            >
                                <X size={20} />
                            </motion.button>
                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                                className="bg-tech-orange text-black p-2 rounded-full hover:bg-orange-500 transition-colors shadow-lg font-bold"
                                title="Export Selection (Enter)"
                            >
                                <Check size={20} />
                            </motion.button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScreenshotOverlay;
