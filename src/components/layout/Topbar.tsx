/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Clock, RefreshCw, Smartphone, ShieldCheck, User, Users } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { PropertyMode, UserRole } from "../../types";
import { Select, Button, ConfirmDialog } from "../ui/design";

interface TopbarProps {
  activeTab: string;
}

export const Topbar: React.FC<TopbarProps> = ({ activeTab }) => {
  const store = useHotelStore();
  const profile = store.propertyProfile;
  const user = store.currentUser;

  // Clock state matching Ghana Local Time format
  const [timeStr, setTimeStr] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      // Ghana is GMT+0
      const d = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTimeStr(d.toLocaleTimeString("en-US", options));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as UserRole;
    store.loginUser(user?.username || "Admin", value);
  };

  // Humanize tab title
  const getTabTitle = () => {
    const maps: Record<string, string> = {
      dashboard: "Executive KPI Dashboard",
      timeline: "Room Availability Gantt Chart",
      rooms: "Floors & Bulk Room Manager",
      frontdesk: "Reception Desk Front office",
      housekeeping: "Maid Services & Assignments",
      restaurant: "In-Hotel Restaurant Menu & KDS",
      conference: "Conference Reservations Board",
      amenities: "Spa & Recreational Bookings",
      billing: "Guest Accounts Billing Ledger",
      guests: "Loyalty Profiles Registry",
      inventory: "Materials Storage & Reorder Levels",
      staff: "Human Resources Employee Roster",
      reports: "GTA Compliant Reports & Audits",
    };
    return maps[activeTab] || activeTab;
  };

  return (
    <>
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 no-print">
        
        {/* Left segment - Screen and breadcrumbs */}
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wider font-display">
            {getTabTitle()}
          </h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-200">
            Mode: {profile?.mode === PropertyMode.GUESTHOUSE
              ? "Guesthouse B&B"
              : profile?.mode === PropertyMode.MIDSIZE_HOTEL
              ? "Mid-Size Hotel"
              : "Large Hotel / Resort"}
          </span>
        </div>

        {/* Right segment - Tools & active clock */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
          
          {/* Active Ghana Clock */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-mono text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>ACCRA: {timeStr}</span>
          </div>

          {/* Nightly Run Emulator */}
          {user?.role === UserRole.SUPER_ADMIN && (
            <button
              onClick={() => store.triggerNightlyRoomCharges()}
              title="Manually simulate the midnight clock background-run that posts nightly room fares to folios"
              className="p-2 border border-slate-200 rounded-lg hover:bg-zinc-50 flex items-center justify-center cursor-pointer transition-colors text-brand-teal gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-brand">Post Nightly</span>
            </button>
          )}

          {/* Quick Role switcher helper for demonstration */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest hidden lg:inline">
                Access Simulator
              </span>
              <select
                value={user.role}
                onChange={handleRoleChange}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer font-bold text-[10px] uppercase tracking-wider text-slate-700 focus:border-brand-teal transition-colors"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={() => setConfirmResetOpen(true)}
            title="Wipe LocalStorage database state and return to setup wizard"
            className="p-2 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg hover:border-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Delete/Reset database confirmation modal */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={() => store.resetAllData()}
        title="Wipe and Factory Reset System"
        message="This operation is irreversible! This will completely clear all local database records, bookings timeline calendars, employees roster, and settings config, and return the hotel application to the First-Launch setup wizard."
        confirmText="Confirm Reset"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
