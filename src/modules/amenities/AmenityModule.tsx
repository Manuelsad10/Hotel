/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Calendar, Plus, Users, DollarSign, Printer, BookOpen } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { ChargeType } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

export const AmenityModule: React.FC = () => {
  const store = useHotelStore();
  const reservations = store.reservations.filter(r => r.status === "Checked-in");
  const guests = store.guests;
  const rooms = store.rooms;

  // Local recreational services catalog
  const servicesList = [
    { id: "sv-1", name: "Premium Balinese Whole Body Massage (60 mins)", price: 450, therapist: "Janet Mensah", category: "Spa" },
    { id: "sv-2", name: "Therapeutic Aloe Clay Facial Therapy", price: 300, therapist: "Grace Osei", category: "Spa" },
    { id: "sv-3", name: "VIP Poolside Cabana booking (Full Day)", price: 600, therapist: "Towel Guard", category: "Recreational" },
    { id: "sv-4", name: "Traditional Sauna Steam Bath & Hydromassage", price: 250, therapist: "Janet Mensah", category: "Spa" },
  ];

  // Recreational logs
  const [amenitySessions, setAmenitySessions] = useState([
    { id: "rec-801", serviceId: "sv-1", guestName: "Adwoa Ofori", time: "14:00 Today", cost: 450, therapist: "Janet Mensah", status: "Completed" },
    { id: "rec-802", serviceId: "sv-3", guestName: "Emmanuel Drah", time: "10:00 Tomorrow", cost: 600, therapist: "Pool Guard", status: "Scheduled" },
  ]);

  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bServiceId, setBServiceId] = useState("sv-1");
  const [bGuestName, setBGuestName] = useState("");
  const [bTime, setBTime] = useState("");
  const [routeToFolio, setRouteToFolio] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState(reservations[0]?.id || "");

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bGuestName.trim() || !bTime) return;

    const serv = servicesList.find((s) => s.id === bServiceId);
    if (!serv) return;

    // 1. If Route To Folio, append straight onto active in-house guest folio
    if (routeToFolio) {
      if (!targetBookingId) {
        store.addToast("Select active in-house room folio to post charges!", "error");
        return;
      }
      
      store.addFolioCharge(targetBookingId, {
        type: ChargeType.AMENITY,
        description: `Spa/Amenity: ${serv.name}`,
        amountPesewas: Math.round(serv.price * 100),
        postedQuantity: 1,
      });

      store.addToast(`₵${serv.price.toFixed(2)} posted directly onto guest's room bill!`, "success");
    } else {
      store.addToast("Appointment scheduled. Fees settled in Cash POS.", "success");
    }

    // 2. Append local session list
    setAmenitySessions([
      ...amenitySessions,
      {
        id: `rec-${Math.floor(100 + Math.random() * 900)}`,
        serviceId: bServiceId,
        guestName: bGuestName,
        time: bTime,
        cost: serv.price,
        therapist: serv.therapist,
        status: "Scheduled",
      },
    ]);

    setIsBookOpen(false);
    setBGuestName("");
    setBTime("");
    setRouteToFolio(false);
  };

  const handleCancelSession = (id: string) => {
    setAmenitySessions(amenitySessions.map((s) => (s.id === id ? { ...s, status: "Cancelled" } : s)));
    store.addToast("Session cancelled.", "info");
  };

  return (
    <div className="space-y-6">
      
      {/* Services summary catalog */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {servicesList.map((srv) => (
          <Card key={srv.id} className="p-4 border border-slate-100 flex flex-col justify-between min-h-[140px] bg-white">
            <div>
              <span className="text-[8px] bg-cyan-100 text-brand-teal px-2 py-0.5 rounded font-black uppercase">
                {srv.category}
              </span>
              <h4 className="text-xs font-bold text-slate-800 uppercase font-display mt-2 leading-snug line-clamp-2">
                {srv.name}
              </h4>
            </div>

            <div className="border-t border-slate-50 pt-2.5 mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>Therapist: {srv.therapist}</span>
              <span className="font-mono text-cyan-800 font-bold">₵{srv.price.toFixed(2)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Sessions schedule grid log */}
      <Card className="p-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
            Spa wellness and recreational calendar logs
          </h3>

          <Button variant="primary" onClick={() => setIsBookOpen(true)}>
            <Sparkles className="w-4 h-4" /> Book Therapist Appointment
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                <th className="py-2.5">Session Ref</th>
                <th>Guest Recipient</th>
                <th>Recreational Service</th>
                <th>Assigned Therapist</th>
                <th>Time scheduled</th>
                <th>Session Price</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {amenitySessions.map((sc) => {
                const sv = servicesList.find((s) => s.id === sc.serviceId);
                return (
                  <tr key={sc.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono font-bold text-slate-800">{sc.id}</td>
                    <td className="font-extrabold text-slate-700">{sc.guestName}</td>
                    <td className="font-semibold text-slate-600">{sv?.name}</td>
                    <td>{sc.therapist}</td>
                    <td className="font-mono">{sc.time}</td>
                    <td className="font-mono font-bold">₵{sc.cost.toFixed(2)}</td>
                    <td>
                      <Badge variant={sc.status === "Scheduled" ? "success" : "neutral"}>
                        {sc.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      {sc.status === "Scheduled" ? (
                        <Button variant="outline" className="py-0.5 px-2.5 text-[10px]" onClick={() => handleCancelSession(sc.id)}>
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic mr-2">Discharged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book service appointment modal */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Spa Treatment Cabana Wellness"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBookOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBookService}>
              Confirm appointment
            </Button>
          </>
        }
      >
        <form onSubmit={handleBookService} className="space-y-4 text-sm text-slate-650">
          <div className="grid grid-cols-2 gap-3.5">
            <Select
              label="Wellness / Rec Service"
              value={bServiceId}
              onChange={(e) => setBServiceId(e.target.value)}
              options={servicesList.map(s => ({ value: s.id, label: `${s.name} — ₵${s.price.toFixed(2)}` }))}
            />
            <Input
              label="Client Name"
              value={bGuestName}
              required
              placeholder="e.g. Ama Serwaa"
              onChange={(e) => setBGuestName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Appointment Time Description"
              value={bTime}
              required
              placeholder="e.g. 14:30 Today, Saturday morning"
              onChange={(e) => setBTime(e.target.value)}
            />

            <div className="flex items-center gap-2 mt-6 cursor-pointer select-none">
              <input
                type="checkbox"
                id="route_f_check"
                checked={routeToFolio}
                onChange={(e) => setRouteToFolio(e.target.checked)}
                className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
              />
              <label htmlFor="route_f_check" className="text-xs font-bold text-slate-750 cursor-pointer uppercase">
                Post Bill to Guest Suite Room Folio
              </label>
            </div>
          </div>

          {routeToFolio && (
            <Select
              label="Active In-House Destination Room Folio"
              value={targetBookingId}
              onChange={(e) => setTargetBookingId(e.target.value)}
              options={reservations.map((r) => {
                const guestObj = guests.find((g) => g.id === r.guestId);
                const roomNo = rooms.find((rm) => rm.id === r.roomId)?.roomNumber || "N/A";
                return {
                  value: r.id,
                  label: `Room ${roomNo} - ${guestObj?.fullName}`,
                };
              })}
            />
          )}
        </form>
      </Modal>

    </div>
  );
};
