import React, { useState } from "react";
import { useHotelStore } from "./store/hotelStore";
import { UserRole } from "./types";
import { SetupWizard } from "./modules/setup/SetupWizard";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ToastContainer } from "./components/ui/design";
import defaultLogo from "./assets/images/sad_logo_1781088567366.png";

// Core 9 Success Above Dreams (SAD) Module Imports
import { DashboardView } from "./modules/dashboard/DashboardView";
import { RoomModule } from "./modules/rooms/RoomModule";
import { ReservationModule } from "./modules/reservations/ReservationModule";
import { FrontDeskModule } from "./modules/frontdesk/FrontDeskModule";
import { HousekeepingModule } from "./modules/housekeeping/HousekeepingModule";
import { BillingModule } from "./modules/billing/BillingModule";
import { GuestModule } from "./modules/guests/GuestModule";
import { StaffModule } from "./modules/staff/StaffModule";
import { ReportsModule } from "./modules/reports/ReportsModule";

export default function App() {
  const store = useHotelStore();
  
  // Check Setup & Authentication states
  const isSetup = store.propertyProfile !== null;
  const isLoggedIn = store.currentUser !== null;

  // Active workspace tab state (Default: dashboard overview)
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Login Gate States
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      store.addToast("Username and password are required.", "error");
      return;
    }

    // Attempt to match login inside the staffList store
    const matched = store.staffList.find(
      (s) => s.username === loginUsername && s.psw === loginPassword && s.status === "Active"
    );

    if (matched) {
      store.loginUser(matched.fullName, matched.role);
      // Auto transition active tab depending on the role to follow "Privacy First" policy
      if (matched.role === UserRole.HOUSEKEEPER) {
        setActiveTab("housekeeping");
      } else if (matched.role === UserRole.ACCOUNTANT) {
        setActiveTab("billing");
      } else {
        setActiveTab("dashboard");
      }
      store.addToast(`Access granted. Welcome back, ${matched.fullName}!`, "success");
    } else {
      store.addToast("Access credentials denied. Check username & password.", "error");
    }
  };

  const handleQuickEmployeeLogin = (fullName: string, role: UserRole, username: string) => {
    store.loginUser(fullName, role);
    if (role === UserRole.HOUSEKEEPER) {
      setActiveTab("housekeeping");
    } else if (role === UserRole.ACCOUNTANT) {
      setActiveTab("billing");
    } else {
      setActiveTab("dashboard");
    }
    store.addToast(`Logged in as ${fullName} (${role})`, "success");
  };

  // 1. If Setup hasn't completed, route to the Setup Form
  if (!isSetup) {
    return (
      <>
        <SetupWizard />
        <ToastContainer />
      </>
    );
  }

  // 2. If Setup is complete, but not logged in, prompt direct credentials gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(175,132,59,0.18),rgba(255,255,255,0))]">
        <div className="w-full max-w-md bg-[#121214] border border-gold-500/20 rounded-2xl shadow-2xl p-8 space-y-6 text-white text-xs relative before:absolute before:inset-0 before:rounded-2xl before:border-t before:border-gold-300/10 before:pointer-events-none">
          
          <div className="text-center space-y-2">
            <img
              src={store.propertyProfile?.logo || defaultLogo}
              alt="Success Above Dreams (SAD) Logo"
              className="mx-auto h-16 w-16 rounded-2xl border border-gold-500/25 object-cover bg-white shadow-xl mb-3"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              {store.propertyProfile?.name || "Success Above Dreams (SAD) PMS"}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              AUTHORIZED PERSONNEL ONLY • VERIFICATION SECURITY REQUIRED
            </p>
          </div>

          {/* Secure Login Form */}
          <form onSubmit={handleLocalLogin} className="space-y-4 font-semibold">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-gold-400/90 uppercase tracking-widest">
                Username Identifier
              </span>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-all duration-300 font-mono text-sm text-white"
                placeholder="e.g. admin"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-gold-400/90 uppercase tracking-widest">
                System Password / PIN
              </span>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-all duration-300 font-mono tracking-widest text-sm text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 outline-none text-neutral-950 rounded-xl font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(175,132,59,0.15)] text-[10px] active:scale-98"
            >
              Secure Sign In &rarr;
            </button>
          </form>

          {/* Quick Roster testing profiles */}
          <div className="space-y-3 pt-5 border-t border-neutral-850">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              Internal Simulation profiles
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleQuickEmployeeLogin("Emmanuel Admin", UserRole.ADMIN, "admin")}
                className="p-2.5 border border-neutral-800 bg-[#18181b]/40 rounded-xl hover:bg-gold-500/5 hover:border-gold-500/40 text-left transition-all duration-300 cursor-pointer"
              >
                <span className="font-extrabold text-slate-200 block truncate">Adwoa Admin</span>
                <span className="text-[8px] text-gold-450 text-gold-400 font-extrabold uppercase font-mono">ADMINISTRATOR</span>
              </button>
              <button
                onClick={() => handleQuickEmployeeLogin("Kwame Front Desk", UserRole.FRONT_DESK, "kwame")}
                className="p-2.5 border border-neutral-800 bg-[#18181b]/40 rounded-xl hover:bg-gold-500/5 hover:border-gold-500/40 text-left transition-all duration-300 cursor-pointer"
              >
                <span className="font-extrabold text-slate-200 block truncate">Kwame FD</span>
                <span className="text-[8px] text-neutral-400 font-extrabold uppercase font-mono">FRONT DESK</span>
              </button>
              <button
                onClick={() => handleQuickEmployeeLogin("Comfort Housekeeping", UserRole.HOUSEKEEPER, "comfort")}
                className="p-2.5 border border-neutral-800 bg-[#18181b]/40 rounded-xl hover:bg-gold-500/5 hover:border-gold-500/40 text-left transition-all duration-300 cursor-pointer"
              >
                <span className="font-extrabold text-slate-200 block truncate">Comfort H.</span>
                <span className="text-[8px] text-amber-500 font-bold uppercase font-mono">HOUSEKEEPER</span>
              </button>
              <button
                onClick={() => handleQuickEmployeeLogin("David Accountant", UserRole.ACCOUNTANT, "david")}
                className="p-2.5 border border-neutral-800 bg-[#18181b]/40 rounded-xl hover:bg-gold-500/5 hover:border-gold-500/40 text-left transition-all duration-300 cursor-pointer"
              >
                <span className="font-extrabold text-slate-200 block truncate">David Acc.</span>
                <span className="text-[8px] text-gold-300 font-extrabold uppercase font-mono">ACCOUNTANT</span>
              </button>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-500 font-mono uppercase tracking-wider">
            Success Above Dreams (SAD) PMS Verification Engine
          </div>

        </div>
        <ToastContainer />
      </div>
    );
  }

  // 3. Main Operational Workspace application
  return (
    <>
      <div className="flex h-screen bg-[#faf9f6]/95 overflow-hidden relative font-sans text-xs antialiased text-neutral-900 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px]">
        
        {/* Navy blue sidebar layout listing 9 modules */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right workspace container */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Topbar with Gh local clock + wipe button */}
          <Topbar activeTab={activeTab} />

          {/* Screen Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth scrollbar-thin">
            
            {activeTab === "dashboard" && (
              <DashboardView
                onSelectBooking={(id) => {
                  setActiveTab("billing");
                }}
                onLaunchNewBooking={() => setActiveTab("bookings")}
                onLaunchNewGuest={() => setActiveTab("guests")}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "rooms" && <RoomModule />}

            {activeTab === "bookings" && <ReservationModule />}

            {activeTab === "frontdesk" && <FrontDeskModule />}

            {activeTab === "housekeeping" && <HousekeepingModule />}

            {activeTab === "billing" && <BillingModule />}

            {activeTab === "guests" && <GuestModule />}

            {activeTab === "staff" && <StaffModule />}

            {activeTab === "reports" && <ReportsModule />}

          </main>

        </div>
      </div>

      <ToastContainer />
    </>
  );
}
