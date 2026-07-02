// Client-safe helpers — no server-only imports.
import { Platform, PLATFORMS } from "./types";

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}
