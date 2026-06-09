/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BedSingle, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle, Plus, ChevronDown } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { RoomStatus, HousekeepingStatus, Room } from "../../types";
import { Badge, Button, Modal, Select, Input } from "../ui/design";

interface RoomGridProps {
  onSelectRoomBooking: (bookingId: string) => void;
  onLaunchNewBooking: (roomId?: string) => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  onSelectRoomBooking,
  onLaunchNewBooking,
}) => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;
  const reservations = store.reservations;
  const staff = store.staffList.filter(s => s.role === "HOUSEKEEPER" && s.status === "Active");

  // Local state for clicking a room to open detail modal
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hkAssignee, setHkAssignee] = useState("");
  const [hkNotes, setHkNotes] = useState("");

  // Group rooms by Floor
  const groupRoomsByFloor = () => {
    const map: Record<string, Room[]> = {};
    rooms.forEach((rm) => {
      const fl = rm.floor;
      if (!map[fl]) map[fl] = [];
      map[fl].push(rm);
    });
    // Sort keys or rooms
    return map;
  };

  const floorsRooms = groupRoomsByFloor();

  // Status visual specs
  const roomStatusStyles = {
    [RoomStatus.AVAILABLE]: { bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800", indicator: "bg-emerald-500" },
    [RoomStatus.OCCUPIED]: { bg: "bg-red-50 hover:bg-red-100/80 border-red-200 text-red-800", indicator: "bg-red-500" },
    [RoomStatus.RESERVED]: { bg: "bg-sky-500/5 hover:bg-sky-500/10 border-sky-200 text-sky-800", indicator: "bg-sky-500" },
    [RoomStatus.UNDER_MAINTENANCE]: { bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-800", indicator: "bg-amber-500" },
    [RoomStatus.OUT_OF_ORDER]: { bg: "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-500", indicator: "bg-slate-500" },
  };

  const hkStatusIcons = {
    [HousekeepingStatus.CLEAN]: <Sparkles className="w-3.5 h-3.5 text-teal-600" />,
    [HousekeepingStatus.DIRTY]: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
    [HousekeepingStatus.INSPECTING]: <ChevronDown className="w-3.5 h-3.5 text-amber-500 rotate-90" />,
    [HousekeepingStatus.INSPECTED]: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
  };

  // Find active booking for room
  const getActiveBookingId = (roomId: string) => {
    const active = reservations.find(
      (r) => r.roomId === roomId && r.status === "Checked-in"
    );
    return active ? active.id : null;
  };

  const handleOpenRoomSettings = (rm: Room) => {
    setSelectedRoom(rm);
    setHkAssignee(staff[0]?.id || "");
    setHkNotes("");
  };

  // Handle assign cleaning duties
  const handleAssignClean = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !hkAssignee) return;

    store.assignHousekeepingTask(selectedRoom.id, hkAssignee, hkNotes);
    store.updateRoomHousekeeping(selectedRoom.id, HousekeepingStatus.DIRTY);
    
    setSelectedRoom(null);
  };

  // Change room statuses manual overrides
  const handleRoomOverride = (status: RoomStatus) => {
    if (!selectedRoom) return;
    store.updateRoomStatus(selectedRoom.id, status);
    setSelectedRoom((prev) => prev ? { ...prev, status } : null);
  };

  const handleHousekeepingOverride = (hks: HousekeepingStatus) => {
    if (!selectedRoom) return;
    store.updateRoomHousekeeping(selectedRoom.id, hks);
    setSelectedRoom((prev) => prev ? { ...prev, housekeepingStatus: hks } : null);
  };

  const handleToggleExtraBed = (checked: boolean) => {
    if (!selectedRoom) return;
    store.toggleExtraBed(selectedRoom.id, checked, 12000); // 120 GHS default extra bed charge
    setSelectedRoom((prev) => prev ? { ...prev, extraBedAdded: checked } : null);
  };

  return (
    <div className="space-y-6">
      {floorsRooms && Object.keys(floorsRooms).length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white border rounded-xl border-dashed">
          No rooms added. Use the configuration screen to set up rooms.
        </div>
      ) : (
        Object.entries(floorsRooms).map(([floorName, floorRooms]) => (
          <div key={floorName} className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            
            {/* Floor Name Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-display flex items-center gap-1.5ClassName">
                {floorName}
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold uppercase py-0.5 px-2 rounded-full">
                {floorRooms.length} Room{floorRooms.length > 1 && "s"} Registered
              </span>
            </div>

            {/* Grid of rooms */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {floorRooms.map((rm) => {
                const typeObj = roomTypes.find((t) => t.id === rm.roomTypeId);
                const activeBookingId = getActiveBookingId(rm.id);
                const styles = roomStatusStyles[rm.status] || roomStatusStyles[RoomStatus.AVAILABLE];

                return (
                  <div
                    key={rm.id}
                    onClick={() => handleOpenRoomSettings(rm)}
                    className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md ${styles.bg}`}
                  >
                    <div>
                      {/* Top bar with state indicators */}
                      <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
                        <span className="text-xs font-black font-mono">
                          Rm {rm.roomNumber}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {hkStatusIcons[rm.housekeepingStatus]}
                          <span className={`w-2 h-2 rounded-full ${styles.indicator}`} />
                        </div>
                      </div>

                      <p className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                        {typeObj?.name || "Standard Room"}
                      </p>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between">
                      {/* Bed capacity count */}
                      <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                        {typeObj?.maxOccupancy} Guests
                      </span>

                      {/* Small overlay if contains extra bed */}
                      {rm.extraBedAdded && (
                        <span className="text-[8px] bg-cyan-100 text-brand-teal px-1 py-0.2 rounded font-bold uppercase">
                          + Rollaway
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Room Detail overrides & Housekeeping Task Assign modal */}
      <Modal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={selectedRoom ? `Configure Grid Room ${selectedRoom.roomNumber}` : ""}
      >
        {selectedRoom && (
          <div className="space-y-5 text-sm text-slate-600">
            {/* Metadata */}
            <div className="bg-zinc-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">
                  {roomTypes.find((t) => t.id === selectedRoom.roomTypeId)?.name || "Standard Bed Setup"}
                </p>
                <p className="text-slate-400 font-mono mt-0.5">Floor: {selectedRoom.floor}</p>
              </div>
              <div className="text-right">
                <Badge variant={selectedRoom.status === RoomStatus.AVAILABLE ? "success" : "danger"}>
                  {selectedRoom.status}
                </Badge>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Manual Status Override
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(RoomStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleRoomOverride(status)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      selectedRoom.status === status
                        ? "bg-brand-teal text-white border-brand-teal"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Housekeeping overide */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Housekeeping Status Override
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(HousekeepingStatus).map((hks) => (
                  <button
                    key={hks}
                    onClick={() => handleHousekeepingOverride(hks)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      selectedRoom.housekeepingStatus === hks
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    {hks}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Bed rollup rollaway bed toggle option */}
            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-slate-800">Rollaway Extra Bed Setup</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Applies surcharge of ₵120.00 daily</p>
              </div>
              <input
                type="checkbox"
                checked={selectedRoom.extraBedAdded}
                onChange={(e) => handleToggleExtraBed(e.target.checked)}
                className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
              />
            </div>

            {/* Booking Folio Launch Details if Occupied */}
            {selectedRoom.status === RoomStatus.OCCUPIED && getActiveBookingId(selectedRoom.id) && (
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="w-full text-brand-teal border-brand-teal/30 hover:bg-brand-teal/10"
                  onClick={() => {
                    const bid = getActiveBookingId(selectedRoom.id);
                    if (bid) {
                      onSelectRoomBooking(bid);
                      setSelectedRoom(null);
                    }
                  }}
                >
                  <Sparkles className="w-4 h-4" /> Open In-House Guest Folio
                </Button>
              </div>
            )}

            {/* Task assignment form for cleaning */}
            <form onSubmit={handleAssignClean} className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Assign Cleaning Duty Task
              </span>

              {staff.length === 0 ? (
                <div className="text-xs text-red-500 italic">
                  No active Housekeeper employees currently available. Manage employees under staff section.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Housekeeper Staff"
                      value={hkAssignee}
                      onChange={(e) => setHkAssignee(e.target.value)}
                      options={staff.map(s => ({
                        value: s.id,
                        label: s.fullName,
                      }))}
                    />
                    <Input
                      label="Cleaning Directives"
                      type="text"
                      placeholder="e.g. mop floor, replace tea"
                      value={hkNotes}
                      onChange={(e) => setHkNotes(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" type="submit" className="w-full">
                    Assign and Mark DIRTY
                  </Button>
                </>
              )}
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
