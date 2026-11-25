/**
 * Local stand-in for the grok/canvas host module.
 *
 * The game file imports React hooks, `useGrokTheme`, `Page`, and a few React
 * types from "grok/canvas". Vite and TypeScript alias that specifier here so a
 * new canvas export can replace src/game/SilverMoon.tsx without edits.
 *
 * This module only paints theme tokens and the document title. It does not
 * read or write localStorage, sessionStorage, IndexedDB, cookies, or window.name.
 */
import { useEffect, type CSSProperties, type ReactNode } from "react";

export type { CSSProperties, ChangeEvent, FocusEvent, FormEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, RefObject, SyntheticEvent } from "react";
export { Fragment, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

type TextStyle = Pick<CSSProperties, "fontSize" | "lineHeight" | "letterSpacing">;

export interface GrokTheme {
  readonly kind: "dark";
  readonly bg: { readonly base: string; readonly subtle: string; readonly elevated: string };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
    readonly onColor: string;
    readonly onPrimary: string;
    readonly accent: string;
    readonly success: string;
    readonly warning: string;
    readonly danger: string;
    readonly accentDeep: string;
    readonly successDeep: string;
    readonly warningDeep: string;
    readonly dangerDeep: string;
  };
  readonly fill: {
    readonly primary: string;
    readonly primaryHover: string;
    readonly secondary: string;
    readonly secondaryHover: string;
    readonly hover: string;
    readonly pressed: string;
    readonly accent: string;
    readonly controlChecked: string;
    readonly accentSubtle: string;
    readonly successSubtle: string;
    readonly warningSubtle: string;
    readonly dangerSubtle: string;
  };
  readonly border: {
    readonly subtle: string;
    readonly weak: string;
    readonly default: string;
    readonly strong: string;
    readonly focus: string;
  };
  readonly font: {
    readonly family: string;
    readonly mono: string;
    readonly heading1: TextStyle;
    readonly heading2: TextStyle;
    readonly heading3: TextStyle;
    readonly body1: TextStyle;
    readonly subtext: TextStyle;
    readonly table: TextStyle;
    readonly metric: TextStyle;
    readonly body2: TextStyle;
    readonly label: TextStyle;
    readonly caption: TextStyle;
    readonly code: TextStyle;
  };
  readonly weight: { readonly regular: 400; readonly medium: 500; readonly semibold: 600 };
  readonly radius: { readonly sm: 4; readonly md: 8; readonly lg: 12; readonly xl: 16; readonly full: 9999 };
  readonly motion: { readonly hover: string; readonly easing: string };
  readonly dataviz: {
    readonly categorical: readonly string[];
    readonly other: string;
    readonly negative: string;
    readonly singleSeriesRest: string;
    readonly areaAlpha: string;
    readonly bandAlpha: string;
    readonly blueTint: string;
    readonly blue5: string;
    readonly sequential: readonly string[];
    readonly diverging: readonly string[];
  };
  readonly chart: readonly [string, string, string, string];
}

const text = (fontSize: string, lineHeight: string): TextStyle => ({
  fontSize,
  lineHeight,
  letterSpacing: "0em",
});

/**
 * Dark Grok page tokens. Ink steps follow the host scale: secondary 60%,
 * tertiary 40%, borders 5/10/15/30/40%, dark fills 17% and 28%.
 * Pinned to dark so the standalone page stays on a black background.
 */
const DARK: GrokTheme = {
  kind: "dark",
  bg: {
    base: "#000000",
    subtle: "#141414",
    elevated: "#1c1c1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#ffffff99",
    tertiary: "#ffffff66",
    onColor: "#ffffff",
    onPrimary: "#000000",
    accent: "#6cb6ff",
    success: "#3dd68c",
    warning: "#f5a524",
    danger: "#ff5c5c",
    accentDeep: "#b9d9ff",
    successDeep: "#b6f3d4",
    warningDeep: "#ffd7a3",
    dangerDeep: "#ffc2c2",
  },
  fill: {
    primary: "#ffffff",
    primaryHover: "#e8e8e8",
    secondary: "#ffffff2b",
    secondaryHover: "#ffffff47",
    hover: "#ffffff14",
    pressed: "#ffffff1f",
    accent: "#3d8bfd",
    controlChecked: "#3d8bfd",
    accentSubtle: "#3d8bfd2b",
    successSubtle: "#3dd68c2b",
    warningSubtle: "#f5a5242b",
    dangerSubtle: "#ff5c5c2b",
  },
  border: {
    subtle: "#ffffff0d",
    weak: "#ffffff1a",
    default: "#ffffff26",
    strong: "#ffffff4d",
    focus: "#ffffff66",
  },
  font: {
    family: 'system-ui, -apple-system, "Segoe UI", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
    mono: 'ui-monospace, "Cascadia Code", "Sarasa Mono TC", "Noto Sans Mono", monospace',
    heading1: text("30px", "36px"),
    heading2: text("24px", "30px"),
    heading3: text("20px", "26px"),
    body1: text("16px", "24px"),
    subtext: text("14px", "20px"),
    table: text("15px", "22px"),
    metric: text("24px", "30px"),
    body2: text("13px", "18px"),
    label: text("12px", "16px"),
    caption: text("11px", "16px"),
    code: text("13px", "20px"),
  },
  weight: { regular: 400, medium: 500, semibold: 600 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  motion: { hover: "150ms", easing: "cubic-bezier(0.2, 0, 0, 1)" },
  dataviz: {
    categorical: ["#4c9aff", "#f5c542", "#3ddec8"],
    other: "#8a8a8a",
    negative: "#ff5c5c",
    singleSeriesRest: "#1e3a5f",
    areaAlpha: "3d",
    bandAlpha: "40",
    blueTint: "#4c9aff3d",
    blue5: "#9cc7ff",
    sequential: ["#16324f", "#1e4b7a", "#2f6fad", "#4c9aff", "#9cc7ff"],
    diverging: ["#ff5c5c", "#8a8a8a", "#4c9aff"],
  },
  chart: ["#ffffff", "#ffffff66", "#ffffff33", "#ffffff2b"],
};

export function useGrokTheme(): GrokTheme {
  return DARK;
}

export interface PageProps {
  title: string;
  summary?: string;
  sources?: readonly string[];
  width?: "column" | "wide" | "full";
  lang?: string;
  palette?: readonly string[];
  children?: ReactNode;
}

/**
 * The canvas host uses Page to name the document. This game only mounts it
 * behind a flag that never trips, and index.html already sets the same title
 * and lang. If a future drop-in renders Page, the title and language follow.
 */
export function Page({ title, lang, children }: PageProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (lang) document.documentElement.lang = lang;
  }, [title, lang]);
  return <>{children}</>;
}
