import React from "react";

// 定义并导出类型
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