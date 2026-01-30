import { create } from 'zustand';
import logoIcon from '../assets/logo-icon.png';

const MAX_HISTORY = 50;

const useStore = create((set, get) => ({
  items: [],
  selectedIds: [], // Multi-select support
  groups: [], // { id, itemIds: [], name: 'Group 1' }
  activeTool: 'pointer',
  drawingConfig: { stroke: '#FF6B00', strokeWidth: 3 }, // Drawing tool settings
  screenshotMode: false, // Screenshot selection mode
  screenshotArea: null, // { x1, y1, x2, y2 } for screenshot selection

  // Panel Creator Global State
  panelCreatorOpen: false,
  panelCreatorReferenceImage: null, // Base64 string from "Use as Reference"

  gridConfig: {
    enabled: true,
    visible: true,
    type: 'lines', // Only 'lines' (hatch) supported for better performance
    spacing: 50,
    color: '#444444',
    opacity: 0.3,
    snapToGrid: false,
  },
  backgroundConfig: {
    type: 'color', // 'color' | 'pattern' | 'none'
    color: '#1a1a1a',
    pattern: null,
  },
  scale: 1,
  position: { x: 0, y: 0 },
  stageSize: { width: window.innerWidth, height: window.innerHeight },
  contentLayerRef: null,

  // History for undo/redo
  history: [{ items: [], timestamp: Date.now() }],
  historyIndex: 0,

  // Helper to push to history
  pushHistory: () => {
    const state = get();
    const snapshot = {
      items: JSON.parse(JSON.stringify(state.items)), // Deep clone
      timestamp: Date.now()
    };

    // Remove any "future" history if we're in the middle
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);

    // Limit history size
    const limitedHistory = newHistory.slice(-MAX_HISTORY);

    set({
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1
    });
  },

  // Actions
  addItem: (item) => {
    const state = get();
    state.pushHistory();
    set({ items: [...state.items, item] });
  },

  updateItem: (id, updates) => {
    const state = get();

    // Check if item is in a group
    const group = state.groups.find(g => g.itemIds.includes(id));

    // Determine if this is a "significant" change for history
    const isContentChange = updates.content !== undefined || updates.color !== undefined ||
      updates.fill !== undefined || updates.fontSize !== undefined;
    const isPositionChange = updates.x !== undefined || updates.y !== undefined;

    // Push history only for significant changes or if it's a group move
    // Note: onDragEnd calls updateItem once, so this is safe for drag operations
    if (isContentChange || isPositionChange) {
      state.pushHistory();
    }

    if (group && isPositionChange) {
      // Calculate delta for position changes
      const item = state.items.find(i => i.id === id);
      const dx = updates.x !== undefined ? updates.x - item.x : 0;
      const dy = updates.y !== undefined ? updates.y - item.y : 0;

      // Update all items in the group
      set({
        items: state.items.map(item => {
          if (group.itemIds.includes(item.id)) {
            return {
              ...item,
              x: item.x + dx,
              y: item.y + dy,
            };
          }
          return item;
        })
      });
    } else {
      // Normal update for non-grouped items or non-position updates
      set({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      });
    }
  },

  removeItem: (id) => {
    const state = get();
    state.pushHistory();
    set({
      items: state.items.filter((item) => item.id !== id),
      selectedIds: state.selectedIds.filter(sid => sid !== id)
    });
  },

  // Undo/Redo
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      set({
        items: JSON.parse(JSON.stringify(snapshot.items)),
        historyIndex: newIndex
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      set({
        items: JSON.parse(JSON.stringify(snapshot.items)),
        historyIndex: newIndex
      });
    }
  },

  selectItem: (id, shiftKey = false) => {
    const state = get();
    if (!id) {
      set({ selectedIds: [] }); // Deselect all
    } else if (shiftKey) {
      // Toggle selection with Shift
      const isSelected = state.selectedIds.includes(id);
      set({
        selectedIds: isSelected
          ? state.selectedIds.filter(sid => sid !== id)
          : [...state.selectedIds, id]
      });
    } else {
      // Check if item is in a group
      const group = state.groups.find(g => g.itemIds.includes(id));
      if (group) {
        // Select all items in the group
        set({ selectedIds: [...group.itemIds] });
      } else {
        // Single selection
        set({ selectedIds: [id] });
      }
    }
  },

  setTool: (tool) => set({
    activeTool: tool,
    selectedIds: []
  }),

  setDrawingConfig: (config) => set((state) => ({
    drawingConfig: { ...state.drawingConfig, ...config }
  })),

  setGridConfig: (config) => set((state) => ({
    gridConfig: { ...state.gridConfig, ...config }
  })),

  setBackgroundConfig: (config) => set((state) => ({
    backgroundConfig: { ...state.backgroundConfig, ...config }
  })),

  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setStageSize: (width, height) => set({ stageSize: { width, height } }),
  setContentLayerRef: (ref) => set({ contentLayerRef: ref }),

  // Screenshot mode actions
  setScreenshotMode: (enabled) => set({ screenshotMode: enabled, screenshotArea: null }),
  setScreenshotArea: (area) => set({ screenshotArea: area }),

  // Panel Creator Actions
  setPanelCreatorOpen: (isOpen) => set({ panelCreatorOpen: isOpen }),
  setPanelCreatorReferenceImage: (image) => set({ panelCreatorReferenceImage: image }),

  saveBoard: async () => {
    try {
      // Prompt for filename
      const defaultName = `infiniteboard-${new Date().toISOString().slice(0, 10)}`;
      const filename = prompt('Enter filename:', defaultName);

      if (!filename) return; // User cancelled

      const state = get();
      const data = {
        scale: state.scale,
        position: state.position,
        items: state.items,
        gridConfig: state.gridConfig,
        backgroundConfig: state.backgroundConfig,
      };
      const jsonData = JSON.stringify(data, null, 2);

      // Check if we're in Tauri or web mode
      if (window.__TAURI__) {
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeTextFile } = await import('@tauri-apps/api/fs');

        const filePath = await save({
          defaultPath: filename.endsWith('.json') ? filename : `${filename}.json`,
          filters: [{ name: 'InfiniteBoard', extensions: ['json'] }],
        });

        if (filePath) {
          await writeTextFile(filePath, jsonData);
          alert('Board saved successfully!');
        }
      } else {
        // Web fallback: download as file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to save board:', error);
      alert('Failed to save board: ' + error.message);
    }
  },

  loadBoard: async () => {
    try {
      if (window.__TAURI__) {
        const { open } = await import('@tauri-apps/api/dialog');
        const { readTextFile } = await import('@tauri-apps/api/fs');

        const filePath = await open({
          filters: [{ name: 'InfiniteBoard', extensions: ['json'] }],
        });

        if (filePath && typeof filePath === 'string') {
          const content = await readTextFile(filePath);
          const data = JSON.parse(content);

          set({
            scale: data.scale,
            position: data.position,
            items: data.items || [],
            gridConfig: data.gridConfig || get().gridConfig,
            backgroundConfig: data.backgroundConfig || get().backgroundConfig,
          });

          // Reset history after load
          get().pushHistory();
          alert('Board loaded successfully!');
        }
      } else {
        // Web fallback: file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const content = await file.text();
            const data = JSON.parse(content);

            set({
              scale: data.scale,
              position: data.position,
              items: data.items || [],
              gridConfig: data.gridConfig || get().gridConfig,
              backgroundConfig: data.backgroundConfig || get().backgroundConfig,
            });

            get().pushHistory();
            alert('Board loaded successfully!');
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Failed to load board:', error);
      alert('Failed to load board: ' + error.message);
    }
  },

  exportBoard: async (customArea = null) => {
    try {
      const state = get();

      // Try getting stage from contentLayerRef first
      let stage = null;
      if (state.contentLayerRef) {
        stage = state.contentLayerRef.getStage();
      }

      // If no stage found, alert and return
      if (!stage) {
        console.error('No stage found. contentLayerRef:', state.contentLayerRef);
        alert('Canvas not ready for export. Please try adding some content first.');
        return;
      }

      // Get current viewport dimensions
      const scale = stage.scaleX();
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const stageX = stage.x();
      const stageY = stage.y();

      let viewportX, viewportY, viewportWidth, viewportHeight;

      if (customArea) {
        // Use the selected area
        viewportX = customArea.x;
        viewportY = customArea.y;
        viewportWidth = customArea.width;
        viewportHeight = customArea.height;
      } else {
        // Default behavior: Export 70% of the viewport centered
        // Convert to world coordinates (what's visible in viewport)
        const fullViewportX = (-stageX) / scale;
        const fullViewportY = (-stageY) / scale;
        const fullViewportWidth = stageWidth / scale;
        const fullViewportHeight = stageHeight / scale;

        const exportScale = 0.7; // Captura el 70% del viewport
        viewportWidth = fullViewportWidth * exportScale;
        viewportHeight = fullViewportHeight * exportScale;
        viewportX = fullViewportX + (fullViewportWidth - viewportWidth) / 2;
        viewportY = fullViewportY + (fullViewportHeight - viewportHeight) / 2;
      }

      // Export the area
      const dataURL = stage.toDataURL({
        x: viewportX,
        y: viewportY,
        width: viewportWidth,
        height: viewportHeight,
        pixelRatio: 2
      });

      // Load logo image for watermark
      const logoImg = new window.Image();
      logoImg.crossOrigin = 'anonymous';
      // Use the imported logo path (Vite will handle the path)
      const logoPath = logoIcon;

      let logoLoaded = false;
      try {
        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            logoLoaded = true;
            resolve();
          };
          logoImg.onerror = () => {
            console.warn('Logo not found, exporting without watermark');
            resolve();
          };
          logoImg.src = logoPath;
          setTimeout(reject, 2000); // 2 second timeout for logo
        });
      } catch (e) {
        console.warn('Logo loading timeout, continuing without watermark');
      }

      // Add watermark if logo loaded
      let finalDataURL = dataURL;
      if (logoLoaded && logoImg.complete && logoImg.naturalWidth > 0) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewportWidth * 2;
        canvas.height = viewportHeight * 2;

        const img = new window.Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = dataURL;
        });
        ctx.drawImage(img, 0, 0);

        // Logo configuration - Stylish & Subtle
        // Fixed reasonable size (max 80px or 12% of width) for visibility without intrusion
        const logoSize = Math.min(viewportWidth * 0.12, 80) * 2;
        const marginX = 25 * 2; // Right margin
        const marginY = 25 * 2; // Bottom margin

        // Render subtle shadow for better visibility on light backgrounds
        ctx.globalAlpha = 0.3;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.drawImage(
          logoImg,
          canvas.width - logoSize - marginX,
          canvas.height - logoSize - marginY,
          logoSize,
          logoSize
        );

        // Render main logo
        ctx.globalAlpha = 0.8; // Slightly transparent but visible
        ctx.shadowBlur = 0;
        ctx.drawImage(
          logoImg,
          canvas.width - logoSize - marginX,
          canvas.height - logoSize - marginY,
          logoSize,
          logoSize
        );

        ctx.globalAlpha = 1.0;

        finalDataURL = canvas.toDataURL('image/png');
      }

      // Save the image
      if (window.__TAURI__) {
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeBinaryFile } = await import('@tauri-apps/api/fs');

        const filePath = await save({
          defaultPath: `infiniteboard-${Date.now()}.png`,
          filters: [{ name: 'PNG Image', extensions: ['png'] }],
        });

        if (filePath) {
          const base64Data = finalDataURL.split(',')[1];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          await writeBinaryFile(filePath, binaryData);
          alert('Viewport exported successfully!');
        }
      } else {
        const link = document.createElement('a');
        link.download = `infiniteboard-${Date.now()}.png`;
        link.href = finalDataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to export board:', error);
      alert('Failed to export board: ' + error.message);
    }
  },

  // Grouping actions
  createGroup: () => {
    const state = get();
    if (state.selectedIds.length < 2) {
      alert('Select at least 2 objects to group');
      return;
    }

    state.pushHistory();
    const groupId = `group-${Date.now()}`;
    const newGroup = {
      id: groupId,
      itemIds: [...state.selectedIds],
      name: `Group ${state.groups.length + 1}`,
    };

    set({
      groups: [...state.groups, newGroup],
      selectedIds: [], // Deselect after grouping
    });
  },

  ungroupItems: () => {
    const state = get();
    if (state.selectedIds.length === 0) {
      alert('Select a group to ungroup');
      return;
    }

    state.pushHistory();

    // Find all groups that contain any of the selected items
    const groupsToRemove = state.groups.filter(group =>
      group.itemIds.some(itemId => state.selectedIds.includes(itemId))
    );

    if (groupsToRemove.length === 0) {
      alert('No groups found in selection');
      return;
    }

    // Remove these groups
    const newGroups = state.groups.filter(group =>
      !groupsToRemove.some(g => g.id === group.id)
    );

    set({ groups: newGroups });
  },

  // Layer Management (Z-Index)
  reorderItem: (id, action) => {
    const state = get();
    state.pushHistory();

    const items = [...state.items];
    const index = items.findIndex(i => i.id === id);

    if (index === -1) return;

    const item = items[index];
    items.splice(index, 1); // Remove item

    switch (action) {
      case 'front':
        items.push(item); // Add to end
        break;
      case 'back':
        items.unshift(item); // Add to beginning
        break;
      case 'forward':
        items.splice(Math.min(index + 1, items.length), 0, item);
        break;
      case 'backward':
        items.splice(Math.max(0, index - 1), 0, item);
        break;
    }

    set({ items });
  },
}));

export default useStore;
