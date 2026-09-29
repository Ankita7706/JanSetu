import { useState } from 'react';
import { X, CheckCircle, Save, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { DEPARTMENTS, DESIGNATIONS, DISTRICTS } from '../../types';
import type { User } from '../../types';

interface GovProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: User) => void;
}

export default function GovProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: GovProfileModalProps) {
  const currentUser = authService.getCurrentUser();

  const [name, setName] = useState(currentUser?.name || 'Rashmita Panigrahy');
  const [employeeId, setEmployeeId] = useState(currentUser?.employeeId || 'GOV-00-1234');
  const [designation, setDesignation] = useState(currentUser?.designation || 'Assistant Executive Engineer (AEE)');
  const [department, setDepartment] = useState(currentUser?.department || 'Water Resources & Public Health');
  const [district, setDistrict] = useState(currentUser?.district || 'Kalahandi');
  const [email, setEmail] = useState(currentUser?.email || 'official@demo.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 99887 76655');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      id: currentUser?.id || 'u2',
      name: name.trim(),
      email: email.trim(),
      role: 'official',
      employeeId: employeeId.trim(),
      designation: designation.trim(),
      department: department.trim(),
      district: district.trim(),
      location: `${district.trim()}, Odisha`,
      language: currentUser?.language || 'English',
      phone: phone.trim(),
      organization: `${designation.trim()} • ${department.trim()}`,
    };

    authService.saveUser(updatedUser);
    setSavedSuccess(true);
    if (onProfileUpdated) {
      onProfileUpdated(updatedUser);
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white card-brutal-xl rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border-2 border-black"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-brand-yellow p-5 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-black text-brand-yellow rounded-xl flex items-center justify-center border-2 border-black shadow-brutal-sm font-extrabold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl text-black leading-tight">
                EDIT OFFICER PROFILE
              </h3>
              <p className="text-[11px] font-bold text-black/75">
                Update Government Official identity, jurisdiction & department credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center font-extrabold hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Officer Name */}
            <div>
              <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rashmita Panigrahy"
                className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Officer / Employee ID */}
            <div>
              <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                Officer ID / Badge Number *
              </label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                placeholder="e.g. GOV-00-1234"
                className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold font-mono text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Designation */}
            <div>
              <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                Official Designation / Title *
              </label>
              <select
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                {DESIGNATIONS.map(des => (
                  <option key={des} value={des}>
                    {des}
                  </option>
                ))}
              </select>
            </div>

            {/* District / Jurisdiction */}
            <div>
              <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                Assigned District / Jurisdiction *
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                {DISTRICTS.map(dist => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
              Government Department *
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div>
              <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="official@demo.com"
                className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 99887 76655"
                className="w-full bg-gray-50 border-2 border-black rounded-xl p-2.5 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="p-3 bg-brand-yellow/30 border-2 border-black rounded-xl text-xs space-y-1">
            <span className="font-extrabold text-[10px] uppercase text-black">Live Telemetry Scope</span>
            <p className="font-bold text-black text-[11px]">
              Active Console View will filter complaints for: <strong>{department}</strong> in <strong>{district}</strong>.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-emerald-800 font-extrabold text-xs flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Official profile updated successfully! Re-indexing dashboard...</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-2 pt-3 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brutal-primary flex-1 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
