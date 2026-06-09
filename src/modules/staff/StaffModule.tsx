/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, Timer, Plus, Clock, Key, ArrowRight, Trash2 } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { UserRole } from "../../types";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

export const StaffModule: React.FC = () => {
  const store = useHotelStore();
  const staff = store.staffList;

  // Tabs: Roster, Clock Board
  const [staffTab, setStaffTab] = useState<"roster" | "clock">("roster");

  // Form states
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [sName, setSName] = useState("");
  const [sRole, setSRole] = useState<UserRole>(UserRole.FRONT_DESK_AGENT);
  const [sPhone, setSPhone] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sWage, setSWage] = useState<number>(200);

  // Shift logs (simulated)
  const [shifts, setShifts] = useState([
    { id: "sh-1", employeeName: "Kwesi Mensah", role: "HOUSEKEEPER", shift: "Morning Shift (06:00 - 14:00)", clockIn: "06:14 AM", status: "On Duty" },
    { id: "sh-2", employeeName: "Adwoa Ofori", role: "FRONT_DESK_AGENT", shift: "Afternoon Shift (14:00 - 22:00)", clockIn: "—", status: "Off Duty" },
    { id: "sh-3", employeeName: "Emmanuel Drah", role: "SUPER_ADMIN", shift: "General Shift", clockIn: "08:10 AM", status: "On Duty" },
  ]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim() || !sPhone.trim()) return;

    // Detect Department based on role
    let dept = "Administration";
    if (sRole === "HOUSEKEEPER" || sRole === "HOUSEKEEPING_SUPERVISOR") {
      dept = "Housekeeping";
    } else if (sRole === "FRONT_DESK_AGENT") {
      dept = "Front Desk";
    } else if (sRole === "RESTAURANT_STAFF") {
      dept = "Food & Beverage";
    } else if (sRole === "ACCOUNTANT") {
      dept = "Finance";
    }

    store.addStaff({
      fullName: sName,
      role: sRole,
      phone: sPhone,
      email: sEmail,
      gender: "Male",
      department: dept,
      hireDate: new Date().toLocaleDateString("en-GB"),
      status: "Active",
    });

    setIsAddModelOpen(false);
    setSName("");
    setSPhone("");
    setSEmail("");
  };

  const handleDeleteEmployee = (id: string) => {
    store.updateStaffStatus(id, "Inactive");
    store.addToast("Employee marked inactive on ledger.", "info");
  };

  // Clock in / out triggers
  const handleToggleDuty = (id: string, current: string) => {
    const nextVal = current === "On Duty" ? "Off Duty" : "On Duty";
    const d = new Date();
    const clockTime = nextVal === "On Duty" ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";
    
    setShifts(shifts.map(s => s.id === id ? { ...s, status: nextVal, clockIn: clockTime } : s));
    store.addToast(`Employee clocked and duty marked: ${nextVal}`, "success");
  };

  return (
    <div className="space-y-6">
      
      {/* Top segments */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-72">
        <button
          onClick={() => setStaffTab("roster")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            staffTab === "roster" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Staff Employee Roster
        </button>
        <button
          onClick={() => setStaffTab("clock")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            staffTab === "clock" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Duty Punch Clock Board
        </button>
      </div>

      {/* 1. Roster tab */}
      {staffTab === "roster" && (
        <Card className="p-5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">
              Human resources team ledger
            </h3>

            <Button variant="primary" onClick={() => setIsAddModelOpen(true)}>
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                  <tr className="border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                    <th className="py-2.5">Staff Name</th>
                    <th>Core Role Designation</th>
                    <th>Phoneline Number</th>
                    <th>Registered Email</th>
                    <th>Department Office</th>
                    <th>Status State</th>
                    <th className="text-center">Action Admin</th>
                  </tr>
              </thead>
              <tbody>
                {staff.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 font-bold text-slate-850">{emp.fullName}</td>
                    <td>
                      <Badge variant="brand" className="uppercase text-[9px] tracking-wider font-bold">
                        {emp.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="font-mono">{emp.phone}</td>
                    <td>{emp.email || "—"}</td>
                    <td className="font-semibold text-slate-650">
                      {emp.department}
                    </td>
                    <td>
                      <Badge variant={emp.status === "Active" ? "success" : "neutral"}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. Clocking board tab */}
      {staffTab === "clock" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {shifts.map((sh) => (
            <Card key={sh.id} className="p-4 flex flex-col justify-between min-h-[150px] bg-white border border-slate-100">
              <div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-400 font-medium">{sh.shift}</span>
                  <Badge variant={sh.status === "On Duty" ? "success" : "neutral"}>
                    {sh.status}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-850 uppercase font-display select-none">
                  {sh.employeeName}
                </h4>
                <p className="text-[10px] text-brand-teal font-bold uppercase tracking-wider mt-1">{sh.role}</p>

                {sh.status === "On Duty" && (
                  <p className="text-xs text-slate-550 mt-2.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> Duty Start: {sh.clockIn}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-50 mt-4 flex justify-end">
                <Button
                  variant={sh.status === "On Duty" ? "outline" : "primary"}
                  className="py-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                  onClick={() => handleToggleDuty(sh.id, sh.status)}
                >
                  {sh.status === "On Duty" ? "Punch Clock OUT" : "Punch Clock IN"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Employee Add Modal */}
      <Modal
        isOpen={isAddModelOpen}
        onClose={() => setIsAddModelOpen(false)}
        title="Register Employee Record"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModelOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddEmployee}>
              Save Employee
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <Input
            label="Employee Full Name"
            value={sName}
            required
            placeholder="e.g. Kwesi Mensah"
            onChange={(e) => setSName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Select
              label="Staff Role Designation"
              value={sRole}
              onChange={(e) => setSRole(e.target.value as any)}
              options={Object.values(UserRole).map((role) => ({
                value: role,
                label: role.replace("_", " "),
              }))}
            />

            <Input
              label="Contact Phone"
              required
              placeholder="+233"
              value={sPhone}
              onChange={(e) => setSPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Welfare Email Address"
              type="email"
              value={sEmail}
              onChange={(e) => setSEmail(e.target.value)}
            />

            <Input
              label="Daily Wages Rate (GHS ₵)"
              type="number"
              value={sWage}
              required
              onChange={(e) => setSWage(parseFloat(e.target.value) || 120)}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
