import React from "react";
import { useHotelStore } from "../../store/hotelStore";
import { RoomStatus, HousekeepingStatus, ReservationStatus } from "../../types";
import { Bed, Calendar, ArrowRight, ClipboardList, Info } from "lucide-react";
import { Badge, Card } from "../../components/ui/design";

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
  const roomTypes = store.roomTypes;

  // 1. Calculate operational stats
  const totalRoomsCount = rooms.length;
  const availableRoomsCount = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;
  const occupiedTonightCount = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;

  // Let's deduce relative today's date formatted as YYYY-MM-DD
  const todayStr = "2026-06-09"; // Set to system metadata date for consistency!

  const arrivalsToday = reservations.filter(
    (res) => res.checkInDate === todayStr && res.status === ReservationStatus.CONFIRMED
  );

  const departuresToday = reservations.filter(
    (res) => res.checkOutDate === todayStr && res.status === ReservationStatus.CHECKED_IN
  );

  const dirtyRooms = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.DIRTY);

  // Helper to retrieve names dynamically
  const getGuestLabel = (guestId: string) => {
    const gst = guests.find((g) => g.id === guestId);
    return gst ? gst.fullName : "Unknown Guest";
  };

  const getRoomName = (roomId?: string) => {
    const rm = rooms.find((r) => r.id === roomId);
    return rm ? `Room ${rm.roomNumber}` : "Not Assigned";
  };

  const getRoomTypeName = (typeId: string) => {
    return roomTypes.find((t) => t.id === typeId)?.name || "Standard";
  };

  const getRoomStatusColor = (status: RoomStatus) => {
    const maps = {
      [RoomStatus.AVAILABLE]: "bg-emerald-500 border-emerald-600 text-white",
      [RoomStatus.OCCUPIED]: "bg-red-500 border-red-650 text-white",
      [RoomStatus.RESERVED]: "bg-amber-500 border-amber-600 text-white",
      [RoomStatus.UNDER_MAINTENANCE]: "bg-slate-500 border-slate-600 text-white",
    };
    return maps[status] || "bg-slate-400";
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 4 Primary Stat cards outlined in specifications */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Rooms Available</span>
            <p className="text-3xl font-black text-slate-800">{availableRoomsCount}</p>
            <span className="text-[10px] text-slate-400">out of {totalRoomsCount} registered</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Occupied Tonight</span>
            <p className="text-3xl font-black text-slate-800">{occupiedTonightCount}</p>
            <span className="text-[10px] text-slate-400">{(totalRoomsCount ? (occupiedTonightCount / totalRoomsCount) * 100 : 0).toFixed(0)}% occupancy rate</span>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Check-ins Today</span>
            <p className="text-3xl font-black text-slate-800">{arrivalsToday.length}</p>
            <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer" onClick={() => onNavigateTab("frontdesk")}>Process Arrivals &rarr;</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Check-outs Today</span>
            <p className="text-3xl font-black text-slate-800">{departuresToday.length}</p>
            <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer" onClick={() => onNavigateTab("frontdesk")}>Process Departures &rarr;</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <ArrowRight className="w-6 h-6 rotate-180" />
          </div>
        </div>

      </div>

      {/* Lists Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Today's Arrivals */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[340px]">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Today's Expected Arrivals</h3>
            <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-full">{arrivalsToday.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
            {arrivalsToday.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <Info className="w-8 h-8 text-slate-350 mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No more expected arrivals today</p>
              </div>
            ) : (
              arrivalsToday.map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between text-xs first:pt-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{getGuestLabel(res.guestId)}</p>
                    <p className="text-[10px] text-slate-500">{getRoomName(res.roomId)} • {res.id}</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab("frontdesk")}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] uppercase shadow-sm cursor-pointer"
                  >
                    Check In
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Today's Departures */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[340px]">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Today's Expected Departures</h3>
            <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full">{departuresToday.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
            {departuresToday.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <Info className="w-8 h-8 text-slate-350 mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No scheduled departures remaining today</p>
              </div>
            ) : (
              departuresToday.map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between text-xs first:pt-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{getGuestLabel(res.guestId)}</p>
                    <p className="text-[10px] text-slate-500">{getRoomName(res.roomId)} • {res.id}</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab("frontdesk")}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[10px] uppercase shadow-sm cursor-pointer"
                  >
                    Check Out
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Housekeeping Dirty Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[340px]">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Rooms Needing Cleaning</h3>
            <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded-full">{dirtyRooms.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
            {dirtyRooms.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <Info className="w-8 h-8 text-emerald-300 mb-2" />
                <p className="text-xs text-emerald-600 font-bold">All hotel rooms are clean and ready!</p>
              </div>
            ) : (
              dirtyRooms.map((rm) => (
                <div key={rm.id} className="py-3 flex items-center justify-between text-xs first:pt-0">
                  <div>
                    <p className="font-bold text-slate-800">Room #{rm.roomNumber}</p>
                    <p className="text-[10px] text-slate-500">{getRoomTypeName(rm.roomTypeId)} • {rm.floor || "Floor 1"}</p>
                  </div>
                  <Badge variant="danger">DIRTY</Badge>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Live Hotel Room Map (Bento Layout Grid Option) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Room Occupancy Map</h3>
          <p className="text-[10px] text-slate-400">Visual overview of rooms. Green = Available, Red = Occupied, Amber = Reserved, Gray = Maintenance.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5 pt-1">
          {rooms.map((rm) => {
            const isAssigned = rm.assignedHousekeeperId;
            return (
              <div
                key={rm.id}
                className={`border rounded-xl p-3 select-none text-center relative overflow-hidden transition-all duration-200 flex flex-col justify-between h-[90px] ${
                  rm.status === RoomStatus.AVAILABLE
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    : rm.status === RoomStatus.OCCUPIED
                    ? "bg-red-50/50 border-red-200 text-red-800 hover:bg-red-50"
                    : rm.status === RoomStatus.RESERVED
                    ? "bg-amber-50/50 border-amber-200 text-amber-800 hover:bg-amber-50"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between leading-none mb-1">
                    <span className="font-black text-sm">#{rm.roomNumber}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      rm.status === RoomStatus.AVAILABLE ? "bg-emerald-500" :
                      rm.status === RoomStatus.OCCUPIED ? "bg-red-500" :
                      rm.status === RoomStatus.RESERVED ? "bg-amber-500" : "bg-slate-400"
                    }`} />
                  </div>
                  <span className="text-[9px] block text-slate-500 truncate uppercase tracking-tight">
                    {getRoomTypeName(rm.roomTypeId)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5 mt-2">
                  <span className="font-bold">GHS ₵{Math.round(rm.pricePesewas / 100)}</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                    rm.housekeepingStatus === HousekeepingStatus.CLEAN ? "bg-emerald-100 text-emerald-800" :
                    rm.housekeepingStatus === HousekeepingStatus.DIRTY ? "bg-red-100 text-red-800" :
                    rm.housekeepingStatus === HousekeepingStatus.IN_PROGRESS ? "bg-blue-100 text-blue-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {rm.housekeepingStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
