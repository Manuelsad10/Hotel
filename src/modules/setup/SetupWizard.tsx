import React, { useState } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { Building, Lock, User, FileText, Percent, MapPin, Phone } from "lucide-react";
import defaultLogo from "../../assets/images/sad_logo_1781088567366.png";

export const SetupWizard: React.FC = () => {
  const store = useHotelStore();

  // Single Form States
  const [hotelName, setHotelName] = useState("Accra Executive Residence");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [phoneNumber, setPhoneNumber] = useState("+233 24 000 1122");
  const [address, setAddress] = useState("Airport Residential, Ghandi St, Accra");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [vatRate, setVatRate] = useState(15);
  const [adminFullName, setAdminFullName] = useState("Emmanuel Admin");
  const [adminPassword, setAdminPassword] = useState("admin123");

  const [useSampleData, setUseSampleData] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !phoneNumber || !address || !adminFullName || !adminPassword) {
      store.addToast("Please fill in all required setup information.", "error");
      return;
    }

    store.initializeSetup(
      {
        name: hotelName,
        logo: logoUrl || "",
        phone: phoneNumber,
        address,
        checkInTime,
        checkOutTime,
        vatRate: Number(vatRate),
        setupComplete: true,
      },
      {
        fullName: adminFullName,
        username: "admin",
        psw: adminPassword,
      },
      useSampleData
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(175,132,59,0.18),rgba(255,255,255,0))]">
      <div className="w-full max-w-2xl bg-[#121214] border border-gold-500/20 rounded-2xl shadow-2xl p-8 space-y-6 text-white animate-in fade-in zoom-in-95 duration-300 relative before:absolute before:inset-0 before:rounded-2xl before:border-t before:border-gold-300/10 before:pointer-events-none">
        
        {/* Branding Title */}
        <div className="text-center">
          <img
            src={defaultLogo}
            alt="Success Above Dreams (SAD) Logo"
            className="mx-auto h-16 w-16 rounded-2xl border border-gold-500/25 object-cover bg-white shadow-xl mb-3"
            referrerPolicy="no-referrer"
          />
          <h2 className="mt-4 text-2xl font-bold font-display tracking-tight text-white uppercase">
            Success Above Dreams (SAD) PMS
          </h2>
          <p className="mt-2 text-xs text-slate-450 text-slate-400">
            Configure luxury hotel operations and register your administrator credential profile below.
          </p>
        </div>

        {/* Setup Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          <div className="border-b border-[#222] pb-5">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-gold-500" /> 1. Hotel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Hotel Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                  placeholder="e.g. Labadi Lodge"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest block mb-1">
                  Company Identity Logo
                </span>
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#18181b] border border-neutral-800 rounded-xl items-center">
                  <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-800 shadow-xs bg-[#121214] shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Company Logo Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] uppercase font-black text-slate-500">No Logo</span>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer select-none transition-colors">
                        Upload custom logo...
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                store.addToast("Logo size exceeds 2MB limit.", "error");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setLogoUrl(event.target.result as string);
                                  store.addToast("Company logo updated successfully!", "success");
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      
                      {logoUrl !== defaultLogo && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoUrl(defaultLogo);
                            store.addToast("Reset default Success Above Dreams logo.", "success");
                          }}
                          className="px-3 py-1.5 border border-neutral-800 hover:bg-white/5 text-slate-350 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Set Default SAD Logo
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Select or drop a PNG/JPEG file (Max 2MB). Our system supports automatic scaling for client receipts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Hotel Phone Number <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                  placeholder="+233 24 123 4567"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Hotel Address <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                  placeholder="Airport West, Accra"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-[#222] pb-5">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gold-500" /> 2. Checkout & Taxes Configuration (Accra, Ghana)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Check-In Time
                </span>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Check-Out Time
                </span>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  VAT Rate (%)
                </span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="px-3.5 py-2.5 bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm font-bold"
                  placeholder="15"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-500" /> 3. Admin Account Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Full Name <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gold-500/50" />
                  <input
                    type="text"
                    required
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    className="pl-9 pr-3.5 py-2.5 w-full bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm"
                    placeholder="Adwoa Mansah"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest">
                  Password <span className="text-red-500">*</span>
                </span>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gold-500/50" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="pl-9 pr-3.5 py-2.5 w-full bg-[#18181b] border border-neutral-800 text-white focus:border-gold-500 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors text-sm font-mono tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Seed Data Prompt */}
          <div className="p-4 bg-[#18181b] rounded-xl border border-neutral-800 flex items-center justify-between select-none">
            <div>
              <p className="font-bold text-slate-200">Load Setup Template Data?</p>
              <p className="text-[10px] text-slate-400">Pre-seed rooms, standard rates, staff accounts, and dummy check-ins for demo purposes.</p>
            </div>
            <input
              type="checkbox"
              checked={useSampleData}
              onChange={(e) => setUseSampleData(e.target.checked)}
              className="w-5 h-5 accent-gold-500 rounded cursor-pointer shrink-0"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-neutral-950 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(175,132,59,0.15)] active:scale-98 cursor-pointer transition-all flex items-center justify-center gap-1"
          >
            Launch Success Above Dreams (SAD) PMS &rarr;
          </button>

        </form>
      </div>
    </div>
  );
};
