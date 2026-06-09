/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, ListFilter, LayoutGrid, CalendarRange, Trash2, ArrowUpRight, Bed } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { RoomStatus, HousekeepingStatus } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";
import { RoomGrid } from "../../components/shared/RoomGrid";

interface RoomModuleProps {
  onSelectBooking: (id: string) => void;
  onLaunchNewBooking: (roomId?: string) => void;
}

export const RoomModule: React.FC<RoomModuleProps> = ({
  onSelectBooking,
  onLaunchNewBooking,
}) => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;

  // Tabs: Floor Plan, Bulk Creator, Room Types, Seasonal Pricing
  const [activeSubTab, setActiveSubTab] = useState<"grid" | "bulk" | "types" | "seasonal">("grid");

  // Single Room form states
  const [isSingleModelOpen, setIsSingleModelOpen] = useState(false);
  const [singleRmNo, setSingleRmNo] = useState("");
  const [singleFloor, setSingleFloor] = useState("Floor 1");
  const [singleBuilding, setSingleBuilding] = useState("Main Block");
  const [singleTypeId, setSingleTypeId] = useState(roomTypes[0]?.id || "");

  // Bulk room states
  const [bulkStart, setBulkStart] = useState<number>(110);
  const [bulkEnd, setBulkEnd] = useState<number>(115);
  const [bulkFloor, setBulkFloor] = useState("Floor 1");
  const [bulkTypeId, setBulkTypeId] = useState(roomTypes[0]?.id || "");
  const [bulkBuilding, setBulkBuilding] = useState("Block A");

  // Room type states
  const [isTypeModelOpen, setIsTypeModelOpen] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [typePrice, setTypePrice] = useState<number>(500);
  const [typeOccup, setTypeOccup] = useState<number>(2);
  const [typeDesc, setTypeDesc] = useState("");
  const [typeAmenities, setTypeAmenities] = useState("AC, WiFi, Hot Water, TV, Balcony");

  // Seasonal rates state (simulated list stored locally in store metadata)
  const [seasonalRates, setSeasonalRates] = useState<Array<{ id: string; name: string; start: string; end: string; rateMult: number; rtId: string }>>([
    { id: "sea-1", name: "Peak Christmas Period", start: "2026-12-15", end: "2027-01-05", rateMult: 1.35, rtId: "rt-suite" },
    { id: "sea-2", name: "Easter Season Rates", start: "2026-04-01", end: "2026-04-10", rateMult: 1.20, rtId: "rt-standard" },
  ]);
  const [seaName, setSeaName] = useState("");
  const [seaStart, setSeaStart] = useState("");
  const [seaEnd, setSeaEnd] = useState("");
  const [seaMult, setSeaMult] = useState<number>(1.25);
  const [seaRt, setSeaRt] = useState(roomTypes[0]?.id || "");

  // Handlers
  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleRmNo.trim()) return;

    store.addRoom({
      roomNumber: singleRmNo,
      floor: singleFloor,
      building: singleBuilding,
      roomTypeId: singleTypeId,
    });

    setSingleRmNo("");
    setIsSingleModelOpen(false);
  };

  const handleBulkCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkStart > bulkEnd) {
      store.addToast("Start range cannot exceed End range", "error");
      return;
    }
    store.bulkCreateRooms(bulkStart, bulkEnd, bulkFloor, bulkTypeId, bulkBuilding);
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    store.addRoomType({
      id: `rt-${Math.random().toString(36).slice(2, 6)}`,
      name: typeName,
      description: typeDesc,
      maxOccupancy: typeOccup,
      basePricePesewas: Math.round(typePrice * 100),
      amenities: typeAmenities.split(",").map((s) => s.trim()).filter(Boolean),
    });

    setTypeName("");
    setTypePrice(500);
    setTypeDesc("");
    setIsTypeModelOpen(false);
  };

  const handleAddSeasonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seaName.trim() || !seaStart || !seaEnd) return;

    setSeasonalRates([
      ...seasonalRates,
      {
        id: `sea-${Math.random()}`,
        name: seaName,
        start: seaStart,
        end: seaEnd,
        rateMult: seaMult,
        rtId: seaRt,
      },
    ]);

    store.addToast(`Seasonal rate '${seaName}' activated successfully.`, "success");
    setSeaName("");
    setSeaStart("");
    setSeaEnd("");
  };

  const handleDeleteSeasonal = (sid: string) => {
    setSeasonalRates(seasonalRates.filter((s) => s.id !== sid));
    store.addToast("Seasonal rate deleted.", "info");
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Subtabs navigation bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab("grid")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "grid" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Graphical Floor Plan
          </button>
          <button
            onClick={() => setActiveSubTab("bulk")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "bulk" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Bulk Room Auto-Creator
          </button>
          <button
            onClick={() => setActiveSubTab("types")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "types" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Beds Configurations
          </button>
          <button
            onClick={() => setActiveSubTab("seasonal")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "seasonal" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Seasonal multipliers
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === "types" ? (
            <Button variant="primary" onClick={() => setIsTypeModelOpen(true)}>
              <Plus className="w-4 h-4" /> Create Category
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsSingleModelOpen(true)}>
              <Plus className="w-4 h-4" /> Single Room
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Tab Rendering panel */}
      {activeSubTab === "grid" && (
        <div className="animate-in fade-in duration-200">
          {/* Key descriptive index */}
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-wrap gap-4 text-xs justify-between mb-4">
            <span className="font-extrabold text-slate-700 uppercase tracking-widest block font-display my-1">
              Color Map Key
            </span>
            <div className="flex gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300" />
                Available Room
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-3 h-3 rounded-md bg-red-50 border border-red-300" />
                Occupied Room (Folio Running)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-3 h-3 rounded-md bg-sky-50 border border-sky-300" />
                Reserved Arrival Room
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300" />
                Under Maintenance
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
                Out of Service
              </span>
            </div>
          </div>

          <RoomGrid
            onSelectRoomBooking={onSelectBooking}
            onLaunchNewBooking={onLaunchNewBooking}
          />
        </div>
      )}

      {activeSubTab === "bulk" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in duration-200">
          
          {/* Form and configs */}
          <Card className="col-span-5 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-50/50 pb-3">
              <Bed className="w-5 h-5 text-brand-teal" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest font-display">
                Bulk Generator Control
              </h3>
            </div>

            <form onSubmit={handleBulkCreate} className="space-y-4">
              <p className="text-[11px] text-slate-500 leading-normal">
                Quickly add consecutive rooms (e.g., 201 to 208) on a specified floor and map them all to a default bed type automatically.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Room ID / No."
                  type="number"
                  required
                  value={bulkStart}
                  onChange={(e) => setBulkStart(parseInt(e.target.value) || 0)}
                />
                <Input
                  label="End Room ID / No."
                  type="number"
                  required
                  value={bulkEnd}
                  onChange={(e) => setBulkEnd(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Target Floor"
                  value={bulkFloor}
                  onChange={(e) => setBulkFloor(e.target.value)}
                  options={[
                    { value: "Floor 1", label: "Floor 1" },
                    { value: "Floor 2", label: "Floor 2" },
                    { value: "Floor 3", label: "Floor 3" },
                    { value: "Penthouse", label: "Penthouse" },
                  ]}
                />
                <Select
                  label="Map Bed Configuration"
                  value={bulkTypeId}
                  onChange={(e) => setBulkTypeId(e.target.value)}
                  options={roomTypes.map((t) => ({ value: t.id, label: t.name }))}
                />
              </div>

              {store.propertyProfile?.mode === "LARGE_HOTEL" && (
                <Input
                  label="Building / Wing Block"
                  placeholder="e.g. Block A, Chalet Annex"
                  value={bulkBuilding}
                  onChange={(e) => setBulkBuilding(e.target.value)}
                />
              )}

              <Button variant="primary" type="submit" className="w-full">
                Generate Suite Ranges
              </Button>
            </form>
          </Card>

          {/* Guidelines info card */}
          <Card className="col-span-7 p-5 space-y-4 bg-slate-50 border border-slate-150">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-display pb-2 border-b border-slate-200">
              Bulk Scheduler Guidelines
            </h4>
            
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                1. <strong>Strict Duplication Lock</strong>: The generator inspects the database registers. If Room number 203 already exists, it is skipped and no collision crash is caused.
              </p>
              <p>
                2. <strong>Incremental Numbering</strong>: Enter standard numerals. The engine creates standard cards matching room tags.
              </p>
              <p>
                3. <strong>Automatic Clean States</strong>: Generated rooms are initially registered with the <strong>AVAILABLE</strong> status and <strong>CLEAN</strong> housekeeping clean stamps, making card reservation timeline mapping immediately live.
              </p>
            </div>
          </Card>

        </div>
      )}

      {activeSubTab === "types" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {roomTypes.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col justify-between min-h-[170px] border border-slate-100">
              <div>
                <div className="flex justify-between items-start">
                  <Badge variant="brand" className="text-[10px] uppercase font-bold">Base setup</Badge>
                  <p className="text-base font-black font-mono text-cyan-700">
                    ₵{(t.basePricePesewas / 100).toFixed(2)} / night
                  </p>
                </div>
                
                <h4 className="text-sm font-bold text-slate-800 uppercase font-display tracking-wide mt-2">
                  {t.name}
                </h4>
                <p className="text-xs text-slate-500 leading-normal mt-1">
                  {t.description}
                </p>

                {/* Amenities list */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {t.amenities.map((am) => (
                    <span key={am} className="text-[9px] font-semibold bg-slate-50 border border-slate-100 text-slate-600 py-0.5 px-2 rounded-full">
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 mt-4 flex justify-between items-center text-xs text-slate-400 font-bold">
                <span>Max Capacity: {t.maxOccupancy} Adults</span>
                <span className="font-mono text-[9px] uppercase tracking-widest">{t.id}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeSubTab === "seasonal" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in duration-200">
          
          {/* Set Seasonal Rates Column */}
          <Card className="col-span-5 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-50/50 pb-3">
              <CalendarRange className="w-5 h-5 text-brand-teal" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest font-display">
                Seasonal Rate Form
              </h3>
            </div>

            <form onSubmit={handleAddSeasonal} className="space-y-4">
              <Input
                label="Holiday / Period Name"
                value={seaName}
                required
                placeholder="e.g. Easter Holiday peak"
                onChange={(e) => setSeaName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3.5">
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={seaStart}
                  onChange={(e) => setSeaStart(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  required
                  value={seaEnd}
                  onChange={(e) => setSeaEnd(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <Select
                  label="Room Bed Type"
                  value={seaRt}
                  onChange={(e) => setSeaRt(e.target.value)}
                  options={roomTypes.map(t => ({ value: t.id, label: t.name }))}
                />
                <Input
                  label="Rate Multiplier"
                  type="number"
                  min={1}
                  step={0.05}
                  value={seaMult}
                  onChange={(e) => setSeaMult(parseFloat(e.target.value) || 1)}
                />
              </div>

              <Button variant="primary" type="submit" className="w-full">
                Add Seasonal Rate Map
              </Button>
            </form>
          </Card>

          {/* Active seasonal list column */}
          <div className="col-span-7 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active Seasonal Multipliers Registry
            </span>

            {seasonalRates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white border rounded-xl border-dashed">
                No active seasonal rate configurations. Room rates follow base prices.
              </div>
            ) : (
              <div className="space-y-3">
                {seasonalRates.map((sr) => {
                  const targetRt = roomTypes.find(rt => rt.id === sr.rtId);
                  return (
                    <Card key={sr.id} className="p-4 flex items-center justify-between border border-slate-100 bg-white">
                      <div>
                        <Badge variant="warning" className="text-[9px] uppercase tracking-widest font-black mb-1">
                          {sr.rateMult}x Multiplier
                        </Badge>
                        <h4 className="text-xs font-bold text-slate-800 uppercase font-display">
                          {sr.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Timeline: {new Date(sr.start).toLocaleDateString("en-GB")} to {new Date(sr.end).toLocaleDateString("en-GB")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Target configuration: {targetRt?.name || "All rooms"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteSeasonal(sr.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Manual Single Room Modal Creator */}
      <Modal
        isOpen={isSingleModelOpen}
        onClose={() => setIsSingleModelOpen(false)}
        title="Add Single Room Record"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSingleModelOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSingle}>
              Add Room
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSingle} className="space-y-3.5">
          <Input
            label="Room No. / Tag"
            value={singleRmNo}
            required
            placeholder="e.g. 109, 211, Cottage 1"
            onChange={(e) => setSingleRmNo(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Select
              label="Default Floor Level"
              value={singleFloor}
              onChange={(e) => setSingleFloor(e.target.value)}
              options={[
                { value: "Floor 1", label: "Floor 1" },
                { value: "Floor 2", label: "Floor 2" },
                { value: "Floor 3", label: "Floor 3" },
                { value: "Penthouse", label: "Penthouse" },
              ]}
            />
            <Select
              label="Standard Bed Type"
              value={singleTypeId}
              onChange={(e) => setSingleTypeId(e.target.value)}
              options={roomTypes.map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>

          <Input
            label="Building Block Wing"
            value={singleBuilding}
            placeholder="e.g. Block B, Garden Wing"
            onChange={(e) => setSingleBuilding(e.target.value)}
          />
        </form>
      </Modal>

      {/* Manual Bed Category Modal creator */}
      <Modal
        isOpen={isTypeModelOpen}
        onClose={() => setIsTypeModelOpen(false)}
        title="Create Room Bed Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsTypeModelOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateType}>
              Add Category
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateType} className="space-y-3.5">
          <Input
            label="Room Category Name"
            value={typeName}
            required
            placeholder="e.g. Coastal View Suite, Twin beds"
            onChange={(e) => setTypeName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Base Price per night (GHS ₵)"
              type="number"
              value={typePrice}
              required
              onChange={(e) => setTypePrice(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Max Occupancy (Adults)"
              type="number"
              value={typeOccup}
              required
              onChange={(e) => setTypeOccup(parseInt(e.target.value) || 2)}
            />
          </div>

          <Input
            label="Standard Amenities (Comma separated list)"
            value={typeAmenities}
            onChange={(e) => setTypeAmenities(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase">Brief Description</label>
            <textarea
              className="px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none"
              rows={3}
              value={typeDesc}
              placeholder="e.g. Master room overlooking the eastern beach front..."
              onChange={(e) => setTypeDesc(e.target.value)}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
