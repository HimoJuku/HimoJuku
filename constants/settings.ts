import React from "react";


export type ThemePreference = "light" | "dark" | "system";
export type ResolvedThemeType = "light" | "dark";

type ThemeContextType = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedThemeType;
  setThemePreference: (preference: ThemePreference) => void;
};

export const ThemeContext = React.createContext<ThemeContextType>({
  themePreference: "system",
  resolvedTheme: "light",
  setThemePreference: () => {},
});

export const typesettingDirections = {
  horizontal: "horizontal",
  vertical: "vertical",
};

export const readingDirections = {
  ltr: "left-to-right",
  rtl: "right-to-left",
  ttb: "top-to-bottom",
  btt: "bottom-to-top"
};

export const readerMode = {
  singlePage: "single",
  doublePage: "double",
  scroll: "scroll",
  spread: "spread",
  continuous: "continuous",
};