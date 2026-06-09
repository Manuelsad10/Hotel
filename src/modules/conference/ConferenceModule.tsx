/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Layers, Calendar, Users, Cpu, FileText, BadgePlus, Trash2, Printer } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

export const ConferenceModule: React.FC = () => {
  const store = useHotelStore();
  const profile = store.propertyProfile;

  // Local meeting spaces catalog
  const mtgSpaces = [
    { id: "sp-1", name: "Royal Gold Pavilion", capacity: 250, basePrice: 5500, desc: "Large multi-functional banquet and gala exhibition space." },
    { id: "sp-2", name: "Executive board room", capacity: 16, basePrice: 1500, desc: "Acoustic boardroom with boardroom desk and video zoom TV." },
    { id: "sp-3", name: "Accra Summit Hall", capacity: 80, basePrice: 2800, desc: "Medium conference room for corporate workshops and trainings." },
  ];

  // Active bookings list
  const [mtgBookings, setMtgBookings] = useState([
    { id: "mtg-101", spaceId: "sp-2", company: "MTN Ghana Marketing", date: "2026-06-12", layout: "U-Shape Setup", participants: 12, cost: 1850, status: "Confirmed" },
    { id: "mtg-102", spaceId: "sp-1", company: "Gold Fields Ghana Marriage Banquet", date: "2026-06-20", layout: "Banquet Round Tables", participants: 200, cost: 7200, status: "Confirmed" },
  ]);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bSpaceId, setBSpaceId] = useState("sp-2");
  const [bCompany, setBCompany] = useState("");
  const [bDate, setBDate] = useState("");
  const [bLayout, setBLayout] = useState("Classroom setup");
  const [bParticipants, setBParticipants] = useState<number>(15);

  // surcharges
  const [includePa, setIncludePa] = useState(false);
  const [includeProj, setIncludeProj] = useState(false);
  const [includeCatering, setIncludeCatering] = useState(false);

  const handleBookMtgSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bCompany.trim() || !bDate) return;

    const baseSel = mtgSpaces.find((s) => s.id === bSpaceId);
    if (!baseSel) return;

    let finalCost = baseSel.basePrice;
    if (includePa) finalCost += 400; // ₵400 GHS PA sound
    if (includeProj) finalCost += 250; // ₵250 GHS projector
    if (includeCatering) finalCost += bParticipants * 75; // ₵75 per head for hot tea breaks

    setMtgBookings([
      ...mtgBookings,
      {
        id: `mtg-${Math.floor(100 + Math.random() * 900)}`,
        spaceId: bSpaceId,
        company: bCompany,
        date: bDate,
        layout: bLayout,
        participants: bParticipants,
        cost: finalCost,
        status: "Confirmed",
      },
    ]);

    setIsBookModalOpen(false);
    setBCompany("");
    // resets
    setIncludePa(false);
    setIncludeProj(false);
    setIncludeCatering(false);

    store.addToast("Conference Event booked and invoiced successfully.", "success");
  };

  const handleCancelMtg = (id: string) => {
    setMtgBookings(mtgBookings.map(b => b.id === id ? { ...b, status: "Cancelled" } : b));
    store.addToast("Meeting calendar slot cancelled.", "info");
  };

  const handlePrintQuote = (b: any) => {
    const spaceName = mtgSpaces.find(s => s.id === b.spaceId)?.name || "Hall";
    const invoiceContent = `
      ===================================
      SUCCESS ABOVE DREAMS CONFERENCE INVOICE
      Event No: ${b.id}
      Sponsor: ${b.company}
      Location: ${spaceName}
      Layout Config: ${b.layout}
      Date reserved: ${b.date}
      No. of Guests: ${b.participants} pax
      -----------------------------------
      Total Settle: GHS ₵${b.cost.toFixed(2)}
      All prices include national tourism VAT assessments GHS.
      ===================================
    `;
    alert(invoiceContent);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper overview spaces cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mtgSpaces.map((space) => (
          <Card key={space.id} className="p-4 border border-slate-100 flex flex-col justify-between min-h-[160px] bg-white">
            <div>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase">
                Meeting Room
              </span>
              <h4 className="text-sm font-black uppercase text-slate-800 font-display tracking-wide mt-2">
                {space.name}
              </h4>
              <p className="text-xs text-slate-500 leading-normal mt-1 text-slate-450 line-clamp-2">
                {space.desc}
              </p>
            </div>

            <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1"><Users className="w-4 h-4 text-slate-300" /> Max: {space.capacity} pax</span>
              <span className="font-mono text-cyan-800 font-black">₵{space.basePrice.toLocaleString()} / day</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main timeline listing */}
      <Card className="p-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
            Meeting Spaces active calendar timeline
          </h3>

          <Button variant="primary" onClick={() => setIsBookModalOpen(true)}>
            <Calendar className="w-4 h-4" /> Book Conference Slot
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                <th className="py-2.5">Slot Ref</th>
                <th>Sponsoring Corporate Account</th>
                <th>Meeting Room Location</th>
                <th>Layout Configuration</th>
                <th>Date scheduled</th>
                <th>Invoiced Cost</th>
                <th>Status</th>
                <th className="text-right">Action dispatch</th>
              </tr>
            </thead>
            <tbody>
              {mtgBookings.map((b) => {
                const spObj = mtgSpaces.find((s) => s.id === b.spaceId);
                return (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono font-bold text-slate-800">{b.id}</td>
                    <td className="font-extrabold text-slate-700">{b.company}</td>
                    <td className="font-semibold text-slate-600">{spObj?.name}</td>
                    <td>{b.layout} ({b.participants} pax)</td>
                    <td className="font-mono">{new Date(b.date).toLocaleDateString("en-GB")}</td>
                    <td className="font-mono font-bold text-cyan-800">₵{b.cost.toFixed(2)}</td>
                    <td>
                      <Badge variant={b.status === "Confirmed" ? "success" : "danger"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" className="py-0.5 px-2 text-[10px]" onClick={() => handlePrintQuote(b)}>
                          <Printer className="w-3.5 h-3.5" /> Quote
                        </Button>
                        {b.status === "Confirmed" && (
                          <Button variant="outline" className="py-0.5 px-2 text-[10px]" onClick={() => handleCancelMtg(b.id)}>
                            Cancel
                          </Button>
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

      {/* Book Meeting Space modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule meeting / conference booking"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBookMtgSpace}>
              Confirm booking
            </Button>
          </>
        }
      >
        <form onSubmit={handleBookMtgSpace} className="space-y-4 text-sm text-slate-650">
          <div className="grid grid-cols-2 gap-3.5">
            <Select
              label="Meeting space Location"
              value={bSpaceId}
              onChange={(e) => setBSpaceId(e.target.value)}
              options={mtgSpaces.map(s => ({ value: s.id, label: s.name }))}
            />
            <Input
              label="Event Organiser Company Sponsor"
              value={bCompany}
              required
              placeholder="e.g. MTN Network Solutions Dept"
              onChange={(e) => setBCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <Input
              label="Reservation Date"
              type="date"
              required
              value={bDate}
              onChange={(e) => setBDate(e.target.value)}
            />
            <Select
              label="Seating Layout setup"
              value={bLayout}
              onChange={(e) => setBLayout(e.target.value)}
              options={[
                { value: "Classroom setup", label: "Classroom style desks" },
                { value: "U-Shape setup", label: "Executive U-Shape Boardroom setup" },
                { value: "Banquet Round Tables", label: "Banquet buffet round tables" },
                { value: "Theater seating", label: "Theater lecture layout rows" },
              ]}
            />
            <Input
              label="No of expected guests (capacity check)"
              type="number"
              min={1}
              value={bParticipants}
              onChange={(e) => setBParticipants(parseInt(e.target.value) || 20)}
            />
          </div>

          {/* Surcharges Additions Checklist */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Add-On Audiovisual Gear & Catering Hotlines
            </span>

            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePa}
                  onChange={(e) => setIncludePa(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
                />
                <span className="text-xs font-bold">PA Speaker setup (+₵400)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeProj}
                  onChange={(e) => setIncludeProj(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
                />
                <span className="text-xs font-bold">HDMI Video Projector (+₵250)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCatering}
                  onChange={(e) => setIncludeCatering(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
                />
                <span className="text-xs font-bold">Tea Break Catering (+₵75/guest)</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
