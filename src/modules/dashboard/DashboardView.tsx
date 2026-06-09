/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Bed,
  TrendingUp,
  UserCheck,
  UserX,
  Package,
  ClipboardList,
  PlusCircle,
  Bell,
  Sparkles,
  ArrowRight,
  UserCheck2,
} from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { RoomStatus, ReservationStatus, HousekeepingStatus } from "../../types";
import { Card, Badge, Button } from "../../components/ui/design";

interface DashboardViewProps {
  onSelectBooking: (id: string) => void;
  onLaunchNewBooking: () => void;
  onLaunchNewGuest: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectBooking,
  onLaunchNewBooking,
  onLaunchNewGuest,
  onNavigateTab,
}) => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const reservations = store.reservations;
  const guests = store.guests;
  const folios = store.folios;
  const inventory = store.inventoryList;

  // 1. Calculations:
  // Rooms filters
  const totalRoomsCount = rooms.length || 1;
  const occupiedRooms = rooms.filter((r) => r.status === RoomStatus.OCCUPIED);
  const occupiedCount = occupiedRooms.length;
  const availableCount = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;

  // Occupancy rate calculation
  const occupancyPercentage = Math.round((occupiedCount / totalRoomsCount) * 100);

  // Today dates YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // Arrivals today: reservations with checkInDate = today and status not cancelled/no-show
  const arrivalsToday = reservations.filter(
    (r) =>
      r.checkInDate === todayStr &&
      r.status !== ReservationStatus.CANCELLED &&
      r.status !== ReservationStatus.NO_SHOW
  );

  // Departures today: reservations with checkOutDate = today and status checked-in or checked-out
  const departuresToday = reservations.filter(
    (r) =>
      r.checkOutDate === todayStr &&
      (r.status === ReservationStatus.CHECKED_IN || r.status === ReservationStatus.CHECKED_OUT)
  );

  // Revenue calculation:
  // Sum of payments recorded on any invoice today + manual invoices
  const todayPaymentsSum = Object.values(folios).reduce((sum, fol) => {
    const todayFers = fol.payments.filter((p) => p.timestamp.startsWith(todayStr));
    const daySettle = todayFers.reduce((s, pay) => s + pay.amountPesewas, 0);
    return sum + daySettle;
  }, 0);

  // Housekeeping counts
  const cleanCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.CLEAN || r.housekeepingStatus === HousekeepingStatus.INSPECTED).length;
  const dirtyCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.DIRTY).length;
  const inspectingCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.INSPECTING).length;

  // Filter low stock
  const lowStockItems = inventory.filter((item) => item.stockLevel <= item.reorderLevel);

  // Recent reservations: last 4 created
  const recentBookings = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Quick top welcome alerts banner */}
      <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-brand-teal/10 rounded-lg text-brand-teal">
            <Sparkles className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-widest leading-none">
              StayCore Orchestrator Live
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              System running successfully with {store.currentUser?.fullName} online. Check outstanding low stock warnings.
            </p>
          </div>
        </div>

        {/* Quick action buttons container */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onLaunchNewBooking}
            className="flex-1 sm:flex-none px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-brand-teal text-white hover:bg-brand-teal/90 rounded-lg shadow-sm font-sans flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> New Booking
          </button>
          <button
            onClick={onLaunchNewGuest}
            className="flex-1 sm:flex-none px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg font-sans flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Add Profile
          </button>
        </div>
      </div>

      {/* KPI Stats cards board */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Rooms Occupied */}
        <Card className="p-4 flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Occupied Tonight
            </span>
            <p className="text-2xl font-black font-display text-slate-800 mt-1.5">
              {occupiedCount}
            </p>
          </div>
          <p className="text-[9px] text-slate-500 font-mono">
            / {totalRoomsCount} Rooms configured
          </p>
        </Card>

        {/* Checkins Today */}
        <Card className="p-4 flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Check-Ins Today
            </span>
            <p className="text-2xl font-black font-display text-slate-800 mt-1.5">
              {arrivalsToday.length}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] text-emerald-600 font-bold uppercase">Arrival operations</p>
          </div>
        </Card>

        {/* Checkouts today */}
        <Card className="p-4 flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Check-Outs Today
            </span>
            <p className="text-2xl font-black font-display text-slate-800 mt-1.5">
              {departuresToday.length}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <p className="text-[9px] text-yellow-600 font-bold uppercase">Folio settlements</p>
          </div>
        </Card>

        {/* Dynamic estimated revenue today */}
        <Card className="p-4 flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Cash receipts today
            </span>
            <p className="text-2xl font-black font-mono text-emerald-600 mt-1.5">
              ₵{(todayPaymentsSum / 100).toFixed(2)}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-mono">
            MOMOs & direct channels
          </p>
        </Card>

        {/* Rooms Available */}
        <Card className="p-4 flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              House Available
            </span>
            <p className="text-2xl font-black font-display text-slate-800 mt-1.5">
              {availableCount}
            </p>
          </div>
          <p className="text-[9px] text-slate-500 font-mono">
            Ready to receive walk-ins
          </p>
        </Card>

      </div>

      {/* Main middle grid: Occupancy Gauge vs Today's Operations lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left column - Occupancy gauge & Housekeeping */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Circular Occupancy gauge chart (Tailwind concentric circular design) */}
          <Card className="p-6 text-center space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Live House Occupancy Gauge
            </h4>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center pt-2">
              {/* Semi concentric stroke circle ring */}
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-brand-teal fill-none transition-all duration-500"
                  strokeWidth="10"
                  strokeDasharray="351.8"
                  strokeDashoffset={351.8 - (351.8 * (occupancyPercentage || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-2xl font-black font-display text-slate-800">
                  {occupancyPercentage}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Occupied
                </span>
              </div>
            </div>

            <div className="flex justify-around text-xs border-t border-slate-50 pt-3">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Occupied</p>
                <span className="font-bold font-mono text-slate-700">{occupiedCount}</span>
              </div>
              <div className="border-r border-slate-100" />
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Empty ready</p>
                <span className="font-bold font-mono text-slate-700">{availableCount}</span>
              </div>
            </div>
          </Card>

          {/* Housekeeping state widget */}
          <Card className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Room Cleanup Statuses
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs p-2 bg-emerald-50 rounded-lg text-emerald-800 font-medium">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Clean / Inspected</span>
                <span className="font-bold">{cleanCount} Rooms</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-red-50 rounded-lg text-red-800 font-medium">
                <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Dirty / Unattended</span>
                <span className="font-bold">{dirtyCount} Rooms</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 bg-amber-50 rounded-lg text-amber-800 font-medium">
                <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> Active Inspections</span>
                <span className="font-bold">{inspectingCount} Rooms</span>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Columns: Dynamic Arrival & Departures Board */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          <Card className="flex-1 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-brand-teal" />
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest font-display">
                  Reception Desk Scheduler (Arrivals/Departures)
                </h4>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded uppercase font-mono">Date: {todayStr}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Arrivals column */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Today's Arrivals ({arrivalsToday.length})
                </span>
                
                {arrivalsToday.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
                    No confirmed departures scheduled today.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {arrivalsToday.map((arr) => {
                      const guestObj = guests.find((g) => g.id === arr.guestId);
                      return (
                        <div
                          key={arr.id}
                          onClick={() => onSelectBooking(arr.id)}
                          className="p-3 border border-slate-100 rounded-lg hover:border-brand-teal/30 bg-slate-50/30 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-semibold text-slate-700 truncate">{guestObj?.fullName}</h5>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">Source: {arr.source}</span>
                          </div>
                          <Badge variant={arr.status === "Checked-in" ? "success" : "info"} className="text-[9px]">
                            {arr.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Departures column */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Today's Departures ({departuresToday.length})
                </span>

                {departuresToday.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
                    No guests scheduled to check out today.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {departuresToday.map((dep) => {
                      const guestObj = guests.find((g) => g.id === dep.guestId);
                      const folio = folios[dep.id];
                      const owes = folio ? folio.charges.reduce((s, c) => s + c.amountPesewas, 0) - folio.payments.reduce((s, p) => s + p.amountPesewas, 0) : 0;

                      return (
                        <div
                          key={dep.id}
                          onClick={() => onSelectBooking(dep.id)}
                          className="p-3 border border-slate-100 rounded-lg hover:border-brand-teal/30 bg-slate-50/30 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-semibold text-slate-700 truncate">{guestObj?.fullName}</h5>
                            {owes > 0 && (
                              <span className="text-[9px] text-red-600 font-bold block mt-0.5">₵{(owes / 100).toFixed(2)} Bal Due</span>
                            )}
                          </div>
                          <Badge variant={dep.status === "Checked-out" ? "neutral" : "warning"} className="text-[9px]">
                            {dep.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </Card>

          {/* Low Stock supplies inventory alert box */}
          {lowStockItems.length > 0 && (
            <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/40 flex items-start gap-3">
              <Package className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest">
                  Low Supplies Inventory Warnings
                </span>
                <p className="text-xs text-red-700 mt-1">
                  The stock levels of {lowStockItems.slice(0, 2).map(i => `[${i.name}]`).join(" and ")} {lowStockItems.length > 2 && "others"} have fallen beneath the minimum reorder levels. Allocate stocks via supplies card.
                </p>
                <button
                  onClick={() => onNavigateTab("inventory")}
                  className="text-[10px] font-mono font-bold text-red-900 mt-2 hover:underline flex items-center gap-1 uppercase cursor-pointer"
                >
                  Inspect catalog ledger <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </Card>
          )}

        </div>

      </div>

      {/* Bottom element - list last bookings */}
      <Card className="p-5 space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Recent Reservations Registry
        </h4>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                <th className="py-2.5">Reference</th>
                <th>Guest</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Deposit</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => {
                const guestObj = guests.find((g) => g.id === b.guestId);
                return (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-semibold text-slate-800">{b.id}</td>
                    <td className="font-medium text-slate-700">{guestObj?.fullName}</td>
                    <td className="font-mono">{new Date(b.checkInDate).toLocaleDateString("en-GB")}</td>
                    <td className="font-mono">{new Date(b.checkOutDate).toLocaleDateString("en-GB")}</td>
                    <td>
                      <Badge
                        variant={
                          b.status === "Checked-in"
                            ? "success"
                            : b.status === "Confirmed"
                            ? "info"
                            : b.status === "Cancelled"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="font-mono font-semibold">₵{(b.depositAmountPesewas / 100).toFixed(2)}</td>
                    <td className="text-right">
                      <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={() => onSelectBooking(b.id)}>
                        Configure stay
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
