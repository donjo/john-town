/**
 * SettingsPage Island — full-page settings interface.
 *
 * Left sidebar navigation with three sections: Townspeople, Port Ranges,
 * and Advanced. Content area on the right shows the active section.
 * On mobile the sidebar stacks above the content.
 */

import { useCallback, useEffect, useState } from "preact/hooks";
import type { Character, PortRange, Settings } from "@/lib/settings.ts";
import { CharactersSection } from "./settings/CharactersSection.tsx";
import { PortRangesSection } from "./settings/PortRangesSection.tsx";
import { ExcludedProcessesSection } from "./settings/ExcludedProcessesSection.tsx";
import { PollIntervalSection } from "./settings/PollIntervalSection.tsx";
import { CARD_SHADOW } from "./settings/styles.ts";

type ActiveSection = "characters" | "portRanges" | "advanced";

const SECTIONS: { key: ActiveSection; label: string; description: string }[] = [
  {
    key: "characters",
    label: "Townspeople",
    description: "Customize the animal mascots for each framework",
  },
  {
    key: "portRanges",
    label: "Port Ranges",
    description: "Choose which ports to scan for dev servers",
  },
  {
    key: "advanced",
    label: "Advanced",
    description: "Excluded processes and polling frequency",
  },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<Settings | null>(null);
  const [savedConfig, setSavedConfig] = useState<string>("");
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    "characters",
  );
  const [message, setMessage] = useState<
    { text: string; isError: boolean } | null
  >(null);

  const isDirty = config !== null && JSON.stringify(config) !== savedConfig;

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setConfig(data);
          setSavedConfig(JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

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
        setMessage({ text: "Settings saved!", isError: false });
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

  const activeMeta = SECTIONS.find((s) => s.key === activeSection)!;

  return (
    <div>
      {/* Header */}
      <nav class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a
            href="/"
            class="text-pebble hover:text-charcoal transition-colors duration-150"
            title="Back to dashboard"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
          <h1 class="text-xl font-heading font-bold text-charcoal tracking-tight">
            Town Settings
          </h1>
        </div>
        <div class="flex items-center gap-3">
          {message && (
            <span
              class={`text-sm font-body ${
                message.isError ? "text-red-600" : "text-meadow-dark"
              }`}
            >
              {message.text}
            </span>
          )}
          <button
            type="button"
            class="border border-pebble text-bark rounded-lg px-4 py-2 text-sm font-heading transition-colors duration-150 hover:border-bark hover:text-charcoal cursor-pointer"
            onClick={resetToDefaults}
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            class={`rounded-lg px-4 py-2 text-sm font-heading font-semibold transition-colors duration-150 ${
              isDirty
                ? "bg-meadow text-cream hover:bg-meadow-dark cursor-pointer"
                : "bg-pebble/60 text-cream/80 cursor-default"
            }`}
            disabled={!isDirty}
            onClick={saveCurrentSettings}
          >
            {isDirty ? "Save Changes" : "Saved"}
          </button>
        </div>
      </nav>

      {config
        ? (
          <div class="flex flex-col md:flex-row gap-6">
            {/* Sidebar nav */}
            <nav class="md:w-56 flex-none">
              <div
                class="bg-cream border-2 border-pebble rounded-lg overflow-hidden"
                style={{ boxShadow: CARD_SHADOW }}
              >
                {SECTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    class={`w-full text-left px-4 py-3 text-sm font-heading font-semibold cursor-pointer transition-colors duration-150 border-b border-pebble/30 last:border-b-0 ${
                      activeSection === key
                        ? "bg-sand text-charcoal border-l-[3px] border-l-meadow"
                        : "text-bark hover:bg-sand/50 hover:text-charcoal"
                    }`}
                    onClick={() => setActiveSection(key)}
                  >
                    {label}
                    {key === "characters" && (
                      <span class="ml-2 text-xs text-pebble font-body">
                        {Object.keys(config.characters).length}
                      </span>
                    )}
                    {key === "portRanges" && (
                      <span class="ml-2 text-xs text-pebble font-body">
                        {config.portRanges.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content area */}
            <div class="flex-1 min-w-0">
              <div
                class="bg-cream border-2 border-pebble rounded-lg p-6"
                style={{ boxShadow: CARD_SHADOW }}
              >
                {/* Section heading */}
                <div class="mb-6">
                  <h2 class="text-lg font-heading font-bold text-charcoal tracking-tight">
                    {activeMeta.label}
                  </h2>
                  <p class="text-sm font-body text-bark mt-1">
                    {activeMeta.description}
                  </p>
                </div>

                {activeSection === "characters" && (
                  <CharactersSection
                    characters={config.characters}
                    onChange={updateCharacter}
                    onDelete={deleteCharacter}
                  />
                )}

                {activeSection === "portRanges" && (
                  <PortRangesSection
                    portRanges={config.portRanges}
                    onChange={updatePortRange}
                    onDelete={deletePortRange}
                    onAdd={addPortRange}
                  />
                )}

                {activeSection === "advanced" && (
                  <div class="space-y-6">
                    <section>
                      <h3 class="text-base font-heading font-semibold text-charcoal mb-1">
                        Excluded Processes
                      </h3>
                      <p class="text-sm font-body text-bark mb-4">
                        System processes to ignore when scanning ports.
                      </p>
                      <ExcludedProcessesSection
                        processes={config.excludedProcesses}
                        onDelete={deleteExcludedProcess}
                        onAdd={addExcludedProcess}
                      />
                    </section>
                    <section>
                      <h3 class="text-base font-heading font-semibold text-charcoal mb-1">
                        Poll Interval
                      </h3>
                      <PollIntervalSection
                        pollInterval={config.pollInterval}
                        onChange={updatePollInterval}
                      />
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
        : (
          <div class="text-center py-12 text-bark text-sm font-body">
            Loading settings...
          </div>
        )}
    </div>
  );
}
