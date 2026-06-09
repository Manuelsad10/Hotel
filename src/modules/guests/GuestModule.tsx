/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, Search, UserCheck, ShieldAlert, Star, ShieldX, Eye, Edit2, Plus, LogIn } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

export const GuestModule: React.FC = () => {
  const store = useHotelStore();
  const guests = store.guests;
  const reservations = store.reservations;

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedHistoryGuest, setSelectedHistoryGuest] = useState<any | null>(null);

  // Form profile states
  const [fname, setFname] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [nationality, setNationality] = useState("Ghanaian");
  const [idType, setIdType] = useState<any>("Ghana Card");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("Accra, Ghana");
  const [company, setCompany] = useState("");
  const [vip, setVip] = useState(false);
  const [blacklist, setBlacklist] = useState(false);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fname.trim() || !phone.trim() || !idNumber.trim()) {
      store.addToast("Missing crucial profile criteria", "error");
      return;
    }

    store.addGuest({
      fullName: fname,
      gender,
      nationality,
      idType,
      idNumber,
      phone,
      email,
      address,
      company: company || undefined,
      vip,
      blacklist,
    });

    setIsNewModalOpen(false);
    // reset
    setFname("");
    setPhone("");
    setIdNumber("");
    setVip(false);
    setBlacklist(false);
  };

  const handleToggleVip = (g: any) => {
    store.updateGuest({
      ...g,
      vip: !g.vip,
    });
    store.addToast(`${g.fullName} VIP state toggled.`, "info");
  };

  const handleToggleBlacklist = (g: any) => {
    store.updateGuest({
      ...g,
      blacklist: !g.blacklist,
    });
    store.addToast(`${g.fullName} blacklist status toggled.`, "info");
  };

  // Find guest stay history counts
  const getStayCountForGuest = (gid: string) => {
    return reservations.filter(r => r.guestId === gid && r.status === "Checked-out").length;
  };

  const getGuestActiveStaysHistory = (gid: string) => {
    return reservations.filter(r => r.guestId === gid);
  };

  // Filter list
  const filteredGuests = guests.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      g.fullName.toLowerCase().includes(term) ||
      g.phone.toLowerCase().includes(term) ||
      g.idNumber.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Search Header panel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-teal" /> Loyalty Profiles Registry
        </h3>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, card..."
              className="pl-8.5 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors w-52"
            />
          </div>

          <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Profile Card
          </Button>
        </div>
      </div>

      {/* Guest Listing Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((g) => {
          const stayNCount = getStayCountForGuest(g.id);

          return (
            <Card key={g.id} className="p-4 flex flex-col justify-between min-h-[170px] border border-slate-100 bg-white relative overflow-hidden">
              <div>
                
                {/* Top Badge area */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-50 mb-3">
                  <div className="flex gap-1">
                    {g.vip && (
                      <Badge variant="warning" className="text-[9px] uppercase tracking-widest font-black">
                        VIP LOYALTY
                      </Badge>
                    )}
                    {g.blacklist && (
                      <Badge variant="danger" className="text-[9px] uppercase tracking-widest font-black block">
                        FLAGGED USER
                      </Badge>
                    )}
                    {!g.vip && !g.blacklist && (
                      <Badge variant="brand" className="text-[9px] uppercase tracking-widest font-bold">
                        LOYALTY CLASS
                      </Badge>
                    )}
                  </div>

                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{g.nationality}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 uppercase font-display leading-none">
                  {g.fullName}
                </h4>

                <div className="text-[11px] font-medium text-slate-500 mt-2.5 space-y-1">
                  <p className="font-mono">Contact: {g.phone}</p>
                  <p>Document: {g.idType} ({g.idNumber})</p>
                  {g.company && <p>Affiliation: {g.company}</p>}
                </div>

              </div>

              {/* Bottom control bar */}
              <div className="pt-3 border-t border-slate-50 mt-4.5 flex items-center justify-between text-xs text-slate-400">
                <span>Completed stays: {stayNCount} times</span>
                
                <div className="flex items-center gap-1">
                  
                  {/* VIP toggle */}
                  <button
                    onClick={() => handleToggleVip(g)}
                    title="Toggle VIP Class status"
                    className={`p-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer ${g.vip ? "text-amber-500 hover:text-amber-600" : "text-slate-300"}`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>

                  {/* Blacklist toggle */}
                  <button
                    onClick={() => handleToggleBlacklist(g)}
                    title="Toggle Flagged Backlist status"
                    className={`p-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer ${g.blacklist ? "text-red-500 hover:text-red-650" : "text-slate-350"}`}
                  >
                    <ShieldX className="w-4.5 h-4.5 fill-current" />
                  </button>

                  {/* History View */}
                  <Button variant="outline" className="py-1 px-2 text-[9px] font-bold uppercase ml-1.5" onClick={() => setSelectedHistoryGuest(g)}>
                    Stays Log
                  </Button>
                </div>
              </div>

            </Card>
          );
        })}
      </div>

      {/* Manual Guest Profile creator modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Establish Loyalty Profile Card"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateGuest}>
              Establish Profile
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <Input label="Full Name" value={fname} required placeholder="e.g. Ama Serwaa" onChange={(e) => setFname(e.target.value)} />
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input label="Nationality" value={nationality} required onChange={(e) => setNationality(e.target.value)} />
            <Input label="Contact Phone" type="tel" value={phone} required placeholder="+233" onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Select
              label="Collecting Identification document type"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              options={[
                { value: "Ghana Card", label: "Ghana Card (GHA)" },
                { value: "Passport", label: "Passport" },
                { value: "Voter ID", label: "Voter ID" },
                { value: "Driver's License", label: "Driver's License" },
              ]}
            />
            <Input label="Document Identification Serial" placeholder="e.g. GHA-9238-A" value={idNumber} required onChange={(e) => setIdNumber(e.target.value)} />
          </div>

          <Input label="Registered Address" value={address} placeholder="e.g. Labadi, Accra" onChange={(e) => setAddress(e.target.value)} />

          <div className="grid grid-cols-3 gap-3 pt-2">
            <Input label="Corporate Affiliation / Company" placeholder="e.g. MTN" value={company} onChange={(e) => setCompany(e.target.value)} />
            
            {/* VIP Check */}
            <div className="flex items-center gap-2 justify-center mt-6 cursor-pointer select-none">
              <input type="checkbox" id="vip_check" checked={vip} onChange={(e) => setVip(e.target.checked)} className="w-4 h-4 text-brand-teal accent-brand-teal cursor-pointer" />
              <label htmlFor="vip_check" className="text-xs font-bold text-slate-700 uppercase cursor-pointer">VIP Client</label>
            </div>

            {/* Blacklist Check */}
            <div className="flex items-center gap-2 justify-center mt-6 cursor-pointer select-none">
              <input type="checkbox" id="bl_check" checked={blacklist} onChange={(e) => setBlacklist(e.target.checked)} className="w-4 h-4 text-red-500 accent-red-500 cursor-pointer" />
              <label htmlFor="bl_check" className="text-xs font-bold text-slate-700 uppercase cursor-pointer">Flag Blacklist</label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Guest History Viewer Modal */}
      <Modal
        isOpen={!!selectedHistoryGuest}
        onClose={() => setSelectedHistoryGuest(null)}
        title={selectedHistoryGuest ? `Stays Log History: ${selectedHistoryGuest.fullName}` : ""}
      >
        {selectedHistoryGuest && (
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">
              Historical Reservations Records
            </span>

            {getGuestActiveStaysHistory(selectedHistoryGuest.id).length === 0 ? (
              <div className="text-xs text-slate-405 text-center italic py-8 bg-slate-50 border border-dashed rounded-lg">
                No past reservations checked into this establishment.
              </div>
            ) : (
              <div className="space-y-2.5">
                {getGuestActiveStaysHistory(selectedHistoryGuest.id).map((h) => (
                  <div key={h.id} className="p-3 border border-slate-100 rounded-lg text-xs flex justify-between items-center bg-zinc-50/50">
                    <div>
                      <span className="font-mono font-bold text-slate-800 text-[11px] block">{h.id}</span>
                      <p className="text-slate-500 mt-1">Nights: {h.checkInDate} to {h.checkOutDate}</p>
                    </div>

                    <Badge variant={h.status === "Checked-out" ? "neutral" : h.status === "Checked-in" ? "success" : "info"}>
                      {h.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
