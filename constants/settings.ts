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