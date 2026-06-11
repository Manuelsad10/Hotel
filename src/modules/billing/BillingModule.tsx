import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, PaymentMethod, Bill, Reservation } from "../../types";
import { Badge, Button, Card, Modal, Input, Select } from "../../components/ui/design";
import { Search, Printer, DollarSign, ArrowRight, Info, AlertTriangle } from "lucide-react";

interface BillingModuleProps {
  onOpenFolio?: (id: string) => void;
}

export const BillingModule: React.FC<BillingModuleProps> = () => {
  const store = useHotelStore();
  const reservations = store.reservations;
  const guests = store.guests;
  const rooms = store.rooms;
  const bills = store.bills;

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [billingFilter, setBillingFilter] = useState<"ALL" | "UNPAID" | "PAID">("ALL");

  // Receipt Modal
  const [selectedBillRes, setSelectedBillRes] = useState<Reservation | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Payment popup
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentRef, setPaymentRef] = useState("");

  const getGuestField = (gid: string, field: "name" | "phone" | "id") => {
    const gst = guests.find((g) => g.id === gid);
    if (!gst) return "N/A";
    if (field === "name") return gst.fullName;
    if (field === "phone") return gst.phone;
    return gst.idNumber;
  };

  const getRoomNumber = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.roomNumber || "Unassigned";
  };

  const getRoomPrice = (roomId: string) => {
    return (rooms.find((r) => r.id === roomId)?.pricePesewas || 45000) / 100;
  };

  // Safe builder: ensures all checked-in reservations have an auto bill prepared
  const checkedInReservations = reservations.filter((r) => r.status === ReservationStatus.CHECKED_IN || r.status === ReservationStatus.CHECKED_OUT);

  const filteredBills = checkedInReservations.filter((res) => {
    const guestName = getGuestField(res.guestId, "name").toLowerCase();
    const resId = res.id.toLowerCase();
    const matchesSearch = guestName.includes(searchTerm.toLowerCase()) || resId.includes(searchTerm.toLowerCase());

    const activeBill = bills[res.id];
    const isPaid = activeBill?.paid || false;

    if (billingFilter === "PAID") return matchesSearch && isPaid;
    if (billingFilter === "UNPAID") return matchesSearch && !isPaid;
    return matchesSearch;
  });

  const handleOpenPrintReceipt = (res: Reservation) => {
    store.calculateBill(res.id);
    setSelectedBillRes(res);
    setReceiptOpen(true);
  };

  const handleOpenPayment = (res: Reservation) => {
    store.calculateBill(res.id);
    setSelectedBillRes(res);
    setPaymentRef("");
    setPayModalOpen(true);
  };

  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillRes) return;

    store.recordPayment(selectedBillRes.id, paymentMethod, paymentRef || `FD_TRANS_${Date.now()}`);
    setPayModalOpen(false);
    
    // Auto trigger receipt printing modal
    setReceiptOpen(true);
  };

  const filteredRoomsCount = (filteredBillsList: Reservation[]) => {
    if (filteredBillsList.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="px-6 py-8 text-center text-slate-400 italic">No billings correspond to filter.</td>
        </tr>
      );
    }

    return filteredBillsList.map((res) => {
      // Generate or fetch auto bill calculations
      const activeBill: Bill = bills[res.id] || {
        id: `Bill-${res.id}`,
        reservationId: res.id,
        roomChargesPesewas: 2 * 45000,
        extrasChargesPesewas: 0,
        discountPesewas: 0,
        vatPesewas: 13500,
        totalPesewas: 103500,
        paid: false,
      };

      const vatRate = store.propertyProfile?.vatRate || 15;
      const dIn = new Date(res.checkInDate);
      const dOut = new Date(res.checkOutDate);
      let nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
      const targetRoom = store.rooms.find((r) => r.id === res.roomId);
      const ratePerNight = targetRoom?.pricePesewas || 45000;
      const roomChargesSum = nights * ratePerNight;
      const extraChargesSum = res.extraCharges.reduce((acc, c) => acc + c.amountPesewas, 0);
      const disc = activeBill.discountPesewas || 0;
      const totalBeforeVat = Math.max(0, (roomChargesSum + extraChargesSum) - disc);
      const computedVat = Math.round(totalBeforeVat * (vatRate / 100));
      const grandTotalSub = totalBeforeVat + computedVat;

      return (
        <tr key={res.id} className="hover:bg-slate-50/50">
          <td className="px-6 py-4 font-bold font-mono text-blue-600">{res.id}</td>
          <td className="px-6 py-4 font-extrabold text-slate-800">
            {getGuestField(res.guestId, "name")}
          </td>
          <td className="px-6 py-4 font-bold">Room {getRoomNumber(res.roomId)}</td>
          <td className="px-6 py-4 text-slate-500">₵{(ratePerNight / 100).toFixed(0)} × {nights} nights</td>
          <td className="px-6 py-4 text-slate-600">GHS ₵{(extraChargesSum / 100).toFixed(2)}</td>
          <td className="px-6 py-4 text-slate-400">₵{(computedVat / 100).toFixed(2)}</td>
          <td className="px-6 py-4 font-black text-slate-800">GHS ₵{(grandTotalSub / 100).toFixed(2)}</td>
          <td className="px-6 py-4">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
              activeBill.paid ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-105 animate-pulse"
            }`}>
              {activeBill.paid ? "PAID" : "UNPAID"}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-1.5">
              {!activeBill.paid ? (
                <Button onClick={() => handleOpenPayment(res)} variant="success" className="px-2 py-1 text-[10px] font-black bg-emerald-600 p-1.5 font-sans">
                  Post Settle
                </Button>
              ) : (
                <Button onClick={() => handleOpenPrintReceipt(res)} variant="outline" className="px-2.5 py-1 text-[10px] font-bold">
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  <span>Receipt</span>
                </Button>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
        
        <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search outstanding accounts by Name or Booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-1">
            {["ALL", "UNPAID", "PAID"].map((filter) => (
              <button
                key={filter}
                onClick={() => setBillingFilter(filter as any)}
                className={`px-3 py-1.5 text-[10px] font-black rounded border cursor-pointer uppercase transition-all ${
                  billingFilter === filter
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
              >
                {filter} accounts
              </button>
            ))}
          </div>
        </div>

        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Overdue / Outstanding Bills: {checkedInReservations.filter((r) => !bills[r.id]?.paid).length} Accounts unpaid
        </span>
      </Card>

      {/* Accounts Billing grid */}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b text-slate-500 font-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3.5">Booking ID</th>
              <th className="px-6 py-3.5">Guest Full Name</th>
              <th className="px-6 py-3.5">Assigned Room</th>
              <th className="px-6 py-3.5">Rate / Night</th>
              <th className="px-6 py-3.5">Extras manual</th>
              <th className="px-6 py-3.5">National VAT</th>
              <th className="px-6 py-3.5">Grand Sum</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredRoomsCount(filteredBills)}
          </tbody>
        </table>
      </Card>

      {/* BILL RECORD MODAL */}
      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Record Payment">
        {selectedBillRes && bills[selectedBillRes.id] && (
          <form onSubmit={handlePostPayment} className="space-y-4 text-xs font-semibold">
            <p className="text-slate-500">Record payments arriving from cash or mobile money networks.</p>
            
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 font-bold flex justify-between">
              <span>Account balance due:</span>
              <span className="text-blue-600">GHS ₵{(bills[selectedBillRes.id].totalPesewas / 100).toFixed(2)}</span>
            </div>

            <Select
              label="Selected Channel"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={Object.values(PaymentMethod).map((m) => ({ value: m, label: m }))}
            />

            <Input
              label="Transaction ID / Receipt Code"
              required
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="eg: MOMO-REF-929310"
            />

            <Button type="submit" variant="primary" className="w-full py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-xs uppercase tracking-wider">
              Post Payment
            </Button>
          </form>
        )}
      </Modal>

      {/* RECEIPT MODAL */}
      <Modal isOpen={receiptOpen} onClose={() => { setReceiptOpen(false); setSelectedBillRes(null); }} title="Print Folio Checkout Invoice">
        {selectedBillRes && bills[selectedBillRes.id] && (
          <div className="space-y-6 pt-2 select-text font-sans">
            
            <div id="hotel-invoice-printable" className="p-6 border border-slate-350 rounded-xl bg-white space-y-6 text-slate-800">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  {store.propertyProfile?.logo && (
                    <img
                      src={store.propertyProfile.logo}
                      alt="Success Above Dreams (SAD) Logo"
                      className="w-12 h-12 rounded-xl border border-slate-200 object-cover bg-white shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <h3 className="text-base font-black uppercase text-[#1e3a5f]">{store.propertyProfile?.name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">{store.propertyProfile?.address}</p>
                    <p className="text-[10px] text-slate-505">TEL: {store.propertyProfile?.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded uppercase block ${
                    bills[selectedBillRes.id].paid ? "bg-green-150 text-green-800 bg-green-100" : "bg-red-100 text-red-800"
                  }`}>
                    {bills[selectedBillRes.id].paid ? "PAID &amp; COMPLETED" : "UNPAID BILL"}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-mono font-bold">INV-{selectedBillRes.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client name</p>
                  <p className="font-extrabold text-[#1e3a5f] text-sm mt-0.5">{getGuestField(selectedBillRes.guestId, "name")}</p>
                  <p className="text-slate-500">{getGuestField(selectedBillRes.guestId, "phone")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PMS Room Assignment</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Room #{getRoomNumber(selectedBillRes.roomId)}</p>
                  <p className="text-slate-500">Stay Period: {new Date(selectedBillRes.checkInDate).toLocaleDateString("en-GB")} to {new Date(selectedBillRes.checkOutDate).toLocaleDateString("en-GB")}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-2">Itemized Charges</span>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between border-b pb-1 font-semibold">
                    <span>Accommodation Stay Charges</span>
                    <span>GHS ₵{(bills[selectedBillRes.id].roomChargesPesewas / 100).toFixed(2)}</span>
                  </div>

                  {selectedBillRes.extraCharges.map((c) => (
                    <div key={c.id} className="flex justify-between border-b pb-1 font-semibold">
                      <span>{c.label}</span>
                      <span>GHS ₵{(c.amountPesewas / 100).toFixed(2)}</span>
                    </div>
                  ))}

                  {bills[selectedBillRes.id].discountPesewas > 0 && (
                    <div className="flex justify-between border-b pb-1 font-extrabold text-red-600">
                      <span>Discount rebate deduction</span>
                      <span>- GHS ₵{(bills[selectedBillRes.id].discountPesewas / 100).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b pb-1 text-slate-500">
                    <span>Accra Tourism VAT ({store.propertyProfile?.vatRate || 15}%)</span>
                    <span>GHS ₵{(bills[selectedBillRes.id].vatPesewas / 100).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-[#1e3a5f] pt-2">
                    <span>STATEMENT GRAND TOTAL:</span>
                    <span>GHS ₵{(bills[selectedBillRes.id].totalPesewas / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {bills[selectedBillRes.id].paid && (
                <div className="p-3 bg-slate-50 border rounded-lg text-[10px] text-slate-600 grid grid-cols-2 gap-2 font-bold leading-relaxed mb-4">
                  <div>
                    <span className="text-slate-400 block uppercase font-normal text-[9px]">Receipt settlement</span>
                    <span>Paid with {bills[selectedBillRes.id].paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-normal text-[9px]">Transaction Reference</span>
                    <span className="font-mono">{bills[selectedBillRes.id].paymentReference}</span>
                  </div>
                </div>
              )}

              <div className="text-[9px] text-slate-400 text-center uppercase tracking-wider pt-4 border-t border-dashed">
                Accra Tourism Authority Approved PMS • Success Above Dreams (SAD) PMS
              </div>

            </div>

            <Button onClick={() => window.print()} className="w-full font-bold bg-blue-600 hover:bg-blue-700 py-3 text-white uppercase text-xs">
              <Printer className="w-4 h-4" />
              <span>Print Invoice / Save A4 PDF File</span>
            </Button>
            
          </div>
        )}
      </Modal>

    </div>
  );
};



