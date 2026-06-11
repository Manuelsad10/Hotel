import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, RoomStatus, Guest, Reservation, Room } from "../../types";
import { Badge, Button, Card, Modal, Input, Select, ConfirmDialog } from "../../components/ui/design";
import { Search, Calendar, Plus, Printer, Trash2, Edit2, Info } from "lucide-react";

export const ReservationModule: React.FC = () => {
  const store = useHotelStore();
  const reservations = store.reservations;
  const guests = store.guests;
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;

  // Search, date filters and paging
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Modals
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<Reservation | null>(null);
  
  // Custom cancellation modal state:
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingRes, setCancellingRes] = useState<Reservation | null>(null);
  const [cancelFee, setCancelFee] = useState("0");

  // Custom ConfirmDialog State
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

  // Form states
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [guestId, setGuestId] = useState("");
  // New Guest Inline Form
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gNationality, setGNationality] = useState("Ghanaian");
  const [gIdType, setGIdType] = useState("Ghana Card");
  const [gIdNumber, setGIdNumber] = useState("");

  // Booking details Form
  const [roomId, setRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("2026-06-09");
  const [checkOutDate, setCheckOutDate] = useState("2026-06-11");
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [deposit, setDeposit] = useState("0");

  // Edit Booking Form states
  const [editBookingId, setEditBookingId] = useState("");

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    let targetGuestId = guestId;

    if (isNewGuest) {
      if (!gName || !gPhone) {
        store.addToast("Guest name and phone number are required.", "error");
        return;
      }
      const added = store.addGuest({
        fullName: gName,
        phone: gPhone,
        email: gEmail,
        nationality: gNationality,
        idType: gIdType,
        idNumber: gIdNumber,
        notes: "",
        vip: false,
      });
      targetGuestId = added.id;
    }

    if (!targetGuestId) {
      store.addToast("Please select or register a guest profile.", "error");
      return;
    }

    if (!roomId) {
      store.addToast("Please select an available room.", "error");
      return;
    }

    const payload = {
      guestId: targetGuestId,
      roomId,
      checkInDate,
      checkOutDate,
      adults: Number(guestsCount),
      specialRequests,
      depositAmountPesewas: parseFloat(deposit || "0") * 100,
    };

    store.createReservation(payload);

    // Reset forms
    setIsNewBookingOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setIsNewGuest(false);
    setGuestId("");
    setGName("");
    setGPhone("");
    setGEmail("");
    setGNationality("Ghanaian");
    setGIdType("Ghana Card");
    setGIdNumber("");
    setRoomId("");
    setCheckRequests();
  };

  const setCheckRequests = () => {
    setSpecialRequests("");
    setDeposit("0");
    setGuestsCount(1);
  };

  const handleOpenEdit = (res: Reservation) => {
    setEditBookingId(res.id);
    setGuestId(res.guestId);
    setRoomId(res.roomId);
    setCheckInDate(res.checkInDate);
    setCheckOutDate(res.checkOutDate);
    setGuestsCount(res.adults);
    setSpecialRequests(res.specialRequests || "");
    setDeposit((res.depositAmountPesewas / 100).toString());
    setIsEditBookingOpen(true);
  };

  const handleEditBooking = (e: React.FormEvent) => {
    e.preventDefault();
    store.editReservation(
      editBookingId,
      checkInDate,
      checkOutDate,
      roomId,
      Number(guestsCount),
      specialRequests
    );
    setIsEditBookingOpen(false);
    resetForm();
  };

  const getGuestField = (gid: string, field: "name" | "phone" | "id") => {
    const gst = guests.find((g) => g.id === gid);
    if (!gst) return "N/A";
    if (field === "name") return gst.fullName;
    if (field === "phone") return gst.phone;
    return gst.idNumber;
  };

  const getRoomNumber = (rid: string) => {
    return rooms.find((r) => r.id === rid)?.roomNumber || "Unassigned";
  };

  // Filter reservations
  const filteredReservations = reservations.filter((res) => {
    const guestName = getGuestField(res.guestId, "name").toLowerCase();
    const matchesSearch =
      guestName.includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoomNumber(res.roomId).includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || res.status === statusFilter;

    const matchesDate =
      !dateFilter || res.checkInDate === dateFilter || res.checkOutDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters panel */}
      <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-450 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Guest, Booking Number, Room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer font-bold uppercase text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value={ReservationStatus.CONFIRMED}>Confirmed Arrival</option>
              <option value={ReservationStatus.CHECKED_IN}>Checked In</option>
              <option value={ReservationStatus.CHECKED_OUT}>Checked Out</option>
              <option value={ReservationStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          <div className="w-full md:w-44">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 text-center"
            />
          </div>
        </div>

        <Button variant="primary" onClick={() => setIsNewBookingOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs font-bold shrink-0">
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Button>

      </Card>

      {/* Reservation Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs table-auto">
          <thead className="bg-slate-50 border-b border-indigo-120 text-slate-500 font-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3.5">Booking ID</th>
              <th className="px-6 py-3.5">Guest Name</th>
              <th className="px-6 py-3.5">Assigned Room</th>
              <th className="px-6 py-3.5">Stay Interval</th>
              <th className="px-6 py-3.5">Deposit</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">No reservation records match criteria.</td>
              </tr>
            ) : (
              filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold font-mono text-blue-650 text-blue-600">{res.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-extrabold text-slate-800">{getGuestField(res.guestId, "name")}</p>
                      <p className="text-[10px] text-slate-500">{getGuestField(res.guestId, "phone")}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-extrabold">Room {getRoomNumber(res.roomId)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-slate-800">{new Date(res.checkInDate).toLocaleDateString("en-GB")}</p>
                      <p className="text-[10px] text-slate-450 text-slate-400 font-semibold">to {new Date(res.checkOutDate).toLocaleDateString("en-GB")}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">GHS ₵{(res.depositAmountPesewas / 100).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      res.status === ReservationStatus.CONFIRMED ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      res.status === ReservationStatus.CHECKED_IN ? "bg-red-100 text-red-800 border border-red-200" :
                      res.status === ReservationStatus.CHECKED_OUT ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                      "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedSlip(res)} className="p-1 px-2.5 text-[10px] font-bold">
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Slip</span>
                      </Button>
                      {res.status === ReservationStatus.CONFIRMED && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(res)}
                            className="p-1 hover:text-blue-500 rounded hover:bg-slate-100 cursor-pointer text-slate-400"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setCancellingRes(res);
                              setCancelFee("0");
                              setIsCancelModalOpen(true);
                            }}
                            className="p-1 hover:text-red-500 rounded hover:bg-slate-100 cursor-pointer text-slate-400"
                            title="Cancel Booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* modal - create booking */}
      <Modal isOpen={isNewBookingOpen} onClose={() => setIsNewBookingOpen(false)} title="Create New Reservation" className="max-w-xl">
        <form onSubmit={handleCreateBooking} className="space-y-6">
          
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-250 flex items-center justify-between select-none">
            <span className="font-bold text-slate-700">Are you booking a NEW guest?</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Already Registered</span>
              <input
                type="checkbox"
                checked={isNewGuest}
                onChange={(e) => setIsNewGuest(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-bold">Register Inline</span>
            </div>
          </div>

          {/* Guest selector or nested inline registration */}
          {!isNewGuest ? (
            <Select
              label="Select Existing Guest Profile"
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              options={[{ value: "", label: "-- Search and Match Guest --" }, ...guests.map((g) => ({ value: g.id, label: `${g.fullName} (${g.phone})` }))]}
            />
          ) : (
            <div className="p-4 border border-blue-100 bg-blue-50/10 rounded-xl space-y-3">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">Inline Guest Enrollment</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input label="Full Name *" value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Yao Mensah" />
                <Input label="Phone Number *" value={gPhone} onChange={(e) => setGPhone(e.target.value)} placeholder="+233 24 100 0011" />
                <Input label="Email address" value={gEmail} onChange={(e) => setGEmail(e.target.value)} placeholder="yao@gmail.com" />
                <Input label="Nationality" value={gNationality} onChange={(e) => setGNationality(e.target.value)} />
                <Select
                  label="Identity Document Type *"
                  value={gIdType}
                  onChange={(e) => setGIdType(e.target.value)}
                  options={[
                    { value: "Ghana Card", label: "Ghana Card" },
                    { value: "Passport", label: "Passport" },
                    { value: "Voter ID", label: "Voter ID" },
                    { value: "Driver's License", label: "Driver's License" },
                  ]}
                />
                <Input label="Identity Serial Number *" value={gIdNumber} onChange={(e) => setGIdNumber(e.target.value)} placeholder="e.g. GHA-920492-0" />
              </div>
            </div>
          )}

          {/* Dates and allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100 pt-4">
            <Input label="Check In Date" type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
            <Input label="Check Out Date" type="date" required value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
            
            <Select
              label="Assign Available Room"
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              options={[
                { value: "", label: "-- Match Room --" },
                // Simply select rooms that are Available or show all
                ...rooms.map((rm) => ({
                  value: rm.id,
                  label: `Room #${rm.roomNumber} - ${getRoomTypeName(rm.roomTypeId)} (GHS ₵${rm.pricePesewas / 100}/n) [${rm.status}]`,
                })),
              ]}
            />

            <Input label="Guests Count" type="number" value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))} />
            <Input label="Immediate Deposit Paid (GHS)" type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Special Requests / Instructions" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="e.g. Double pillow request" />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Enter Reservation</Button>
        </form>
      </Modal>

      {/* Modal - modify booking prior to arrival */}
      <Modal isOpen={isEditBookingOpen} onClose={() => setIsEditBookingOpen(false)} title="Modify Active Reservation">
        <form onSubmit={handleEditBooking} className="space-y-4">
          <Input label="Check In Date" type="date" required value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
          <Input label="Check Out Date" type="date" required value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
          
          <Select
            label="Room Allocation"
            required
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            options={rooms.map((rm) => ({
              value: rm.id,
              label: `Room #${rm.roomNumber} - ${getRoomTypeName(rm.roomTypeId)} (₵${rm.pricePesewas / 100})`,
            }))}
          />
          <Input label="Guests Count" type="number" value={guestsCount} onChange={(e) => setGuestsCount(Number(e.target.value))} />
          <Input label="Special Requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />

          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Save Booking Adjustments</Button>
        </form>
      </Modal>

      {/* Slip Modal */}
      <Modal isOpen={!!selectedSlip} onClose={() => setSelectedSlip(null)} title="Print Reservation Confirmation Receipt">
        {selectedSlip && (
          <div className="space-y-6 pt-2 select-text">
            
            {/* Elegant Letterhead printable layout */}
            <div id="reservation-slip-printable" className="p-6 border border-slate-300 rounded-xl bg-white space-y-6 text-slate-800">
              
              <div className="flex justify-between items-start border-b border-slate-205 pb-4 border-b">
                <div>
                  <h3 className="text-base font-black uppercase text-[#1e3a5f]">{store.propertyProfile?.name}</h3>
                  <p className="text-[10px] text-slate-450 text-slate-500 font-semibold">{store.propertyProfile?.address}</p>
                  <p className="text-[10px] text-slate-500">{store.propertyProfile?.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black uppercase rounded block">CONFIRMATION SLIP</span>
                  <p className="text-[10px] text-slate-500 font-bold font-mono mt-1">{selectedSlip.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider uppercase">Guest Profile</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{getGuestField(selectedSlip.guestId, "name")}</p>
                  <p className="text-slate-500">{getGuestField(selectedSlip.guestId, "phone")}</p>
                  <p className="text-slate-505 font-medium">ID Ref: {getGuestField(selectedSlip.guestId, "id")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider uppercase">Accomodation Block</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Room #{getRoomNumber(selectedSlip.roomId)}</p>
                  <p className="text-slate-500">Type: {getRoomTypeName(rooms.find((r) => r.id === selectedSlip.roomId)?.roomTypeId || "")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-y border-slate-100 py-3 text-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Arrival Schedule</span>
                  <span className="font-extrabold text-slate-750 block mt-1">{new Date(selectedSlip.checkInDate).toLocaleDateString("en-GB")}</span>
                  <span className="text-[10px] text-slate-500">Check In standard: {store.propertyProfile?.checkInTime}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Departure Schedule</span>
                  <span className="font-extrabold text-slate-750 block mt-1">{new Date(selectedSlip.checkOutDate).toLocaleDateString("en-GB")}</span>
                  <span className="text-[10px] text-slate-500">Check Out deadline: {store.propertyProfile?.checkOutTime}</span>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Special / Special Requests</span>
                <p className="text-slate-700 italic font-semibold">{selectedSlip.specialRequests || "No specific guest request registered"}</p>
              </div>

              <div className="flex justify-between items-center text-xs font-black text-[#1e3a5f] border-t border-slate-100 pt-3.5">
                <span>Secure Escrow Deposit Paid:</span>
                <span>GHS ₵{(selectedSlip.depositAmountPesewas / 100).toFixed(2)}</span>
              </div>

              <div className="text-[9px] text-slate-400 text-center uppercase tracking-wider pt-4 border-t border-dashed">
                Printed via Success Above Dreams (SAD) PMS • Signature of front-desk clerk: ____________________
              </div>

            </div>

            <Button variant="primary" onClick={handlePrintSlip} className="w-full font-bold bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4" />
              <span>Print Slip / Save A4 PDF File</span>
            </Button>
            
          </div>
        )}
      </Modal>

      {/* CANCELLATION MODAL WITH FEES */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancellingRes(null);
        }}
        title="Cancel Guest Booking"
      >
        {cancellingRes && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-xs space-y-1">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-red-900">Are you sure you want to cancel this booking?</p>
              <p className="font-medium text-red-700">
                Cancel booking for guest <strong className="font-bold">{getGuestField(cancellingRes.guestId, "name")}</strong> in <strong className="font-bold">Room #{getRoomNumber(cancellingRes.roomId)}</strong>. Once cancelled, this room will be set back to Available immediately.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <Input
                label="Cancellation Fee Override Amount (GHS ₵) if applicable"
                type="number"
                min="0"
                value={cancelFee}
                onChange={(e) => setCancelFee(e.target.value)}
                placeholder="0.00"
              />

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancellingRes(null);
                  }}
                  className="font-bold text-xs"
                >
                  Go Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const feeValue = parseFloat(cancelFee) || 0;
                    store.updateReservationStatus(cancellingRes.id, ReservationStatus.CANCELLED, feeValue * 100);
                    setIsCancelModalOpen(false);
                    setCancellingRes(null);
                  }}
                  className="font-bold text-xs bg-red-600 hover:bg-red-700"
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

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

const getRoomTypeName = (typeId: string) => {
  const store = useHotelStore.getState();
  return store.roomTypes.find((t) => t.id === typeId)?.name || "Standard Room";
};

const getRoomNumber = (roomId: string) => {
  const store = useHotelStore.getState();
  return store.rooms.find((r) => r.id === roomId)?.roomNumber || "Unassigned";
};

const getGuestField = (gid: string, field: "name" | "phone" | "id") => {
  const store = useHotelStore.getState();
  const gst = store.guests.find((g) => g.id === gid);
  if (!gst) return "N/A";
  if (field === "name") return gst.fullName;
  if (field === "phone") return gst.phone;
  return gst.idNumber;
};
