/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useHotelStore } from "./store/hotelStore";
import { PropertyMode, UserRole } from "./types";
import { SetupWizard } from "./modules/setup/SetupWizard";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ToastContainer } from "./components/ui/design";
import { FolioSlideOver } from "./components/shared/FolioSlideOver";

// Module Imports
import { DashboardView } from "./modules/dashboard/DashboardView";
import { RoomModule } from "./modules/rooms/RoomModule";
import { ReservationModule } from "./modules/reservations/ReservationModule";
import { FrontDeskModule } from "./modules/frontdesk/FrontDeskModule";
import { HousekeepingModule } from "./modules/housekeeping/HousekeepingModule";
import { RestaurantModule } from "./modules/restaurant/RestaurantModule";
import { ConferenceModule } from "./modules/conference/ConferenceModule";
import { AmenityModule } from "./modules/amenities/AmenityModule";
import { BillingModule } from "./modules/billing/BillingModule";
import { GuestModule } from "./modules/guests/GuestModule";
import { InventoryModule } from "./modules/inventory/InventoryModule";
import { StaffModule } from "./modules/staff/StaffModule";
import { ReportsModule } from "./modules/reports/ReportsModule";

export default function App() {
  const store = useHotelStore();
  
  // Checking Setup state
  const isSetup = store.propertyProfile !== null;
  const isLoggedIn = store.currentUser !== null;

  // Active workspace tab state
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Reservation launchers states
  const [openReservationIdForFolio, setOpenReservationIdForFolio] = useState<string>("");
  const [isNewBookingLauncherOpen, setIsNewBookingLauncherOpen] = useState(false);
  
  // Pre-loaded parameters for double clicks/clicks on timeline cells
  const [calendarPreSelectedRoom, setCalendarPreSelectedRoom] = useState("");
  const [calendarPreSelectedDate, setCalendarPreSelectedDate] = useState("");

  // Login states for demo logins
  const [loginUser, setLoginUser] = useState("admin");
  const [loginPsw, setLoginPsw] = useState("admin");

  const handleOpenFolio = (id: string) => {
    setOpenReservationIdForFolio(id);
  };

  const handleCloseFolio = () => {
    setOpenReservationIdForFolio("");
  };

  const handleLaunchBookingFlowFromCell = (roomId?: string, date?: string) => {
    setCalendarPreSelectedRoom(roomId || "");
    setCalendarPreSelectedDate(date || "");
    setIsNewBookingLauncherOpen(true);
    setActiveTab("timeline"); // Switch to reservation timeline module
  };

  const handleLaunchNewBookingDirect = () => {
    setCalendarPreSelectedRoom("");
    setCalendarPreSelectedDate("");
    setIsNewBookingLauncherOpen(true);
    setActiveTab("timeline");
  };

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate lookup. We set default passwords to 'admin' of course
    const success = store.loginUser(loginUser, UserRole.SUPER_ADMIN);
    if (!success) {
      store.addToast("Access credentials denied", "error");
    } else {
      store.addToast(`Access granted! Welcome ${loginUser}`, "success");
    }
  };

  // 1. If Setup hasn't completed, route to the Wizard Setup
  if (!isSetup) {
    return (
      <>
        <SetupWizard />
        <ToastContainer />
      </>
    );
  }

  // 2. If Setup is complete, but not logged in, prompt credentials gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-brand-teal p-6 text-white text-center pb-8 relative">
            <h2 className="text-base font-black uppercase tracking-widest font-display text-cyan-200">
              {store.propertyProfile?.name || "StayCore Gate"}
            </h2>
            <p className="text-[10px] text-zinc-300 font-bold uppercase mt-1">
              Operational Management Portal
            </p>
            <div className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 w-11 h-11 bg-white text-brand-teal flex items-center justify-center font-bold text-sm rounded-full shadow-md border border-slate-100">
              SAD
            </div>
          </div>

          <form onSubmit={handleLocalLogin} className="p-6 pt-10 space-y-4 text-xs font-semibold">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Username / Handset login
              </label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="px-3.5 py-2.5 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-all text-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Passcode keys
              </label>
              <input
                type="password"
                required
                value={loginPsw}
                onChange={(e) => setLoginPsw(e.target.value)}
                className="px-3.5 py-2.5 text-slate-850 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-all text-sm font-medium"
              />
            </div>

            <div className="bg-slate-50 p-2.5 border rounded-lg text-[9.5px] leading-relaxed text-slate-500 font-mono italic text-center">
              * DEFAULT TESTING CODE: admin / admin *
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all cursor-pointer mt-2"
            >
              Sign In to StayCore
            </button>
          </form>

        </div>
        <ToastContainer />
      </div>
    );
  }

  // 3. Main Workspace application
  return (
    <>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative font-sans text-xs antialiased text-slate-800">
        
        {/* Dynamic property-adapted left navigation sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right workspace container */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Status headers and access control simulator */}
          <Topbar activeTab={activeTab} />

          {/* Core scrollable screen body */}
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
            
            {activeTab === "dashboard" && (
              <DashboardView
                onSelectBooking={handleOpenFolio}
                onLaunchNewBooking={handleLaunchNewBookingDirect}
                onLaunchNewGuest={() => setActiveTab("guests")}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "timeline" && (
              <ReservationModule
                onSelectBooking={handleOpenFolio}
                isNewBookingLauncherOpen={isNewBookingLauncherOpen}
                setIsNewBookingLauncherOpen={setIsNewBookingLauncherOpen}
                preSelectedRoomId={calendarPreSelectedRoom}
                preSelectedDate={calendarPreSelectedDate}
              />
            )}

            {activeTab === "rooms" && (
              <RoomModule
                onSelectBooking={handleOpenFolio}
                onLaunchNewBooking={handleLaunchBookingFlowFromCell}
              />
            )}

            {activeTab === "frontdesk" && (
              <FrontDeskModule
                onOpenFolio={handleOpenFolio}
                onLaunchNewBooking={handleLaunchNewBookingDirect}
              />
            )}

            {activeTab === "housekeeping" && <HousekeepingModule />}

            {activeTab === "restaurant" && <RestaurantModule />}

            {activeTab === "conference" && <ConferenceModule />}

            {activeTab === "amenities" && <AmenityModule />}

            {activeTab === "billing" && <BillingModule onOpenFolio={handleOpenFolio} />}

            {activeTab === "guests" && <GuestModule />}

            {activeTab === "inventory" && <InventoryModule />}

            {activeTab === "staff" && <StaffModule />}

            {activeTab === "reports" && <ReportsModule />}

          </main>

        </div>
      </div>

      {/* Global Invoice sliding panel */}
      {openReservationIdForFolio && (
        <FolioSlideOver
          isOpen={!!openReservationIdForFolio}
          onClose={handleCloseFolio}
          reservationId={openReservationIdForFolio}
        />
      )}

      {/* Persistent global notification alerts hook */}
      <ToastContainer />
    </>
  );
}
