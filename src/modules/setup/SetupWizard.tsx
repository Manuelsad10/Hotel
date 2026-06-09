/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Building, ShieldCheck, UserPlus, Sparkles, AlertOctagon, HelpCircle } from "lucide-react";
import { PropertyMode } from "../../types";
import { useHotelStore } from "../../store/hotelStore";
import { Button, Input } from "../../components/ui/design";

export const SetupWizard: React.FC = () => {
  const store = useHotelStore();

  const [step, setStep] = useState<number>(1);

  // Step 1: Property Info
  const [name, setName] = useState("Success Above Dreams Hotel");
  const [address, setAddress] = useState("Airport Residential Area, Accra - Ghana");
  const [phone, setPhone] = useState("+233 24 555 1209");
  const [email, setEmail] = useState("info@successabovedreams.com");
  const [gtaLicense, setGtaLicense] = useState("GTA-ACC-2026-8293");
  const [approxRooms, setApproxRooms] = useState<number>(18);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [currency, setCurrency] = useState("GHS ₵");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState<number>(15);

  // Step 2: Mode Selection
  const [selectedMode, setSelectedMode] = useState<PropertyMode>(PropertyMode.MIDSIZE_HOTEL);

  // Step 3: Admin Account
  const [fullName, setFullName] = useState("Emmanuel Drah");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirmPsw, setConfirmPsw] = useState("");

  const handleNextStep = () => {
    if (step === 3) {
      if (password !== confirmPsw) {
        store.addToast("Passwords do not match", "error");
        return;
      }
      if (password.length < 4) {
        store.addToast("Password must be at least 4 characters", "error");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteSetup = () => {
    // Generate a default base64 decorative logo helper
    const dummyLogoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f4c5c"/><text x="50" y="55" font-family="Arial" font-size="24" fill="white" font-weight="bold" text-anchor="middle">SAD</text></svg>`;

    store.initializeSetup(
      {
        name,
        logo: dummyLogoSvg,
        address,
        phone,
        email,
        gtaLicense,
        approxRooms,
        checkInTime,
        checkOutTime,
        currency,
        taxEnabled,
        taxRate,
        cityLevyEnabled: true,
        cityLevyRate: 1,
        mode: selectedMode,
      },
      {
        fullName,
        username,
        psw: password,
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Banner Area */}
        <div className="w-full md:w-72 bg-brand-teal p-8 text-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase bg-brand-cyan/20 text-cyan-200 border border-brand-cyan/30 px-2 py-0.5 rounded tracking-widest leading-none font-mono">
              SYSTEM INITIALIZER
            </span>
            <h1 className="text-xl font-bold font-display mt-3 leading-tight uppercase tracking-wider text-cyan-200">
              SUCCESS ABOVE DREAMS
            </h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Premium Property Orchestration Console for Independent Hostels, Guesthouses, and Large-Scale Resorts.
            </p>
          </div>

          {/* Staggered progress steps tracker */}
          <div className="space-y-4 my-8 relative border-l border-white/20 pl-4 text-xs font-semibold">
            <div className={`flex items-center gap-2 ${step === 1 ? "text-cyan-200" : "text-white/40"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${step >= 1 ? "bg-cyan-300" : "bg-white/20"}`} />
              <span>1. Property Profile</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 2 ? "text-cyan-200" : "text-white/40"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${step >= 2 ? "bg-cyan-300" : "bg-white/20"}`} />
              <span>2. Operational Mode</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 3 ? "text-cyan-200" : "text-white/40"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${step >= 3 ? "bg-cyan-300" : "bg-white/20"}`} />
              <span>3. Administrator Account</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 4 ? "text-cyan-200" : "text-white/40"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${step >= 4 ? "bg-cyan-300" : "bg-white/20"}`} />
              <span>4. Final Verification</span>
            </div>
          </div>

          {/* Credit and Port information */}
          <div className="text-[9px] text-slate-400 font-mono mt-auto">
            PORT: 8769 | SECURED OFFLINE
          </div>
        </div>

        {/* Dynamic Setup Forms Panel */}
        <div className="flex-1 p-8 flex flex-col justify-between min-h-[480px]">
          <div>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                  <Building className="w-5 h-5 text-brand-teal" />
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-widest font-display">
                    Establish Property Profile
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <Input label="Property Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="GTA Tourist License" value={gtaLicense} onChange={(e) => setGtaLicense(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <Input label="Property Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input label="Property Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <Input label="Physical Postal Address" value={address} onChange={(e) => setAddress(e.target.value)} />

                <div className="grid grid-cols-3 gap-3">
                  <Input label="Default Check-In" type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
                  <Input label="Default Check-Out" type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
                  <Input label="Approx Room Count" type="number" value={approxRooms} onChange={(e) => setApproxRooms(parseInt(e.target.value) || 0)} />
                </div>

                {/* Country and taxation options */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase">National Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="GHS ₵">Ghana Pesewas / Cedis (GHS ₵)</option>
                      <option value="USD $">United States Dollar (USD $)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 justify-center mt-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxEnabled}
                        onChange={(e) => setTaxEnabled(e.target.checked)}
                        className="w-4 h-4 text-brand-teal accent-brand-teal cursor-pointer"
                      />
                      <span>In-Hotel VAT Tax (15% Ghana VAT)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                  <Sparkles className="w-5 h-5 text-brand-teal" />
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-widest font-display">
                    Select Operational Mode
                  </h2>
                </div>

                <p className="text-xs text-slate-500 leading-normal">
                  Our StayCore system adapts menus, inventories, calendars, buildings, spa booking metrics, and analytics to match your property type. Choose matching mode:
                </p>

                {/* Grid of Three Cards */}
                <div className="grid grid-cols-3 gap-3.5 pt-1">
                  
                  {/* Mode Guesthouse */}
                  <div
                    onClick={() => setSelectedMode(PropertyMode.GUESTHOUSE)}
                    className={`border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[190px] ${
                      selectedMode === PropertyMode.GUESTHOUSE
                        ? "border-brand-teal bg-neutral-50 shadow-md scale-[1.01]"
                        : "border-slate-150 hover:bg-zinc-50"
                    }`}
                  >
                    <div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">
                        B&B/Inn
                      </span>
                      <h4 className="text-xs font-black uppercase text-slate-800 font-display mt-2">
                        Guesthouse Mode
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Simplistic, light layout with minimal services.
                      </p>
                    </div>
                    <ul className="text-[9px] text-slate-500 font-bold space-y-1 list-disc pl-3.5 mt-3 leading-tight uppercase">
                      <li>Bed/Beds only</li>
                      <li>Basic Housekeeping</li>
                      <li>Fast Billings</li>
                    </ul>
                  </div>

                  {/* Mode Midsize */}
                  <div
                    onClick={() => setSelectedMode(PropertyMode.MIDSIZE_HOTEL)}
                    className={`border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[190px] ${
                      selectedMode === PropertyMode.MIDSIZE_HOTEL
                        ? "border-brand-teal bg-neutral-50 shadow-md scale-[1.01]"
                        : "border-slate-150 hover:bg-zinc-50"
                    }`}
                  >
                    <div>
                      <span className="text-[9px] bg-cyan-50 text-brand-teal font-bold px-1.5 py-0.5 rounded uppercase">
                        Hotel
                      </span>
                      <h4 className="text-xs font-black uppercase text-slate-800 font-display mt-2">
                        Mid-Size Hotel
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Multiple room divisions, bars, events, and channel managers.
                      </p>
                    </div>
                    <ul className="text-[9px] text-slate-500 font-bold space-y-1 list-disc pl-3.5 mt-3 leading-tight uppercase">
                      <li>Restaurant & Bar</li>
                      <li>Conference Booking</li>
                      <li>OTA Channel logs</li>
                    </ul>
                  </div>

                  {/* Mode Resort */}
                  <div
                    onClick={() => setSelectedMode(PropertyMode.LARGE_HOTEL)}
                    className={`border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[190px] ${
                      selectedMode === PropertyMode.LARGE_HOTEL
                        ? "border-brand-teal bg-neutral-50 shadow-md scale-[1.01]"
                        : "border-slate-150 hover:bg-zinc-50"
                    }`}
                  >
                    <div>
                      <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded uppercase">
                        Fully Loaded
                      </span>
                      <h4 className="text-xs font-black uppercase text-slate-800 font-display mt-2">
                        Resort Complex
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Comprehensive layout across multiple building blocks, pool, spa, and wellness center.
                      </p>
                    </div>
                    <ul className="text-[9px] text-slate-500 font-bold space-y-1 list-disc pl-3.5 mt-3 leading-tight uppercase">
                      <li>Multiple Buildings</li>
                      <li>Spa & Massage Settle</li>
                      <li>Advanced Logistics</li>
                    </ul>
                  </div>

                </div>

                {/* Important warning constraints block */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 pt-3.5">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest leading-none block mb-0.5">
                      Critical System Notice
                    </span>
                    <p className="text-[10px] text-red-600 leading-normal">
                      Once selected, features exclusive to chosen mode are established deep within the database schema. Switching requires a full factories reset by a system Super Admin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                  <UserPlus className="w-5 h-5 text-brand-teal" />
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-widest font-display">
                    Setup Admin Account
                  </h2>
                </div>

                <p className="text-xs text-slate-500 leading-normal">
                  Configure the credentials of the core Super Admin profile who can reset database variables and edit operational structures.
                </p>

                <div className="space-y-3 pt-2">
                  <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  <Input label="System Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <Input label="Secure Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Input label="Confirm Password" type="password" value={confirmPsw} onChange={(e) => setConfirmPsw(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-widest font-display">
                    Summary Review & Consent
                  </h2>
                </div>

                <p className="text-xs text-slate-500 leading-normal">
                  Double check the specified configuration variables. Clicking the initialization button below will boot the hotel engine.
                </p>

                <div className="border border-slate-150 rounded-xl p-4 space-y-2.5 text-xs text-slate-700 bg-zinc-50/50">
                  <div className="flex justify-between pb-1.5 border-b border-slate-150 font-bold">
                    <span>Variable Definition</span>
                    <span>Configuration Value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hotel Name:</span>
                    <span className="font-semibold text-slate-800">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tourism Lic:</span>
                    <span className="font-mono">{gtaLicense || "Not Registered"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Postal Address:</span>
                    <span className="font-semibold text-slate-800 truncate">{address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Currency Setup:</span>
                    <span className="font-bold text-brand-teal">{currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Mode:</span>
                    <span className="font-bold uppercase text-brand-cyan">
                      {selectedMode === PropertyMode.GUESTHOUSE
                        ? "Guesthouse B&B Mode"
                        : selectedMode === PropertyMode.MIDSIZE_HOTEL
                        ? "Mid-Size Hotel Mode"
                        : "Resort Complex Mode"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Main Account:</span>
                    <span className="font-mono">{fullName} ({username})</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal leading-relaxed text-center italic mt-2">
                  By clicking the button below, you represent that the provided Ghana Tourism registration numbers of the establishment are correct. StayCore is ready.
                </p>
              </div>
            )}
          </div>

          {/* Nav control buttons footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button variant="primary" onClick={handleNextStep}>
                Continue
              </Button>
            ) : (
              <Button variant="success" onClick={handleCompleteSetup} className="px-6">
                Launch StayCore Hotel System
              </Button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
