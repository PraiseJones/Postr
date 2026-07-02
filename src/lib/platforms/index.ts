import { Platform, PlatformAdapter } from "./types";
import { xAdapter } from "./x";
import { facebookAdapter } from "./facebook";
import { instagramAdapter } from "./instagram";
import { linkedinAdapter } from "./linkedin";

export const adapters: Record<Platform, PlatformAdapter> = {
  x: xAdapter,
  facebook: facebookAdapter,
  instagram: instagramAdapter,
  linkedin: linkedinAdapter,
};

export * from "./types";
export * from "./guards";
