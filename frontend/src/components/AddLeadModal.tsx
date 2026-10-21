import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; company?: string; phone?: string }) => void;
}

export default function AddLeadModal({
  isOpen,
  onClose,
  onSave,
}: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setCompany("");
      setPhone("");
      setError(null);
      setTouched(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      setTouched(true);
      return;
    }

    onSave({
      name: trimmedName,
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lead-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2
            id="add-lead-title"
            className="text-base font-semibold text-slate-900"
          >
            Add New Lead
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="lead-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error && e.target.value.trim()) {
                  setError(null);
                }
              }}
              onBlur={() => {
                setTouched(true);
                if (!name.trim()) {
                  setError("Full name is required.");
                }
              }}
              placeholder="e.g. Sarah Connor"
              autoFocus
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                error && touched
                  ? "border-red-300 focus:ring-red-400"
                  : "border-slate-300 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
            {error && touched && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label
              htmlFor="lead-company"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Company <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="lead-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Cyberdyne Systems"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="lead-phone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Phone <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
