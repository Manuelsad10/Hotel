import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, RoomStatus, HousekeepingStatus, PaymentMethod, Reservation, Room, Guest } from "../../types";
import { Badge, Button, Card, Modal, Input, Select } from "../../components/ui/design";
import { Search, UserCheck, LogOut, Check, Printer, Plus, AlertCircle } from "lucide-react";

export const FrontDeskModule: React.FC = () => {
  const store = useHotelStore();
  const reservations = store.reservations;
  const guests = store.guests;
  const rooms = store.rooms;
  const roomTypes = store.roomTypes;
  const bills = store.bills;

  // Active sub-tab under frontdesk: "checkin" | "checkout" | "walkin"
  const [activeSubTab, setActiveSubTab] = useState<"checkin" | "checkout" | "walkin">("checkin");

  // Check-In State variables
  const [checkInSearch, setCheckInSearch] = useState("");
  const [recordedIdType, setRecordedIdType] = useState("Ghana Card");
  const [recordedIdNumber, setRecordedIdNumber] = useState("");

  // Checkout State variables
  const [checkoutSearch, setCheckoutSearch] = useState("");
  const [selectedCheckoutRes, setSelectedCheckoutRes] = useState<Reservation | null>(null);

  // Extra manual charge at checkout state
  const [extraLabel, setExtraLabel] = useState("");
  const [extraAmount, setExtraAmount] = useState("");

  // Checkout Payment States
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentRef, setPaymentRef] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");

  const [checkoutReceiptOpen, setCheckoutReceiptOpen] = useState(false);

  // Walk-in form states
  const [walkinGuestId, setWalkinGuestId] = useState("");
  const [walkinNewGuest, setWalkinNewGuest] = useState(false);
  const [wName, setWName] = useState("");
  const [wPhone, setWPhone] = useState("");
  const [wEmail, setWEmail] = useState("");
  const [wNationality, setWNationality] = useState("Ghanaian");
  const [wIdType, setWIdType] = useState("Ghana Card");
  const [wIdNumber, setWIdNumber] = useState("");

  const [wRoomId, setWRoomId] = useState("");
  const [wCheckOutDate, setWCheckOutDate] = useState("2026-06-11");
  const [wAdults, setWAdults] = useState(1);
  const [wSpecial, setWSpecial] = useState("");
  const [wDeposit, setWDeposit] = useState("0");

  // Lookup helpers
  const getGuestLabel = (gid: string) => {
    const gst = guests.find((g) => g.id === gid);
    return gst ? `${gst.fullName} (${gst.phone})` : "Unregistered Guest";
  };

  const getGuestObject = (gid: string): Guest | undefined => {
    return guests.find((g) => g.id === gid);
  };

  const getRoomName = (rid: string) => {
    const rm = rooms.find((r) => r.id === rid);
    return rm ? `Room #${rm.roomNumber}` : "Unassigned";
  };

  const getRoomTypeName = (typeId: string) => {
    return roomTypes.find((t) => t.id === typeId)?.name || "Standard";
  };

  // 1. Process Check In click
  const handleCheckInNow = (resId: string) => {
    if (!recordedIdNumber) {
      store.addToast("Please confirm and write down the guest's ID number before check-in.", "error");
      return;
    }
    // Update reservation with recorded ID type and number, and activate Checked-in status
    const listRes = reservations.map((res) => {
      if (res.id === resId) {
        return {
          ...res,
          checkedInIdType: recordedIdType,
          checkedInIdNumber: recordedIdNumber,
        };
      }
      return res;
    });

    // Save changes and update room occupancy
    store.updateReservationStatus(resId, ReservationStatus.CHECKED_IN);
    store.addToast(`Booking ${resId} successfully checked in. Room marked OCCUPIED.`, "success");
    setRecordedIdNumber("");
    setCheckInSearch("");
  };

  // 2. Walk-in Registration + Check-in in ONE SINGLE FLOW
  const handleWalkInCheckIn = (e: React.FormEvent) => {
    e.preventDefault();

    let targetGuestId = walkinGuestId;

    if (walkinNewGuest) {
      if (!wName || !wPhone || !wIdNumber) {
        store.addToast("Name, ID number, and Phone are required for Walk-in guest.", "error");
        return;
      }
      const newGst = store.addGuest({
        fullName: wName,
        phone: wPhone,
        email: wEmail,
        nationality: wNationality,
        idType: wIdType,
        idNumber: wIdNumber,
        notes: "Walk-in Guest",
        vip: false,
      });
      targetGuestId = newGst.id;
    }

    if (!targetGuestId) {
      store.addToast("Please choose or register a guest profile.", "error");
      return;
    }

    if (!wRoomId) {
      store.addToast("Please select a room to assign for walk-in.", "error");
      return;
    }

    // Create reservation with checked in status directly
    const invoiceNumber = "INN-" + Date.now().toString().slice(-8);
    const newReservation: Reservation = {
      id: invoiceNumber,
      guestId: targetGuestId,
      roomId: wRoomId,
      checkInDate: "2026-06-09", // Today
      checkOutDate: wCheckOutDate,
      adults: Number(wAdults),
      specialRequests: wSpecial,
      depositAmountPesewas: parseFloat(wDeposit || "0") * 100,
      status: ReservationStatus.CHECKED_IN,
      checkedInIdType: walkinNewGuest ? wIdType : "Verified Database",
      checkedInIdNumber: walkinNewGuest ? wIdNumber : "Verified Database",
      createdAt: new Date().toISOString(),
      extraCharges: [],
    };

    // Push reservation directly
    store.createReservation(newReservation);
    store.updateReservationStatus(newReservation.id, ReservationStatus.CHECKED_IN);

    store.addToast(`Walk-in Check-in completed for Room ${getRoomName(wRoomId)}!`, "success");
    
    // Switch to active check-ins list
    setActiveSubTab("checkin");
    resetWalkinForm();
  };

  const resetWalkinForm = () => {
    setWName("");
    setWPhone("");
    setWEmail("");
    setWNationality("Ghanaian");
    setWIdNumber("");
    setWRoomId("");
    setWDeposit("0");
    setWAdults(1);
    setWSpecial("");
  };

  // 3. Select Reservation for Checkout Calculations
  const handleSelectCheckoutRes = (res: Reservation) => {
    setSelectedCheckoutRes(res);
    // Fetch or compute active payment summary
    store.calculateBill(res.id);
  };

  // 4. Add checkout manual fee items (eg: laundry, minibar)
  const handleAddExtraFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckoutRes || !extraLabel || !extraAmount) return;

    store.addExtraCharge(selectedCheckoutRes.id, extraLabel, parseFloat(extraAmount) * 100);
    setExtraLabel("");
    setExtraAmount("");
    // Refresh calculations
    store.calculateBill(selectedCheckoutRes.id);
  };

  const handleApplyDiscount = () => {
    if (!selectedCheckoutRes) return;
    const amountPesewas = parseFloat(discountAmount || "0") * 100;
    store.applyDiscount(selectedCheckoutRes.id, amountPesewas);
  };

  // 5. Commit Check Out payment
  const handleCommitCheckout = () => {
    if (!selectedCheckoutRes) return;

    // Record checkout payment and swap status
    store.recordPayment(selectedCheckoutRes.id, paymentMethod, paymentRef || `FD_TRANS_${Date.now()}`);
    store.updateReservationStatus(selectedCheckoutRes.id, ReservationStatus.CHECKED_OUT);

    // Open receipt invoice printable form
    setCheckoutReceiptOpen(true);
  };

  // Calculations details
  const activeBill = selectedCheckoutRes ? bills[selectedCheckoutRes.id] : null;

  // Search filter check-ins (Only reservation status == CONFIRMED or Checked-in list)
  const arrivalsToDisplay = reservations.filter((res) => {
    if (res.status !== ReservationStatus.CONFIRMED) return false;
    const name = getGuestLabel(res.guestId).toLowerCase();
    const matchesSearch = name.includes(checkInSearch.toLowerCase()) || res.id.toLowerCase().includes(checkInSearch.toLowerCase());
    return matchesSearch;
  });

  // Search filter active checklist for checkouts (Only checked-in guests)
  const occupantsToDisplay = reservations.filter((res) => {
    if (res.status !== ReservationStatus.CHECKED_IN) return false;
    const name = getGuestLabel(res.guestId).toLowerCase();
    const roomNo = getRoomName(res.roomId);
    return name.includes(checkoutSearch.toLowerCase()) || roomNo.includes(checkoutSearch) || res.id.toLowerCase().includes(checkoutSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Frontdesk operation tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 max-w-md">
        <button
          onClick={() => { setActiveSubTab("checkin"); setSelectedCheckoutRes(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "checkin" ? "bg-white text-blue-600 shadow-sm" : "text-slate-550 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Confirm Check-In</span>
        </button>
        <button
          onClick={() => { setActiveSubTab("checkout"); setSelectedCheckoutRes(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "checkout" ? "bg-white text-blue-600 shadow-sm" : "text-slate-550 hover:text-slate-800"
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Check-Out Bill</span>
        </button>
        <button
          onClick={() => { setActiveSubTab("walkin"); setSelectedCheckoutRes(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "walkin" ? "bg-white text-blue-600 shadow-sm" : "text-slate-550 hover:text-slate-800"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Walk-In Flow</span>
        </button>
      </div>

      {/* SUB-TAB: CHECK IN CONSOLE */}
      {activeSubTab === "checkin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card className="p-5 space-y-4 h-[440px] flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Arrivals Guest Registry</h3>
                <p className="text-[10px] text-slate-400">Match confirmed guests with their reservations</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expected guests by name or booking code..."
                  value={checkInSearch}
                  onChange={(e) => setCheckInSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[260px] pr-2 scrollbar-thin">
                {arrivalsToDisplay.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">No arriving bookings match criteria.</p>
                ) : (
                  arrivalsToDisplay.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectCheckoutRes(res)}
                      className={`py-3 flex justify-between items-center text-xs cursor-pointer rounded-lg px-2.5 transition-all ${
                        selectedCheckoutRes?.id === res.id ? "bg-blue-50/50 border border-blue-200" : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-slate-800">{getGuestLabel(res.guestId)}</p>
                        <p className="text-[10px] text-slate-500">{getRoomName(res.roomId)} • {res.id}</p>
                      </div>
                      <Badge variant="warning">CONFIRMED</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* CHECK IN DETAILS REGISTRY */}
          <Card className="p-5 space-y-4 flex flex-col justify-between h-[440px]">
            {selectedCheckoutRes && selectedCheckoutRes.status === ReservationStatus.CONFIRMED ? (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b pb-3 border-indigo-50">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block">Selected Booking Profile</span>
                    <h4 className="text-base font-black text-[#1e3a5f] mt-1">{getGuestLabel(selectedCheckoutRes.guestId)}</h4>
                    <p className="text-xs text-slate-505 font-medium mt-1 font-mono">CODE: {selectedCheckoutRes.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Allocated Room</span>
                      <span className="text-slate-800 block text-sm font-extrabold">{getRoomName(selectedCheckoutRes.roomId)}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{(rooms.find((r) => r.id === selectedCheckoutRes.roomId)?.pricePesewas || 0) / 100} GHS / night</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Scheduled Stay</span>
                      <span className="text-slate-800 block text-sm font-extrabold">
                        {new Date(selectedCheckoutRes.checkInDate).toLocaleDateString("en-GB")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">to {new Date(selectedCheckoutRes.checkOutDate).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>

                  {/* ID CONFIRMATION FOR GHANA REQ */}
                  <div className="p-4 border border-blue-105 bg-blue-50/10 rounded-xl space-y-3.5">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-550 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-black text-blue-700 block">Verify Guest credentials</span>
                        <p className="text-[10px] text-slate-505 font-medium">Under Accra Tourism Regulations, record document info upon check-in.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={recordedIdType}
                        onChange={(e) => setRecordedIdType(e.target.value)}
                        className="px-2.5 py-1.5 w-full text-xs bg-white border border-slate-200 rounded-lg outline-none cursor-pointer font-bold"
                      >
                        <option value="Ghana Card">Ghana Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driver's License">Driver's License</option>
                      </select>

                      <input
                        type="text"
                        placeholder="ID Document Serial Number"
                        required
                        value={recordedIdNumber}
                        onChange={(e) => setRecordedIdNumber(e.target.value)}
                        className="px-2.5 py-1.5 w-full text-xs bg-white border border-slate-200 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleCheckInNow(selectedCheckoutRes.id)}
                  className="w-full font-bold bg-blue-600 hover:bg-blue-700 py-3 text-white uppercase text-xs tracking-wider"
                >
                  Confirm Check-In and Hand Keys
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Select an arriving guest from list to process checking in.</p>
              </div>
            )}
          </Card>

        </div>
      )}

      {/* SUB-TAB: WALK-IN PROCESS */}
      {activeSubTab === "walkin" && (
        <Card className="p-6 max-w-xl mx-auto">
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Fast Walk-In Entry</h3>
            <p className="text-[10px] text-slate-400">Instantly create a booking and check the guest in without pre-booking</p>
          </div>

          <form onSubmit={handleWalkInCheckIn} className="space-y-4 text-xs font-semibold">
            
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-slate-700 text-xs">Register a NEW guest inline?</span>
              <input
                type="checkbox"
                checked={walkinNewGuest}
                onChange={(e) => setWalkinNewGuest(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {!walkinNewGuest ? (
              <Select
                label="Selected Guest Profile"
                value={walkinGuestId}
                onChange={(e) => setWalkinGuestId(e.target.value)}
                options={[
                  { value: "", label: "-- Match Guest Profile --" },
                  ...guests.map((g) => ({ value: g.id, label: `${g.fullName} (${g.phone})` })),
                ]}
              />
            ) : (
              <div className="p-4 border border-indigo-50 bg-indigo-50/5 rounded-xl space-y-3">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">Walk-In Guest enrollment</span>
                <div className="grid grid-cols-2 gap-3.5">
                  <Input label="Full Name *" value={wName} onChange={(e) => setWName(e.target.value)} />
                  <Input label="Phone Number *" value={wPhone} onChange={(e) => setWPhone(e.target.value)} />
                  <Input label="Email Address" value={wEmail} onChange={(e) => setWEmail(e.target.value)} />
                  <Input label="Nationality" value={wNationality} onChange={(e) => setWNationality(e.target.value)} />
                  <Select
                    label="Identity ID Type *"
                    value={wIdType}
                    onChange={(e) => setWIdType(e.target.value)}
                    options={[
                      { value: "Ghana Card", label: "Ghana Card" },
                      { value: "Passport", label: "Passport" },
                      { value: "Voter ID", label: "Voter ID" },
                    ]}
                  />
                  <Input label="ID Number *" value={wIdNumber} onChange={(e) => setWIdNumber(e.target.value)} placeholder="e.g. GHA-920102-1" />
                </div>
              </div>
            )}

            {/* Room Allocation */}
            <div className="grid grid-cols-2 gap-3.5 border-t pt-4">
              <Select
                label="Allocate Available Room"
                required
                value={wRoomId}
                onChange={(e) => setWRoomId(e.target.value)}
                options={[
                  { value: "", label: "-- Match Room --" },
                  ...rooms
                    .filter((r) => r.status === RoomStatus.AVAILABLE)
                    .map((r) => ({ value: r.id, label: `Room #${r.roomNumber} (${getRoomTypeName(r.roomTypeId)}) - GHS ₵${r.pricePesewas / 100}` })),
                ]}
              />

              <Input label="Departure Schedule (UTC)" type="date" value={wCheckOutDate} onChange={(e) => setWCheckOutDate(e.target.value)} />
              <Input label="Guests size" type="number" value={wAdults} onChange={(e) => setWAdults(Number(e.target.value))} />
              <Input label="Escrow Deposit paid (GHS)" type="number" value={wDeposit} onChange={(e) => setWDeposit(e.target.value)} />
              
              <div className="col-span-2">
                <Input label="Front-Desk check-in notes" value={wSpecial} onChange={(e) => setWSpecial(e.target.value)} placeholder="eg: Walk-in late night check in" />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 text-xs uppercase bg-blue-600 hover:bg-blue-700 tracking-wider">
              Commit Instant Walk-In &amp; Check-In
            </Button>
          </form>
        </Card>
      )}

      {/* SUB-TAB: CHECK OUT INTEGRATION */}
      {activeSubTab === "checkout" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          
          {/* Active occupiers list */}
          <Card className="p-5 space-y-4 h-[440px] flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Checked-In Guests Directory</h3>
                <p className="text-[10px] text-slate-400">Retrieve guests currently occupying hotel rooms</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, room number, or reservation ID..."
                  value={checkoutSearch}
                  onChange={(e) => setCheckoutSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[260px] pr-2 scrollbar-thin">
                {occupantsToDisplay.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">No occupants matching description found.</p>
                ) : (
                  occupantsToDisplay.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectCheckoutRes(res)}
                      className={`py-2.5 flex justify-between items-center text-xs cursor-pointer rounded-lg px-2 transition-all ${
                        selectedCheckoutRes?.id === res.id ? "bg-red-50/50 border border-red-200" : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-slate-800">{getGuestLabel(res.guestId)}</p>
                        <p className="text-[10px] text-slate-500">{getRoomName(res.roomId)} • {res.id}</p>
                      </div>
                      <span className="text-[9px] bg-red-100 text-red-850 px-2 py-0.5 rounded font-black border border-red-150">OCCUPIED</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* CHECKOUT SETTLEMENT FORM PANEL */}
          <Card className="p-5 space-y-4 h-[440px] flex flex-col justify-between overflow-y-auto scrollbar-thin">
            {selectedCheckoutRes && activeBill ? (
              <div className="space-y-4">
                
                <div className="border-b pb-3 border-slate-100">
                  <span className="text-[9px] font-black tracking-widest text-[#1e3a5f] block uppercase">Checkout Folio Invoice</span>
                  <h4 className="text-sm font-black text-slate-800 mt-1">{getGuestLabel(selectedCheckoutRes.guestId)}</h4>
                  <p className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Room: {getRoomName(selectedCheckoutRes.roomId)} • ID: {selectedCheckoutRes.id}</p>
                </div>

                {/* Ledger Items Sum */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200/55 text-slate-400 text-[10px] uppercase">
                    <span>Charge Type</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Accomodation stays:</span>
                    <span>GHS ₵{(activeBill.roomChargesPesewas / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Extra services, minibar:</span>
                    <span>GHS ₵{(activeBill.extrasChargesPesewas / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-650 text-red-650">
                    <span>Discounts deducted:</span>
                    <span>- GHS ₵{(activeBill.discountPesewas / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 border-t border-slate-100 pt-1">
                    <span>National Hotel VAT (15%):</span>
                    <span>₵{(activeBill.vatPesewas / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-[#1e3a5f] border-t border-dashed border-slate-200 pt-1.5 mt-1">
                    <span>GRAND TOTAL:</span>
                    <span>GHS ₵{(activeBill.totalPesewas / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Form to add extra checkout charges manually */}
                <form onSubmit={handleAddExtraFee} className="grid grid-cols-3 gap-2 border-t pt-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Add charge item label"
                      required
                      value={extraLabel}
                      onChange={(e) => setExtraLabel(e.target.value)}
                      className="px-2.5 py-1.5 w-full text-xs bg-slate-5 border border-slate-200 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="GHS"
                    required
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(e.target.value)}
                    className="px-2.5 py-1.5 w-full text-xs bg-slate-5 border border-slate-200 rounded-lg outline-none font-semibold text-slate-800 focus:border-blue-500 text-center font-bold"
                  />
                  <Button type="submit" variant="secondary" className="col-span-3 py-1 font-bold text-[10px] uppercase block text-center">
                    + Add Charge Item manually
                  </Button>
                </form>

                {/* Apply Discount Panel */}
                <div className="flex gap-2 items-center border-t border-slate-100 pt-3">
                  <input
                    type="number"
                    placeholder="Apply Discount (GHS)"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="px-2.5 py-1.5 w-full text-xs bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-800 text-center"
                  />
                  <Button onClick={handleApplyDiscount} variant="secondary" className="py-1.5 px-3 text-[10px] font-bold uppercase shrink-0">
                    Apply
                  </Button>
                </div>

                {/* Settle Panel */}
                <div className="border-t border-slate-100 pt-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      label="Payment Method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      options={Object.values(PaymentMethod).map((m) => ({ value: m, label: m }))}
                    />

                    <Input
                      label="Reference Number"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. TXN-MOMO-929"
                    />
                  </div>

                  <Button
                    onClick={handleCommitCheckout}
                    className="w-full font-bold bg-green-600 hover:bg-green-700 py-3 text-white uppercase text-xs tracking-wider"
                  >
                    Post Payment and Settle Checkout
                  </Button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Select an occupying guest from left directory list to process checkout.</p>
              </div>
            )}
          </Card>

        </div>
      )}

      {/* PRINT CHECKOUT RECEIPT POP-UP MODAL */}
      <Modal isOpen={checkoutReceiptOpen} onClose={() => { setCheckoutReceiptOpen(false); setSelectedCheckoutRes(null); }} title="Print Checkout Receipt">
        {selectedCheckoutRes && activeBill && (
          <div className="space-y-6 pt-2 font-sans select-text">
            
            <div id="checkout-receipt-printable" className="p-6 border border-slate-300 rounded-xl bg-white space-y-6 text-slate-800">
              
              {/* Hotel Letterhead */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-[#1e3a5f]">{store.propertyProfile?.name}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">{store.propertyProfile?.address}</p>
                  <p className="text-[10px] text-slate-500">TEL: {store.propertyProfile?.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-black rounded uppercase">PAID &amp; SETTLED</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">REC-INV-{selectedCheckoutRes.id}</p>
                </div>
              </div>

              {/* Guest Profile */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guest info</p>
                  <p className="font-extrabold text-[#1e3a5f] text-sm mt-0.5">{getGuestField(selectedCheckoutRes.guestId, "name")}</p>
                  <p className="text-slate-500">{getGuestField(selectedCheckoutRes.guestId, "phone")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accomodation assigned</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{getRoomName(selectedCheckoutRes.roomId)}</p>
                  <p className="text-slate-500">Period: {new Date(selectedCheckoutRes.checkInDate).toLocaleDateString("en-GB")} to {new Date(selectedCheckoutRes.checkOutDate).toLocaleDateString("en-GB")}</p>
                </div>
              </div>

              {/* Itemized charges table */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Itemized Stay details</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span>Accommodation charges ({Math.max(1, Math.round((new Date(selectedCheckoutRes.checkOutDate).getTime() - new Date(selectedCheckoutRes.checkInDate).getTime()) / (1000 * 3600 * 24)))} nights stay)</span>
                    <span className="font-bold">GHS ₵{(activeBill.roomChargesPesewas / 100).toFixed(2)}</span>
                  </div>

                  {selectedCheckoutRes.extraCharges.map((c) => (
                    <div key={c.id} className="flex justify-between py-1 border-b">
                      <span>{c.label}</span>
                      <span className="font-bold">GHS ₵{(c.amountPesewas / 100).toFixed(2)}</span>
                    </div>
                  ))}

                  {activeBill.discountPesewas > 0 && (
                    <div className="flex justify-between py-1 border-b text-red-600 font-bold">
                      <span>Rebate / Discount Applied</span>
                      <span>- GHS ₵{(activeBill.discountPesewas / 100).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 border-b text-slate-500">
                    <span>Accra Tourism VAT ({store.propertyProfile?.vatRate}%)</span>
                    <span>GHS ₵{(activeBill.vatPesewas / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-[#1e3a5f] pt-3">
                    <span>TOTAL COMPLETED SETTLEMENT:</span>
                    <span>GHS ₵{(activeBill.totalPesewas / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment validation details */}
              <div className="p-3 bg-slate-50 border rounded-lg text-[10px] text-slate-600 grid grid-cols-2 gap-2 font-bold leading-relaxed mb-4">
                <div>
                  <span className="text-slate-400 block uppercase font-normal text-[9px]">Receipt settlement</span>
                  <span>Paid with {activeBill.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-normal text-[9px]">Transaction Reference</span>
                  <span className="font-mono">{activeBill.paymentReference}</span>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 text-center uppercase tracking-wider pt-4 border-t border-dashed">
                Invoice generated and signed via Success Above Dreams (SAD) PMS • Accra Tourism Authority Approved
              </div>

            </div>

            <Button
              onClick={() => window.print()}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700 py-3 text-white uppercase text-xs shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice / Save A4 PDF File</span>
            </Button>
            
          </div>
        )}
      </Modal>

    </div>
  );
};

const getGuestField = (gid: string, field: "name" | "phone" | "id") => {
  const store = useHotelStore.getState();
  const gst = store.guests.find((g) => g.id === gid);
  if (!gst) return "N/A";
  if (field === "name") return gst.fullName;
  if (field === "phone") return gst.phone;
  return gst.idNumber;
};
