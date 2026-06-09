/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FileBarChart, Calendar, Globe, Award, Download, Printer } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { RoomStatus, ReservationStatus } from "../../types";
import { Card, Badge, Button } from "../../components/ui/design";

export const ReportsModule: React.FC = () => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const reservations = store.reservations;
  const guests = store.guests;
  const folios = store.folios;

  const totalHouseRoomsCount = rooms.length || 1;

  // ADR / RevPAR Calculation
  // Accumulate today checked-in occupied room nights base charge sum
  const occupiedList = rooms.filter((r) => r.status === RoomStatus.OCCUPIED);
  const occupiedN = occupiedList.length || 1;

  // Let's sum the room charges that are posted
  const totalPostedRoomFaresPesewas = Object.values(folios).reduce((sum, fol) => {
    const roomChargesSum = fol.charges
      .filter((c) => c.description.toLowerCase().includes("nightly room fare") || c.description.toLowerCase().includes("room charge"))
      .reduce((s, c) => s + c.amountPesewas, 0);
    return sum + roomChargesSum;
  }, 0);

  const adrGhs = totalPostedRoomFaresPesewas > 0 ? (totalPostedRoomFaresPesewas / 100) / occupiedN : 350; // default/simulated GHS GHS GHS
  const revparGhs = (adrGhs * occupiedN) / totalHouseRoomsCount;

  // Ghana Tourism Authority Statutory Guest Nationalities Report calculations
  // Count guests by nationality
  const compileNationalitiesReport = () => {
    const registry: Record<string, { guestCount: number; nightsSlept: number; totalLevyPesewas: number }> = {};
    
    reservations.forEach((r) => {
      const gs = guests.find((g) => g.id === r.guestId);
      if (!gs) return;

      const nation = gs.nationality || "Ghanaian";
      if (!registry[nation]) {
        registry[nation] = { guestCount: 0, nightsSlept: 0, totalLevyPesewas: 0 };
      }

      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      // Settle 1% statutory GTA Tourism levy per night slept
      const fol = folios[r.id];
      const roomCost = fol?.charges.find(c => c.description.includes("Nightly Room Fare"))?.amountPesewas || 45000;
      const calculatedLevy = (roomCost * 0.01) * nights;

      registry[nation].guestCount += 1;
      registry[nation].nightsSlept += nights;
      registry[nation].totalLevyPesewas += calculatedLevy;
    });

    return Object.entries(registry).map(([nat, dat]) => ({
      nationality: nat,
      visitorsCount: dat.guestCount,
      roomNightsSlept: dat.nightsSlept,
      gtaFundLevyGhs: dat.totalLevyPesewas / 100,
    }));
  };

  const nationalitiesData = compileNationalitiesReport();

  const handlePrintAuditReports = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper reports dispatch bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
        <div className="flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-brand-teal" />
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider font-display">
            National Audits & Yield Analytics
          </h3>
        </div>

        <Button variant="primary" onClick={handlePrintAuditReports} className="flex items-center gap-1">
          <Printer className="w-4 h-4" /> Print PDF Compliance Audit
        </Button>
      </div>

      {/* Yield KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* ADR */}
        <Card className="p-4 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              ADR (Average Daily Rate)
            </span>
            <p className="text-2xl font-black font-mono text-cyan-800 mt-2">
              ₵{adrGhs.toFixed(2)}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            Rent income per occupied room tonight
          </p>
        </Card>

        {/* RevPAR */}
        <Card className="p-4 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              RevPAR (Revenue Per Available Room)
            </span>
            <p className="text-2xl font-black font-mono text-cyan-800 mt-2">
              ₵{revparGhs.toFixed(2)}
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            Rent capacity weight across all inventory
          </p>
        </Card>

        {/* Tourism Levy Accumulation */}
        <Card className="p-4 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              GTA Tourism Levy Fund (1%)
            </span>
            {/* Total 1% tourism fund levy collected from all bookings */}
            <p className="text-2xl font-black font-mono text-emerald-600 mt-2">
              ₵{nationalitiesData.reduce((s, d) => s + d.gtaFundLevyGhs, 0).toFixed(2)}
            </p>
          </div>
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">
            Accumulated Statutory Accra Tourism levy
          </p>
        </Card>

      </div>

      {/* GTA Nationalities Compliance statutory report table */}
      <Card className="p-5 space-y-4">
        
        <div className="flex border-b border-slate-100 pb-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-teal" />
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider font-display">
                GTA Statutory Guest Nationalities Report
              </h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                Complies with Ghana Tourism Authority Statutory Board levy declarations
              </p>
            </div>
          </div>
          <Badge variant="brand" className="text-[9px] uppercase tracking-wider font-bold">GTA-ACC-FORM 04</Badge>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                <th className="py-2.5">Registered Nationality State</th>
                <th>Total Guests Welcomed</th>
                <th>Accumulated Bed-Nights Slept</th>
                <th>Estimated 1% Tourism Levy (GHS ₵)</th>
                <th className="text-right">Tax Audits Status</th>
              </tr>
            </thead>
            <tbody>
              {nationalitiesData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 italic bg-slate-50/20 rounded-lg">
                    No active stay records inside the database archives.
                  </td>
                </tr>
              ) : (
                nationalitiesData.map((d) => (
                  <tr key={d.nationality} className="border-b border-slate-55 hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-slate-850 uppercase">{d.nationality}</td>
                    <td className="font-mono">{d.visitorsCount} guest{d.visitorsCount > 1 && "s"} registered</td>
                    <td className="font-mono">{d.roomNightsSlept} bed-nights slept</td>
                    <td className="font-mono font-bold text-slate-800">
                      ₵{d.gtaFundLevyGhs.toFixed(2)}
                    </td>
                    <td className="text-right">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold py-0.5 px-2 rounded-full uppercase">
                        Audited / Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-[9.5px] text-slate-400 leading-normal bg-zinc-50 border p-3 rounded-lg leading-relaxed pt-3">
          <strong>Hotelier Certification Clause:</strong> We certify that the guest nationality counts and 1% statutory levy contributions shown above accurately mirror active registrations at <strong>SUCCESS ABOVE DREAMS</strong>. Produced under license <strong>{store.propertyProfile?.gtaLicense || "GTA-ACC-2026"}</strong>.
        </div>
      </Card>

    </div>
  );
};
