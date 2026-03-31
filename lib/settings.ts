/**
 * Centralized Settings
 *
 * All configurable values for John Town live here. Other modules import
 * from this file rather than defining their own defaults.
 *
 * Settings are persisted to CONFIG_DIR/settings.json (defaults to
 * $HOME/.john-town). If the file doesn't exist, defaults are used.
 */

import { join } from "jsr:@std/path@^1";

export interface Character {
  emoji: string;
  label: string;
}

export interface PortRange {
  start: number;
  end: number;
  label: string;
}

export interface Settings {
  portRanges: PortRange[];
  excludedProcesses: string[];
  pollInterval: number;
  characters: Record<string, Character>;
}

const DEFAULTS: Settings = {
  portRanges: [
    { start: 3000, end: 3010, label: "React, Remix, Rails" },
    { start: 3100, end: 3110, label: "Backend APIs" },
    { start: 4000, end: 4010, label: "Phoenix, GraphQL" },
    { start: 5001, end: 5010, label: "Flask" },
    { start: 5173, end: 5200, label: "Vite dev server" },
    { start: 5800, end: 5810, label: "Custom dev servers" },
    { start: 8000, end: 8010, label: "Fresh, Django" },
    { start: 8080, end: 8090, label: "General purpose" },
    { start: 8888, end: 8895, label: "Jupyter" },
  ],
  excludedProcesses: [
    "ControlCenter",
    "ControlCe",
    "rapportd",
    "sharingd",
    "AirPlayXPCHelper",
    "io.tailscale",
    "tailscaled",
  ],
  pollInterval: 5000,
  characters: {
    "Vite": { emoji: "\u{1F431}", label: "Cat Painter" },
    "Fresh": { emoji: "\u{1F438}", label: "Frog Juicer" },
    "Next.js": { emoji: "\u{1F989}", label: "Owl Librarian" },
    "React": { emoji: "\u{1F99D}", label: "Raccoon Builder" },
    "Node.js": { emoji: "\u{1F43B}", label: "Bear Operator" },
    "Django": { emoji: "\u{1F436}", label: "Dog Mail Carrier" },
    "Python": { emoji: "\u{1F40D}", label: "Snake Scientist" },
    "Rails": { emoji: "\u{1F98A}", label: "Fox Conductor" },
    "Astro": { emoji: "\u{1F430}", label: "Rabbit Astronomer" },
    "Phoenix": { emoji: "\u{1F426}", label: "Bird Messenger" },
    "Nuxt": { emoji: "\u{1F43F}\u{FE0F}", label: "Squirrel Organizer" },
    "Remix": { emoji: "\u{1F99C}", label: "Parrot DJ" },
    "Jupyter": { emoji: "\u{1F42D}", label: "Mouse Scribe" },
    "Flask": { emoji: "\u{1F994}", label: "Hedgehog Alchemist" },
    "Deno": { emoji: "\u{1F995}", label: "Dino Builder" },
    "Unknown": { emoji: "\u{1F439}", label: "Hamster Helper" },
  },
};

function configDir(): string {
  return Deno.env.get("CONFIG_DIR") ??
    join(Deno.env.get("HOME")!, ".john-town");
}

function settingsPath(): string {
  return join(configDir(), "settings.json");
}

export function getSettings(): Settings {
  try {
    const text = Deno.readTextFileSync(settingsPath());
    return { ...structuredClone(DEFAULTS), ...JSON.parse(text) };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function updateSettings(newSettings: Settings): void {
  const dir = configDir();
  Deno.mkdirSync(dir, { recursive: true });
  Deno.writeTextFileSync(settingsPath(), JSON.stringify(newSettings, null, 2));
}

export function resetSettings(): Settings {
  try {
    Deno.removeSync(settingsPath());
  } catch {
    // file may not exist
  }
  return structuredClone(DEFAULTS);
}

export const DEFAULT_CHARACTER: Character = {
  emoji: "\u{1F439}",
  label: "Hamster Helper",
};
