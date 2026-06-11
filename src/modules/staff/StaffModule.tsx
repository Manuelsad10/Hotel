import React, { useState, useRef, useEffect } from "react";
import { useHotelStore } from "../../store/hotelStore";
import { UserRole } from "../../types";
import { Badge, Button, Card, Modal, Input, Select } from "../../components/ui/design";
import { Plus, Users, Shield, ShieldCheck, Mail, Lock, Sparkles, Ban, Camera, Trash, Edit2 } from "lucide-react";

export const StaffModule: React.FC = () => {
  const store = useHotelStore();
  const staffList = store.staffList;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form states (Add)
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [psw, setPsw] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.FRONT_DESK);
  const [phone, setPhone] = useState("+233 24 000 0000");
  const [photo, setPhoto] = useState("");

  // Form states (Edit)
  const [editFullName, setEditFullName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPsw, setEditPsw] = useState("");
  const [editRole, setEditRole] = useState<UserRole>(UserRole.FRONT_DESK);
  const [editPhone, setEditPhone] = useState("");
  const [editPhoto, setEditPhoto] = useState("");

  // Camera capture states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean raw stream up on modal closes or unmounts
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: "user" },
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => console.error("Webcam Feed Play Error:", err));
        }
      }, 150);
      store.addToast("Device camera activated. Keep steady!", "success");
    } catch (err: any) {
      console.error("Camera access failed", err);
      store.addToast("Camera access failed. Ensure permission permissions are granted.", "error");
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(300, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/png");
        if (isAddOpen) {
          setPhoto(dataUrl);
        } else if (isEditOpen) {
          setEditPhoto(dataUrl);
        }
        stopCamera();
        store.addToast("Employee photo snapshot captured!", "success");
      }
    }
  };

  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !psw) {
      store.addToast("Full name, login username, and password are required.", "error");
      return;
    }

    // Save staff member to state
    store.addStaff({
      fullName,
      username,
      psw,
      role,
      phone,
      status: "Active",
      photo: photo || undefined,
    });

    closeModals();
    setFullName("");
    setUsername("");
    setPsw("");
    setPhone("+233 24 000 0000");
    setPhoto("");
  };

  const handleOpenEdit = (st: any) => {
    setEditingStaffId(st.id);
    setEditFullName(st.fullName);
    setEditUsername(st.username);
    setEditPsw(st.psw);
    setEditRole(st.role);
    setEditPhone(st.phone || "+233 24 000 0000");
    setEditPhoto(st.photo || "");
    setIsEditOpen(true);
  };

  const handleEditStaffSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;

    if (!editFullName || !editUsername || !editPsw) {
      store.addToast("Full name, credentials username, and password are required.", "error");
      return;
    }

    store.editStaff(editingStaffId, {
      fullName: editFullName,
      username: editUsername,
      psw: editPsw,
      role: editRole,
      phone: editPhone,
      photo: editPhoto || undefined,
    });

    closeModals();
  };

  const closeModals = () => {
    stopCamera();
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingStaffId(null);
  };

  const toggleStaffStatus = (id: string, currentStatus: string) => {
    const target = staffList.find((s) => s.id === id);
    if (target?.username === "admin") {
      store.addToast("Root Administrator cannot be deactivated.", "error");
      return;
    }
    const nextStatus = currentStatus === "Active" ? "Deactivated" : "Active";
    store.editStaff(id, { status: nextStatus });
    store.addToast(`Employee status toggled to ${nextStatus}.`, "success");
  };

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 select-none">
        <div>
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Employee Directory</h3>
          <p className="text-[10px] text-slate-400">Control hotel personnel access credentials and roles</p>
        </div>

        <Button variant="primary" onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs font-bold shrink-0">
          <Plus className="w-4 h-4" />
          <span>Register New staff</span>
        </Button>
      </Card>

      {/* Staff directory grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {staffList.map((st) => (
          <div
            key={st.id}
            className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[210px] bg-white transition-all hover:shadow-md select-none relative overflow-hidden ${
              st.status === "Deactivated" ? "opacity-60 border-slate-205" : "border-slate-200"
            }`}
          >
            {/* Top row */}
            <div>
              <div className="flex justify-between items-start leading-none mb-2">
                {st.photo ? (
                  <img
                    src={st.photo}
                    alt={st.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black uppercase text-[#1e3a5f] text-xs shrink-0 border border-slate-200">
                    {st.fullName.slice(0, 2)}
                  </div>
                )}
                
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  st.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                }`}>
                  {st.status}
                </span>
              </div>

              <h4 className="font-extrabold text-[#1e3a5f] text-sm leading-tight truncate">{st.fullName}</h4>
              <p className="text-[10px] text-slate-455 uppercase tracking-widest font-extrabold text-blue-500 mt-0.5">{st.role}</p>
              <p className="text-[9px] text-slate-400 mt-2 font-semibold">Username: @{st.username}</p>
            </div>

            {/* Actions button */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center mt-3">
              <span className="text-[9px] text-slate-405 text-slate-400 font-mono">ID: {st.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(st)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-0.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                {st.username !== "admin" && (
                  <button
                    onClick={() => toggleStaffStatus(st.id, st.status)}
                    className={`text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-0.5 cursor-pointer ${
                      st.status === "Active" ? "text-red-500 hover:underline" : "text-emerald-600 hover:underline"
                    }`}
                  >
                    <Ban className="w-3 h-3" />
                    <span>{st.status === "Active" ? "Suspend" : "Lift"}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE STAFF MODAL */}
      <Modal isOpen={isAddOpen} onClose={closeModals} title="Register New Personnel Roster">
        <form onSubmit={handleRegisterStaff} className="space-y-4">
          <Input label="Full Name *" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Kwame Boateng" />
          <Input label="Credentials Username *@..." required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. kboateng" />
          <Input label="Roster Password PIN *" type="password" required value={psw} onChange={(e) => setPsw(e.target.value)} placeholder="••••" />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0000" />
          
          <Select
            label="Security clearance role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: UserRole.FRONT_DESK, label: "Front Desk operator" },
              { value: UserRole.HOUSEKEEPER, label: "Housekeeping staff" },
              { value: UserRole.ACCOUNTANT, label: "Accounting team" },
              { value: UserRole.ADMIN, label: "Root Executive Admin" },
            ]}
          />

          {/* Web Cam Capture Portion */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Employee Profile Picture</span>
            
            <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 border border-slate-250 rounded-xl">
              {photo ? (
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 shadow-sm bg-white">
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto("")}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                  >
                    <Trash className="w-3.5 h-3.5 mr-1" />
                    Reset Photo
                  </button>
                </div>
              ) : isCameraActive ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-48 h-48 bg-black rounded-xl overflow-hidden shadow-inner border border-slate-300">
                    <video
                      ref={videoRef}
                      aria-label="Staff Photo stream preview"
                      className="w-full h-full object-cover scale-x-[-1]"
                      playsInline
                      muted
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={captureSnapshot}
                      className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px] px-3 py-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" /> Take photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={stopCamera}
                      className="text-[10px] px-3 py-1.5 font-semibold"
                    >
                      Cancel stream
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <Button
                    type="button"
                    onClick={startCamera}
                    variant="outline"
                    className="text-[10px] font-bold font-sans border-blue-200 hover:bg-blue-50 text-blue-600 px-3 py-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    Open Camera Capture
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Register Staff member</Button>
        </form>
      </Modal>

      {/* EDIT STAFF MODAL */}
      <Modal isOpen={isEditOpen} onClose={closeModals} title="Edit Employee Profile details">
        <form onSubmit={handleEditStaffSubmission} className="space-y-4">
          <Input label="Full Name *" required value={editFullName} onChange={(e) => setEditFullName(e.target.value)} placeholder="e.g. Kwame Boateng" />
          <Input label="Credentials Username *@..." required value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="e.g. kboateng" />
          <Input label="Password PIN *" type="password" required value={editPsw} onChange={(e) => setEditPsw(e.target.value)} placeholder="••••" />
          <Input label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+233 24 000 0000" />
          
          <Select
            label="Security clearance role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
            options={[
              { value: UserRole.FRONT_DESK, label: "Front Desk operator" },
              { value: UserRole.HOUSEKEEPER, label: "Housekeeping staff" },
              { value: UserRole.ACCOUNTANT, label: "Accounting team" },
              { value: UserRole.ADMIN, label: "Root Executive Admin" },
            ]}
          />

          {/* Web Cam Capture Portion (Edit) */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Employee Profile Picture</span>
            
            <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 border border-slate-250 rounded-xl">
              {editPhoto ? (
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 shadow-sm bg-white">
                  <img src={editPhoto} alt="Employee Avatar Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditPhoto("")}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                  >
                    <Trash className="w-3.5 h-3.5 mr-1" />
                    Reset Photo
                  </button>
                </div>
              ) : isCameraActive ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-48 h-48 bg-black rounded-xl overflow-hidden shadow-inner border border-slate-300">
                    <video
                      ref={videoRef}
                      aria-label="Staff Photo stream preview"
                      className="w-full h-full object-cover scale-x-[-1]"
                      playsInline
                      muted
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={captureSnapshot}
                      className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px] px-3 py-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" /> Take Snapshot
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={stopCamera}
                      className="text-[10px] px-3 py-1.5 font-semibold"
                    >
                      Cancel stream
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <Button
                    type="button"
                    onClick={startCamera}
                    variant="outline"
                    className="text-[10px] font-bold font-sans border-blue-200 hover:bg-blue-50 text-blue-600 px-3 py-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    Capture with Webcam
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full font-bold bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </form>
      </Modal>

    </div>
  );
};
