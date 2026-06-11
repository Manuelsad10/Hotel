import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { Guest } from "../../types";
import { Badge, Button, Card, Modal, Input, Select, ConfirmDialog } from "../../components/ui/design";
import { Search, Plus, User, Edit2, Trash2, Star } from "lucide-react";

export const GuestModule: React.FC = () => {
  const store = useHotelStore();
  const guests = store.guests;
  const reservations = store.reservations;

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [vipOnly, setVipOnly] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setGEmail] = useState("");
  const [nationality, setNationality] = useState("Ghanaian");
  const [idType, setIdType] = useState("Ghana Card");
  const [idNumber, setIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [vip, setVip] = useState(false);

  // Editing state
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      store.addToast("Full name and Phone are required", "error");
      return;
    }

    store.addGuest({
      fullName,
      phone,
      email,
      nationality,
      idType,
      idNumber,
      notes,
      vip,
    });

    setIsAddOpen(false);
    clearForm();
  };

  const handleOpenEdit = (gst: Guest) => {
    setSelectedGuest(gst);
    setFullName(gst.fullName);
    setPhone(gst.phone);
    setGEmail(gst.email || "");
    setNationality(gst.nationality);
    setIdType(gst.idType);
    setIdNumber(gst.idNumber);
    setNotes(gst.notes || "");
    setVip(gst.vip);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    store.editGuest(selectedGuest.id, {
      fullName,
      phone,
      email,
      nationality,
      idType,
      idNumber,
      notes,
      vip,
    });

    setIsEditOpen(false);
    setSelectedGuest(null);
    clearForm();
  };

  const clearForm = () => {
    setFullName("");
    setPhone("");
    setGEmail("");
    setNationality("Ghanaian");
    setIdType("Ghana Card");
    setIdNumber("");
    setNotes("");
    setVip(false);
  };

  const getStaysCount = (gid: string) => {
    return reservations.filter((r) => r.guestId === gid).length;
  };

  // Filter guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm) ||
      g.nationality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVip = !vipOnly || g.vip;

    return matchesSearch && matchesVip;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and control header */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
        <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guests by Name, Phone, Country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400">Filter: VIP only</span>
            <input
              type="checkbox"
              checked={vipOnly}
              onChange={(e) => setVipOnly(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs font-bold shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add New Guest</span>
        </Button>
      </Card>

      {/* Guest profiles table */}
      <Card className="overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b text-slate-500 font-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3.5">Guest</th>
              <th className="px-6 py-3.5">Nationality</th>
              <th className="px-6 py-3.5">ID Credentials</th>
              <th className="px-6 py-3.5">Email address</th>
              <th className="px-6 py-3.5">Total Stays</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">No guests discovered matching search factors.</td>
              </tr>
            ) : (
              filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border text-slate-550 flex items-center justify-center font-bold font-sans uppercase shrink-0 text-slate-600 text-[11px]">
                        {g.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm leading-tight flex items-center gap-1">
                          <span>{g.fullName}</span>
                          {g.vip && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        </p>
                        <p className="text-[10px] text-slate-500">{g.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-750 font-bold">{g.nationality}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-slate-800">{g.idType}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold">{g.idNumber || "Not recorded"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-semibold">{g.email || <span className="text-slate-300 italic">N/A</span>}</td>
                  <td className="px-6 py-4 font-extrabold text-slate-800">{getStaysCount(g.id)} nights</td>
                  <td className="px-6 py-4">
                    {g.vip ? (
                      <Badge variant="warning">VIP CLIENT</Badge>
                    ) : (
                      <Badge variant="outline">STANDARD</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          triggerConfirmation(
                            "Delete Guest Profile",
                            `Are you sure you want to permanently delete guest profile for "${g.fullName}"?`,
                            "Delete Guest",
                            () => {
                              store.deleteGuest(g.id);
                            }
                          );
                        }}
                        className="p-1 hover:text-red-600 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* CREATE GUEST MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Enroll Guest Profile">
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <Input label="Full Name *" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aba Korang" />
          <Input label="Phone Number *" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 20 000 0000" />
          <Input label="Email address" value={email} onChange={(e) => setGEmail(e.target.value)} placeholder="aba@gmail.com" />
          <Input label="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          
          <Select
            label="ID Type"
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            options={[
              { value: "Ghana Card", label: "Ghana Card" },
              { value: "Passport", label: "Passport" },
              { value: "Voter ID", label: "Voter ID" },
            ]}
          />
          <Input label="ID Serial Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="GHA-920421-1" />
          
          <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between select-none">
            <span className="text-xs text-slate-700 font-bold">Mark as VIP Client ?</span>
            <input
              type="checkbox"
              checked={vip}
              onChange={(e) => setVip(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Confirm Creation</Button>
        </form>
      </Modal>

      {/* EDIT GUEST MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Guest Information">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input label="Full Name *" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Phone Number *" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email Address" value={email} onChange={(e) => setGEmail(e.target.value)} />
          <Input label="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
          
          <Select
            label="ID Type"
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            options={[
              { value: "Ghana Card", label: "Ghana Card" },
              { value: "Passport", label: "Passport" },
              { value: "Voter ID", label: "Voter ID" },
            ]}
          />
          <Input label="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          
          <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between select-none">
            <span className="text-xs text-slate-700 font-bold font-sans">VIP Class</span>
            <input
              type="checkbox"
              checked={vip}
              onChange={(e) => setVip(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Save Profiles</Button>
        </form>
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
