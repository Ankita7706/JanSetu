import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Eye,
  CheckCircle,
  X,
  Send,
  Sparkles,
  ArrowUpDown,
  Mic,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react';
import { requestService, useCitizenRequests } from '../../services/requestService';
import { authService } from '../../services/authService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import MapView, { type MapViewMarker } from '../../components/map/MapView';
import type { CitizenRequest, RequestStatus } from '../../types';
import { DEPARTMENTS, DISTRICTS } from '../../types';

export default function GovRequests() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { requests, loading } = useCitizenRequests();
  const [search, setSearch] = useState(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [slaFilter, setSlaFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'affected'>('date');

  // Modal detail & live status updater
  const [selectedReq, setSelectedReq] = useState<CitizenRequest | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('in_progress');
  const [officialNote, setOfficialNote] = useState('');
  const [resolutionDate, setResolutionDate] = useState('2026-10-15');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
      const currentUser = authService.getCurrentUser();
      const updated = requestService.updateStatus(selectedReq.id, newStatus, {
        message: officialNote.trim() || `Status updated to ${newStatus.replace('_', ' ').toUpperCase()} by ${currentUser?.name || 'Department Officer'}.`,
        updatedAt: new Date().toISOString(),
        officialName: currentUser?.name || 'Government Official',
        officialRole: currentUser?.organization || (currentUser?.designation && currentUser?.department ? `${currentUser.designation} • ${currentUser.department}` : 'Authorized Department Official'),
        estimatedResolution: resolutionDate,
      });

      setUpdating(false);
      setUpdateSuccess(true);
      if (updated) {
        setSelectedReq(updated);
      }
    }, 600);
  };

  // 7 Filters implementation
  const filtered = requests
    .filter(req => {
      // 1. Department
      if (departmentFilter !== 'All') {
        const reqDept = (req.department || '').toLowerCase();
        const targetDept = departmentFilter.toLowerCase();
        if (!reqDept.includes(targetDept) && !targetDept.includes(reqDept)) return false;
      }
      // 2. Region
      if (regionFilter !== 'All') {
        const loc = (req.location + ' ' + (req.region || '')).toLowerCase();
        if (!loc.includes(regionFilter.toLowerCase())) return false;
      }
      // 3. Category
      if (categoryFilter !== 'All' && req.category !== categoryFilter) return false;
      // 4. Severity / Priority
      if (severityFilter !== 'All' && req.priority !== severityFilter.toLowerCase() && req.aiAnalysis?.severity !== severityFilter.toLowerCase()) {
        return false;
      }
      // 5. Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && req.status !== 'pending' && req.status !== 'new') return false;
        if (statusFilter !== 'pending' && req.status !== statusFilter) return false;
      }
      // 6. Date
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
      // 7. SLA
      if (slaFilter !== 'All') {
        const isCriticalOrOld = (req.status === 'pending' || req.status === 'new') && req.priority === 'high';
        if (slaFilter === 'Breached' && !isCriticalOrOld) return false;
        if (slaFilter === 'Within SLA' && isCriticalOrOld) return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          req.id.toLowerCase().includes(q) ||
          req.description.toLowerCase().includes(q) ||
          req.location.toLowerCase().includes(q) ||
          req.category.toLowerCase().includes(q) ||
          (req.department && req.department.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'affected') return (b.affectedCount || 0) - (a.affectedCount || 0);
      return (b.priority === 'high' ? 2 : 1) - (a.priority === 'high' ? 2 : 1);
    });

  const categories = ['All', 'Roads', 'Water', 'Streetlights', 'Drainage', 'Public Transport', 'Schools & Hospitals', 'Electricity', 'Sanitation'];
  const mapMarkers: MapViewMarker[] = filtered.flatMap(req => {
    const point = req.locationDetails
      ? { latitude: req.locationDetails.latitude, longitude: req.locationDetails.longitude }
      : req.coordinates
        ? { latitude: req.coordinates.lat, longitude: req.coordinates.lng }
        : undefined;
    if (!point || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude) ||
      point.latitude < -90 || point.latitude > 90 || point.longitude < -180 || point.longitude > 180) return [];

    const address = req.locationDetails?.address || req.location;
    return [{
      id: req.id,
      ...point,
      label: `${req.id} - ${req.category}`,
      popup: (
        <div className="min-w-52 space-y-1.5 text-xs">
          <p className="font-mono font-extrabold">{req.id}</p>
          <p className="font-bold">{req.category}: {req.description}</p>
          <p>Status: {req.status.replace('_', ' ')}</p>
          {req.aiAnalysis?.severity && <p>Severity: {req.aiAnalysis.severity}</p>}
          <p className="text-black/70">{address}</p>
          {req.affectedCount != null && <p>{req.affectedCount.toLocaleString()} citizens affected</p>}
          <button
            type="button"
            onClick={() => handleOpenModal(req)}
            className="mt-1 rounded-md border-2 border-black bg-brand-yellow px-2.5 py-1.5 font-extrabold"
          >
            Open request details
          </button>
        </div>
      ),
    }];
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-black">
        <div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-black">
            CENTRAL DATABASE OF CITIZEN REQUESTS
          </h1>
          <p className="font-medium text-sm text-black/75 mt-1">
            Complete statewide repository of citizen complaints with full filtering by department, region, category, severity, status, date & SLA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="px-3 py-1.5 bg-black text-brand-yellow rounded-xl text-xs font-mono font-bold animate-pulse">
              Syncing Live Data...
            </span>
          )}
          <div className="flex items-center gap-2 font-mono font-extrabold text-xs bg-black text-brand-yellow px-4 py-2 rounded-xl shadow-brutal-sm">
            <span>Total Filtered: {filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar with All 7 Filters */}
      <div className="bg-white card-brutal rounded-2xl p-5 space-y-4 border-2 border-black">
        {/* Search & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Request ID, category, keyword, department, district..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-black/60 shrink-0 flex items-center gap-1">
              <ArrowUpDown size={13} />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="date">Most Recent Date</option>
              <option value="affected">Most Citizens Affected</option>
              <option value="priority">Highest Severity Priority</option>
            </select>
          </div>
        </div>

        {/* 7 Required Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3 border-t border-black/10 text-xs font-bold">
          {/* 1. Department */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">Department</label>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="All">All Depts</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 2. Region */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">Region</label>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="All">All Regions</option>
              {DISTRICTS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 3. Category */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 4. Severity */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">Severity</label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* 5. Status */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Submitted / New</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* 6. Date */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">Date</label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* 7. SLA */}
          <div>
            <label className="block text-[10px] uppercase text-black/60 mb-1 truncate">SLA Status</label>
            <select
              value={slaFilter}
              onChange={e => setSlaFilter(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="All">All SLA</option>
              <option value="Within SLA">Within SLA</option>
              <option value="Breached">SLA Breached / At Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request location map */}
      <section className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-brutal">
        <div className="flex flex-col gap-1 border-b-2 border-black bg-brand-yellow px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-extrabold">REQUEST LOCATIONS</h2>
            <p className="text-xs font-bold text-black/60">Select a marker to inspect a request</p>
          </div>
          <span className="font-mono text-xs font-extrabold">{mapMarkers.length} mapped / {filtered.length} requests</span>
        </div>
        {mapMarkers.length > 0 ? (
          <MapView center={[20.2961, 85.8245]} className="h-[340px] w-full sm:h-[440px]" markers={mapMarkers} fitMarkers />
        ) : (
          <div className="flex h-44 items-center justify-center px-5 text-center text-sm font-bold text-black/55">
            No requests with valid map coordinates match the current filters.
          </div>
        )}
      </section>

      {/* Table Representation */}
      <div className="bg-white card-brutal-lg rounded-3xl overflow-hidden border-2 border-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead>
              <tr className="bg-brand-yellow/40 border-b-2 border-black text-black">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Region / Location</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-black/50 text-sm">
                    No requests match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.id} className="hover:bg-brand-yellow/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-black">{req.id}</td>
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={req.category} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-black font-semibold text-[11px] truncate max-w-44">
                      {req.department || 'Public Works'}
                    </td>
                    <td className="py-3.5 px-4 text-black">
                      <span className="truncate block max-w-44">{req.location}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-black/70">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={req.priority || 'medium'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenModal(req)}
                        className="btn-brutal-primary px-3 py-1.5 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Inspect &rarr;</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Complete Information & Status Update Modal */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="bg-white card-brutal-xl rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border-2 border-black"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-brand-yellow p-5 border-b-2 border-black flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs bg-black text-brand-yellow px-2 py-0.5 rounded">
                    {selectedReq.id}
                  </span>
                  <CategoryBadge category={selectedReq.category} size="md" />
                  <PriorityBadge priority={selectedReq.priority || 'medium'} size="sm" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-black mt-1">
                  OFFICIAL GRIEVANCE FILE & ACTION DOSSIER
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center font-extrabold hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Grievance Statement */}
              <div className="p-4 bg-gray-50 border-2 border-black rounded-2xl space-y-2">
                <span className="font-extrabold uppercase text-black/60 text-[10px]">Citizen Grievance Statement</span>
                <p className="font-medium text-sm text-black leading-relaxed">{selectedReq.description}</p>
                {selectedReq.voiceTranscription && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Mic size={14} className="text-amber-700 shrink-0 mt-0.5" />
                    <span><strong>Audio Transcription:</strong> "{selectedReq.voiceTranscription}"</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-black/70 font-bold text-[11px] border-t border-black/10">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {selectedReq.location}</span>
                  <span className="flex items-center gap-1"><Building size={12} /> {selectedReq.department || 'Public Works'}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(selectedReq.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Photo Evidence if any */}
              {selectedReq.imageUrl && (
                <div className="space-y-1">
                  <span className="font-extrabold uppercase text-[10px] text-black/60">Photo Evidence</span>
                  <div className="border-2 border-black rounded-xl overflow-hidden max-h-48 bg-black">
                    <img src={selectedReq.imageUrl} alt="Complaint Evidence" className="w-full h-44 object-cover" />
                  </div>
                </div>
              )}

              {/* AI Technical Analysis */}
              <div className="p-3.5 bg-brand-yellow/30 border-2 border-black rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-extrabold uppercase text-[10px] text-black">
                  <Sparkles size={13} />
                  <span>AI Technical Analysis & Severity Diagnostic</span>
                </div>
                <p className="font-medium text-black/90">{selectedReq.aiAnalysis?.summary || 'AI has analyzed severity and auto-routed to respective department.'}</p>
              </div>

              {/* Status Update Form (Live Updater) */}
              <div className="p-5 bg-brand-charcoal text-white border-2 border-black rounded-2xl space-y-4">
                <h4 className="font-heading font-extrabold text-base text-brand-yellow uppercase">
                  Update Official Status & Dispatch Response
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-brand-sage mb-1">
                      Status State *
                    </label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as RequestStatus)}
                      className="w-full bg-white text-black font-extrabold border-2 border-brand-yellow rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="pending">SUBMITTED (Pending Assessment)</option>
                      <option value="assigned">ASSIGNED (Officer Designated)</option>
                      <option value="in_progress">IN PROGRESS (Work Order Sanctioned)</option>
                      <option value="resolved">RESOLVED (Rectified & Completed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-brand-sage mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={resolutionDate}
                      onChange={e => setResolutionDate(e.target.value)}
                      className="w-full bg-white text-black font-bold border-2 border-brand-yellow rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-brand-sage mb-1">
                    Official Engineering Note (Visible to Citizen in Real Time) *
                  </label>
                  <textarea
                    value={officialNote}
                    onChange={e => setOfficialNote(e.target.value)}
                    rows={3}
                    placeholder="Enter public engineering dispatch notes, contractor details, or resolution summary..."
                    className="w-full bg-white text-black font-medium border-2 border-brand-yellow rounded-xl p-3 text-xs focus:outline-none"
                  />
                </div>

                {updateSuccess && (
                  <div className="p-2.5 bg-emerald-900/80 border border-emerald-400 rounded-xl text-emerald-300 font-extrabold text-xs flex items-center gap-2">
                    <CheckCircle size={15} />
                    <span>Status updated successfully & synced across all portals!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t-2 border-black flex items-center justify-between">
              <button
                onClick={() => setSelectedReq(null)}
                className="btn-brutal-secondary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="btn-brutal-primary px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send size={13} />
                <span>{updating ? 'Updating...' : 'Publish Official Update →'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
