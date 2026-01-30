import React from 'react';
import useStore from '../store/useStore';
import { Square, Palette, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const COLORS = [
    { name: 'Yellow', value: '#ffd700' },
    { name: 'Orange', value: '#ff9f43' },
    { name: 'Blue', value: '#54a0ff' },
    { name: 'Green', value: '#1dd1a1' },
    { name: 'Pink', value: '#ff9ff3' },
    { name: 'White', value: '#ffffff' },
];

const DEFAULT_FONTS = [
    { name: 'Sans Serif', value: 'sans-serif' },
    { name: 'Serif', value: 'serif' },
    { name: 'Monospace', value: 'monospace' },
    { name: 'Handwritten', value: 'cursive' },
    { name: 'Display', value: 'fantasy' }
];

const PropertiesPanel = () => {
    const { items, updateItem, selectedIds } = useStore();
    const [fonts, setFonts] = React.useState(DEFAULT_FONTS);

    // Load local fonts
    React.useEffect(() => {
        const loadFonts = async () => {
            if ('queryLocalFonts' in window) {
                try {
                    // Request permission and get fonts
                    const localFonts = await window.queryLocalFonts();

                    // Filter duplicates and create options
                    const uniqueFonts = [...new Set(localFonts.map(f => f.family))];
                    const fontOptions = uniqueFonts.map(family => ({
                        name: family,
                        value: family
                    })).sort((a, b) => a.name.localeCompare(b.name));

                    setFonts([...DEFAULT_FONTS, { name: '--- Local Fonts ---', value: 'disabled', disabled: true }, ...fontOptions]);
                } catch (err) {
                    console.log('Local fonts access denied or failed:', err);
                }
            }
        };

        // Try to load fonts automatically
        loadFonts();
    }, []);

    const handleLoadLocalFonts = async () => {
        if ('queryLocalFonts' in window) {
            try {
                const localFonts = await window.queryLocalFonts();
                const uniqueFonts = [...new Set(localFonts.map(f => f.family))];
                const fontOptions = uniqueFonts.map(family => ({
                    name: family,
                    value: family
                })).sort((a, b) => a.name.localeCompare(b.name));
                setFonts([...DEFAULT_FONTS, { name: '--- Local Fonts ---', value: 'disabled', disabled: true }, ...fontOptions]);
            } catch (err) {
                console.error('Failed to load fonts:', err);
                alert('Could not load local fonts. Permission may be denied.');
            }
        } else {
            alert('Your browser does not support loading local fonts.');
        }
    };

    // For multi-select, show properties of first selected item
    const selectedId = selectedIds[0] || null;
    const selectedItem = items.find(item => item.id === selectedId);

    if (!selectedItem) return null;

    const isText = selectedItem.type === 'text';
    const isSticky = selectedItem.type === 'sticky';
    const isShape = ['rect', 'circle'].includes(selectedItem.type);

    // Support text properties for both Text and Sticky Notes
    const hasText = isText || isSticky;

    const handleColorChange = (color) => {
        updateItem(selectedId, { color });
    };

    return (
        <div className="fixed top-24 right-6 z-50 w-64 p-4 bg-[#1e1e1e]/90 backdrop-blur-sm border border-[#333] rounded-lg shadow-xl flex flex-col gap-4 animate-in slide-in-from-right-10 fade-in duration-300">
            <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wider border-b border-[#333] pb-2 mb-1 flex items-center gap-2">
                <Palette size={16} /> Properties
            </h3>

            {/* Typography Section - for Text and Sticky Notes */}
            {hasText && (
                <div className="flex flex-col gap-4 mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase">
                        <Type size={14} /> Typography
                    </div>

                    {/* Size & Color */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Size</label>
                            <input
                                type="number"
                                min="8"
                                max="200"
                                value={selectedItem.fontSize || 16}
                                onChange={(e) => updateItem(selectedId, { fontSize: parseInt(e.target.value) })}
                                className="w-full bg-[#333] border border-[#444] rounded px-2 py-1 text-white text-sm focus:border-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                            <div className="flex items-center h-[30px]">
                                <input
                                    type="color"
                                    value={selectedItem.fill || '#333333'}
                                    onChange={(e) => updateItem(selectedId, { fill: e.target.value })}
                                    className="w-full h-full cursor-pointer rounded bg-transparent border border-[#444]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Font Family */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-gray-500">Font Family</label>
                            {'queryLocalFonts' in window && fonts.length === DEFAULT_FONTS.length && (
                                <button
                                    onClick={handleLoadLocalFonts}
                                    className="text-[10px] text-orange-500 hover:text-orange-400 underline"
                                >
                                    Load System Fonts
                                </button>
                            )}
                        </div>
                        <select
                            value={selectedItem.fontFamily || 'sans-serif'}
                            onChange={(e) => updateItem(selectedId, { fontFamily: e.target.value })}
                            className="w-full bg-[#333] border border-[#444] rounded px-2 py-1 text-white text-sm focus:border-orange-500 outline-none"
                        >
                            {fonts.map(font => (
                                <option
                                    key={font.value}
                                    value={font.value}
                                    disabled={font.disabled}
                                    style={font.disabled ? { color: '#666', fontStyle: 'italic' } : { fontFamily: font.value }}
                                >
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Alignment */}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Alignment</label>
                        <div className="flex bg-[#333] rounded border border-[#444] p-1 gap-1">
                            {['left', 'center', 'right'].map(align => (
                                <button
                                    key={align}
                                    onClick={() => updateItem(selectedId, { align })}
                                    className={`flex-1 py-1 flex justify-center rounded hover:bg-[#444] ${selectedItem.align === align ? 'bg-[#444] text-orange-500' : 'text-gray-400'}`}
                                    title={`Align ${align}`}
                                >
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Note Color */}
            {isSticky && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#333]">
                    <label className="text-xs text-gray-400">Note Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => handleColorChange(c.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedItem.color === c.value ? 'border-orange-500' : 'border-transparent'}`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Shape Properties */}
            {isShape && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Fill Color</label>
                        <input
                            type="color"
                            value={selectedItem.fill || '#ffffff'}
                            onChange={(e) => updateItem(selectedId, { fill: e.target.value })}
                            className="w-full h-8 cursor-pointer rounded bg-transparent border border-[#444]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Stroke Color</label>
                        <input
                            type="color"
                            value={selectedItem.stroke || '#000000'}
                            onChange={(e) => updateItem(selectedId, { stroke: e.target.value })}
                            className="w-full h-8 cursor-pointer rounded bg-transparent border border-[#444]"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Stroke Width: {selectedItem.strokeWidth || 0}px</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={selectedItem.strokeWidth || 0}
                            onChange={(e) => updateItem(selectedId, { strokeWidth: parseInt(e.target.value) })}
                            className="w-full accent-orange-500 h-2 bg-[#444] rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {/* Coordinates info */}
            <div className="text-[10px] text-gray-600 font-mono mt-2 pt-2 border-t border-[#333]">
                ID: {selectedItem.id.slice(0, 8)}...<br />
                Type: {selectedItem.type}
            </div>
        </div>
    );
};

export default PropertiesPanel;
