import React from "react";
import { cn } from "../../lib/utils";

export const ShimmerButton = ({
  className,
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  shimmerDuration = "3s",
  borderRadius = "100px",
  children,
  onClick,
  disabled = false,
  ...props
}) => {
  return (
    <button
      style={{
        "--shimmer-color": shimmerColor,
        "--radius": borderRadius,
        "--speed": shimmerDuration,
        "--cut": shimmerSize,
      }}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
        "transition-all duration-300 hover:scale-105 active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {/* spark container */}
      <div className="absolute inset-0 z-[-1] [container-type:size]">
        {/* spark */}
        <div className="absolute inset-0 [mask:radial-gradient(100%_100%_at_50%_50%,#000_0%,transparent_100%)]">
          <div className="absolute inset-x-[-100%] inset-y-[-100%] [animate-shimmer:0_0_100%_100%] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [--spread:90deg]" />
        </div>
      </div>

      {/* content */}
      <div className="relative z-10 flex items-center justify-center gap-2 font-bold">
        {children}
      </div>

      {/* backdrop */}
      <div className="absolute inset-[var(--cut)] z-[-1] [background:var(--bg)] [border-radius:var(--radius)]" />
    </button>
  );
};
