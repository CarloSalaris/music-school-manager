import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import type { PaletteDesignToken } from "@primeuix/themes/types";

// ── Palette knobs ───────────────────────────────────────────────────────────
// Change these two strings to restyle the whole app (components + the
// tailwindcss-primeui utilities). Values are PrimeVue primitive palette names:
//   primary: emerald | teal | sky | blue | indigo | violet | rose | amber ...
//   neutral: zinc | slate | gray | neutral | stone
const PRIMARY = "teal"; // (emerald matches Aura's default)
const NEUTRAL = "gray"; // surfaces / grays (Aura's light default is slate)

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Build a 50..950 token ramp referencing a primitive palette.
const ramp = (name: string): PaletteDesignToken =>
  Object.fromEntries(
    SHADES.map((shade): [number, string] => [shade, `{${name}.${shade}}`]),
  ) as PaletteDesignToken;

export const AppPreset = definePreset(Aura, {
  semantic: {
    primary: ramp(PRIMARY),
    colorScheme: {
      // Surface uses NEUTRAL in both schemes so the knob is authoritative
      // (Aura's dark default is already zinc; its light default is slate).
      light: {
        surface: { 0: "#ffffff", ...ramp(NEUTRAL) },
      },
      dark: {
        surface: { 0: "#ffffff", ...ramp(NEUTRAL) },
        // Lift the dark scheme one level so content and fields sit ABOVE the
        // page ground (surface-900) instead of matching it — a visible
        // elevation hierarchy without the near-black (surface-950) look.
        content: {
          background: "{surface.800}",
          hoverBackground: "{surface.700}",
          borderColor: "{surface.700}",
        },
        formField: {
          background: "{surface.900}",
          filledBackground: "{surface.900}",
          filledHoverBackground: "{surface.800}",
          filledFocusBackground: "{surface.800}",
          borderColor: "{surface.700}",
          hoverBorderColor: "{surface.600}",
        },
        overlay: {
          select: { background: "{surface.800}", borderColor: "{surface.700}" },
          popover: {
            background: "{surface.800}",
            borderColor: "{surface.700}",
          },
          modal: { background: "{surface.800}", borderColor: "{surface.700}" },
        },
        list: {
          option: { focusBackground: "{surface.700}" },
        },
        navigation: {
          item: {
            focusBackground: "{surface.700}",
            activeBackground: "{surface.700}",
          },
        },
      },
    },
  },
});
