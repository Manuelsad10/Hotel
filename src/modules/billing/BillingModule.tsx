/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DollarSign, Search, ShieldCheck, UserPlus, FileText, ArrowUpRight, Globe, Plus } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { PaymentMethod, ReservationStatus } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

interface BillingModuleProps {
  onOpenFolio: (id: string) => void;
}

export const BillingModule: React.FC<BillingModuleProps> = ({ onOpenFolio }) => {
  const store = useHotelStore();
  const reservations = store.reservations;
  const guests = store.guests;
  const folios = store.folios;

  const [ledgerSearch, setLedgerSearch] = useState("");
  const [billingSegment, setBillingSegment] = useState<"individual" | "corporate">("individual");

  // Corporate Direct Bill accounts list
  const [corporateAccounts, setCorporateAccounts] = useState([
    { id: "corp-1", companyName: "MTN Ghana Head Office", creditLimit: 50000, currentOwes: 18200, country: "Ghana" },
    { id: "corp-2", companyName: "AngloGold Ashanti Ltd", creditLimit: 120000, currentOwes: 42100, country: "Ghana" },
    { id: "corp-3", companyName: "Ghana National Petroleum Corp (GNPC)", creditLimit: 250000, currentOwes: 0, country: "Ghana" },
    { id: "corp-4", companyName: "Guinness Ghana Breweries", creditLimit: 90000, currentOwes: 8400, country: "Ghana" },
  ]);

  const [isCorpModalOpen, setIsCorpModalOpen] = useState(false);
  const [corpName, setCorpName] = useState("");
  const [corpLimit, setCorpLimit] = useState<number>(50000);
  const [corpCountry, setCorpCountry] = useState("Ghana");

  const handleCreateCorp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corpName.trim()) return;

    setCorporateAccounts([
      ...corporateAccounts,
      {
        id: `corp-${Math.random()}`,
        companyName: corpName,
        creditLimit: corpLimit,
        currentOwes: 0,
        country: corpCountry,
      },
    ]);

    setIsCorpModalOpen(false);
    setCorpName("");
    store.addToast(`Corporate Ledger account created: ${corpName}`, "success");
  };

  // Filter individual ledger entries
  const filteredLedger = reservations.filter((r) => {
    if (r.status === ReservationStatus.CANCELLED) return false;

    const guestObj = guests.find((g) => g.id === r.guestId);
    const gName = guestObj?.fullName || "";
    return (
      gName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(ledgerSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Visual top selection segments panel switch */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-80">
        <button
          onClick={() => setBillingSegment("individual")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            billingSegment === "individual" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Individual Folio Ledgers
        </button>
        <button
          onClick={() => setBillingSegment("corporate")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            billingSegment === "corporate" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Corporate Direct Bills
        </button>
      </div>

      {/* 1. Individual Ledger Section */}
      {billingSegment === "individual" && (
        <Card className="p-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
              Active individual accounts ledger
            </h3>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search ledger by guest..."
                className="pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors w-48"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2.5">Acc Ref</th>
                  <th>Primary Guest Title</th>
                  <th>Charges (Pesewas)</th>
                  <th>Payments Settlement</th>
                  <th>Direct Outstanding Balance</th>
                  <th>Audit Stage</th>
                  <th className="text-right">Action Ledger</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((res) => {
                  const gs = guests.find((g) => g.id === res.guestId);
                  const fol = folios[res.id];

                  // Calculations
                  const totalCharges = fol ? fol.charges.reduce((s, c) => s + c.amountPesewas, 0) : 0;
                  const totalPaid = fol ? fol.payments.reduce((s, p) => s + p.amountPesewas, 0) : 0;
                  const bal = totalCharges - totalPaid;

                  return (
                    <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3.5 font-mono font-bold text-slate-800">{res.id}</td>
                      <td>
                        <span className="font-extrabold text-slate-700">{gs?.fullName}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">National: {gs?.nationality}</p>
                      </td>
                      <td className="font-mono">GHS ₵{(totalCharges / 100).toFixed(2)}</td>
                      <td className="font-mono text-emerald-600">GHS ₵{(totalPaid / 100).toFixed(2)}</td>
                      <td className={`font-mono font-bold ${bal > 0 ? "text-red-650" : "text-emerald-700"}`}>
                        ₵{(bal / 100).toFixed(2)}
                      </td>
                      <td>
                        <Badge variant={res.status === "Checked-out" ? "neutral" : "success"}>
                          {res.status === "Checked-in" ? "Live Account" : res.status === "Confirmed" ? "Provision" : "Discharged"}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={() => onOpenFolio(res.id)}>
                          Inspect Ledger
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. Corporate Segment */}
      {billingSegment === "corporate" && (
        <Card className="p-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
              Direct Bill Corporate Accounts Ledger
            </h3>

            <Button variant="primary" onClick={() => setIsCorpModalOpen(true)}>
              <Plus className="w-4 h-4" /> Add Company Account
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                  <th className="py-2.5">Corporation Name</th>
                  <th>Country</th>
                  <th>Credit Limit approved</th>
                  <th>Active Direct Bill balance</th>
                  <th>Approved Status</th>
                  <th className="text-right font-bold text-[10px]">Action dispatch</th>
                </tr>
              </thead>
              <tbody>
                {corporateAccounts.map((corp) => (
                  <tr key={corp.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-slate-800">{corp.companyName}</td>
                    <td>{corp.country}</td>
                    <td className="font-mono font-medium">GHS ₵{corp.creditLimit.toLocaleString()}</td>
                    <td className="font-mono text-cyan-800 font-black">
                      ₵{corp.currentOwes.toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={corp.currentOwes > corp.creditLimit ? "danger" : "brand"}>
                        {corp.currentOwes > corp.creditLimit ? "Limit Breach" : "Good Credit State"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={() => store.addToast("Monthly invoice PDF summary generated inside local cache", "success")}>
                        Generate Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Corporate Modal */}
      <Modal
        isOpen={isCorpModalOpen}
        onClose={() => setIsCorpModalOpen(false)}
        title="Establish Corporate Ledger Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCorpModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCorp}>
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCorp} className="space-y-4">
          <Input
            label="Corporate / Company Legal Name"
            value={corpName}
            required
            placeholder="e.g. MTN Ghana Ltd, Vodafone Ghana"
            onChange={(e) => setCorpName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Line of Credit Limit (GHS ₵)"
              type="number"
              value={corpLimit}
              required
              onChange={(e) => setCorpLimit(parseFloat(e.target.value) || 10000)}
            />
            <Input
              label="Tax Jurisdiction Country"
              value={corpCountry}
              required
              onChange={(e) => setCorpCountry(e.target.value)}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
