import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { RoomStatus, HousekeepingStatus, Room, UserRole } from "../../types";
import { Badge, Button, Card, Modal, Input, Select, ConfirmDialog } from "../../components/ui/design";
import { Grid, List, Plus, Trash2, Edit2, ShieldAlert } from "lucide-react";

export const RoomModule: React.FC = () => {
  const store = useHotelStore();
  const rooms = useHotelStore((state) => state.rooms);
  const roomTypes = useHotelStore((state) => state.roomTypes);
  const currentUser = useHotelStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Tabs: "grid" | "list" | "types"
  const [viewMode, setViewMode] = useState<"grid" | "list" | "types">("grid");

  // Reusable custom ConfirmDialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

  const triggerConfirmation = (title: string, message: string, confirmText: string, onConfirm: () => void) => {
    setConfirmConfig({
      title,
      message,
      confirmText,
      onConfirm,
    });
    setIsConfirmOpen(true);
  };

  // Multi-Selection State for Admins bulk operations
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  const toggleSelectRoom = (id: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRooms = () => {
    if (selectedRoomIds.length === rooms.length) {
      setSelectedRoomIds([]);
    } else {
      setSelectedRoomIds(rooms.map((r) => r.id));
    }
  };

  const handleBulkStatusUpdate = (status: RoomStatus) => {
    if (selectedRoomIds.length === 0) return;
    store.bulkUpdateRooms(selectedRoomIds, { status });
    setSelectedRoomIds([]); // Clear selection after action completes
  };

  const handleBulkHousekeepingUpdate = (hs: HousekeepingStatus) => {
    if (selectedRoomIds.length === 0) return;
    store.bulkUpdateRooms(selectedRoomIds, { housekeepingStatus: hs });
    setSelectedRoomIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedRoomIds.length === 0) return;
    triggerConfirmation(
      "Bulk Delete Rooms",
      `Are you sure you want to delete ${selectedRoomIds.length} selected rooms in bulk? This is irreversible and permanent.`,
      "Delete Selected",
      () => {
        store.bulkDeleteRooms(selectedRoomIds);
        setSelectedRoomIds([]);
      }
    );
  };

  // Interaction Modals States
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);

  // Form Fields for new Room
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState("Floor 1");
  const [newRoomTypeId, setNewRoomTypeId] = useState(roomTypes[0]?.id || "");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomNotes, setNewRoomNotes] = useState("");

  // Room type details
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePrice, setNewTypePrice] = useState("");

  // Room Type Edit State
  const [isEditTypeOpen, setIsEditTypeOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editTypePrice, setEditTypePrice] = useState("");

  // Edit Room State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editRoomStatus, setEditRoomStatus] = useState<RoomStatus>(RoomStatus.AVAILABLE);
  const [editRoomHousekeeping, setEditRoomHousekeeping] = useState<HousekeepingStatus>(HousekeepingStatus.CLEAN);

  const handleOpenEditType = (type: any) => {
    setEditingType(type);
    setEditTypeName(type.name);
    setEditTypePrice((type.basePricePesewas / 100).toString());
    setIsEditTypeOpen(true);
  };

  const handleSaveEditType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    if (!editTypeName || !editTypePrice) {
      store.addToast("Name and rate are required", "error");
      return;
    }
    const ratePesewas = parseFloat(editTypePrice) * 100;
    store.editRoomType(editingType.id, editTypeName, ratePesewas);
    setIsEditTypeOpen(false);
    setEditingType(null);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) {
      store.addToast("Room number is required", "error");
      return;
    }
    const chosenType = roomTypes.find((t) => t.id === newRoomTypeId);
    const parsedPrice = newRoomPrice ? parseFloat(newRoomPrice) * 100 : chosenType?.basePricePesewas || 45000;

    store.addRoom({
      roomNumber: newRoomNumber,
      roomTypeId: newRoomTypeId || roomTypes[0]?.id || "",
      floor: newRoomFloor,
      pricePesewas: parsedPrice,
      notes: newRoomNotes,
    });

    setIsAddRoomOpen(false);
    setNewRoomNumber("");
    setNewRoomNotes("");
    setNewRoomPrice("");
  };

  const handleCreateRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName || !newTypePrice) {
      store.addToast("Name and rate are required for categories.", "error");
      return;
    }
    const ratePesewas = parseFloat(newTypePrice) * 100;
    const newId = "rt-" + Math.random().toString(36).substring(2, 6);

    store.addRoomType({
      id: newId,
      name: newTypeName,
      basePricePesewas: ratePesewas,
    });

    setIsAddTypeOpen(false);
    setNewTypeName("");
    setNewTypePrice("");
    if (!newRoomTypeId) {
      setNewRoomTypeId(newId);
    }
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setNewRoomNumber(room.roomNumber);
    setNewRoomFloor(room.floor || "Floor 1");
    setNewRoomTypeId(room.roomTypeId);
    setNewRoomPrice((room.pricePesewas / 100).toString());
    setNewRoomNotes(room.notes || "");
    setEditRoomStatus(room.status);
    setEditRoomHousekeeping(room.housekeepingStatus);
    setIsEditRoomOpen(true);
  };

  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const ratePesewas = newRoomPrice ? parseFloat(newRoomPrice) * 100 : editingRoom.pricePesewas;

    store.editRoom(editingRoom.id, {
      roomNumber: newRoomNumber,
      floor: newRoomFloor,
      roomTypeId: newRoomTypeId,
      pricePesewas: ratePesewas,
      notes: newRoomNotes,
      status: editRoomStatus,
      housekeepingStatus: editRoomHousekeeping,
    });

    setIsEditRoomOpen(false);
    setEditingRoom(null);
    setNewRoomNumber("");
    setNewRoomNotes("");
    setNewRoomPrice("");
  };

  const getRoomTypeName = (typeId: string) => {
    return roomTypes.find((t) => t.id === typeId)?.name || "Standard";
  };

  return (
    <div className="space-y-6">
      
      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        
        {/* Left Segment: View Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-650 hover:text-slate-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Room Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-650 hover:text-slate-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Room List</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setViewMode("types")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "types" ? "bg-white text-blue-600 shadow-sm" : "text-slate-650 hover:text-slate-800"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Room Types</span>
            </button>
          )}
        </div>

        {/* Right Segment: Fast additions */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsAddTypeOpen(true)} className="text-xs font-bold">
              <Plus className="w-4 h-4" />
              <span>Add Room Type</span>
            </Button>
            <Button variant="primary" onClick={() => setIsAddRoomOpen(true)} className="text-xs font-bold bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Add Single Room</span>
            </Button>
          </div>
        )}

      </div>

      {/* Primary Display based on active View Mode */}
      {viewMode === "grid" && (
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Live Visual Room Matrix</h3>
            <p className="text-[10px] text-slate-400">Green = Available | Red = Occupied | Yellow = Reserved | Gray = Maintenance</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 col-span-full text-center">No rooms configured. Click "Add Single Room" above.</p>
            ) : (
              rooms.map((rm) => (
                <div
                  key={rm.id}
                  onClick={() => handleOpenEditRoom(rm)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-[120px] ${
                    selectedRoomIds.includes(rm.id) ? "border-blue-600 ring-2 ring-blue-600/10 shadow-md" : ""
                  } ${
                    rm.status === RoomStatus.AVAILABLE ? (selectedRoomIds.includes(rm.id) ? "bg-emerald-50/30 text-emerald-950" : "bg-emerald-50/40 border-emerald-200 text-emerald-950") :
                    rm.status === RoomStatus.OCCUPIED ? (selectedRoomIds.includes(rm.id) ? "bg-red-50/30 text-red-950" : "bg-red-50/40 border-red-200 text-red-950") :
                    rm.status === RoomStatus.RESERVED ? (selectedRoomIds.includes(rm.id) ? "bg-amber-50/30 text-amber-950" : "bg-amber-50/40 border-amber-200 text-amber-950") :
                    (selectedRoomIds.includes(rm.id) ? "bg-slate-100 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-700")
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {store.currentUser?.role === UserRole.ADMIN && (
                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedRoomIds.includes(rm.id)}
                            onChange={() => toggleSelectRoom(rm.id)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-400 cursor-pointer"
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-extrabold text-base leading-none block text-slate-900">Room {rm.roomNumber}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight block mt-0.5">{getRoomTypeName(rm.roomTypeId)}</span>
                      </div>
                    </div>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      rm.status === RoomStatus.AVAILABLE ? "bg-emerald-500" :
                      rm.status === RoomStatus.OCCUPIED ? "bg-red-500" :
                      rm.status === RoomStatus.RESERVED ? "bg-amber-550 bg-amber-500" : "bg-slate-500"
                    }`} />
                  </div>

                  <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-700">₵{(rm.pricePesewas / 100).toFixed(2)}</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white border border-slate-100 shadow-xs">
                      {rm.housekeepingStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {viewMode === "list" && (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-indigo-120 text-slate-500 uppercase font-black tracking-wider text-[10px]">
              <tr>
                {store.currentUser?.role === UserRole.ADMIN && (
                  <th className="px-6 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRoomIds.length === rooms.length && rooms.length > 0}
                      onChange={toggleSelectAllRooms}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-350 cursor-pointer align-middle"
                    />
                  </th>
                )}
                <th className="px-6 py-3.5">Room Number</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Floor</th>
                <th className="px-6 py-3.5">Rate / Night</th>
                <th className="px-6 py-3.5">PMS Status</th>
                <th className="px-6 py-3.5">Cleaning</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={store.currentUser?.role === UserRole.ADMIN ? 8 : 7} className="px-6 py-8 text-center text-slate-400 italic">No room records discovered.</td>
                </tr>
              ) : (
                rooms.map((rm) => (
                  <tr key={rm.id} className={`hover:bg-slate-50/60 ${selectedRoomIds.includes(rm.id) ? "bg-blue-50/30" : ""}`}>
                    {store.currentUser?.role === UserRole.ADMIN && (
                      <td className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedRoomIds.includes(rm.id)}
                          onChange={() => toggleSelectRoom(rm.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-350 cursor-pointer align-middle"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 font-extrabold text-sm text-slate-800">#{rm.roomNumber}</td>
                    <td className="px-6 py-4 font-semibold">{getRoomTypeName(rm.roomTypeId)}</td>
                    <td className="px-6 py-4 text-slate-500">{rm.floor || "Floor 1"}</td>
                    <td className="px-6 py-4 text-slate-800 font-bold">GHS ₵{(rm.pricePesewas / 100).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        rm.status === RoomStatus.AVAILABLE ? "bg-emerald-100 text-emerald-800" :
                        rm.status === RoomStatus.OCCUPIED ? "bg-red-100 text-red-800" :
                        rm.status === RoomStatus.RESERVED ? "bg-amber-100 text-amber-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {rm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                        rm.housekeepingStatus === HousekeepingStatus.CLEAN ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        rm.housekeepingStatus === HousekeepingStatus.DIRTY ? "bg-red-50 text-red-750 border border-red-100" :
                        "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {rm.housekeepingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditRoom(rm)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                          title={isAdmin ? "Edit room" : "View room details"}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              triggerConfirmation(
                                "Delete Room Profile",
                                `Are you sure you want to permanently delete Room #${rm.roomNumber} from database records?`,
                                "Delete Room",
                                () => {
                                  store.deleteRoom(rm.id);
                                }
                              );
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Delete room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {viewMode === "types" && (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Room Classifications</h3>
              <p className="text-[10px] text-slate-400 font-semibold text-slate-500 uppercase">Set pricing benchmarks per category.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomTypes.map((t) => {
              const roomsCount = rooms.filter((r) => r.roomTypeId === t.id).length;
              return (
                <div key={t.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-[#1e3a5f] text-sm uppercase">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{roomsCount} rooms registered in category</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditType(t)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Edit benchmarking name and rate"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          triggerConfirmation(
                            "Delete Room Category",
                            `Are you sure you want to delete room category "${t.name}"? This deletes all associated rooms simultaneously. This action is permanent.`,
                            "Delete Category",
                            () => {
                              store.deleteRoomType(t.id);
                            }
                          );
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete category cascade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/50 pt-2.5">
                    <span className="text-xs text-slate-500">Benchmark Rate:</span>
                    <span className="text-xs font-extrabold text-blue-600">GHS ₵{(t.basePricePesewas / 100).toFixed(2)} / night</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Setup Form Modals */}
      <Modal isOpen={isAddRoomOpen} onClose={() => setIsAddRoomOpen(false)} title="Add Single Room to PMS">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <Input label="Room Number" required value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} placeholder="e.g. 104" />
          <Select
            label="Floor Level"
            value={newRoomFloor}
            onChange={(e) => setNewRoomFloor(e.target.value)}
            options={[
              { value: "Floor 1", label: "Floor 1" },
              { value: "Floor 2", label: "Floor 2" },
              { value: "Floor 3", label: "Floor 3" },
              { value: "Ground Floor", label: "Ground Floor" },
            ]}
          />
          <Select
            label="Room Category Type"
            value={newRoomTypeId}
            onChange={(e) => setNewRoomTypeId(e.target.value)}
            options={roomTypes.map((t) => ({ value: t.id, label: t.name }))}
          />
          <Input
            label="Override Price per Night (GHS)"
            type="number"
            value={newRoomPrice}
            onChange={(e) => setNewRoomPrice(e.target.value)}
            placeholder="Leave empty to use Category base price"
          />
          <Input label="Internal Operational Notes" value={newRoomNotes} onChange={(e) => setNewRoomNotes(e.target.value)} placeholder="e.g. Broken telephone" />
          
          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Add Room</Button>
        </form>
      </Modal>

      <Modal isOpen={isAddTypeOpen} onClose={() => setIsAddTypeOpen(false)} title="Create Room Category Type">
        <form onSubmit={handleCreateRoomType} className="space-y-4">
          <Input label="Category Name" required value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="e.g. Presidential Suite" />
          <Input label="Default Rate per Night (GHS)" required type="number" value={newTypePrice} onChange={(e) => setNewTypePrice(e.target.value)} placeholder="e.g. 850" />
          
          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Create Category</Button>
        </form>
      </Modal>

      <Modal isOpen={isEditRoomOpen} onClose={() => setIsEditRoomOpen(false)} title="Edit Room Properties">
        <form onSubmit={handleSaveEditRoom} className="space-y-4">
          <Input label="Room Number" required value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} disabled={!isAdmin} />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Floor Level"
              value={newRoomFloor}
              onChange={(e) => setNewRoomFloor(e.target.value)}
              disabled={!isAdmin}
              options={[
                { value: "Floor 1", label: "Floor 1" },
                { value: "Floor 2", label: "Floor 2" },
                { value: "Floor 3", label: "Floor 3" },
                { value: "Ground Floor", label: "Ground Floor" },
              ]}
            />
            <Select
              label="Category Type"
              value={newRoomTypeId}
              onChange={(e) => setNewRoomTypeId(e.target.value)}
              disabled={!isAdmin}
              options={roomTypes.map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="PMS Operational Status"
              value={editRoomStatus}
              onChange={(e) => setEditRoomStatus(e.target.value as RoomStatus)}
              disabled={!isAdmin}
              options={[
                { value: RoomStatus.AVAILABLE, label: "Available" },
                { value: RoomStatus.OCCUPIED, label: "Occupied" },
                { value: RoomStatus.RESERVED, label: "Reserved" },
                { value: RoomStatus.UNDER_MAINTENANCE, label: "Under Maintenance" },
              ]}
            />
            <Select
              label="Housekeeping Cleanliness"
              value={editRoomHousekeeping}
              onChange={(e) => setEditRoomHousekeeping(e.target.value as HousekeepingStatus)}
              disabled={!isAdmin}
              options={[
                { value: HousekeepingStatus.CLEAN, label: "Clean" },
                { value: HousekeepingStatus.DIRTY, label: "Dirty" },
                { value: HousekeepingStatus.IN_PROGRESS, label: "In Progress" },
                { value: HousekeepingStatus.INSPECTED, label: "Inspected" },
              ]}
            />
          </div>

          <Input label="Price per Night (Override Rate) - GHS" required type="number" value={newRoomPrice} onChange={(e) => setNewRoomPrice(e.target.value)} disabled={!isAdmin} />
          <Input label="Internal Operational & Staff Notes" value={newRoomNotes} onChange={(e) => setNewRoomNotes(e.target.value)} disabled={!isAdmin} />

          {isAdmin ? (
            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  triggerConfirmation(
                    "Delete Room Database Record",
                    `Are you sure you want to permanently delete Room #${newRoomNumber} from database records?`,
                    "Delete Room",
                    () => {
                      store.deleteRoom(editingRoom?.id || "");
                      setIsEditRoomOpen(false);
                      setEditingRoom(null);
                    }
                  );
                }}
                className="w-1/3 text-red-650 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 border text-xs font-bold"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 inline" /> Delete Room
              </Button>
              <Button type="submit" variant="primary" className="flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-xs text-white">
                Save Room Changes
              </Button>
            </div>
          ) : (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditRoomOpen(false)}
                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 border text-xs font-bold"
              >
                Close View
              </Button>
            </div>
          )}
        </form>
      </Modal>

      <Modal isOpen={isEditTypeOpen} onClose={() => setIsEditTypeOpen(false)} title="Edit Room Classification Category">
        <form onSubmit={handleSaveEditType} className="space-y-4">
          <Input label="Category Name" required value={editTypeName} onChange={(e) => setEditTypeName(e.target.value)} />
          <Input label="Default Rate per Night (GHS)" required type="number" value={editTypePrice} onChange={(e) => setEditTypePrice(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-xs text-white">
            Save Category Details
          </Button>
        </form>
      </Modal>

      {/* BULK ACTIONS FLOATING ACTION BAR FOR ADMINISTRATORS */}
      {store.currentUser?.role === UserRole.ADMIN && selectedRoomIds.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white font-black text-xs px-2.5 py-1 rounded">
              {selectedRoomIds.length} Selected
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Bulk Operations Active</p>
              <p className="text-[10px] text-slate-400">Perform massive state modifications or delete entries cleanly</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-black text-xs font-semibold">
            {/* Status Update Select */}
            <div className="flex items-center gap-1.5 bg-[#1e293b]/50 border border-[#334155] px-3 py-1.5 rounded-lg text-white">
              <span className="text-[10px] uppercase font-bold text-slate-400">Set PMS Status:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value as RoomStatus);
                    e.target.value = ""; // Reset
                  }
                }}
                className="bg-[#0f172a] text-xs font-bold ring-none rounded border border-[#334155] px-2 py-1 outline-none text-slate-100 cursor-pointer"
              >
                <option value="">-- Choose Status --</option>
                <option value={RoomStatus.AVAILABLE}>Available</option>
                <option value={RoomStatus.OCCUPIED}>Occupied</option>
                <option value={RoomStatus.RESERVED}>Reserved</option>
                <option value={RoomStatus.UNDER_MAINTENANCE}>Under Maintenance</option>
              </select>
            </div>

            {/* Housekeeping Update Select */}
            <div className="flex items-center gap-1.5 bg-[#1e293b]/50 border border-[#334155] px-3 py-1.5 rounded-lg text-white">
              <span className="text-[10px] uppercase font-bold text-slate-400">Set Housekeeping:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkHousekeepingUpdate(e.target.value as HousekeepingStatus);
                    e.target.value = ""; // Reset
                  }
                }}
                className="bg-[#0f172a] text-xs font-bold ring-none rounded border border-[#334155] px-2 py-1 outline-none text-slate-100 cursor-pointer"
              >
                <option value="">-- Choose Status --</option>
                <option value={HousekeepingStatus.CLEAN}>Clean</option>
                <option value={HousekeepingStatus.DIRTY}>Dirty</option>
                <option value={HousekeepingStatus.IN_PROGRESS}>In Progress</option>
                <option value={HousekeepingStatus.INSPECTED}>Inspected</option>
              </select>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              <span>Bulk Delete</span>
            </button>

            {/* Deselect button */}
            <button
              type="button"
              onClick={() => setSelectedRoomIds([])}
              className="px-3.5 py-2 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Custom Reusable ConfirmDialog Component */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
};
