import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { HousekeepingStatus, RoomStatus, UserRole, Room } from "../../types";
import { Badge, Button, Card, Modal, Input, Select } from "../../components/ui/design";
import { ClipboardList, Filter, UserCheck, ShieldAlert, CheckCircle, Hammer, MessageSquare } from "lucide-react";

export const HousekeepingModule: React.FC = () => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const staffList = store.staffList;

  // Cleaning filter: "ALL" | "Dirty" | "In Progress" | "Clean" | "Inspected"
  const [cleaningFilter, setCleaningFilter] = useState<string>("ALL");

  // Assignment Modal
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedHousekeeperId, setSelectedHousekeeperId] = useState("");
  const [hkAssModalOpen, setHkAssModalOpen] = useState(false);

  // Maintenance Modal
  const [maintRoom, setMaintRoom] = useState<Room | null>(null);
  const [maintNotes, setMaintNotes] = useState("");
  const [maintModalOpen, setMaintModalOpen] = useState(false);

  // Quick updating note modal
  const [notesRoom, setNotesRoom] = useState<Room | null>(null);
  const [quickRoomNotes, setQuickRoomNotes] = useState("");
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  // Filter staff list to active personnel for task distribution (Admins can delegate to any active staff)
  const housekeepers = staffList.filter((s) => s.status === "Active");

  const handleOpenAssign = (rm: Room) => {
    setSelectedRoom(rm);
    setSelectedHousekeeperId(rm.assignedHousekeeperId || "");
    setHkAssModalOpen(true);
  };

  const handleCommitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !selectedHousekeeperId) return;

    store.assignRoomCleaning(selectedRoom.id, selectedHousekeeperId);
    setHkAssModalOpen(false);
  };

  const handleOpenMaintenance = (rm: Room) => {
    setMaintRoom(rm);
    setMaintNotes(rm.notes || "");
    setMaintModalOpen(true);
  };

  const handleCommitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintRoom) return;

    store.markRoomMaintenance(maintRoom.id, maintNotes);
    store.updateCleaningStatus(maintRoom.id, HousekeepingStatus.DIRTY); // Needs clean afterwards
    setMaintModalOpen(false);
    setMaintNotes("");
  };

  const handleOpenNotes = (rm: Room) => {
    setNotesRoom(rm);
    setQuickRoomNotes(rm.notes || "");
    setNotesModalOpen(true);
  };

  const handleCommitNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesRoom) return;

    store.editRoom(notesRoom.id, { notes: quickRoomNotes });
    setNotesModalOpen(false);
    setQuickRoomNotes("");
  };

  const handleStatusCycle = (room: Room, nextStatus: HousekeepingStatus) => {
    store.updateCleaningStatus(room.id, nextStatus);
  };

  const getHousekeeperName = (hkId?: string) => {
    if (!hkId) return "Unassigned";
    return staffList.find((s) => s.id === hkId)?.fullName || "Unknown Staff";
  };

  // Filter rooms list
  const filteredRooms = rooms.filter((r) => {
    if (cleaningFilter === "ALL") return true;
    return r.housekeepingStatus === cleaningFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Filtering control panel */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-550 mr-2 uppercase tracking-wide">Filter Cleaning Needs:</span>
          <div className="flex flex-wrap gap-1.5">
            {["ALL", HousekeepingStatus.DIRTY, HousekeepingStatus.IN_PROGRESS, HousekeepingStatus.CLEAN, HousekeepingStatus.INSPECTED].map((status) => (
              <button
                key={status}
                onClick={() => setCleaningFilter(status)}
                className={`px-3 py-1 text-[10px] font-black rounded border cursor-pointer transition-all uppercase ${
                  cleaningFilter === status
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Rooms to Clean: {rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.DIRTY).length} dirty rooms
        </span>
      </Card>

      {/* Housekeeping Rooms List */}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b text-slate-500 font-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3.5">Room</th>
              <th className="px-6 py-3.5">Cleaning Status</th>
              <th className="px-6 py-3.5">Assigned Housekeeper</th>
              <th className="px-6 py-3.5">Room State</th>
              <th className="px-6 py-3.5">Operational Notes</th>
              <th className="px-6 py-3.5 text-right">Quick Updates / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No rooms matched the cleaning filter.</td>
              </tr>
            ) : (
              filteredRooms.map((rm) => (
                <tr key={rm.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-extrabold text-sm text-slate-800">Room {rm.roomNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block border ${
                      rm.housekeepingStatus === HousekeepingStatus.DIRTY ? "bg-red-50 text-red-700 border-red-100" :
                      rm.housekeepingStatus === HousekeepingStatus.IN_PROGRESS ? "bg-blue-50 text-blue-700 border-blue-105" :
                      rm.housekeepingStatus === HousekeepingStatus.CLEAN ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>
                      {rm.housekeepingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenAssign(rm)}
                      className="text-xs text-blue-600 hover:underline cursor-pointer font-bold uppercase flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{getHousekeeperName(rm.assignedHousekeeperId)}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-black ${
                      rm.status === RoomStatus.AVAILABLE ? "text-emerald-600" :
                      rm.status === RoomStatus.OCCUPIED ? "text-red-600" :
                      rm.status === RoomStatus.RESERVED ? "text-amber-600" : "text-slate-500 font-extrabold"
                    }`}>
                      {rm.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 font-semibold max-w-xs truncate">
                    {rm.notes || <span className="text-slate-300 italic">No alerts</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1.5 flex-wrap">
                      
                      {/* Dynamic transitions strictly following rules */}
                      {rm.housekeepingStatus === HousekeepingStatus.DIRTY && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusCycle(rm, HousekeepingStatus.IN_PROGRESS)}
                          className="px-2 py-1 text-[9px] font-extrabold uppercase bg-white hover:bg-slate-50 text-blue-600"
                        >
                          Clean
                        </Button>
                      )}

                      {rm.housekeepingStatus === HousekeepingStatus.IN_PROGRESS && (
                        <Button
                          variant="success"
                          onClick={() => handleStatusCycle(rm, HousekeepingStatus.CLEAN)}
                          className="px-2 py-1 text-[9px] font-extrabold uppercase"
                        >
                          Finish
                        </Button>
                      )}

                      {rm.housekeepingStatus === HousekeepingStatus.CLEAN && (
                        <Button
                          variant="primary"
                          onClick={() => handleStatusCycle(rm, HousekeepingStatus.INSPECTED)}
                          className="px-2 py-1 text-[9px] font-extrabold uppercase bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Inspect</span>
                        </Button>
                      )}

                      <button
                        onClick={() => handleOpenNotes(rm)}
                        className="p-1 hover:text-blue-500 hover:bg-slate-100 rounded cursor-pointer text-slate-400"
                        title="Edit internal room notes"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {rm.status !== RoomStatus.UNDER_MAINTENANCE && (
                        <button
                          onClick={() => handleOpenMaintenance(rm)}
                          className="p-1 hover:text-amber-500 hover:bg-slate-100 rounded cursor-pointer text-slate-400"
                          title="Flag Room for Repairs &amp; Maintenance"
                        >
                          <Hammer className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* MODAL: ASSIGN HOUSEKEEPER */}
      <Modal isOpen={hkAssModalOpen} onClose={() => setHkAssModalOpen(false)} title="Assign Cleaning Duty">
        <form onSubmit={handleCommitAssignment} className="space-y-4 text-xs font-semibold">
          <p className="text-slate-500">Pick a registered active staff member for Room #{selectedRoom?.roomNumber}.</p>
          <Select
            label="Assigned Operational Staff"
            value={selectedHousekeeperId}
            onChange={(e) => setSelectedHousekeeperId(e.target.value)}
            options={[
              { value: "", label: "-- Match Staff --" },
              ...housekeepers.map((h) => ({ value: h.id, label: `${h.fullName} (${h.role})` })),
            ]}
          />
          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Assign staff</Button>
        </form>
      </Modal>

      {/* MODAL: REPAIR & MAINTENANCE FLAG */}
      <Modal isOpen={maintModalOpen} onClose={() => setMaintModalOpen(false)} title="Flag Room for Repairs">
        <form onSubmit={handleCommitMaintenance} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Flagging room puts its status as **Under Maintenance**. This frees any occupancy until repair logs are closed.
          </p>
          <Input
            label="Specific defect / maintenance notes *"
            required
            value={maintNotes}
            onChange={(e) => setMaintNotes(e.target.value)}
            placeholder="eg: Damaged AC regulator, needs replacement"
          />
          <Button type="submit" variant="danger" className="w-full font-bold">Lock Room for Repair</Button>
        </form>
      </Modal>

      {/* MODAL: QUICK ROOM NOTES */}
      <Modal isOpen={notesModalOpen} onClose={() => setNotesModalOpen(false)} title="Operational Notes">
        <form onSubmit={handleCommitNotes} className="space-y-4">
          <Input
            label="Internal Notes"
            required
            value={quickRoomNotes}
            onChange={(e) => setQuickRoomNotes(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Update Notes</Button>
        </form>
      </Modal>

    </div>
  );
};
