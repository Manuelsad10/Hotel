/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, CreditCard, Receipt, Percent, ShieldAlert, CheckCircle } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { ChargeType, PaymentMethod, ReservationStatus, RoomStatus } from "../../types";
import { Button, Input, Select, Badge } from "../ui/design";

interface FolioSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
}

export const FolioSlideOver: React.FC<FolioSlideOverProps> = ({ isOpen, onClose, reservationId }) => {
  // Store
  const store = useHotelStore();
  const reservation = store.reservations.find((r) => r.id === reservationId);
  const guest = reservation ? store.guests.find((g) => g.id === reservation.guestId) : null;
  const room = reservation ? store.rooms.find((r) => r.id === reservation.roomId) : null;
  
  // Local states
  const [chargeDesc, setChargeDesc] = useState("");
  const [chargeAmountGhs, setChargeAmountGhs] = useState<number>(0);
  const [chargeType, setChargeType] = useState<ChargeType>(ChargeType.MINIBAR);
  
  const [payAmountGhs, setPayAmountGhs] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>(PaymentMethod.MTN_MOMO);
  const [payRef, setPayRef] = useState("");
  const [discountGhs, setDiscountGhs] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<"charges" | "payment">("charges");

  // Get active folio
  const folio = store.getOrCreateFolio(reservationId);

  // Sync default pay value
  useEffect(() => {
    if (isOpen) {
      const balance = calculateRemainingBalance();
      setPayAmountGhs(balance > 0 ? balance / 100 : 0);
    }
  }, [isOpen, reservationId, folio]);

  if (!isOpen || !reservation || !guest) return null;

  // Calculates financial totals
  const totalChargesPesewas = folio.charges.reduce((acc, ch) => acc + (ch.amountPesewas * ch.postedQuantity), 0);
  const totalPaymentsPesewas = folio.payments.reduce((acc, p) => acc + p.amountPesewas, 0);
  const totalDiscountPesewas = folio.discountPesewas || 0;
  
  // Ghana Vat 15% calculation
  const subTotalPesewas = totalChargesPesewas;
  const vatRate = store.propertyProfile?.taxEnabled ? (store.propertyProfile?.taxRate || 15) : 0;
  const vatPesewas = Math.floor(subTotalPesewas * (vatRate / 100));
  
  // Total after taxes and discounts
  const grandTotalPesewas = Math.max(0, subTotalPesewas + vatPesewas - totalDiscountPesewas);
  const remainingBalancePesewas = Math.max(0, grandTotalPesewas - totalPaymentsPesewas);

  function calculateRemainingBalance() {
    return remainingBalancePesewas;
  }

  // Handle Add Charge
  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeDesc.trim() || chargeAmountGhs <= 0) return;

    store.addFolioCharge(reservationId, {
      description: chargeDesc,
      amountPesewas: Math.round(chargeAmountGhs * 100),
      type: chargeType,
      postedQuantity: 1,
    });

    setChargeDesc("");
    setChargeAmountGhs(0);
  };

  // Handle Add Payment
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmountGhs <= 0) return;

    store.recordFolioPayment(
      reservationId,
      Math.round(payAmountGhs * 100),
      payMethod,
      payRef
    );

    setPayAmountGhs(0);
    setPayRef("");
  };

  // Handle Apply Discount (Admin authorization simulated)
  const handleApplyDiscount = () => {
    store.applyFolioDiscount(reservationId, Math.round(discountGhs * 100));
  };

  // Settle Full Folio
  const handleSettleFullFolio = () => {
    if (remainingBalancePesewas > 0) {
      store.addToast("Cannot close folio with outstanding balance. Record payment first.", "error");
      return;
    }
    store.settleFolio(reservationId);
    store.updateReservationStatus(reservationId, ReservationStatus.CHECKED_OUT);
  };

  // Print Invoice Layout
  const triggerPrintReceipt = () => {
    window.print();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />

      {/* Main slide content */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-200 no-print">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-zinc-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-brand-teal uppercase tracking-wider">
                Active Folio (Room {room?.roomNumber || "N/A"})
              </span>
              {folio.settled ? (
                <Badge variant="success">Closed / Settled</Badge>
              ) : (
                <Badge variant="warning">Active Ledger</Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-display mt-0.5">
              {guest.fullName}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Ref: {reservationId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("charges")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "charges"
                ? "border-brand-teal text-brand-teal bg-slate-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Charges & Extras
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "payment"
                ? "border-brand-teal text-brand-teal bg-slate-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Discounts & Settlement
          </button>
        </div>

        {/* Panel Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

          {/* Quick billing summary cards */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-50 border border-slate-100 rounded-xl p-4">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Charges + VAT
              </span>
              <p className="text-sm font-semibold text-slate-800 font-mono mt-1">
                ₵{((subTotalPesewas + vatPesewas) / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                Payments
              </span>
              <p className="text-sm font-semibold text-emerald-600 font-mono mt-1">
                ₵{(totalPaymentsPesewas / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                Due Balance
              </span>
              <p className="text-sm font-bold text-red-600 font-mono mt-1">
                ₵{(remainingBalancePesewas / 100).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Blacklist banner check */}
          {guest.blacklist && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-red-700 uppercase">
                  Blacklisted Guest Alert
                </span>
                <p className="text-xs text-red-600 leading-normal mt-0.5">
                  {guest.blacklistReason || "Unauthorized repeat guest profile flagging."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "charges" ? (
            <div className="space-y-5">
              {/* Charge poster form */}
              {!folio.settled && (
                <form
                  onSubmit={handleAddCharge}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3.5"
                >
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                    Post Custom Charge Item
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Category"
                      value={chargeType}
                      onChange={(e) => setChargeType(e.target.value as ChargeType)}
                      options={Object.values(ChargeType).map((ct) => ({
                        value: ct,
                        label: ct,
                      }))}
                    />
                    <Input
                      label="Price (GHS ₵)"
                      type="number"
                      placeholder="0.00"
                      min={0}
                      value={chargeAmountGhs || ""}
                      onChange={(e) => setChargeAmountGhs(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Input
                    label="Item Description / Notes"
                    type="text"
                    required
                    placeholder="e.g. Minibar - 2 Bottles Club Beer, extra laundry ironing"
                    value={chargeDesc}
                    onChange={(e) => setChargeDesc(e.target.value)}
                  />
                  <div className="flex justify-end pt-1">
                    <Button variant="primary" type="submit" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4" /> Post Charge
                    </Button>
                  </div>
                </form>
              )}

              {/* Running checklist list */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
                  Running Charges Ledger ({folio.charges.length} line items)
                </span>
                
                {folio.charges.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    No charges registered on this stay yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {folio.charges.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between p-3 border border-slate-50 bg-slate-50/50 rounded-lg"
                      >
                        <div>
                          <Badge variant="neutral" className="mb-1 text-[10px]">
                            {ch.type}
                          </Badge>
                          <h4 className="text-xs font-medium text-slate-700">
                            {ch.description}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ch.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-800 font-mono">
                            ₵{((ch.amountPesewas * ch.postedQuantity) / 100).toFixed(2)}
                          </span>
                          {!folio.settled && (
                            <button
                              onClick={() => store.removeFolioCharge(reservationId, ch.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Payment Settlement Form */}
              {!folio.settled && remainingBalancePesewas > 0 && (
                <form
                  onSubmit={handleAddPayment}
                  className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3.5"
                >
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block border-b border-emerald-100/50 pb-1.5">
                    Record Payment Settle
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Payment Channel"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                      options={Object.values(PaymentMethod).map((pm) => ({
                        value: pm,
                        label: pm,
                      }))}
                    />
                    <Input
                      label="Settle Amt (GHS ₵)"
                      type="number"
                      placeholder="0.00"
                      value={payAmountGhs || ""}
                      onChange={(e) => setPayAmountGhs(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <Input
                    label="Transaction ID / Ref"
                    type="text"
                    placeholder="e.g. MTN-83948293, VISA-928"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                  />

                  <div className="flex justify-end pt-1">
                    <Button variant="success" type="submit" className="w-full">
                      <CreditCard className="w-4 h-4" /> Settle Amount
                    </Button>
                  </div>
                </form>
              )}

              {/* Discounts Section */}
              {!folio.settled && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block border-b border-amber-100/50 pb-1.5">
                    Apply Manager Discount
                  </span>
                  
                  <div className="flex gap-2 items-end">
                    <Input
                      label="Discount GHS ₵"
                      type="number"
                      placeholder="0.00"
                      value={discountGhs || ""}
                      onChange={(e) => setDiscountGhs(parseFloat(e.target.value) || 0)}
                    />
                    <Button variant="warning" onClick={handleApplyDiscount} className="h-9">
                      <Percent className="w-4 h-4" /> Apply
                    </Button>
                  </div>
                </div>
              )}

              {/* Recorded payments logs */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
                  Transaction Ledger History
                </span>
                {folio.payments.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    No transactions recorded on this stay yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {folio.payments.map((p, pidx) => (
                      <div
                        key={pidx}
                        className="flex items-center justify-between p-3 border border-slate-100 bg-white shadow-xs rounded-lg"
                      >
                        <div>
                          <Badge variant="success" className="mb-1 text-[10px]">
                            {p.method}
                          </Badge>
                          <h4 className="text-xs font-semibold text-slate-700">
                            ₵{(p.amountPesewas / 100).toFixed(2)} Settle
                          </h4>
                          {p.reference && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              TxID: {p.reference}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub totals & Taxes calculation breakdowns */}
          <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Consolidated Invoice Summary
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Item Total (Sub-total)</span>
              <span className="font-mono">₵{(subTotalPesewas / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Ghana Tourism VAT ({vatRate}%)</span>
              <span className="font-mono">₵{(vatPesewas / 100).toFixed(2)}</span>
            </div>
            {totalDiscountPesewas > 0 && (
              <div className="flex justify-between text-amber-700 font-medium">
                <span>Discounts Applied</span>
                <span className="font-mono">-₵{(totalDiscountPesewas / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800 text-sm">
              <span>Grand Net Total</span>
              <span className="font-mono">₵{(grandTotalPesewas / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-emerald-600">
              <span>Settled Payments</span>
              <span className="font-mono">₵{(totalPaymentsPesewas / 100).toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between font-bold text-slate-800 text-sm">
              <span>Net Outstanding Due</span>
              <span className="font-mono text-red-600">₵{(remainingBalancePesewas / 100).toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5">
          <Button variant="outline" onClick={triggerPrintReceipt} className="flex-1">
            <Receipt className="w-4 h-4" /> Print A4 Invoice
          </Button>

          {!folio.settled && (
            <Button
              variant="primary"
              onClick={handleSettleFullFolio}
              disabled={remainingBalancePesewas > 0}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4" /> Complete Settle
            </Button>
          )}
        </div>

      </div>

      {/* ============================================================== */}
      {/* FULL HIDDEN PRINT LAYOUT - CONFORMS TO REAL A4 FORMAT REPORTING */}
      {/* ============================================================== */}
      <div className="print-only p-12 text-slate-800 bg-white leading-relaxed text-sm w-full font-sans">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display uppercase text-brand-teal tracking-wide">
              {store.propertyProfile?.name || "SUCCESS ABOVE DREAMS"}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {store.propertyProfile?.address || "Airport Residential, Accra - Ghana"}
            </p>
            <p className="text-xs text-slate-600">
              Tel: {store.propertyProfile?.phone} | Email: {store.propertyProfile?.email}
            </p>
            {store.propertyProfile?.gtaLicense && (
              <p className="text-xs text-slate-500 mt-0.5">
                GTA Lic No: {store.propertyProfile.gtaLicense}
              </p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest">
              Guest Invoice Folio
            </h2>
            <p className="font-mono text-xs mt-1">Invoice ID: {reservationId}</p>
            <p className="text-xs text-slate-500 mt-1">
              Date Printed: {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Guest & Reservation details */}
        <div className="grid grid-cols-2 gap-8 mb-8 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Guest Recipient
            </h3>
            <p className="font-bold text-slate-800 text-sm">{guest.fullName}</p>
            <p className="text-xs text-slate-600 mt-0.5">{guest.phone} | {guest.email}</p>
            <p className="text-xs text-slate-600 mt-0.5">ID: {guest.idType} - {guest.idNumber}</p>
            {guest.company && (
              <p className="text-xs text-slate-500 mt-1 font-medium">Company: {guest.company}</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Stay Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-500">Room Number:</span>
              <span className="font-bold">{room?.roomNumber || "N/A"} ({room?.floor})</span>

              <span className="font-medium text-slate-500">Check-in:</span>
              <span className="font-semibold">{new Date(reservation.checkInDate).toLocaleDateString("en-GB")}</span>

              <span className="font-medium text-slate-500">Check-out:</span>
              <span className="font-semibold">{new Date(reservation.checkOutDate).toLocaleDateString("en-GB")}</span>

              <span className="font-medium text-slate-500">Status:</span>
              <span className="font-bold uppercase">{reservation.status}</span>
            </div>
          </div>
        </div>

        {/* Itemized charges table */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-600 uppercase font-bold text-[10px] tracking-widest">
                <th className="py-2.5">Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="text-right">Rate</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Total (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {folio.charges.map((ch) => (
                <tr key={ch.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-2.5 font-mono">{new Date(ch.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="font-semibold">{ch.type}</td>
                  <td>{ch.description}</td>
                  <td className="text-right font-mono">₵{(ch.amountPesewas / 100).toFixed(2)}</td>
                  <td className="text-center">{ch.postedQuantity}</td>
                  <td className="text-right font-bold font-mono">₵{((ch.amountPesewas * ch.postedQuantity) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payments list table */}
        <div className="mb-8 grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Payment Settlements
            </h3>
            {folio.payments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No payments have been recorded for this invoice yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-[11px] text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 font-bold uppercase text-[9px] tracking-wider text-slate-500">
                    <th className="py-1">Timestamp</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th className="text-right">Paid (GHS)</th>
                  </tr>
                </thead>
                <tbody>
                  {folio.payments.map((p, idx) => (
                    <tr key={idx} className="border-b border-slate-50">
                      <td className="py-1 font-mono">{new Date(p.timestamp).toLocaleDateString("en-GB")}</td>
                      <td className="font-semibold">{p.method}</td>
                      <td className="font-mono text-slate-500">{p.reference || "N/A"}</td>
                      <td className="text-right font-bold font-mono">₵{(p.amountPesewas / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Sub totals side column */}
          <div className="col-span-5 bg-slate-50 rounded-lg p-4 border border-slate-200">
            <table className="w-full text-xs space-y-1.5 text-slate-700">
              <tbody>
                <tr>
                  <td className="py-1">Sub-total Charge:</td>
                  <td className="text-right font-bold font-mono">₵{(subTotalPesewas / 100).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1">Ghana Tourism Levy & VAT ({vatRate}%):</td>
                  <td className="text-right font-bold font-mono">₵{(vatPesewas / 100).toFixed(2)}</td>
                </tr>
                {totalDiscountPesewas > 0 && (
                  <tr className="text-amber-800">
                    <td className="py-1">Discounts Applied:</td>
                    <td className="text-right font-bold font-mono">-₵{(totalDiscountPesewas / 100).toFixed(2)}</td>
                  </tr>
                )}
                <tr className="border-t border-slate-300 font-bold text-slate-900 text-sm">
                  <td className="py-2">Grand Total Net:</td>
                  <td className="text-right font-mono">₵{(grandTotalPesewas / 100).toFixed(2)}</td>
                </tr>
                <tr className="text-emerald-700 font-bold">
                  <td className="py-1">Settled Balance:</td>
                  <td className="text-right font-mono">₵{(totalPaymentsPesewas / 100).toFixed(2)}</td>
                </tr>
                <tr className="border-t border-dashed border-slate-300 text-red-600 font-bold text-sm">
                  <td className="py-2">Outstanding Due:</td>
                  <td className="text-right font-mono">₵{(remainingBalancePesewas / 100).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Footer signatures */}
        <div className="mt-16 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 h-10 w-48 mx-auto" />
            <p className="mt-2 text-slate-500 uppercase font-semibold">Guest Signature & Consent</p>
          </div>
          <div>
            <div className="border-b border-slate-400 h-10 w-48 mx-auto" />
            <p className="mt-2 text-slate-500 uppercase font-semibold">Authorized Staff Cashier</p>
          </div>
        </div>

        <div className="mt-16 text-center border-t border-slate-200 pt-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Thank you for choosing SUCCESS ABOVE DREAMS. Safe travels!
        </div>

      </div>
    </>
  );
};
