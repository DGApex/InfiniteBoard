import React from 'react';
import InfiniteCanvas from './components/InfiniteCanvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import StatusBar from './components/StatusBar';
import TopBar from './components/TopBar';
import ScreenshotOverlay from './components/ScreenshotOverlay';
import useStore from './store/useStore';

function App() {
    const screenshotMode = useStore((state) => state.screenshotMode);

    return (
        <div className="relative w-full h-screen bg-tech-bg overflow-hidden text-tech-text-primary font-sans selection:bg-tech-orange selection:text-black">
            <TopBar />
            <div className="pt-14">
                <Toolbar />
                <PropertiesPanel />
                <InfiniteCanvas />
                <StatusBar />
            </div>
            {screenshotMode && <ScreenshotOverlay />}
        </div>
    );
}

export default App;
