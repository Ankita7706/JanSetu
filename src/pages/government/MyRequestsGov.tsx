import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  X,
  Send,
  Sparkles,
  UserCheck,
  Building,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Mic,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { requestService, useCitizenRequests } from '../../services/requestService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import type { CitizenRequest, RequestStatus, User } from '../../types';

export default function MyRequestsGov() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const raw = authService.getCurrentUser();
    return {
      id: raw?.id || 'u2',
      name: raw?.name || 'Rashmita Panigrahy',
      email: raw?.email || 'official@demo.com',
      role: raw?.role || 'official',
      employeeId: raw?.employeeId || 'GOV-00-1234',
      department: raw?.department || 'Water Resources & Public Health',
      designation: raw?.designation || 'Assistant Executive Engineer (AEE)',
      location: raw?.location || 'Kalahandi, Odisha',
      district: raw?.district || 'Kalahandi',
      language: raw?.language || 'English',
      organization: raw?.organization || `${raw?.designation || 'Assistant Executive Engineer (AEE)'} • ${raw?.department || 'Water Resources & Public Health'}`,
    };
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(updated => {
      if (updated) {
        setCurrentUser({
          id: updated.id || 'u2',
          name: updated.name || 'Rashmita Panigrahy',
          email: updated.email || 'official@demo.com',
          role: updated.role || 'official',
          employeeId: updated.employeeId || 'GOV-00-1234',
          department: updated.department || 'Water Resources & Public Health',
          designation: updated.designation || 'Assistant Executive Engineer (AEE)',
          location: updated.location || 'Kalahandi, Odisha',
          district: updated.district || 'Kalahandi',
          language: updated.language || 'English',
          organization: updated.organization || `${updated.designation || 'Assistant Executive Engineer (AEE)'} • ${updated.department || 'Water Resources & Public Health'}`,
        });
      }
    });

    const handleProfileCustomEvent = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };
    window.addEventListener('jansetu_user_profile_updated', handleProfileCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('jansetu_user_profile_updated', handleProfileCustomEvent);
    };
  }, []);

  const { loading } = useCitizenRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');

  // Modal detail & live status updater
  const [selectedReq, setSelectedReq] = useState<CitizenRequest | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('in_progress');
  const [officialNote, setOfficialNote] = useState('');
  const [resolutionDate, setResolutionDate] = useState('2026-10-15');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Filter requests for this specific officer
  const myOfficerRequests = requestService.getByOfficer(currentUser);

  const filtered = myOfficerRequests.filter(req => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && req.status !== 'pending' && req.status !== 'new') return false;
      if (statusFilter !== 'pending' && req.status !== statusFilter) return false;
    }
    if (priorityFilter !== 'All' && req.priority !== priorityFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        req.id.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.location.toLowerCase().includes(q) ||
        req.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (dateFilter !== 'All') {
      const reqDate = new Date(req.createdAt || 0);
      const now = new Date();
      if (dateFilter === 'Today') {
        if (reqDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'This Week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (reqDate < weekAgo) return false;
      } else if (dateFilter === 'This Month') {
        if (reqDate.getMonth() !== now.getMonth() || reqDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  const handleOpenModal = (req: CitizenRequest) => {
    setSelectedReq(req);
    setNewStatus(req.status);
    setOfficialNote(req.officialResponse?.message || '');
    setResolutionDate(req.officialResponse?.estimatedResolution || '2026-10-15');
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = () => {
    if (!selectedReq) return;
    setUpdating(true);

    setTimeout(() => {
      const updated = requestService.updateStatus(selectedReq.id, newStatus, {
        message: officialNote.trim() || `Status updated to ${newStatus.replace('_', ' ').toUpperCase()} by ${currentUser.name}.`,
        updatedAt: new Date().toISOString(),
        officialName: currentUser.name,
        officialRole: `${currentUser.designation || 'Officer'} • ${currentUser.department || 'Govt'}`,
        estimatedResolution: resolutionDate,
      });

      setUpdating(false);
      setUpdateSuccess(true);
      if (updated) {
        setSelectedReq(updated);
      }
    }, 400);
  };

  const pendingCount = myOfficerRequests.filter(r => r.status === 'pending' || r.status === 'new').length;
  const inProgressCount = myOfficerRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
  const resolvedCount = myOfficerRequests.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6 font-body">
      {/* Officer Header Card */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full shadow-brutal-sm text-xs font-extrabold uppercase tracking-wider mb-2">
            <UserCheck size={13} className="text-emerald-600" />
            Officer Action Desk
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-black">
            MY ASSIGNED GRIEVANCES
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-black/80">
            <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-black/20 shadow-brutal-xs">
              <Briefcase size={12} />
              {currentUser.designation || 'Assistant Executive Engineer (AEE)'}
            </span>
            <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-black/20 shadow-brutal-xs">
              <Building size={12} />
              {currentUser.department || 'Water Resources & Public Health'}
            </span>
            <span className="flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-black/20 shadow-brutal-xs">
              <MapPin size={12} className="text-red-600" />
              {currentUser.district || 'Kalahandi'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="px-3 py-1.5 bg-black text-brand-yellow rounded-xl text-xs font-mono font-bold animate-pulse">
              Syncing...
            </span>
          )}
          <div className="bg-black text-white px-4 py-2.5 rounded-xl border-2 border-black shadow-brutal-sm font-mono text-xs font-extrabold">
            <span>Assigned to Me: {myOfficerRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Quick Status KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white card-brutal rounded-xl p-4 border-2 border-black flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-black/60 uppercase tracking-wider">Awaiting Action</p>
            <p className="font-heading font-extrabold text-2xl text-red-600 mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-9 h-9 bg-red-100 border border-red-400 rounded-lg flex items-center justify-center text-red-700">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white card-brutal rounded-xl p-4 border-2 border-black flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-black/60 uppercase tracking-wider">In Progress</p>
            <p className="font-heading font-extrabold text-2xl text-amber-600 mt-0.5">{inProgressCount}</p>
          </div>
          <div className="w-9 h-9 bg-amber-100 border border-amber-400 rounded-lg flex items-center justify-center text-amber-700">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="bg-white card-brutal rounded-xl p-4 border-2 border-black flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-black/60 uppercase tracking-wider">Resolved by Me</p>
            <p className="font-heading font-extrabold text-2xl text-emerald-700 mt-0.5">{resolvedCount}</p>
          </div>
          <div className="w-9 h-9 bg-emerald-100 border border-emerald-400 rounded-lg flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white card-brutal rounded-2xl p-5 space-y-3 border-2 border-black">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, location..."
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">New / Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority / Critical</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Requests */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 space-y-4 border-2 border-black">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-xl">TASK EXECUTION QUEUE</h3>
          <span className="text-xs font-bold text-black/60">Showing {filtered.length} requests</span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-black/60 space-y-2 border-2 border-dashed border-black/20 rounded-2xl">
              <AlertCircle className="mx-auto text-black/40" size={32} />
              <p className="font-bold text-sm">No requests assigned matching the selected filters</p>
              <p className="text-xs">Incoming citizen requests in your department and region will be routed here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-bold">
              <thead>
                <tr className="border-b-2 border-black bg-brand-yellow/30 text-black">
                  <th className="py-3 px-3">Tracking ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Citizen Problem</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">SLA Target</th>
                  <th className="py-3 px-3">Media</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map(req => {
                  const hasVoice = req.isVoice || req.voiceTranscription;
                  const hasImage = !!req.imageUrl;
                  return (
                    <tr key={req.id} className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3 px-3 font-mono text-black font-extrabold">{req.id}</td>
                      <td className="py-3 px-3">
                        <CategoryBadge category={req.category} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-black max-w-[220px]">
                        <p className="truncate font-medium">{req.description}</p>
                        {req.aiAnalysis?.summary && (
                          <p className="text-[10px] text-black/60 truncate italic mt-0.5">
                            AI: {req.aiAnalysis.summary}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-black/80">{req.location}</td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={req.priority || 'medium'} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-black/70">
                        {req.officialResponse?.estimatedResolution || '48h SLA'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {hasVoice && (
                            <span className="p-1 bg-amber-100 text-amber-800 rounded border border-amber-400" title="Voice submission">
                              <Mic size={12} />
                            </span>
                          )}
                          {hasImage && (
                            <span className="p-1 bg-blue-100 text-blue-800 rounded border border-blue-400" title="Photo attached">
                              <ImageIcon size={12} />
                            </span>
                          )}
                          {!hasVoice && !hasImage && <span className="text-black/30 text-[10px]">Text</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenModal(req)}
                          className="btn-brutal-primary px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Process</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Workflow Update Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedReq(null)}>
          <div className="bg-white card-brutal-xl rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-150 border-2 border-black" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-black">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold bg-black text-brand-yellow px-2 py-0.5 rounded">
                    {selectedReq.id}
                  </span>
                  <CategoryBadge category={selectedReq.category} size="sm" />
                  <PriorityBadge priority={selectedReq.priority || 'medium'} size="sm" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl mt-1.5">CITIZEN GRIEVANCE DOSSIER</h3>
                <p className="text-xs font-bold text-black/60 mt-0.5">
                  Assigned Department: {selectedReq.department || currentUser.department} • 📍 {selectedReq.location}
                </p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-black hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Citizen Statement */}
            <div className="p-3.5 bg-gray-50 border-2 border-black rounded-xl space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-black/60">Citizen Problem Statement</p>
              <p className="text-xs font-medium text-black leading-relaxed">{selectedReq.description}</p>
              {selectedReq.voiceTranscription && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                  <Mic size={13} className="shrink-0 mt-0.5 text-amber-700" />
                  <span><strong>Voice Audio Transcription:</strong> "{selectedReq.voiceTranscription}"</span>
                </div>
              )}
            </div>

            {/* Photos if any */}
            {selectedReq.imageUrl && (
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-black/60">Citizen Photo Evidence</span>
                <div className="border-2 border-black rounded-xl overflow-hidden max-h-48 bg-black">
                  <img src={selectedReq.imageUrl} alt="Complaint attachment" className="w-full h-44 object-cover" />
                </div>
              </div>
            )}

            {/* AI Technical Analysis Summary */}
            {selectedReq.aiAnalysis && (
              <div className="p-3.5 bg-brand-yellow/30 border-2 border-black rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-black">
                  <Sparkles size={13} />
                  <span>AI Summary & Automated Triage</span>
                </div>
                <p className="text-xs font-medium text-black/90">{selectedReq.aiAnalysis.summary}</p>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-black/70">
                  <span>Severity: <strong className="uppercase">{selectedReq.aiAnalysis.severity}</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong>{Math.round((selectedReq.aiAnalysis.confidence || 0.95) * 100)}%</strong></span>
                </div>
              </div>
            )}

            {/* Workflow Transition Stepper: New -> Assigned -> In Progress -> Resolved */}
            <div className="space-y-2">
              <label className="font-bold text-xs uppercase tracking-wider block">Update Grievance Status</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'pending', label: '1. New' },
                  { key: 'assigned', label: '2. Assigned' },
                  { key: 'in_progress', label: '3. In Progress' },
                  { key: 'resolved', label: '4. Resolved' },
                ].map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setNewStatus(s.key as RequestStatus)}
                    className={`py-2 px-2 rounded-xl border-2 font-bold text-xs transition-all text-center cursor-pointer ${
                      newStatus === s.key
                        ? 'bg-brand-yellow border-black shadow-brutal-sm text-black font-extrabold'
                        : 'bg-gray-50 border-black/30 hover:border-black'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Engineering Note / Response */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs uppercase tracking-wider block">
                Official Engineering Note / Status Update (Visible to Citizen) *
              </label>
              <textarea
                rows={3}
                value={officialNote}
                onChange={e => setOfficialNote(e.target.value)}
                placeholder="e.g. Field inspection completed. Work order #892 issued to contractor for emergency pipeline replacement."
                className="w-full border-2 border-black rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Estimated Resolution Date */}
            <div>
              <label className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar size={13} />
                <span>SLA Target / Estimated Resolution Date</span>
              </label>
              <input
                type="date"
                value={resolutionDate}
                onChange={e => setResolutionDate(e.target.value)}
                className="w-full border-2 border-black rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              />
            </div>

            {updateSuccess && (
              <div className="p-3 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle size={15} />
                <span>Status successfully updated & synced with Citizen Portal in real-time!</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedReq(null)}
                className="btn-brutal-secondary flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="btn-brutal-primary flex-1 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={13} />
                <span>{updating ? 'Updating...' : 'Publish Official Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
