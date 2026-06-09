/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, UserCheck, Key, ShieldCheck, ShieldAlert, Receipt, DoorOpen, BadgePlus, BellRing } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, RoomStatus, HousekeepingStatus, PaymentMethod } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

interface FrontDeskModuleProps {
  onOpenFolio: (id: string) => void;
  onLaunchNewBooking: () => void;
}

export const FrontDeskModule: React.FC<FrontDeskModuleProps> = ({
  onOpenFolio,
  onLaunchNewBooking,
}) => {
  const store = useHotelStore();
  const reservations = store.reservations;
  const guests = store.guests;
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;

  const todayStr = new Date().toISOString().split("T")[0];

  // States
  const [activeSegment, setActiveSegment] = useState<"arrivals" | "departures" | "inhouse" | "board">("arrivals");
  const [deskSearch, setDeskSearch] = useState("");

  // Checkin modal state
  const [checkinTarget, setCheckinTarget] = useState<any | null>(null);
  const [checkinIdType, setCheckinIdType] = useState<any>("Ghana Card");
  const [checkinIdNo, setCheckinIdNo] = useState("");
  const [checkinKeys, setCheckinKeys] = useState<number>(2);
  const [checkinRoomId, setCheckinRoomId] = useState("");

  // Lists
  const arrivals = reservations.filter(
    (r) =>
      r.checkInDate === todayStr &&
      r.status === ReservationStatus.CONFIRMED
  );

  const departures = reservations.filter(
    (r) =>
      r.checkOutDate === todayStr &&
      r.status === ReservationStatus.CHECKED_IN
  );

  const inhouse = reservations.filter(
    (r) => r.status === ReservationStatus.CHECKED_IN
  );

  // Filter segment arrays
  const getSegmentList = () => {
    let baseList = [];
    if (activeSegment === "arrivals") baseList = arrivals;
    else if (activeSegment === "departures") baseList = departures;
    else if (activeSegment === "inhouse") baseList = inhouse;
    else return []; // Board uses a separate grid rendering

    return baseList.filter((r) => {
      const gs = guests.find((g) => g.id === r.guestId);
      const name = gs?.fullName || "";
      return (
        name.toLowerCase().includes(deskSearch.toLowerCase()) ||
        r.id.toLowerCase().includes(deskSearch.toLowerCase())
      );
    });
  };

  const activeList = getSegmentList();

  // Trigger checkin setup
  const triggerCheckinSetup = (res: any) => {
    const gs = guests.find((g) => g.id === res.guestId);
    setCheckinTarget(res);
    setCheckinIdType(gs?.idType || "Ghana Card");
    setCheckinIdNo(gs?.idNumber || "");
    setCheckinRoomId(res.roomId || "");
    setCheckinKeys(2);
  };

  const handlePerformCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinTarget || !checkinRoomId) {
      store.addToast("Assigned room is required for check-in", "error");
      return;
    }

    // Verify room status is available
    const targetRoom = rooms.find((rm) => rm.id === checkinRoomId);
    if (!targetRoom) return;

    if (targetRoom.status !== RoomStatus.AVAILABLE && targetRoom.id !== checkinTarget.roomId) {
      store.addToast(`Room ${targetRoom.roomNumber} is currently ${targetRoom.status}`, "error");
      return;
    }

    // 1. Update guest ID info if newly entered
    const gs = guests.find((g) => g.id === checkinTarget.guestId);
    if (gs) {
      store.updateGuest({
        ...gs,
        idType: checkinIdType,
        idNumber: checkinIdNo,
      });
    }

    // 2. Map Room ID to Reservation
    const finalBooking = {
      ...checkinTarget,
      roomId: checkinRoomId,
    };
    store.modifyReservation(finalBooking);

    // 3. Trigger check-in status (which updates room status to Occupied and posts room fare)
    store.updateReservationStatus(checkinTarget.id, ReservationStatus.CHECKED_IN);

    setCheckinTarget(null);
  };

  // Safe checks if guest has stayed previously (Repeat Loyal Customer check)
  const isRepeatGuest = (guestId: string) => {
    // Count past completed stays
    const pastN = reservations.filter(
      (r) => r.guestId === guestId && r.status === ReservationStatus.CHECKED_OUT
    ).length;
    return pastN > 0;
  };

  return (
    <div className="space-y-6">
      
      {/* Segment switches headers */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveSegment("arrivals"); setDeskSearch(""); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSegment === "arrivals" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Arrivals Today ({arrivals.length})
          </button>
          <button
            onClick={() => { setActiveSegment("departures"); setDeskSearch(""); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSegment === "departures" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Departures Today ({departures.length})
          </button>
          <button
            onClick={() => { setActiveSegment("inhouse"); setDeskSearch(""); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSegment === "inhouse" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            In-House Guests ({inhouse.length})
          </button>
          <button
            onClick={() => { setActiveSegment("board"); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSegment === "board" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Overviews Status Board
          </button>
        </div>

        {activeSegment !== "board" && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={deskSearch}
              onChange={(e) => setDeskSearch(e.target.value)}
              placeholder="Search arrivals / stays..."
              className="pl-8.5 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors w-48"
            />
          </div>
        )}
      </div>

      {/* Main Dynamic Panel */}
      {activeSegment === "board" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 animate-in fade-in duration-200">
          {rooms.map((rm) => {
            const rt = roomTypes.find((t) => t.id === rm.roomTypeId);
            const statusColor =
              rm.status === RoomStatus.AVAILABLE
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : rm.status === RoomStatus.OCCUPIED
                ? "bg-red-50 text-red-800 border-red-100"
                : "bg-amber-50 text-amber-800 border-amber-100";

            return (
              <Card key={rm.id} className={`p-4 border text-center ${statusColor}`}>
                <span className="text-xs font-black font-mono">Rm {rm.roomNumber}</span>
                <p className="text-[9px] font-bold mt-0.5 opacity-60 truncate">{rt?.name}</p>
                <div className="mt-3 flex justify-center items-center gap-1">
                  <span className="text-[10px] font-extrabold uppercase">{rm.status}</span>
                </div>
                <div className="text-[8px] uppercase mt-1 opacity-50 font-bold">
                  {rm.housekeepingStatus} cleaning
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-5 animate-in fade-in duration-200">
          {activeList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic border border-dashed border-slate-100 rounded-xl">
              No active reservations matched this desk filters segments.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                    <th className="py-2.5">Reference No</th>
                    <th>Full Guest Name</th>
                    <th>Room Setup</th>
                    <th>Duration Nights</th>
                    <th>Deposit Saved</th>
                    <th className="text-right">Front Desk Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {activeList.map((res) => {
                    const gs = guests.find((g) => g.id === res.guestId);
                    const rt = roomTypes.find((t) => t.id === res.roomTypeId);
                    const rm = rooms.find((r) => r.id === res.roomId);

                    const nightsCount = Math.max(
                      1,
                      Math.ceil(
                        (new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );

                    return (
                      <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-4 font-mono font-bold text-slate-800">{res.id}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-700">{gs?.fullName}</span>
                            {/* Repeat guest detector */}
                            {gs && isRepeatGuest(gs.id) && (
                              <Badge variant="success" className="text-[8px] px-1 py-0.2 animate-pulse uppercase">
                                Welcome Back!
                              </Badge>
                            )}
                            {gs?.blacklist && (
                              <Badge variant="danger" className="text-[8px] px-1 py-0.2 uppercase">
                                Blacklisted
                              </Badge>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{gs?.phone}</span>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-700">{rt?.name}</span>
                          {rm && (
                            <Badge variant="brand" className="ml-1.5 font-mono text-[9px]">
                              Room {rm.roomNumber}
                            </Badge>
                          )}
                        </td>
                        <td className="font-mono">
                          {nightsCount} Night{nightsCount > 1 && "s"} (Check-out {new Date(res.checkOutDate).toLocaleDateString("en-GB")})
                        </td>
                        <td className="font-mono font-semibold">GHS ₵{(res.depositAmountPesewas / 100).toFixed(2)}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {activeSegment === "arrivals" && (
                              <Button variant="success" className="py-1 px-2.5 text-[10px]" onClick={() => triggerCheckinSetup(res)}>
                                <UserCheck className="w-3.5 h-3.5" /> Check-In Guest
                              </Button>
                            )}

                            {activeSegment === "departures" && (
                              <Button variant="danger" className="py-1 px-2.5 text-[10px]" onClick={() => onOpenFolio(res.id)}>
                                <Receipt className="w-3.5 h-3.5" /> Check-Out & Settle
                              </Button>
                            )}

                            {activeSegment === "inhouse" && (
                              <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={() => onOpenFolio(res.id)}>
                                <Key className="w-3.5 h-3.5" /> Inspect Folio ledger
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Checkin Setup Overlays Modal */}
      <Modal
        isOpen={!!checkinTarget}
        onClose={() => setCheckinTarget(null)}
        title={checkinTarget ? `Assuring Lobby Check-In: ${checkinTarget.id}` : ""}
      >
        {checkinTarget && (
          <form onSubmit={handlePerformCheckin} className="space-y-4 text-sm text-slate-600">
            
            {/* Blacklist banner check block */}
            {guests.find((g) => g.id === checkinTarget.guestId)?.blacklist && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <ShieldAlert className="w-5.5 h-5.5 text-red-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-red-800 uppercase block">Blacklisted Guest Intercept</span>
                  <p className="text-[10px] text-red-600 leading-normal mt-0.5">
                    This guest was flagged on previous stays. Check details of history before completing keys issuance.
                  </p>
                </div>
              </div>
            )}

            {/* Repeat guest alert indicator */}
            {isRepeatGuest(checkinTarget.guestId) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-2">
                <ShieldCheck className="w-5.5 h-5.5 text-emerald-600 shrink-0 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Returning Loyal Customer detected</span>
                  <p className="text-[10px] text-emerald-600 leading-normal mt-0.5 animate-pulse">
                    This customer has stayed in key segments previously. Offer welcome fruit platter drinks.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <Select
                label="Collecting Identification ID"
                value={checkinIdType}
                onChange={(e) => setCheckinIdType(e.target.value)}
                options={[
                  { value: "Ghana Card", label: "Ghana Card (GHA)" },
                  { value: "Passport", label: "Passport" },
                  { value: "Voter ID", label: "Voter ID" },
                  { value: "Driver's License", label: "Driver's License" },
                ]}
              />
              <Input
                label="ID Document Number"
                required
                placeholder="e.g. GHA-38291..."
                value={checkinIdNo}
                onChange={(e) => setCheckinIdNo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Select
                label="Assign Specific Room"
                required
                value={checkinRoomId}
                onChange={(e) => setCheckinRoomId(e.target.value)}
                options={[
                  { value: "", label: "-- Please select available room --" },
                  ...rooms
                    .filter((rm) => rm.roomTypeId === checkinTarget.roomTypeId && (rm.status === RoomStatus.AVAILABLE || rm.id === checkinTarget.roomId))
                    .map((rm) => ({
                      value: rm.id,
                      label: `Room ${rm.roomNumber} - ${rm.floor} (Cleanup: ${rm.housekeepingStatus})`,
                    })),
                ]}
              />
              
              <Input
                label="Physical Keys Issued"
                type="number"
                min={1}
                value={checkinKeys}
                onChange={(e) => setCheckinKeys(parseInt(e.target.value) || 2)}
              />
            </div>

            <div className="bg-zinc-50 rounded-lg p-3 text-xs leading-relaxed">
              <span className="font-bold text-slate-700 block uppercase mb-1">Pre-Check-In Checklist</span>
              <p className="text-slate-500">1. Confirm that advance booking deposit of ₵{(checkinTarget.depositAmountPesewas / 100).toFixed(2)} is received.</p>
              <p className="text-slate-500 mt-0.5">2. Issue {checkinKeys} physical welcome keys after ID verification.</p>
            </div>

            <Button variant="primary" type="submit" className="w-full">
              <UserCheck className="w-4 h-4" /> Issue Keys & Confirm Check-In
            </Button>
          </form>
        )}
      </Modal>

    </div>
  );
};
