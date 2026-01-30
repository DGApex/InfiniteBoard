import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Settings } from 'lucide-react';
import useStore from '../store/useStore';
import appIcon from '../assets/logo-icon.png';
import SettingsModal from './SettingsModal';

const TopBarButton = ({ icon, label, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 107, 0, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-zinc-400 hover:text-tech-orange transition-colors duration-200"
        title={label}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </motion.button>
);

const TopBar = () => {
    const { saveBoard, loadBoard } = useStore();
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 h-14 px-6 py-2 bg-tech-panel/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between">
                {/* Left: Icon + Brand Name */}
                <div className="flex items-center gap-3">
                    <img
                        src={appIcon}
                        alt="InfiniteBoard Icon"
                        className="w-8 h-8 object-contain"
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-zinc-200">Infinity</span>
                        <span className="text-lg font-bold text-tech-orange">Board</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <TopBarButton
                        icon={<FileText size={16} />}
                        label="Save"
                        onClick={saveBoard}
                    />
                    <TopBarButton
                        icon={<FileText size={16} />}
                        label="Load"
                        onClick={loadBoard}
                    />
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </>
    );
};

export default TopBar;
