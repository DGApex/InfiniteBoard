import { create } from 'zustand';

const useStore = create((set) => ({
  items: [],
  selectedId: null, // ID of the currently selected item
  activeTool: 'pointer', // pointer | hand | text | sticky | image

  scale: 1,
  position: { x: 0, y: 0 },
  stageSize: { width: window.innerWidth, height: window.innerHeight },
  contentLayerRef: null,

  // Actions
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, newAttrs) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...newAttrs } : item)),
    })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId // Deselect if removed
  })),
  selectItem: (id) => set({ selectedId: id }),
  setTool: (tool) => set({
    activeTool: tool,
    selectedId: null // Clear selection when changing tools
  }),

  // Existing actions...
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setStageSize: (width, height) => set({ stageSize: { width, height } }),
  setContentLayerRef: (ref) => set({ contentLayerRef: ref }),

  saveBoard: async () => {
    try {
      const { save } = await import('@tauri-apps/api/dialog');
      const { writeTextFile } = await import('@tauri-apps/api/fs');

      const filePath = await save({
        filters: [{ name: 'InfiniteBoard', extensions: ['json'] }],
      });

      if (filePath) {
        const state = useStore.getState();
        const data = {
          scale: state.scale,
          position: state.position,
          items: state.items, // Save items
        };
        await writeTextFile(filePath, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save board:', error);
    }
  },

  loadBoard: async () => {
    try {
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
          items: data.items || [], // Load items
        });
      }
    } catch (error) {
      console.error('Failed to load board:', error);
    }
  },

  exportBoard: async () => {
    const { contentLayerRef } = useStore.getState();
    if (contentLayerRef) {
      const { exportToImage } = await import('../utils/exportUtils');
      await exportToImage(contentLayerRef);
    }
  }
}));

export default useStore;
