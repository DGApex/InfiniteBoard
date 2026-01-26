export const exportToImage = async (layer) => {
    if (!layer) {
        console.error("No layer provided for export");
        return;
    }

    try {
        // Calculate Bounding Box of all children
        const children = layer.getChildren();
        if (children.length === 0) {
            alert("Canvas is empty!");
            return;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        children.forEach(child => {
            const rect = child.getClientRect();
            if (rect.x < minX) minX = rect.x;
            if (rect.y < minY) minY = rect.y;
            if (rect.x + rect.width > maxX) maxX = rect.x + rect.width;
            if (rect.y + rect.height > maxY) maxY = rect.y + rect.height;
        });

        // Add some padding
        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const width = maxX - minX;
        const height = maxY - minY;

        // Generate high resolution image (300 DPI approx = pixelRatio 3 or 4)
        const dataUrl = layer.toDataURL({
            x: minX,
            y: minY,
            width: width,
            height: height,
            pixelRatio: 3,
            mimeType: 'image/png',
        });

        // Convert DataURL to binary for Tauri
        // Format: "data:image/png;base64,....."
        const base64Data = dataUrl.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Use Tauri Dialog to save
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeBinaryFile } = await import('@tauri-apps/api/fs');

        const filePath = await save({
            filters: [{ name: 'Image', extensions: ['png'] }],
            defaultPath: 'infinite-board-export.png'
        });

        if (filePath) {
            await writeBinaryFile(filePath, binaryData);
            console.log('Exported successfully to', filePath);
        }

    } catch (error) {
        console.error("Export failed:", error);
    }
};
