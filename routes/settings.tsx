/**
 * Settings Page
 *
 * Dedicated page for configuring John Town. Renders the SettingsPage
 * island which handles all the interactive settings management.
 */

import { define } from "../utils.ts";
import SettingsPage from "../islands/SettingsPage.tsx";

export default define.page(function Settings() {
  return (
    <div
      class="min-h-screen"
      style={{
        backgroundColor: "#fdf5eb",
        backgroundImage:
          "linear-gradient(90deg, #e0c9a830 20px, transparent 20px), linear-gradient(#e0c9a830 20px, transparent 20px)",
        backgroundPosition: "10px 10px",
        backgroundSize: "40px 40px",
      }}
    >
      <main class="px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <SettingsPage />
      </main>
    </div>
  );
});
