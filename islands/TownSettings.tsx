/**
 * TownSettings Island — bottom panel for editing John Town configuration.
 *
 * Fixed to the bottom of the page, expands upward on click.
 * Reads/writes settings via /api/settings (GET, PUT, DELETE).
 */

import { useCallback, useEffect, useState } from "preact/hooks";
import type { Character, PortRange, Settings } from "@/lib/settings.ts";
import { CharactersSection } from "./settings/CharactersSection.tsx";
import { PortRangesSection } from "./settings/PortRangesSection.tsx";
import { ExcludedProcessesSection } from "./settings/ExcludedProcessesSection.tsx";
import { PollIntervalSection } from "./settings/PollIntervalSection.tsx";

type OpenSection = "characters" | "portRanges" | "advanced" | null;

function SectionButton(
  { label, sectionKey, openSection, setOpenSection }: {
    label: string;
    sectionKey: OpenSection;
    openSection: OpenSection;
    setOpenSection: (s: OpenSection) => void;
  },
) {
  return (
    <button
      type="button"
      class="w-full flex items-center gap-2 py-2 text-xs uppercase tracking-wider text-warm-brown hover:text-charcoal cursor-pointer font-heading font-semibold"
      onClick={() =>
        setOpenSection(openSection === sectionKey ? null : sectionKey)}
    >
      <span class="text-xs">
        {openSection === sectionKey ? "\u25BE" : "\u25B8"}
      </span>
      {label}
    </button>
  );
}

