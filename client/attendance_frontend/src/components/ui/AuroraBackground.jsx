import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col  h-[100vh] items-center justify-center bg-zinc-950  text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={cn(
              `
            [--white-gradient:linear-gradient(to_bottom,white,transparent)]
            [--dark-gradient:linear-gradient(to_bottom,black,transparent)]
            [--aurora:repeating-linear-gradient(100deg,#0ea5e9_0%,#38bdf8_7%,#818cf8_15%,#6366f1_20%,#a855f7_25%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[30px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-30`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,transparent_80%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
