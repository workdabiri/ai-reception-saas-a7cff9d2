import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, MoonStar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type Theme = "light" | "dark" | "night" | "system";
const STORAGE_KEY = "app.theme";

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const r = document.documentElement;
  const resolved = theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
  // Night mode is layered on top of dark — keep `.dark` so all dark: variants stay active.
  const isDark = resolved === "dark" || resolved === "night";
  const isNight = resolved === "night";
  r.classList.toggle("dark", isDark);
  r.classList.toggle("night", isNight);
  r.style.colorScheme = isDark ? "dark" : "light";
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored ?? "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return { theme, setTheme };
}

const ORDER: Theme[] = ["light", "dark", "night", "system"];
const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  night: MoonStar,
  system: Monitor,
};
const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  night: "Night",
  system: "System",
};

export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const { theme, setTheme } = useTheme();
  const next: Theme = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = ICONS[theme];
  const label = LABELS[theme];

  if (variant === "full") {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
        {ORDER.map((t) => {
          const I = ICONS[t];
          const active = theme === t;
          return (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-[12px] font-medium capitalize transition ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              <I className="h-3.5 w-3.5" />
              {t}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setTheme(next)}
          aria-label={`Theme: ${label}. Switch to ${LABELS[next]}`}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:text-foreground hover:bg-secondary"
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Theme: {label} (click for {LABELS[next]})
      </TooltipContent>
    </Tooltip>
  );
}

/** Inline script string injected before paint to avoid theme flash. */
export const themeBootScript = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}')||'dark';var resolved=s==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):s;var isDark=resolved==='dark'||resolved==='night';var isNight=resolved==='night';var r=document.documentElement;if(isDark)r.classList.add('dark');if(isNight)r.classList.add('night');r.style.colorScheme=isDark?'dark':'light';}catch(e){var r=document.documentElement;r.classList.add('dark');r.style.colorScheme='dark';}})();`;
