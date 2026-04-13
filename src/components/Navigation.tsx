"use client";

import { UtensilsCrossed, Trophy, User } from "lucide-react";
import { useI18n } from "@/i18n";
import type { TabKey } from "@/lib/types";

interface TabConfig {
  key: TabKey;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { key: "log",       labelKey: "tabs.log",       Icon: UtensilsCrossed },
  { key: "challenge", labelKey: "tabs.challenge",  Icon: Trophy },
  { key: "profile",   labelKey: "tabs.profile",    Icon: User },
];

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useI18n();
  return (
    <nav
      className="sticky bottom-0 pb-safe border-t border-gray-200 bg-white/95 backdrop-blur-lg z-10"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex">
        {TABS.map(({ key, labelKey, Icon }) => {
          const label = t(labelKey);
          const isActive = key === activeTab;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors active:scale-95 ${
                isActive ? "text-orange-500" : "text-gray-400"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-all ${isActive ? "scale-110" : "scale-100"}`}
                aria-hidden="true"
              />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
              {isActive && (
                <span className="block w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
