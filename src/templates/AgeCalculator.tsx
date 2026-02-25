"use client";

import { useState } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function computeAge(dob: Date, now: Date) {
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function daysUntilNextBirthday(dob: Date, now: Date): number {
  const thisYear = now.getFullYear();
  let next = new Date(thisYear, dob.getMonth(), dob.getDate());
  if (next <= now) {
    next = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
  }
  const diffMs = next.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function totalDaysLived(dob: Date, now: Date): number {
  return Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AgeCalculator({ config }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const [dobStr, setDobStr] = useState("");

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let result: {
    years: number;
    months: number;
    days: number;
    daysUntilBirthday: number;
    totalDays: number;
    totalHours: number;
    birthDayOfWeek: string;
    isBirthdayToday: boolean;
  } | null = null;

  if (dobStr) {
    const dob = new Date(dobStr + "T00:00:00");
    if (!isNaN(dob.getTime()) && dob < now) {
      const { years, months, days } = computeAge(dob, now);
      const totalDays = totalDaysLived(dob, now);
      const daysUntilBirthday = daysUntilNextBirthday(dob, now);
      result = {
        years,
        months,
        days,
        daysUntilBirthday,
        totalDays,
        totalHours: totalDays * 24,
        birthDayOfWeek: DAYS_OF_WEEK[dob.getDay()],
        isBirthdayToday: daysUntilBirthday === 365 || daysUntilBirthday === 366,
      };
      // Check if today IS the birthday
      const sameDayMonth = dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate();
      if (sameDayMonth) {
        result.isBirthdayToday = true;
        result.daysUntilBirthday = 0;
      }
    }
  }

  const stats = result
    ? [
        { label: "Years", value: result.years, sub: `${result.months} months, ${result.days} days` },
        { label: "Days until birthday", value: result.isBirthdayToday ? "🎂 Today!" : result.daysUntilBirthday, sub: result.isBirthdayToday ? "Happy Birthday!" : "days to go" },
        { label: "Total days lived", value: result.totalDays.toLocaleString(), sub: "days" },
        { label: "Total hours lived", value: result.totalHours.toLocaleString(), sub: "hours" },
        { label: "Born on a", value: result.birthDayOfWeek, sub: "" },
      ]
    : [];

  // Max date is today
  const maxDate = now.toISOString().split("T")[0];

  return (
    <TemplateShell config={config} icon="🎂">
      <div className="p-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={dobStr}
            max={maxDate}
            onChange={(e) => setDobStr(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
            style={{ borderColor: dobStr ? color : undefined }}
          />
        </div>

        {result ? (
          <div className="space-y-3">
            {/* Main age display */}
            <div
              className="rounded-2xl p-5 text-center"
              style={{ backgroundColor: `${color}10`, border: `2px solid ${color}30` }}
            >
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Age</p>
              <p className="text-5xl font-bold" style={{ color }}>
                {result.years}
              </p>
              <p className="text-lg text-gray-600 mt-1">
                years, {result.months} months &amp; {result.days} days
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.slice(1).map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 bg-white border border-gray-100"
                >
                  <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-gray-800">{s.value}</p>
                  {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
          >
            <p className="text-4xl mb-3">🗓️</p>
            <p className="text-gray-400 text-sm">Pick your date of birth to see your age details</p>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
