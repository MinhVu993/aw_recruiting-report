"use client";

import React from "react";

interface BentoContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoContainer: React.FC<BentoContainerProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`w-full h-full flex-1 min-h-0 p-2 sm:p-2.5 lg:p-3 grid grid-cols-1 md:grid-cols-12 lg:grid-rows-12 gap-2 sm:gap-2.5 lg:gap-3 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};
