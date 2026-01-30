import React, { useState } from 'react';
import useStore from '../store/useStore';
import { ZoomIn, Undo2, Redo2, Grid as GridIcon, Settings, Palette } from 'lucide-react';

const StatusBar = () => {
    const { scale, items, historyIndex, history, undo, redo, gridConfig, setGridConfig, backgroundConfig, setBackgroundConfig } = useStore();
    const [showSettings, setShowSettings] = useState(false);

    const zoomPercentage = Math.round(scale * 100);
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-3 bg-tech-panel/80 backdrop-blur-md border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-400">
            {/* Left: Object count + Grid controls */}
            <div className="flex items-center gap-4">
                <span className="font-mono font-semibold">{items.length} objects</span>

                {/* Grid visibility toggle */}
                <button
                    onClick={() => setGridConfig({ visible: !gridConfig.visible })}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${gridConfig.visible
                        ? 'bg-zinc-800 text-tech-orange'
                        : 'hover:bg-zinc-800 hover:text-tech-orange'
                        }`}
                    title="Toggle Grid (Ctrl+G)"
                >
                    <GridIcon size={16} />
                    <span className="font-mono text-xs">Grid</span>
                </button>



                {/* Snap to grid toggle */}
                <button
                    onClick={() => setGridConfig({ snapToGrid: !gridConfig.snapToGrid })}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${gridConfig.snapToGrid
                        ? 'bg-tech-orange/20 text-tech-orange'
                        : 'hover:bg-zinc-800'
                        }`}
                    title="Snap to Grid"
                >
                    <span className="font-mono text-xs">Snap</span>
                </button>

                {/* Settings toggle */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-2 py-1 rounded hover:bg-zinc-800 hover:text-tech-orange transition-colors"
                    title="Grid Settings"
                >
                    <Settings size={16} />
                </button>
            </div>

            {/* Center: Zoom control */}
            <div className="flex items-center gap-2">
                <ZoomIn size={18} className="text-zinc-500" />
                <span className="font-mono text-tech-orange font-bold text-base">{zoomPercentage}%</span>
            </div>

            {/* Right: Undo/Redo state */}
            <div className="flex items-center gap-3">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${canUndo
                        ? 'hover:bg-zinc-800 hover:text-tech-orange cursor-pointer'
                        : 'opacity-30 cursor-not-allowed'
                        }`}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={16} />
                    <span className="font-mono text-xs">Ctrl+Z</span>
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${canRedo
                        ? 'hover:bg-zinc-800 hover:text-tech-orange cursor-pointer'
                        : 'opacity-30 cursor-not-allowed'
                        }`}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 size={16} />
                    <span className="font-mono text-xs">Ctrl+Shift+Z</span>
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="fixed bottom-16 left-6 z-50 p-4 bg-tech-panel border border-zinc-800 rounded-lg shadow-neon-orange min-w-64">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Grid & Background Settings</h3>

                        {/* Grid Spacing */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-400">Grid Spacing: {gridConfig.spacing}px</label>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                value={gridConfig.spacing}
                                onChange={(e) => setGridConfig({ spacing: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        {/* Grid Opacity */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-400">Grid Opacity: {Math.round(gridConfig.opacity * 100)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={gridConfig.opacity * 100}
                                onChange={(e) => setGridConfig({ opacity: parseInt(e.target.value) / 100 })}
                                className="w-full"
                            />
                        </div>

                        {/* Background Color */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-zinc-400">Background Color</label>
                            <input
                                type="color"
                                value={backgroundConfig.color}
                                onChange={(e) => setBackgroundConfig({ color: e.target.value })}
                                className="w-full h-8 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusBar;
