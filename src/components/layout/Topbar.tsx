import React, { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { UserRole } from "../../types";
import { SafeResetModal } from "../SafeResetModal";

interface TopbarProps {
  activeTab: string;
}

export const Topbar: React.FC<TopbarProps> = ({ activeTab }) => {
  const store = useHotelStore();
  const profile = store.propertyProfile;
  const user = store.currentUser;

  const [timeStr, setTimeStr] = useState("");
  const [isSafeResetOpen, setIsSafeResetOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = e.target.value as UserRole;
    store.loginUser(user?.fullName || "Staff", nextRole);
  };

  const getTabTitle = () => {
    const maps: Record<string, string> = {
      dashboard: "Dashboard Overview",
      rooms: "Hotel Room Directory",
      bookings: "Bookings & Reservations",
      frontdesk: "Front Desk Check In",
      housekeeping: "Housekeeper Console",
      billing: "Billing & Transactions",
      guests: "Guest Directory",
      staff: "Employee Directory",
      reports: "Statistical & GTA Reports",
    };
    return maps[activeTab] || activeTab;
  };

  return (
    <>
      <div className="h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 flex items-center justify-between px-8 shrink-0 no-print select-none">
        
        {/* Left header title */}
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold font-display uppercase text-neutral-950 tracking-wider">
            {getTabTitle()}
          </h2>
          <span className="px-2.5 py-0.5 bg-neutral-950 text-gold-400 text-[10px] font-black rounded-md border border-gold-500/30 uppercase tracking-widest">
            SAD PMS
          </span>
        </div>

        {/* Right tools and utilities */}
        <div className="flex items-center gap-4 text-xs font-semibold text-neutral-800">
          
          {/* Real-time local clock */}
          <div className="hidden md:flex items-center gap-1.5 bg-neutral-950 border border-gold-500/20 px-3 py-1.5 rounded-lg text-gold-400 font-mono text-[11px] font-bold shadow-md">
            <Clock className="w-3.5 h-3.5 text-gold-500" />
            <span>ACCRA: {timeStr}</span>
          </div>

          {/* Quick role-based login simulator */}
          {user && (
            <div className="flex items-center gap-2 bg-white border border-neutral-300 px-2.5 py-1 rounded-lg shadow-sm">
              <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider hidden lg:inline px-1">
                Role Selector:
              </span>
              <select
                value={user.role}
                onChange={handleRoleChange}
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-[10px] uppercase text-neutral-800 select-none py-0.5 focus:ring-0 focus:ring-offset-0 font-sans"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role} View
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Wipe and return to Setup Form (Only premium administrators) */}
          {user?.role === UserRole.ADMIN && (
            <button
              id="wipe-system-btn"
              onClick={() => setIsSafeResetOpen(true)}
              title="Wipe configuration database and prompt Setup configuration form"
              className="px-3 py-1.5 flex items-center gap-1.5 text-red-650 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-lg shadow-sm font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset & Clear System</span>
            </button>
          )}

        </div>

      </div>

      {/* SECURE SYSTEM RESET DIALOG */}
      <SafeResetModal
        isOpen={isSafeResetOpen}
        onClose={() => setIsSafeResetOpen(false)}
      />
    </>
  );
};
