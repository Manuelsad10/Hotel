/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Plus, Search, Calendar, BadgeIcon, Eye, Trash2, CalendarX, Sparkles, UserPlus } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, ReservationSource, PaymentMethod, ChargeType } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";
import { ReservationCalendar } from "../../components/shared/ReservationCalendar";

interface ReservationModuleProps {
  onSelectBooking: (id: string) => void;
  isNewBookingLauncherOpen: boolean;
  setIsNewBookingLauncherOpen: (open: boolean) => void;
  preSelectedRoomId?: string;
  preSelectedDate?: string;
}

export const ReservationModule: React.FC<ReservationModuleProps> = ({
  onSelectBooking,
  isNewBookingLauncherOpen,
  setIsNewBookingLauncherOpen,
  preSelectedRoomId = "",
  preSelectedDate = "",
}) => {
  const store = useHotelStore();
  const reservations = store.reservations;
  const guests = store.guests;
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;

  // Search filter list
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Reservation Form State
  const [guestId, setGuestId] = useState(guests[0]?.id || "");
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id || "");
  const [roomId, setRoomId] = useState(preSelectedRoomId || "");
  const [checkIn, setCheckIn] = useState(preSelectedDate || new Date().toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [requests, setRequests] = useState("");
  const [source, setSource] = useState<ReservationSource>(ReservationSource.WALK_IN);
  const [deposit, setDeposit] = useState<number>(100);

  // Group Reservation
  const [groupName, setGroupName] = useState("");

  // Create Guest first toggle
  const [showCreateGuestForm, setShowCreateGuestForm] = useState(false);
  const [gName, setGName] = useState("");
  const [gGender, setGGender] = useState<"Male" | "Female">("Male");
  const [gNat, setGNat] = useState("Ghanaian");
  const [gIdType, setGIdType] = useState<"Ghana Card" | "Passport" | "Voter ID" | "Driver's License">("Ghana Card");
  const [gIdNo, setGIdNo] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gAddr, setGAddr] = useState("Accra, Ghana");
  const [gComp, setGComp] = useState("");

  const handleLaunchModalWithInitialDetails = (rid?: string, date?: string) => {
    if (rid) {
      setRoomId(rid);
      // find room type
      const targetR = rooms.find(rm => rm.id === rid);
      if (targetR) setRoomTypeId(targetR.roomTypeId);
    } else {
      setRoomId("");
    }
    if (date) {
      setCheckIn(date);
      // Auto-set checkOut to date + 2 days
      const d = new Date(date);
      d.setDate(d.getDate() + 2);
      setCheckOut(d.toISOString().split("T")[0]);
    } else {
      setCheckIn(new Date().toISOString().split("T")[0]);
      setCheckOut("");
    }

    setShowCreateGuestForm(false);
    setIsNewBookingLauncherOpen(true);
  };

  const handleAddGuestFirst = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim() || !gPhone.trim()) {
      store.addToast("Guest name and contact number required", "error");
      return;
    }

    const created = store.addGuest({
      fullName: gName,
      gender: gGender as any,
      nationality: gNat,
      idType: gIdType,
      idNumber: gIdNo,
      phone: gPhone,
      email: gEmail,
      address: gAddr,
      company: gComp || undefined,
      vip: false,
      blacklist: false,
    });

    setGuestId(created.id);
    setShowCreateGuestForm(false);
    
    // reset
    setGName("");
    setGPhone("");
    setGIdNo("");
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestId || !checkIn || !checkOut) {
      store.addToast("Missing crucial booking criteria", "error");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      store.addToast("Check-out date must follow Check-in date", "error");
      return;
    }

    // Availability validation check
    const rId = roomId || undefined;
    if (rId) {
      // Look for collision bookings
      const collisionExists = reservations.some((res) => {
        if (res.roomId !== rId) return false;
        if (res.status === ReservationStatus.CANCELLED || res.status === ReservationStatus.NO_SHOW) return false;
        // overlap check
        return checkIn < res.checkOutDate && checkOut > res.checkInDate;
      });

      if (collisionExists) {
        store.addToast("This target room contains collisions inside the selected nights!", "error");
        return;
      }
    }

    store.createReservation({
      guestId,
      roomTypeId,
      roomId: rId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      children,
      specialRequests: requests || undefined,
      source,
      status: ReservationStatus.CONFIRMED,
      depositAmountPesewas: Math.round(deposit * 100),
    });

    setIsNewBookingLauncherOpen(false);
    // reset
    setRequests("");
    setRoomId("");
  };

  // Filter lists
  const filteredReservations = reservations.filter((r) => {
    const guestObj = guests.find((g) => g.id === r.guestId);
    const guestName = guestObj?.fullName || "";
    const matchesSearch =
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Custom horizontal calendar timeline section */}
      <ReservationCalendar
        onSelectBooking={onSelectBooking}
        onLaunchNewBooking={handleLaunchModalWithInitialDetails}
      />

      {/* 2. Reservations List block */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider font-display">
            Registry Ledger Database
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code / guest name..."
                className="pl-9.5 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors w-52"
              />
            </div>

            {/* Status filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ReservationStatus).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Top triggers */}
            <Button variant="primary" className="py-1.5" onClick={() => handleLaunchModalWithInitialDetails()}>
              <Plus className="w-4 h-4" /> Add Reservation
            </Button>
          </div>
        </div>

        {/* Database table listing */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                <th className="py-3">Ref ID</th>
                <th>Guest</th>
                <th>Room Setup</th>
                <th>Arrival</th>
                <th>Departure</th>
                <th>Source</th>
                <th>Deposit Details</th>
                <th>Status</th>
                <th className="text-right">Configure</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 italic bg-slate-50/20 rounded-lg">
                    No reservations matched active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((r) => {
                  const guestObj = guests.find((g) => g.id === r.guestId);
                  const roomTypeObj = roomTypes.find((rt) => rt.id === r.roomTypeId);
                  const roomObj = rooms.find((rm) => rm.id === r.roomId);

                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3.5 font-mono font-semibold text-slate-800">{r.id}</td>
                      <td>
                        <div className="font-bold text-slate-700">{guestObj?.fullName}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{guestObj?.phone}</div>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-800">{roomTypeObj?.name}</span>
                        {roomObj && (
                          <Badge variant="brand" className="ml-1.5 text-[9px]">
                            Rm {roomObj.roomNumber}
                          </Badge>
                        )}
                      </td>
                      <td className="font-mono">{new Date(r.checkInDate).toLocaleDateString("en-GB")}</td>
                      <td className="font-mono">{new Date(r.checkOutDate).toLocaleDateString("en-GB")}</td>
                      <td className="font-semibold uppercase text-slate-500">{r.source}</td>
                      <td className="font-mono">₵{(r.depositAmountPesewas / 100).toFixed(2)}</td>
                      <td>
                        <Badge
                          variant={
                            r.status === ReservationStatus.CHECKED_IN
                              ? "success"
                              : r.status === ReservationStatus.CONFIRMED
                              ? "info"
                              : r.status === ReservationStatus.CANCELLED
                              ? "danger"
                              : "neutral"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={() => onSelectBooking(r.id)}>
                          Configure
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. New Reservation launcher modal */}
      <Modal
        isOpen={isNewBookingLauncherOpen}
        onClose={() => setIsNewBookingLauncherOpen(false)}
        title="Schedule New Reservation Booking"
        className="max-w-xl"
        footer={
          !showCreateGuestForm && (
            <>
              <Button variant="outline" onClick={() => setIsNewBookingLauncherOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateReservation}>
                Confirm Reservation Slip
              </Button>
            </>
          )
        }
      >
        {showCreateGuestForm ? (
          /* Mini overlay form to create profile inline */
          <form onSubmit={handleAddGuestFirst} className="space-y-3.5 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-cyan-800 uppercase">Create Guest Profile First</span>
              <button
                type="button"
                onClick={() => setShowCreateGuestForm(false)}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ← Back to Booking
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full Name" value={gName} required onChange={(e) => setGName(e.target.value)} />
              <Select
                label="Gender"
                value={gGender}
                onChange={(e) => setGGender(e.target.value as any)}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nationality" value={gNat} onChange={(e) => setGNat(e.target.value)} />
              <Input label="Contact Phone" type="tel" required placeholder="+233" value={gPhone} onChange={(e) => setGPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Verification ID"
                value={gIdType}
                onChange={(e) => setGIdType(e.target.value as any)}
                options={[
                  { value: "Ghana Card", label: "Ghana Card (GHA)" },
                  { value: "Passport", label: "Passport" },
                  { value: "Voter ID", label: "Voter ID" },
                ]}
              />
              <Input label="ID Serial Number" required value={gIdNo} onChange={(e) => setGIdNo(e.target.value)} />
            </div>
            <Input label="Registered Address" value={gAddr} onChange={(e) => setGAddr(e.target.value)} />
            <Button variant="success" type="submit" className="w-full">
              Establish Profile
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCreateReservation} className="space-y-3.5">
            <div className="flex items-end gap-2">
              <Select
                label="Guest Recipient"
                required
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
                options={guests.map((g) => ({ value: g.id, label: `${g.fullName} (${g.phone})` }))}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setShowCreateGuestForm(true)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-brand-teal shrink-0 h-9.5 flex items-center justify-center cursor-pointer"
                title="Create profile of returning or new guest first"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Select
                label="Booking Category Target"
                required
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                options={roomTypes.map((rt) => ({ value: rt.id, label: `${rt.name} — ₵${(rt.basePricePesewas/100).toFixed(2)}/nt` }))}
              />
              <Select
                label="Specific Room Block (Optional)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                options={[
                  { value: "", label: "-- Assign at Check-In --" },
                  ...rooms
                    .filter((r) => r.roomTypeId === roomTypeId)
                    .map((r) => ({
                      value: r.id,
                      label: `Room ${r.roomNumber} (${r.status})`,
                    })),
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Check-In"
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
              <Input
                label="Check-Out"
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="No of Adults"
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              />
              <Input
                label="No of Children"
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              />
              <Input
                label="Secure Deposit (₵)"
                type="number"
                min={0}
                value={deposit}
                onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Booking Source Channel"
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                options={Object.values(ReservationSource).map((s) => ({ value: s, label: s }))}
              />
              <Input
                label="Special Requests"
                placeholder="e.g. airport picker, pool-facing room"
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
