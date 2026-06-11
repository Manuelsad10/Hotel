import React, { useState } from "react";
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";
import { Modal, Button, Input } from "./ui/design";
import { useHotelStore } from "../store/hotelStore";

interface SafeResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeResetModal: React.FC<SafeResetModalProps> = ({ isOpen, onClose }) => {
  const store = useHotelStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [typedVerification, setTypedVerification] = useState("");

  const handleReset = () => {
    if (typedVerification === "DELETE") {
      store.resetAllData();
      onClose();
      // Reset local state back to initial step
      setStep(1);
      setTypedVerification("");
    }
  };

  const handleClose = () => {
    setStep(1);
    setTypedVerification("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "⚠️ WARNING: FACTORY SYSTEM RESET" : "🔒 MANDATORY SYSTEM AUTHORIZATION"}
      className="max-w-md border-red-200"
    >
      {step === 1 ? (
        <div className="space-y-5">
          {/* Accent Warning Header */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4 rounded-xl text-red-900">
            <AlertTriangle className="w-8 h-8 shrink-0 text-red-650 text-red-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-950">
                Wipe Out and Reset local State?
              </h4>
              <p className="text-[11px] font-medium leading-relaxed text-red-800">
                You are about to execute a complete **Factory Reset** of the SAD PMS system.
                This operation is immediate and completely irreversible. All local database structures will be permanently vaporized.
              </p>
            </div>
          </div>

          {/* Loss list */}
          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              The following resources will be permanently deleted:
            </p>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-3 rounded-lg text-[11px] text-slate-700 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-xs">•</span>
                <span>Active Booking History</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-xs">•</span>
                <span>Payments & Receipts Ledger</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-xs">•</span>
                <span>Guest CRM Profiles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-xs">•</span>
                <span>Employee & Staff accounts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-xs">•</span>
                <span>Room Config Templates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-500 text-xs">•</span>
                <span>Hotel Branding Profile info</span>
              </div>
            </div>
          </div>

          {/* Warning Message block */}
          <div className="bg-[#fffbeb] border border-amber-200 text-amber-900 p-3 rounded-xl text-[10px] font-medium leading-relaxed">
            <strong>SYSTEM ADVISOR:</strong> If you are running multiple active check-ins, they will be discarded immediately. Please export any necessary reports first.
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={handleClose} className="font-bold text-xs">
              Go Back safely
            </Button>
            <Button
              variant="danger"
              onClick={() => setStep(2)}
              className="font-black text-xs uppercase tracking-wide bg-red-650 bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
            >
              <span>Verify reset sequence</span>
              <span>→</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-900">
            <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-600" />
            <p className="text-[11px] font-bold">
              Step 2 of 2: Authorize Reset Protocol
            </p>
          </div>

          {/* Authentication Input box */}
          <div className="space-y-3">
            <p className="text-slate-700 font-medium leading-relaxed text-xs">
              To authorize wiping the SAD PMS system database, please type the exact word <strong className="font-extrabold text-red-600 tracking-wider">DELETE</strong> in the verification input field below.
            </p>

            <Input
              label="Type 'DELETE' to confirm"
              placeholder="DELETE"
              value={typedVerification}
              onChange={(e) => setTypedVerification(e.target.value)}
              className="font-mono text-center tracking-widest text-[#991b1b]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setStep(1);
                setTypedVerification("");
              }}
              type="button"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-semibold py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 1</span>
            </button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="font-bold text-xs">
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={typedVerification !== "DELETE"}
                onClick={handleReset}
                className="font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-750 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Database & Restart</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
