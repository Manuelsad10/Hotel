/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ClipboardList, Plus, Sparkles, Check, Archive, ShoppingBag, Eye, Trash2, ShieldCheck } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { HousekeepingStatus, RoomStatus, Room } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

export const HousekeepingModule: React.FC = () => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const staff = store.staffList.filter((s) => s.role === "HOUSEKEEPER");

  // Tabs: Assignments tracker, Lost & Found log, Linen Laundry
  const [hkSegment, setHkSegment] = useState<"tasks" | "lost" | "laundry">("tasks");

  // Lost and found register
  const [lostItems, setLostItems] = useState([
    { id: "lost-1", itemName: "Gold Apple Watch", founderName: "Mercy Boateng", roomNo: "102", foundDate: "2026-06-03", status: "Unclaimed" },
    { id: "lost-2", itemName: "Leather Wallet with IDs", founderName: "Kwesi Mensah", roomNo: "304", foundDate: "2026-06-08", status: "Claimed" },
    { id: "lost-3", itemName: "Lenovo Laptop Charger", founderName: "Mercy Boateng", roomNo: "101", foundDate: "2026-06-09", status: "Unclaimed" },
  ]);

  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostName, setLostName] = useState("");
  const [lostRm, setLostRm] = useState("101");
  const [lostFounder, setLostFounder] = useState("");
  const [lostDate, setLostDate] = useState(new Date().toISOString().split("T")[0]);

  // Linen Laundry metrics
  const [linenBatches, setLinenBatches] = useState([
    { id: "lin-1", type: "Bedsheets", qty: 45, status: "Washing", updatedBy: "Mercy Boateng" },
    { id: "lin-2", type: "Bath Towels", qty: 30, status: "Ironed", updatedBy: "Kwesi Mensah" },
    { id: "lin-3", type: "Pillowcases", qty: 60, status: "Clean Stocks", updatedBy: "Mercy Boateng" },
    { id: "lin-4", type: "Fitted Sheets", qty: 15, status: "Dirty", updatedBy: "Kwesi Mensah" },
  ]);

  const [isLinenModalOpen, setIsLinenModalOpen] = useState(false);
  const [linType, setLinType] = useState("Bedsheets");
  const [linQty, setLinQty] = useState<number>(20);
  const [linStatus, setLinStatus] = useState("Dirty");

  // Housekeeping task handlers
  const handleCompleteCleaning = (roomId: string) => {
    store.updateRoomHousekeeping(roomId, HousekeepingStatus.CLEAN);
    store.addToast(`Room ${rooms.find(r => r.id === roomId)?.roomNumber} marked CLEAN. Ready for inspection.`, "success");
  };

  const handleInspectVerify = (roomId: string) => {
    store.updateRoomHousekeeping(roomId, HousekeepingStatus.INSPECTED);
    // If room is Out of Service/Under Maintenance, let's restore it to Available if cleaned!
    const rmObj = rooms.find(r => r.id === roomId);
    if (rmObj && rmObj.status === RoomStatus.UNDER_MAINTENANCE) {
      store.updateRoomStatus(roomId, RoomStatus.AVAILABLE);
    }
    store.addToast(`Room ${rmObj?.roomNumber} verified as INSPECTED & READY.`, "success");
  };

  const handleAddLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostName.trim() || !lostFounder.trim()) return;

    setLostItems([
      ...lostItems,
      {
        id: `lost-${Math.random()}`,
        itemName: lostName,
        founderName: lostFounder,
        roomNo: lostRm,
        foundDate: lostDate,
        status: "Unclaimed",
      },
    ]);

    setIsLostModalOpen(false);
    setLostName("");
    setLostFounder("");
    store.addToast("Lost item logged in registrar.", "success");
  };

  const handleToggleClaimed = (id: string) => {
    setLostItems(lostItems.map(item => item.id === id ? { ...item, status: "Claimed" } : item));
    store.addToast("Item status updated to CLAIMED.", "info");
  };

  const handleAddLinen = (e: React.FormEvent) => {
    e.preventDefault();
    setLinenBatches([
      ...linenBatches,
      {
        id: `lin-${Math.random()}`,
        type: linType,
        qty: linQty,
        status: linStatus,
        updatedBy: "Lobby Housekeeper",
      },
    ]);

    setIsLinenModalOpen(false);
    store.addToast("Linen laundry batch registered.", "success");
  };

  const handleCycleLinenStatus = (id: string, nextSt: string) => {
    setLinenBatches(linenBatches.map(b => b.id === id ? { ...b, status: nextSt } : b));
    store.addToast(`Linen status transitioned to ${nextSt}.`, "info");
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header segment navigation bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setHkSegment("tasks")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              hkSegment === "tasks" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Cleaning Assignments
          </button>
          <button
            onClick={() => setHkSegment("lost")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              hkSegment === "lost" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Lost & Found Registrar
          </button>
          <button
            onClick={() => setHkSegment("laundry")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              hkSegment === "laundry" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Linen Laundry Tracker
          </button>
        </div>

        <div>
          {hkSegment === "lost" && (
            <Button variant="primary" onClick={() => setIsLostModalOpen(true)}>
              <Plus className="w-4 h-4" /> Log Found Item
            </Button>
          )}
          {hkSegment === "laundry" && (
            <Button variant="primary" onClick={() => setIsLinenModalOpen(true)}>
              <Plus className="w-4 h-4" /> Log Linen Batch
            </Button>
          )}
        </div>
      </div>

      {/* 2. Tasks Assignments segment */}
      {hkSegment === "tasks" && (
        <Card className="p-5 animate-in fade-in duration-200">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
            House Cleaning and Supervisors Audits Board
          </h3>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2.5">Room</th>
                  <th>Floor Wing</th>
                  <th>Cleanliness Status</th>
                  <th>Room occupancies</th>
                  <th>Assigned Housekeeper</th>
                  <th className="text-right">Maid Clean Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((rm) => {
                  let badgeVar: any = "neutral";
                  if (rm.housekeepingStatus === HousekeepingStatus.CLEAN) badgeVar = "success";
                  else if (rm.housekeepingStatus === HousekeepingStatus.DIRTY) badgeVar = "danger";
                  else if (rm.housekeepingStatus === HousekeepingStatus.INSPECTING) badgeVar = "warning";
                  else if (rm.housekeepingStatus === HousekeepingStatus.INSPECTED) badgeVar = "brand";

                  // Find housekeeper assigned if room is dirty (simulated task)
                  const dummyMaid = staff[rooms.indexOf(rm) % staff.length]?.fullName || "General Maid";

                  return (
                    <tr key={rm.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3.5 font-mono font-bold text-slate-800">Room {rm.roomNumber}</td>
                      <td>{rm.floor} ({rm.building})</td>
                      <td>
                        <Badge variant={badgeVar} className="capitalize">
                          {rm.housekeepingStatus}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={rm.status === RoomStatus.OCCUPIED ? "danger" : "success"}>
                          {rm.status}
                        </Badge>
                      </td>
                      <td className="font-semibold text-slate-700">{rm.housekeepingStatus !== HousekeepingStatus.INSPECTED ? dummyMaid : "— Completed —"}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {rm.housekeepingStatus === HousekeepingStatus.DIRTY && (
                            <Button variant="success" className="py-1 px-2 text-[10px]" onClick={() => handleCompleteCleaning(rm.id)}>
                              <Check className="w-3 h-3" /> Done Cleaning
                            </Button>
                          )}
                          {(rm.housekeepingStatus === HousekeepingStatus.CLEAN || rm.housekeepingStatus === HousekeepingStatus.INSPECTING) && (
                            <Button variant="brand" className="py-1 px-2.5 text-[10px]" onClick={() => handleInspectVerify(rm.id)}>
                              <ShieldCheck className="w-3.5 h-3.5" /> Confirm Inspected
                            </Button>
                          )}
                          {rm.housekeepingStatus === HousekeepingStatus.INSPECTED && (
                            <span className="text-[10px] text-emerald-600 font-bold uppercase italic mr-2.5">
                              Ready for guest
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 3. Lost & Found register Segment */}
      {hkSegment === "lost" && (
        <Card className="p-5 animate-in fade-in duration-200">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
            Security Lost & Found Database
          </h3>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2.5">Item Registered</th>
                  <th>Where found (Room)</th>
                  <th>Logged Date</th>
                  <th>Discovered by (Maid)</th>
                  <th>Current State</th>
                  <th className="text-right">Action Settle</th>
                </tr>
              </thead>
              <tbody>
                {lostItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-slate-800">{item.itemName}</td>
                    <td className="font-mono">Room {item.roomNo}</td>
                    <td className="font-mono">{new Date(item.foundDate).toLocaleDateString("en-GB")}</td>
                    <td className="font-medium text-slate-700">{item.founderName}</td>
                    <td>
                      <Badge variant={item.status === "Claimed" ? "neutral" : "warning"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      {item.status === "Unclaimed" ? (
                        <Button variant="outline" className="py-0.5 px-2.5 text-[10px]" onClick={() => handleToggleClaimed(item.id)}>
                          Claim Settlement
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic mr-2">Discharge signed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. Linen laundry batches Segment */}
      {hkSegment === "laundry" && (
        <Card className="p-5 animate-in fade-in duration-200">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
            Linen Laundry Pieces Wash Tracker
          </h3>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2.5">Linen Product</th>
                  <th>Total Pieces</th>
                  <th>Current Cycle State</th>
                  <th>Last updated by</th>
                  <th className="text-right">Cycle Transition Action</th>
                </tr>
              </thead>
              <tbody>
                {linenBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-slate-800">{batch.type}</td>
                    <td className="font-mono">{batch.qty} units</td>
                    <td>
                      <Badge
                        variant={
                          batch.status === "Dirty"
                            ? "danger"
                            : batch.status === "Washing"
                            ? "warning"
                            : batch.status === "Ironed"
                            ? "info"
                            : "success"
                        }
                      >
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="font-medium text-slate-600">{batch.updatedBy}</td>
                    <td className="text-right">
                      {batch.status === "Dirty" && (
                        <Button variant="warning" className="py-1 px-2.5 text-[10px]" onClick={() => handleCycleLinenStatus(batch.id, "Washing")}>
                          Start Wash Cycle
                        </Button>
                      )}
                      {batch.status === "Washing" && (
                        <Button variant="info" className="py-1 px-2.5 text-[10px]" onClick={() => handleCycleLinenStatus(batch.id, "Ironed")}>
                          Confirm Ironing
                        </Button>
                      )}
                      {batch.status === "Ironed" && (
                        <Button variant="success" className="py-1 px-2.5 text-[10px]" onClick={() => handleCycleLinenStatus(batch.id, "Clean Stocks")}>
                          Move to Linen Closet
                        </Button>
                      )}
                      {batch.status === "Clean Stocks" && (
                        <span className="text-[10px] text-emerald-600 font-bold uppercase italic mr-2.5">
                          Available Stocks
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Manual log lost & found item modal */}
      <Modal
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        title="Log Discovered Found Property"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLostModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLost}>
              Log Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLost} className="space-y-4">
          <Input
            label="Property Item Desc / Title"
            value={lostName}
            required
            placeholder="e.g. Leather jacket, keys"
            onChange={(e) => setLostName(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3.5">
            <Select
              label="Found in Room"
              value={lostRm}
              onChange={(e) => setLostRm(e.target.value)}
              options={rooms.map(r => ({ value: r.roomNumber, label: `Room ${r.roomNumber}` }))}
            />
            <Input
              label="Discovered by (Staff)"
              value={lostFounder}
              required
              placeholder="e.g. Mercy Boateng"
              onChange={(e) => setLostFounder(e.target.value)}
            />
            <Input
              label="Date Found"
              type="date"
              value={lostDate}
              onChange={(e) => setLostDate(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Manual Linen modal */}
      <Modal
        isOpen={isLinenModalOpen}
        onClose={() => setIsLinenModalOpen(false)}
        title="Log Laundry Linen Pieces"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLinenModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLinen}>
              Log Batch
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLinen} className="space-y-4">
          <div className="grid grid-cols-3 gap-3.5">
            <Select
              label="Linen Product Item"
              value={linType}
              onChange={(e) => setLinType(e.target.value)}
              options={[
                { value: "Bedsheets", label: "Bedsheets" },
                { value: "Bath Towels", label: "Bath Towels" },
                { value: "Pillowcases", label: "Pillowcases" },
                { value: "Duvet Covers", label: "Duvet Covers" },
                { value: "Bathrobes", label: "Bathrobes" },
              ]}
            />
            <Input
              label="Total Quantity (Pieces)"
              type="number"
              min={1}
              value={linQty}
              onChange={(e) => setLinQty(parseInt(e.target.value) || 12)}
            />
            <Select
              label="Initial Status"
              value={linStatus}
              onChange={(e) => setLinStatus(e.target.value)}
              options={[
                { value: "Dirty", label: "Dirty Laundry" },
                { value: "Washing", label: "Washing Machine" },
                { value: "Clean Stocks", label: "Clean stock shelves" },
              ]}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
