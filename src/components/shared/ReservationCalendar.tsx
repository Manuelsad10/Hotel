/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, User, ArrowRight, BedSingle, Plus } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, Room } from "../../types";
import { Badge, Button } from "../ui/design";

interface ReservationCalendarProps {
  onSelectBooking: (id: string) => void;
  onLaunchNewBooking: (roomId?: string, date?: string) => void;
}

export const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  onSelectBooking,
  onLaunchNewBooking,
}) => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;
  const reservations = store.reservations;
  const guests = store.guests;

  // Horizontal timeline date grid offset state
  // We showcase 14 dates at a time, scrollable
  const [baseDateOffset, setBaseDateOffset] = useState<number>(-4); // Start 4 days before today to show checked-in stays

  const generateDays = () => {
    const arr = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date();
      d.setDate(d.getDate() + baseDateOffset + i);
      arr.push(d);
    }
    return arr;
  };

  const days = generateDays();

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const shiftDates = (delta: number) => {
    setBaseDateOffset((prev) => prev + delta);
  };

  // Helper to find booking occupying room for specific date
  // (exclusive of check-out day, since checkouts free the room for next checkins)
  const getBookingForRoomDate = (roomId: string, dateStr: string) => {
    return reservations.find((res) => {
      if (res.roomId !== roomId) return false;
      if (res.status === ReservationStatus.CANCELLED || res.status === ReservationStatus.NO_SHOW) return false;
      return dateStr >= res.checkInDate && dateStr < res.checkOutDate;
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
      
      {/* Calendar Bar Title & Nav Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-teal/10 rounded-lg">
            <Calendar className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-display">
              Live Room Availability Timeline
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Horizontal Gantt Grid — Scrollable Rooms × Days
            </p>
          </div>
        </div>

        {/* Date shifting sliders */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => shiftDates(-7)} className="py-1 px-2">
            <ChevronLeft className="w-4 h-4" /> 1 Wk
          </Button>
          <Button variant="outline" onClick={() => shiftDates(-1)} className="py-1 px-1.5ClassName">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setBaseDateOffset(-4)}
            className="px-3 py-1 text-xs font-semibold bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/15 rounded-lg border border-brand-teal/20 transition-all cursor-pointer"
          >
            Today Focus
          </button>
          <Button variant="outline" onClick={() => shiftDates(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => shiftDates(7)} className="py-1 px-2">
            7 Wk <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid Headers Block */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1200px]">
          
          {/* Header Row: Month / Day headers */}
          <div className="grid grid-cols-[180px_repeat(15,_1fr)] border-b border-slate-100">
            {/* Corner Cell */}
            <div className="px-4 py-3 bg-slate-100/50 flex flex-col justify-center border-r border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Rooms Inventory
              </span>
              <span className="text-[11px] font-semibold text-slate-700 mt-1 flex items-center gap-1">
                <BedSingle className="w-3.5 h-3.5 text-brand-teal" /> Standard Floor Plan
              </span>
            </div>

            {/* Date Titles */}
            {days.map((date, idx) => {
              const dateStr = formatDateString(date);
              const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = date.getDate();
              const isTodayCell = isToday(date);

              return (
                <div
                  key={idx}
                  className={`py-2 text-center flex flex-col justify-center border-r border-slate-100 relative ${
                    isTodayCell ? "bg-amber-100/40 text-amber-900 border-x border-amber-200" : "bg-slate-50/50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    {weekday}
                  </span>
                  <span className="text-sm font-bold font-display">{dayNum}</span>
                  <span className="text-[9px] opacity-40 font-mono">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  {isTodayCell && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Rooms Rows */}
          {rooms.map((rm) => {
            const roomType = roomTypes.find((t) => t.id === rm.roomTypeId);

            return (
              <div
                key={rm.id}
                className="grid grid-cols-[180px_repeat(15,_1fr)] border-b border-slate-100 items-stretch hover:bg-slate-50/40 transition-colors"
              >
                {/* Room Left Header */}
                <div className="px-4 py-3 border-r border-slate-200 bg-slate-50/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Rm {rm.roomNumber}
                    </span>
                    <p className="text-[9px] text-slate-400 font-semibold truncate max-w-[110px]">
                      {roomType?.name || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">
                      {rm.floor.replace("Floor ", "F")}
                    </span>
                  </div>
                </div>

                {/* Day Blocks */}
                {days.map((day, dIdx) => {
                  const dateStr = formatDateString(day);
                  const bookingObj = getBookingForRoomDate(rm.id, dateStr);
                  
                  if (bookingObj) {
                    // We found an active overlapping booking cell
                    // Wait, let's see if this cell is indeed the beginning of this booking on our visible timeline, 
                    // or if it began before our timeline visible window
                    const isFirstVisibleDay = dIdx === 0 || getBookingForRoomDate(rm.id, formatDateString(days[dIdx - 1]))?.id !== bookingObj.id;

                    const guestObj = guests.find((gs) => gs.id === bookingObj.guestId);

                    const statusStyles: Record<string, string> = {
                      "Confirmed": "bg-sky-500/10 hover:bg-sky-500/15 text-sky-800 border-sky-400/40",
                      "Checked-in": "bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-800 border-emerald-400/40",
                      "Checked-out": "bg-zinc-100 hover:bg-zinc-200/50 text-zinc-600 border-zinc-200",
                    };

                    const badgeProps: Record<string, string> = {
                      "Confirmed": "bg-sky-500 text-white",
                      "Checked-in": "bg-emerald-500 text-white",
                      "Checked-out": "bg-neutral-500 text-white",
                    };

                    if (isFirstVisibleDay) {
                      // Calculate nights visible from here
                      let visualNights = 1;
                      let scanIdx = dIdx + 1;
                      while (scanIdx < 15) {
                        const checkB = getBookingForRoomDate(rm.id, formatDateString(days[scanIdx]));
                        if (checkB && checkB.id === bookingObj.id) {
                          visualNights++;
                          scanIdx++;
                        } else {
                          break;
                        }
                      }

                      return (
                        <div
                          key={dIdx}
                          style={{ gridColumn: `span ${visualNights}` }}
                          onClick={() => onSelectBooking(bookingObj.id)}
                          className={`p-1.5 m-1 rounded-lg border cursor-pointer select-none transition-all duration-150 flex flex-col justify-between align-stretch shadow-xs ${
                            statusStyles[bookingObj.status] || "bg-slate-500/15 border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold truncate max-w-[120px] tracking-tight">
                              {guestObj?.fullName || "Group Guest"}
                            </span>
                            <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${badgeProps[bookingObj.status]}`}>
                              {bookingObj.status === "Checked-in" ? "IN" : bookingObj.status === "Confirmed" ? "CONF" : "OUT"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[8px] font-mono opacity-80 mt-1">
                            <span>{bookingObj.id.split("-").pop()}</span>
                            <span>{visualNights} visible day{visualNights > 1 && "s"}</span>
                          </div>
                        </div>
                      );
                    } else {
                      // Don't render cell since it is covered by the Colspan block
                      return null;
                    }
                  } else {
                    // Cell is empty - render clickable visual block that starts booking flow
                    return (
                      <div
                        key={dIdx}
                        onClick={() => onLaunchNewBooking(rm.id, dateStr)}
                        className="border-r border-slate-100 min-h-[46px] group transition-all relative flex items-center justify-center cursor-pointer hover:bg-slate-50"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {isToday(day) && (
                          <div className="absolute inset-y-0 left-0 bg-amber-500/5 right-0 pointer-events-none" />
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tiny descriptive legend helper */}
      <div className="p-3 bg-zinc-50 border-t border-slate-100 flex gap-4 text-[10px] font-bold text-slate-400 justify-end uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/20 border border-sky-300" />
          Confirmed Booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-300" />
          Checked In / In House
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 border border-zinc-300" />
          Checked Out / Dirty Room
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300" />
          Today's Date
        </span>
      </div>

    </div>
  );
};