export default function TownSettings() {
  const [config, setConfig] = useState<Settings | null>(null);
  const [savedConfig, setSavedConfig] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<OpenSection>("characters");
  const [message, setMessage] = useState<
    { text: string; isError: boolean } | null
  >(null);

  const isDirty = config !== null && JSON.stringify(config) !== savedConfig;

  // Auto-clear message after 3s
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setSavedConfig(JSON.stringify(data));
      }
    } catch { /* silent */ }
  }, []);

  const handleToggle = useCallback(async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && !config) await fetchSettings();
  }, [isOpen, config, fetchSettings]);

  const saveCurrentSettings = useCallback(async () => {
    if (!config) return;
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSavedConfig(JSON.stringify(config));
        globalThis.dispatchEvent(new Event("settings-updated"));
      } else {
        const d = await res.json();
        setMessage({ text: "Error: " + d.error, isError: true });
      }
    } catch {
      setMessage({ text: "Failed to save", isError: true });
    }
  }, [config]);

  const resetToDefaults = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setSavedConfig(JSON.stringify(data));
        setMessage({ text: "Reset to defaults!", isError: false });
        globalThis.dispatchEvent(new Event("settings-updated"));
      }
    } catch {
      setMessage({ text: "Failed to reset", isError: true });
    }
  }, []);

  // --- Config mutation callbacks ---

  const updateCharacter = useCallback(
    (fw: string, field: keyof Character, value: string) => {
      setConfig((prev) => {
        if (!prev) return prev;
        const existing = prev.characters[fw] ?? {
          emoji: "\uD83D\uDC39",
          label: "New Townsperson",
        };
        return {
          ...prev,
          characters: {
            ...prev.characters,
            [fw]: { ...existing, [field]: value },
          },
        };
      });
    },
    [],
  );

  const deleteCharacter = useCallback((fw: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const { [fw]: _, ...rest } = prev.characters;
      return { ...prev, characters: rest };
    });
  }, []);

  const updatePortRange = useCallback(
    (i: number, field: keyof PortRange, value: string | number) => {
      setConfig((prev) => {
        if (!prev) return prev;
        const newRanges = [...prev.portRanges];
        newRanges[i] = { ...newRanges[i], [field]: value };
        return { ...prev, portRanges: newRanges };
      });
    },
    [],
  );

  const deletePortRange = useCallback((i: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        portRanges: prev.portRanges.filter((_, idx) => idx !== i),
      };
    });
  }, []);

  const addPortRange = useCallback(() => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        portRanges: [...prev.portRanges, { start: 0, end: 0, label: "" }],
      };
    });
  }, []);

  const deleteExcludedProcess = useCallback((i: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        excludedProcesses: prev.excludedProcesses.filter((_, idx) => idx !== i),
      };
    });
  }, []);

  const addExcludedProcess = useCallback((name: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        excludedProcesses: [...prev.excludedProcesses, name],
      };
    });
  }, []);

  const updatePollInterval = useCallback((ms: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return { ...prev, pollInterval: ms };
    });
  }, []);

  const drawerOpen = isOpen && config !== null;

  return (
    <div class="fixed bottom-0 left-0 right-0 z-50">
      <div
        class="mx-4 sm:mx-6 lg:mx-8 flex flex-col max-h-[70vh] bg-cream border-2 border-b-0 border-pebble rounded-t-lg transition-transform duration-300 ease-out"
        style={{
          transform: drawerOpen
            ? "translateY(0)"
            : "translateY(calc(100% - 2.625rem))",
          boxShadow: drawerOpen
            ? "0 -4px 12px rgba(160,113,79,0.1), 0 -1px 3px rgba(160,113,79,0.08)"
            : "none",
        }}
      >
        {/* Toggle bar — always at top of drawer */}
        <button
          type="button"
          class={`flex-none w-full flex items-center justify-center gap-2 text-sm text-bark hover:text-charcoal cursor-pointer px-4 py-2.5 bg-sand rounded-t-lg font-heading font-semibold ${
            drawerOpen ? "border-b-2 border-pebble" : "border-t-2 border-pebble"
          }`}
          onClick={handleToggle}
        >
          <span class="text-base">&#x2699;&#xFE0F;</span>
          Town Settings
          <span class="text-xs text-pebble">
            {drawerOpen ? "\u25BE" : "\u25B4"}
          </span>
        </button>

        {/* Scrollable content */}
        <div class="flex-1 overflow-y-auto p-4 space-y-1">
          {config && (
            <>
              {/* Townspeople */}
              <SectionButton
                label={`Townspeople (${Object.keys(config.characters).length})`}
                sectionKey="characters"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === "characters" && (
                <CharactersSection
                  characters={config.characters}
                  onChange={updateCharacter}
                  onDelete={deleteCharacter}
                />
              )}

              {/* Port Ranges */}
              <SectionButton
                label={`Port Ranges (${config.portRanges.length})`}
                sectionKey="portRanges"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === "portRanges" && (
                <PortRangesSection
                  portRanges={config.portRanges}
                  onChange={updatePortRange}
                  onDelete={deletePortRange}
                  onAdd={addPortRange}
                />
              )}

              {/* Advanced */}
              <SectionButton
                label="Advanced"
                sectionKey="advanced"
                openSection={openSection}
                setOpenSection={setOpenSection}
              />
              {openSection === "advanced" && (
                <div class="pb-3 space-y-4">
                  <div>
                    <h4 class="text-xs font-semibold text-bark mb-2 font-heading">
                      Excluded Processes
                    </h4>
                    <ExcludedProcessesSection
                      processes={config.excludedProcesses}
                      onDelete={deleteExcludedProcess}
                      onAdd={addExcludedProcess}
                    />
                  </div>
                  <div>
                    <h4 class="text-xs font-semibold text-bark mb-2 font-heading">
                      Poll Interval
                    </h4>
                    <PollIntervalSection
                      pollInterval={config.pollInterval}
                      onChange={updatePollInterval}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — pinned to bottom */}
        {config && (
          <div class="flex-none flex items-center justify-between px-4 py-3 bg-sand border-t-2 border-pebble">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class={isDirty
                  ? "bg-meadow text-cream rounded px-4 py-1.5 text-sm hover:bg-meadow-dark cursor-pointer font-heading font-semibold"
                  : "bg-pebble text-cream rounded px-4 py-1.5 text-sm cursor-default font-heading font-semibold"}
                disabled={!isDirty}
                onClick={saveCurrentSettings}
              >
                {isDirty ? "Save Changes" : "Saved"}
              </button>
              <button
                type="button"
                class="border border-pebble text-bark rounded px-4 py-1.5 text-sm hover:bg-cream cursor-pointer font-heading"
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </button>
            </div>
            {message && (
              <span
                class={`text-xs ${
                  message.isError ? "text-red-600" : "text-meadow-dark"
                }`}
              >
                {message.text}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
