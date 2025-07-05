import { create } from "zustand";

// Window Animation Types
export type WindowAnimationType =
  | "fade"
  | "scale"
  | "slide"
  | "flip"
  | "rotate"
  | "jellyfish"
  | "none";

// Context Menu types
export type ContextMenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  variant?: "default" | "destructive";
};

export type ContextMenuInfo = {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  sourceWindowId: string | null;
  zIndex: number;
};

type Window = {
  id: string;
  title: string | React.ReactNode;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  originalSize?: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  mode?: "open" | "save";
  data?: any;
  snapPosition?: "left" | "right" | "none";
  toolbar?: React.ReactNode | string;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
};

export type WindowManagerState = {
  windows: Window[];
  activeWindowId: string | null;
  previousWindowId: string | null;
  windowHistory: string[];
  isAltQOpen: boolean;
  selectedWindowIndex: number;
  splitterPosition: number;
  isSplitterVisible: boolean;
  windowAnimation: WindowAnimationType;
  addWindow: (window: Window) => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  setActiveWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  endSplitOnDrag: (draggedWindowId: string) => void;
  setWindowAnimation: (animation: WindowAnimationType) => void;
};

export const useWindowManagerStore = create<WindowManagerState>((set) => ({
  windows: [],
  activeWindowId: null,
  previousWindowId: null,
  windowHistory: [],
  isAltQOpen: false,
  selectedWindowIndex: 0,
  splitterPosition: 50,
  isSplitterVisible: false,
  windowAnimation: "fade",

  addWindow: (window) =>
    set((state) => {
      if (state.windows.some((w) => w.id === window.id)) {
        return state;
      }
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const windowWithActiveFlag = {
        ...window,
        zIndex: maxZIndex + 1,
        originalSize: window.size,
      };

      const newHistory = state.activeWindowId
        ? [
            state.activeWindowId,
            ...state.windowHistory.filter((id) => id !== state.activeWindowId),
          ]
        : state.windowHistory;

      return {
        windows: [...state.windows, windowWithActiveFlag],
        activeWindowId: window.id,
        previousWindowId: state.activeWindowId,
        windowHistory: newHistory,
      };
    }),

  removeWindow: (id) =>
    set((state) => {
      const newWindows = state.windows.filter((w) => w.id !== id);
      let newActiveWindowId = state.activeWindowId;
      const newHistory = state.windowHistory.filter((wId) => wId !== id);

      if (state.activeWindowId === id) {
        newActiveWindowId = newHistory.length > 0 ? newHistory[0] : null;
      }

      let newPreviousWindowId = state.previousWindowId;
      if (state.previousWindowId === id) {
        newPreviousWindowId = newHistory.length > 1 ? newHistory[1] : null;
      }

      return {
        windows: newWindows,
        activeWindowId: newActiveWindowId,
        previousWindowId: newPreviousWindowId,
        windowHistory: newHistory,
      };
    }),

  updateWindow: (id, updates) =>
    set((state) => {
      const updatedWindows = state.windows.map((window) => {
        if (window.id === id) {
          const shouldUpdateOriginalSize =
            updates.size &&
            !window.snapPosition &&
            (!updates.snapPosition || updates.snapPosition === "none");

          return {
            ...window,
            ...updates,
            originalSize: shouldUpdateOriginalSize
              ? updates.size
              : window.originalSize,
          };
        }
        return window;
      });

      return { windows: updatedWindows };
    }),

  setActiveWindow: (id) =>
    set((state) => {
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);

      const newHistory =
        state.activeWindowId && state.activeWindowId !== id
          ? [
              state.activeWindowId,
              ...state.windowHistory.filter(
                (wId) => wId !== state.activeWindowId && wId !== id
              ),
            ]
          : state.windowHistory.filter((wId) => wId !== id);

      const updatedWindows = state.windows.map((window) => {
        if (window.id === id) {
          return { ...window, zIndex: maxZIndex + 1 };
        }
        return window;
      });

      return {
        activeWindowId: id,
        previousWindowId:
          state.activeWindowId !== id
            ? state.activeWindowId
            : state.previousWindowId,
        windowHistory: newHistory,
        windows: updatedWindows,
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const targetWindow = state.windows.find((w) => w.id === id);

      if (targetWindow && targetWindow.zIndex === maxZIndex) {
        return {
          activeWindowId: id,
          previousWindowId:
            state.activeWindowId !== id
              ? state.activeWindowId
              : state.previousWindowId,
          windowHistory: state.windowHistory,
        };
      }

      const newHistory =
        state.activeWindowId && state.activeWindowId !== id
          ? [
              state.activeWindowId,
              ...state.windowHistory.filter(
                (wId) => wId !== state.activeWindowId && wId !== id
              ),
            ]
          : state.windowHistory.filter((wId) => wId !== id);

      const updatedWindows = state.windows.map((window) => {
        if (window.id === id) {
          return { ...window, zIndex: maxZIndex + 1 };
        }
        return window;
      });

      return {
        activeWindowId: id,
        previousWindowId:
          state.activeWindowId !== id
            ? state.activeWindowId
            : state.previousWindowId,
        windowHistory: newHistory,
        windows: updatedWindows,
      };
    }),

  endSplitOnDrag: (draggedWindowId) => {
    // Simplified implementation
    console.log("End split on drag:", draggedWindowId);
  },

  setWindowAnimation: (windowAnimation) => set({ windowAnimation }),
}));
