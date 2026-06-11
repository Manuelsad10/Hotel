import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Bed,
  UserCheck,
  ClipboardList,
  DollarSign,
  Users,
  BookOpen,
  FileBarChart,
  Settings,
} from "lucide-react";
import { UserRole } from "../../types";
import { useHotelStore } from "../../store/hotelStore";
import { Modal, Button, Input } from "../ui/design";
import defaultLogo from "../../assets/images/sad_logo_1781088567366.png";
import { SafeResetModal } from "../SafeResetModal";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const store = useHotelStore();
  const profile = store.propertyProfile;
  const user = store.currentUser;

  if (!profile) return null;

  // Header Hotel settings states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSafeResetOpen, setIsSafeResetOpen] = useState(false);
  const [cfgName, setCfgName] = useState(profile.name);
  const [cfgLogo, setCfgLogo] = useState(profile.logo || "");
  const [cfgPhone, setCfgPhone] = useState(profile.phone);
  const [cfgAddress, setCfgAddress] = useState(profile.address);
  const [cfgCheckIn, setCfgCheckIn] = useState(profile.checkInTime);
  const [cfgCheckOut, setCfgCheckOut] = useState(profile.checkOutTime);
  const [cfgVat, setCfgVat] = useState(profile.vatRate);

  useEffect(() => {
    if (profile) {
      setCfgName(profile.name);
      setCfgLogo(profile.logo || "");
      setCfgPhone(profile.phone);
      setCfgAddress(profile.address);
      setCfgCheckIn(profile.checkInTime);
      setCfgCheckOut(profile.checkOutTime);
      setCfgVat(profile.vatRate);
    }
  }, [profile]);

  // Custom 9 PMS sidebar items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.FRONT_DESK, UserRole.ACCOUNTANT] },
    { id: "rooms", label: "Rooms", icon: Bed, roles: [UserRole.ADMIN, UserRole.FRONT_DESK] },
    { id: "bookings", label: "Bookings", icon: Calendar, roles: [UserRole.ADMIN, UserRole.FRONT_DESK] },
    { id: "frontdesk", label: "Front Desk", icon: UserCheck, roles: [UserRole.ADMIN, UserRole.FRONT_DESK] },
    { id: "housekeeping", label: "Housekeeping", icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.HOUSEKEEPER] },
    { id: "billing", label: "Billing", icon: DollarSign, roles: [UserRole.ADMIN, UserRole.FRONT_DESK, UserRole.ACCOUNTANT] },
    { id: "guests", label: "Guests", icon: BookOpen, roles: [UserRole.ADMIN, UserRole.FRONT_DESK] },
    { id: "staff", label: "Staff", icon: Users, roles: [UserRole.ADMIN] },
    { id: "reports", label: "Reports", icon: FileBarChart, roles: [UserRole.ADMIN, UserRole.ACCOUNTANT] },
  ];

  // Filtering based on role
  const filteredMenu = menuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="w-64 bg-neutral-950 text-neutral-200 flex flex-col h-screen shrink-0 border-r border-[#1a1a1a] no-print select-none">
      
      {/* Success Above Dreams (SAD) Header branding with logo */}
      <div className="p-6 border-b border-[#1a1a1a] bg-neutral-900/40">
        <div className="flex items-center gap-3">
          <img
            src={profile.logo || defaultLogo}
            alt="Success Above Dreams logo"
            className="w-10 h-10 rounded-lg border border-gold-500/25 object-cover bg-white"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden flex-1">
            <h1 className="text-xs font-black tracking-wider uppercase text-white font-display flex items-center justify-between">
              <span className="text-gold-400">SAD PMS</span>
              {user?.role === UserRole.ADMIN && (
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Configure Hotel Profile & Logo"
                  className="p-1 hover:bg-neutral-800 rounded-md text-gold-500 hover:text-gold-400 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow hover:rotate-45" />
                </button>
              )}
            </h1>
            <p className="text-[10px] text-neutral-400 truncate font-semibold">
              {profile.name}
            </p>
          </div>
        </div>
      </div>

      {/* Nav list - Black Background with Gold Accent Highlighting */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-gold-500 text-neutral-950 font-bold shadow-lg scale-[1.01]"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? "text-neutral-950" : "text-neutral-500 group-hover:text-neutral-350"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom user profile info card */}
      {user && (
        <div className="p-4 border-t border-[#1a1a1a] bg-neutral-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-xs font-bold text-neutral-950 uppercase shrink-0">
              {user.fullName.slice(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-tight">{user.fullName}</p>
              <p className="text-[9px] text-gold-400 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => store.logoutUser()}
            className="text-[10px] text-red-400 font-bold hover:text-red-300 hover:underline uppercase tracking-widest text-left pt-1 inline-block cursor-pointer"
          >
            ← Sign Out
          </button>
        </div>
      )}

      {/* HOTEL SETTINGS MODAL */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Success Above Dreams - Company Settings"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!cfgName || !cfgPhone || !cfgAddress) {
              store.addToast("Hotel name, phone number, and address are required.", "error");
              return;
            }
            store.updatePropertyProfile({
              name: cfgName,
              logo: cfgLogo || undefined,
              phone: cfgPhone,
              address: cfgAddress,
              checkInTime: cfgCheckIn,
              checkOutTime: cfgCheckOut,
              vatRate: Number(cfgVat),
            });
            setIsSettingsOpen(false);
          }}
          className="space-y-4 text-xs font-semibold"
        >
          <Input
            label="Property Name *"
            required
            value={cfgName}
            onChange={(e) => setCfgName(e.target.value)}
            placeholder="e.g. Success Above Dreams Lodge"
          />

          {/* Interactive Logo Uploader inside modal */}
          <div className="space-y-2 text-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Company Logo Image</span>
            
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {cfgLogo ? (
                  <img src={cfgLogo} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] uppercase font-black text-slate-400">Empty</span>
                )}
              </div>
              
              <div className="space-y-1.5 flex-1">
                <div className="flex gap-2">
                  <label className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors">
                    Upload image...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            store.addToast("File exceeds 2MB limit.", "error");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setCfgLogo(event.target.result as string);
                              store.addToast("New logo loaded. Ready to save!", "success");
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {cfgLogo !== defaultLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setCfgLogo(defaultLogo);
                        store.addToast("Reverted logo back to default SAD template logo.", "success");
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                    >
                      Use SAD Default
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">PNG/JPEG supported up to 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-slate-800">
            <Input
              label="Contact Phone Number *"
              required
              value={cfgPhone}
              onChange={(e) => setCfgPhone(e.target.value)}
              placeholder="+233 24 000 0050"
            />
            <Input
              label="Accra Address Location *"
              required
              value={cfgAddress}
              onChange={(e) => setCfgAddress(e.target.value)}
              placeholder="e.g. Airport Residential, Accra"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-slate-800">
            <Input
              label="Check-In"
              type="time"
              value={cfgCheckIn}
              onChange={(e) => setCfgCheckIn(e.target.value)}
            />
            <Input
              label="Check-Out"
              type="time"
              value={cfgCheckOut}
              onChange={(e) => setCfgCheckOut(e.target.value)}
            />
            <Input
              label="VAT Rate (%)"
              type="number"
              min="0"
              max="50"
              value={cfgVat}
              onChange={(e) => setCfgVat(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="w-1/2 font-bold text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-1/2 font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Configurations
            </Button>
          </div>

          {/* DANGER ZONE - SYSTEM SYSTEM RESET */}
          <div className="mt-6 pt-5 border-t border-red-100 bg-red-50/50 p-4 rounded-xl space-y-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-red-700 font-sans">
              ⚠️ System Action (Danger Zone)
            </h4>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-slate-800 font-black text-[11px] uppercase tracking-wide">Perform Factory Reset</p>
                <p className="text-slate-500 font-semibold text-[10px] leading-snug">
                  Wipe all logs, reservations, bills, rooms, & administrative accounts to start clean setup over.
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsSafeResetOpen(true);
                }}
                className="bg-red-650 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest px-3 py-2 shrink-0 shadow-md animate-pulse"
              >
                Factory Reset...
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* SECURE SYSTEM RESET DIALOG */}
      <SafeResetModal
        isOpen={isSafeResetOpen}
        onClose={() => setIsSafeResetOpen(false)}
      />

    </div>
  );
};
