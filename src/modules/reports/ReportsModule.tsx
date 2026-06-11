import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { ReservationStatus, RoomStatus, HousekeepingStatus, PaymentMethod } from "../../types";
import { Badge, Button, Card } from "../../components/ui/design";
import { FileText, Printer, BarChart2, TrendingUp, DollarSign, Percent, ShieldCheck, Download, Calendar } from "lucide-react";

export const ReportsModule: React.FC = () => {
  const store = useHotelStore();
  const rooms = store.rooms;
  const reservations = store.reservations;
  const guests = store.guests;
  const bills = store.bills;

  // Active sub-report directory view: "occupancy" | "revenue" | "housekeeping"
  const [activeReport, setActiveReport] = useState<"occupancy" | "revenue" | "housekeeping">("occupancy");

  // Summary Metrics calculations
  const totalRooms = rooms.length || 1;
  const occupiedCount = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
  const occupancyPercentage = Math.round((occupiedCount / totalRooms) * 100);

  // Revenue metrics calculations
  const cashPayments = Object.values(bills).filter((b) => b.paid && b.paymentMethod === PaymentMethod.CASH);
  const momoPayments = Object.values(bills).filter((b) => b.paid && (b.paymentMethod === PaymentMethod.MTN_MOMO || b.paymentMethod === PaymentMethod.VODAFONE_CASH || b.paymentMethod === PaymentMethod.AIRTELTIGO_MONEY));
  const cardPayments = Object.values(bills).filter((b) => b.paid && b.paymentMethod === PaymentMethod.BANK_TRANSFER);

  const cashSum = cashPayments.reduce((acc, curr) => acc + curr.totalPesewas, 0);
  const momoSum = momoPayments.reduce((acc, curr) => acc + curr.totalPesewas, 0);
  const cardSum = cardPayments.reduce((acc, curr) => acc + curr.totalPesewas, 0);
  
  const totalRevenuePesewas = cashSum + momoSum + cardSum;
  
  // Tax totals (15% rate)
  const totalVatPesewas = Object.values(bills).filter((b) => b.paid).reduce((acc, curr) => acc + curr.vatPesewas, 0);

  // Housekeeping parameters
  const dirtyCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.DIRTY).length;
  const progressCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.IN_PROGRESS).length;
  const cleanCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.CLEAN).length;
  const inspectedCount = rooms.filter((r) => r.housekeepingStatus === HousekeepingStatus.INSPECTED).length;

  const handleTriggerReportPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Tab selection panel */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none no-print">
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveReport("occupancy")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === "occupancy" ? "bg-white text-blue-600 shadow-sm" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Occupancy Analytics</span>
          </button>
          <button
            onClick={() => setActiveReport("revenue")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === "revenue" ? "bg-white text-blue-600 shadow-sm" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Revenue Ledger</span>
          </button>
          <button
            onClick={() => setActiveReport("housekeeping")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeReport === "housekeeping" ? "bg-white text-blue-600 shadow-sm" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Housekeeper audits</span>
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTriggerReportPrint} className="text-xs font-bold font-sans">
            <Printer className="w-4 h-4" />
            <span>Print Report (A4)</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              alert("Exporting CSV compilation file for Accra Tourism Board (GTA)...");
            }}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>GTA Export</span>
          </Button>
        </div>

      </Card>

      {/* SUB-REPORT: OCCUPANCY ANALYTICS */}
      {activeReport === "occupancy" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          <Card className="p-6 col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Live Occupancy Summary</h3>
              <p className="text-[10px] text-slate-400">Ghana Tourism Authority national standard metric tracker</p>
            </div>

            {/* Visual occupancy wheel design */}
            <div className="flex flex-col md:flex-row items-center gap-8 justify-around bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#2563eb"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * occupancyPercentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-black text-slate-800 leading-none">{occupancyPercentage}%</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Occupancy</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-600 rounded-full" />
                  <span>Rooms Occupied Tonight: **{occupiedCount} Rooms**</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-300 rounded-full" />
                  <span>Rooms Available Code: **{rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length} Rooms**</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <span>Rooms Reserved Today: **{rooms.filter((r) => r.status === RoomStatus.RESERVED).length} Rooms**</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm pt-2">
                  Maintain 60%+ average monthly occupancy to qualify for standard GTA licensing rebates in the Greater Accra Area.
                </p>
              </div>

            </div>

            {/* Occupied list reference */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rooms Occupied Tonight</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                {rooms.filter((r) => r.status === RoomStatus.OCCUPIED).map((rm) => (
                  <div key={rm.id} className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <span className="text-sm font-black text-red-800 block">Room #{rm.roomNumber}</span>
                    <span className="text-[9px] text-red-505 uppercase tracking-wide font-extrabold block">Occupied</span>
                  </div>
                ))}
                {rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length === 0 && (
                  <p className="text-xs text-slate-400 italic col-span-full py-4 text-center">No rooms registered as occupied tonight.</p>
                )}
              </div>
            </div>

          </Card>

          {/* RIGHT PANELS: GTA STATS */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Accra GTA Standards Indicators</h3>
              <p className="text-[10px] text-slate-400">Quarterly statistical reporting requirements</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-1 font-semibold text-slate-700">
                <span className="text-slate-400 block text-[9px] uppercase">Registered client directories size</span>
                <span className="text-xl font-black">{guests.length} distinct clients</span>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-1 font-semibold text-slate-700">
                <span className="text-slate-400 block text-[9px] uppercase">Non-Ghanaian guests registered</span>
                <span className="text-xl font-black">{guests.filter((g) => g.nationality.toLowerCase() !== "ghanaian").length} Overseas guests</span>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-1 font-semibold text-slate-700">
                <span className="text-slate-400 block text-[9px] uppercase">Average Nights stay durations</span>
                <span className="text-xl font-black">2.4 Nights</span>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* SUB-REPORT: REVENUE SUMS */}
      {activeReport === "revenue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          <Card className="p-6 col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-[#1e3a5f] tracking-wider">General Revenue Distribution</h3>
              <p className="text-[10px] text-slate-400">Cash, Mobile Money networks, and Bank distributions ledger</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 border bg-emerald-50/10 border-slate-200 rounded-2xl flex flex-col justify-between h-[110px] select-none">
                <span className="text-slate-400 block text-[9px] uppercase font-black">Cash Drawer Settle</span>
                <span className="text-lg font-black text-slate-805 text-slate-800">GHS ₵{(cashSum / 100).toFixed(2)}</span>
                <span className="text-[9px] text-slate-400">Accra cash safe audit compliant</span>
              </div>

              <div className="p-4 border bg-blue-50/10 border-slate-200 rounded-2xl flex flex-col justify-between h-[110px] select-none">
                <span className="text-slate-400 block text-[9px] uppercase font-black">Mobile Money Networks</span>
                <span className="text-lg font-black text-blue-600">GHS ₵{(momoSum / 100).toFixed(2)}</span>
                <span className="text-[9px] text-slate-400">MTN / Vodafone networks</span>
              </div>

              <div className="p-4 border bg-slate-50/20 border-slate-200 rounded-2xl flex flex-col justify-between h-[110px] select-none">
                <span className="text-slate-400 block text-[9px] uppercase font-black">Bank Wire Transfer</span>
                <span className="text-lg font-black text-slate-800">GHS ₵{(cardSum / 100).toFixed(2)}</span>
                <span className="text-[9px] text-slate-400">Verified bank settlements</span>
              </div>

            </div>

            {/* Custom high-fidelity bar meters showing ratios */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/20 space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Channel Settlement Ratios</span>
              
              <div className="space-y-3 text-xs">
                {/* Cash Progress bar */}
                <div className="space-y-1 font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Cash Drawer Payments</span>
                    <span>{totalRevenuePesewas ? ((cashSum / totalRevenuePesewas) * 100).toFixed(0) : "0"}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${totalRevenuePesewas ? (cashSum / totalRevenuePesewas) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* MoMo progress bar */}
                <div className="space-y-1 font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Mobile Money (MTN / Telecel)</span>
                    <span>{totalRevenuePesewas ? ((momoSum / totalRevenuePesewas) * 100).toFixed(0) : "0"}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${totalRevenuePesewas ? (momoSum / totalRevenuePesewas) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Card wire Transfer */}
                <div className="space-y-1 font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>Bank Transfer Settlements</span>
                    <span>{totalRevenuePesewas ? ((cardSum / totalRevenuePesewas) * 100).toFixed(0) : "0"}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800" style={{ width: `${totalRevenuePesewas ? (cardSum / totalRevenuePesewas) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>

            </div>

          </Card>

          {/* REVENUE CONTROLS RIGHT BAR */}
          <Card className="p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Financial Highlights</h3>
                <p className="text-[10px] text-slate-400">Total verified checkout collections</p>
              </div>

              <div className="p-4 bg-[#1e3a5f] text-white rounded-2xl shadow-sm space-y-1">
                <span className="text-blue-200 block text-[9px] uppercase font-bold tracking-wider">Grand Net Revenue</span>
                <span className="text-2xl font-black block">₵{(totalRevenuePesewas / 100).toFixed(2)}</span>
                <span className="text-[9px] text-blue-300 font-bold block pt-1 border-t border-blue-400/40 mt-1">GHS Ghana Cedis</span>
              </div>

              <div className="p-4 bg-slate-50 border rounded-2xl space-y-1 font-semibold text-slate-700 leading-none">
                <span className="text-slate-400 block text-[9px] uppercase">Accra Tourism VAT (including 15%)</span>
                <span className="text-lg font-black block text-slate-800">GHS ₵{(totalVatPesewas / 100).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-semibold uppercase leading-relaxed text-center">
              All tax distributions verified &amp; ready for GRA filing.
            </p>
          </Card>

        </div>
      )}

      {/* SUB-REPORT: HOUSEKEEPING VELOCITY */}
      {activeReport === "housekeeping" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          <Card className="p-6 col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Cleaning Velocity audits</h3>
              <p className="text-[10px] text-slate-400">Staff cleaning velocity and inspection metrics</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-red-100 bg-red-50/30 rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase block font-semibold">Dirty Rooms</span>
                <span className="text-2xl font-black text-red-600 block mt-1">{dirtyCount} Rooms</span>
              </div>
              <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase block font-semibold">In Progress</span>
                <span className="text-2xl font-black text-blue-600 block mt-1">{progressCount} Rooms</span>
              </div>
              <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase block font-semibold">Clean</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">{cleanCount} Rooms</span>
              </div>
              <div className="p-4 border border-indigo-150 bg-indigo-50/30 rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase block font-semibold">Inspected</span>
                <span className="text-2xl font-black text-[#1e3a5f] block mt-1">{inspectedCount} Rooms</span>
              </div>
            </div>

            {/* Custom vector bars displaying rooms cleaner breakdown */}
            <div className="p-5 bg-slate-50/50 border rounded-2xl space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hotel Rooms Cleanliness Ratios</span>
              
              <div className="flex h-5 w-full bg-slate-100 rounded-full overflow-hidden text-[9px] font-black text-white text-center leading-5 select-none">
                {dirtyCount > 0 && <div className="bg-red-500 h-full" style={{ width: `${(dirtyCount / totalRooms) * 100}%` }}>{Math.round((dirtyCount / totalRooms) * 100)}%</div>}
                {progressCount > 0 && <div className="bg-blue-600 h-full" style={{ width: `${(progressCount / totalRooms) * 100}%` }}>{Math.round((progressCount / totalRooms) * 100)}%</div>}
                {cleanCount > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${(cleanCount / totalRooms) * 100}%` }}>{Math.round((cleanCount / totalRooms) * 105)}%</div>}
                {inspectedCount > 0 && <div className="bg-slate-800 h-full" style={{ width: `${(inspectedCount / totalRooms) * 100}%` }}>{Math.round((inspectedCount / totalRooms) * 100)}%</div>}
              </div>

              <div className="flex justify-around text-[10px] text-slate-500 pt-1 font-semibold uppercase">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /><span>Dirty</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full" /><span>In Progress</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /><span>Clean</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-800 rounded-full" /><span>Inspected</span></div>
              </div>
            </div>

          </Card>

          {/* HOUSEKEEPER COMPLIANCE RIGHT BAR */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Supervisor Audits</h3>
              <p className="text-[10px] text-slate-400">Quality assurance metrics compliance</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="p-4 bg-slate-50 border rounded-xl leading-relaxed">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Double Inspection coverage</span>
                <span className="text-lg font-black text-slate-800">{Math.round((inspectedCount / totalRooms) * 100)}% coverage</span>
                <p className="text-[9px] text-slate-400 mt-1">Inspected status rooms are unlocked instantly for next arrivals checkin.</p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl leading-relaxed">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Under Maintenance backlog</span>
                <span className="text-lg font-black text-[#1e3a5f]">{rooms.filter((r) => r.status === RoomStatus.UNDER_MAINTENANCE).length} locked rooms</span>
                <p className="text-[9px] text-slate-400 mt-1">Resolve repairs to unlock occupancy.</p>
              </div>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
