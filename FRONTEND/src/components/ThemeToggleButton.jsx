import { useTheme } from "../context/ThemeContext";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Changer de thème"
      className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
