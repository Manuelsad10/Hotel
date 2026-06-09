/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Bed,
  Layers,
  Utensils,
  BookOpen,
  DollarSign,
  Users,
  ClipboardList,
  FolderOpen,
  FileBarChart,
  UserCheck,
  Settings,
  HelpCircle,
} from "lucide-react";
import { PropertyMode, UserRole } from "../../types";
import { useHotelStore } from "../../store/hotelStore";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const store = useHotelStore();
  const profile = store.propertyProfile;
  const user = store.currentUser;

  if (!profile) return null;

  // Render navigation links dynamically
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: Object.values(UserRole) },
    { id: "timeline", label: "Bookings Timeline", icon: Calendar, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.FRONT_DESK_AGENT, UserRole.ACCOUNTANT, UserRole.CONFERENCE_COORDINATOR] },
    { id: "rooms", label: "Rooms & Floors", icon: Bed, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.FRONT_DESK_AGENT] },
    { id: "frontdesk", label: "Front Desk Ops", icon: UserCheck, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.FRONT_DESK_AGENT, UserRole.ACCOUNTANT] },
    { id: "housekeeping", label: "Housekeeping", icon: ClipboardList, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.HOUSEKEEPER, UserRole.HOUSEKEEPING_SUPERVISOR] },
    { id: "restaurant", label: "Restaurant & Bar", icon: Utensils, modes: [PropertyMode.MIDSIZE_HOTEL, PropertyMode.LARGE_HOTEL], roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.RESTAURANT_STAFF, UserRole.ACCOUNTANT] },
    { id: "conference", label: "Conference & Events", icon: Layers, modes: [PropertyMode.MIDSIZE_HOTEL, PropertyMode.LARGE_HOTEL], roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.CONFERENCE_COORDINATOR, UserRole.ACCOUNTANT] },
    { id: "amenities", label: "Spa & Amenities", icon: Sparkles, modes: [PropertyMode.LARGE_HOTEL], roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.FRONT_DESK_AGENT, UserRole.ACCOUNTANT] },
    { id: "billing", label: "Billing Ledger", icon: DollarSign, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.ACCOUNTANT] },
    { id: "guests", label: "Guest Registry", icon: BookOpen, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.FRONT_DESK_AGENT] },
    { id: "inventory", label: "Stock & Supplies", icon: FolderOpen, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.INVENTORY_MANAGER] },
    { id: "staff", label: "Employee Roster", icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER] },
    { id: "reports", label: "GTA Reports & KPIs", icon: FileBarChart, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN_MANAGER, UserRole.ACCOUNTANT] },
  ];

  // Filtering based on mode and role
  const filteredMenu = menuItems.filter((item) => {
    // Mode guard checks
    if (item.modes && !item.modes.includes(profile.mode)) {
      return false;
    }
    // Role checks
    if (user && item.roles && !item.roles.includes(user.role)) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-64 bg-brand-teal text-white flex flex-col h-screen shrink-0 border-r border-teal-950 no-print">
      
      {/* Branding Header with Logo */}
      <div className="p-6 border-b border-teal-800">
        <div className="flex items-center gap-3">
          {profile.logo ? (
            <img
              src={profile.logo}
              alt="Success Above Dreams"
              className="w-8 h-8 rounded border border-white/20 object-contain bg-white"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 bg-brand-cyan rounded flex items-center justify-center font-bold text-lg text-white">
              S
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold tracking-tight leading-tight uppercase text-white font-display">
              {profile.name ? (
                <>
                  {profile.name.split(" ").slice(0, 2).join(" ")}
                  <br />
                  <span className="text-cyan-400 font-medium text-[10px]">{profile.name.split(" ").slice(2).join(" ")}</span>
                </>
              ) : (
                "Success Above\nDreams"
              )}
            </h1>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[9px] bg-cyan-900/50 text-cyan-200 px-2 py-0.5 rounded font-bold border border-cyan-800 inline-block uppercase">
            {profile.mode === PropertyMode.GUESTHOUSE
              ? "Guesthouse B&B"
              : profile.mode === PropertyMode.MIDSIZE_HOTEL
              ? "Mid-Size Hotel"
              : "Resort Complex"}
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5 custom-scrollbar">
        {filteredMenu.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white border-l-4 border-brand-cyan shadow-sm font-bold scale-[1.01]"
                    : "text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-brand-cyan" : "text-white/50"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
        })}
      </div>

      {/* Footer profile metadata */}
      {user && (
        <div className="p-4 mt-auto border-t border-teal-800 flex flex-col gap-2.5 bg-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm uppercase shrink-0">
              {user.fullName.slice(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-tight">{user.fullName}</p>
              <p className="text-[10px] text-teal-400 font-medium truncate uppercase tracking-wider">{user.role.replace("_", " ")}</p>
            </div>
          </div>
          <button
            onClick={() => store.logoutUser()}
            className="text-[10px] text-red-400 font-bold hover:text-red-300 uppercase tracking-widest text-left pt-1 inline-block cursor-pointer hover:underline"
          >
            ← Sign Out
          </button>
        </div>
      )}

    </div>
  );
};
