"use client";

import { type ReactNode } from "react";
import type { TemplateConfig } from "@/types";

interface TemplateShellProps {
  config: TemplateConfig;
  children: ReactNode;
  icon?: string;
}

export default function TemplateShell({ config, children, icon }: TemplateShellProps) {
  const primary = config.primaryColor || "#6366f1";
  const accent = config.accentColor || "#f5c518";

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: `${primary}08` }}
    >
      {/* Header */}
      <div
        className="px-4 py-5 border-b"
        style={{ borderColor: `${primary}20`, background: `${primary}10` }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h1 className="font-bold text-xl text-gray-900">{config.name}</h1>
            {config.description && (
              <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-lg mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
