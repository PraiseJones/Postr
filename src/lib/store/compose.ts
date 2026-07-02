import { create } from "zustand";
import type { Platform } from "@/lib/platforms/types";

interface ComposeState {
  text: string;
  selectedPlatforms: Platform[];
  mediaFile: File | null;
  mediaPreview: string | null;
  publishing: boolean;
  setText: (text: string) => void;
  togglePlatform: (platform: Platform) => void;
  setMedia: (file: File | null) => void;
  setPublishing: (publishing: boolean) => void;
  reset: () => void;
}

export const useComposeStore = create<ComposeState>((set, get) => ({
  text: "",
  selectedPlatforms: [],
  mediaFile: null,
  mediaPreview: null,
  publishing: false,

  setText: (text) => set({ text }),

  togglePlatform: (platform) =>
    set((state) => ({
      selectedPlatforms: state.selectedPlatforms.includes(platform)
        ? state.selectedPlatforms.filter((p) => p !== platform)
        : [...state.selectedPlatforms, platform],
    })),

  setMedia: (file) => {
    const prev = get().mediaPreview;
    if (prev) URL.revokeObjectURL(prev);
    set({
      mediaFile: file,
      mediaPreview: file ? URL.createObjectURL(file) : null,
    });
  },

  setPublishing: (publishing) => set({ publishing }),

  reset: () => {
    const prev = get().mediaPreview;
    if (prev) URL.revokeObjectURL(prev);
    set({
      text: "",
      selectedPlatforms: [],
      mediaFile: null,
      mediaPreview: null,
      publishing: false,
    });
  },
}));
