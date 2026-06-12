import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * Eclipse Morph theme toggle.
 * - Light mode: bright sun with 8 rays.
 * - Dark mode: a shadow disc slides over the sun, the rays retract,
 *   forming a crescent moon (eclipse animation).
 */
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      aria-pressed={isDark}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
      className="group relative h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        {/* Sun rays — retract when dark */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out",
            isDark ? "opacity-0 scale-50 rotate-90" : "opacity-90 scale-100 rotate-0",
          )}
          aria-hidden="true"
        >
          <span className="absolute h-full w-[1.5px] rounded-full bg-current" />
          <span className="absolute h-full w-[1.5px] rounded-full bg-current rotate-45" />
          <span className="absolute h-full w-[1.5px] rounded-full bg-current rotate-90" />
          <span className="absolute h-full w-[1.5px] rounded-full bg-current [transform:rotate(135deg)]" />
        </div>

        {/* Sun body (becomes the crescent when shadow covers it) */}
        <div
          className={cn(
            "relative h-3 w-3 rounded-full bg-current transition-transform duration-500",
            isDark ? "scale-125" : "scale-100",
          )}
        >
          {/* Eclipse shadow — slides over the sun to form crescent */}
          <div
            className={cn(
              "absolute -top-[2px] -right-[2px] h-3 w-3 rounded-full bg-primary transition-all duration-500 ease-out",
              isDark ? "translate-x-0 translate-y-0 opacity-100" : "translate-x-4 -translate-y-4 opacity-0",
            )}
            aria-hidden="true"
          />
        </div>

        {/* Tiny stars that twinkle in dark mode */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-1 -left-2 h-0.5 w-0.5 rounded-full bg-current transition-all duration-500",
            isDark ? "opacity-90 animate-pulse" : "opacity-0",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-1.5 -right-1 h-[3px] w-[3px] rounded-full bg-current transition-all duration-700 delay-150",
            isDark ? "opacity-80 animate-pulse" : "opacity-0",
          )}
        />
      </div>
    </button>
  );
};
