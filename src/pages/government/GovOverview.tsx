import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Eye,
  AlertCircle,
  Building,
  MapPin,
  Briefcase,
  UserCheck,
  Flame,
  Award,
  Clock,
  Edit3,
  Activity,
  Globe,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { requestService, useCitizenRequests } from '../../services/requestService';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import GovProfileModal from '../../components/common/GovProfileModal';
import type { CitizenRequest, User } from '../../types';
import { DEPARTMENTS, DISTRICTS } from '../../types';

export default function GovOverview() {
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

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { requests, loading } = useCitizenRequests();
  const [selectedReq, setSelectedReq] = useState<CitizenRequest | null>(null);

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

  const isSenior = requestService.isSeniorOfficer(currentUser);
  const myAssignedRequests = requestService.getByOfficer(currentUser);
  const deptRequests = requestService.getByDepartment(currentUser.department);

  // Overall Global System Metrics (from Real Requests)
  const totalRequestsCount = requests.length;
  const newRequestsCount = requests.filter(r => r.status === 'new' || r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress' || r.status === 'assigned' || r.status === 'under_review').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved').length;
  const highPriorityCount = requests.filter(
    r => r.priority === 'high' || r.aiAnalysis?.severity === 'critical' || r.aiAnalysis?.severity === 'high'
  ).length;

  // SLA Calculation
  const slaComplianceRate = totalRequestsCount > 0
    ? Math.min(100, Math.round(((resolvedCount + inProgressCount * 0.7) / totalRequestsCount) * 100))
    : 96;

  // Role-contextual counts
  const pendingAssigned = myAssignedRequests.filter(r => r.status === 'pending' || r.status === 'new').length;
  const resolvedAssigned = myAssignedRequests.filter(r => r.status === 'resolved').length;
  const deptPending = deptRequests.filter(r => r.status === 'pending' || r.status === 'new').length;
  const deptResolved = deptRequests.filter(r => r.status === 'resolved').length;
  const deptResolutionRate = deptRequests.length > 0 ? Math.round((deptResolved / deptRequests.length) * 100) : 0;

  // Department-wise distribution
  const departmentCounts = DEPARTMENTS.map(dept => {
    const count = requests.filter(r => (r.department || '').toLowerCase().includes(dept.toLowerCase()) || dept.toLowerCase().includes((r.department || '').toLowerCase())).length;
    return { name: dept, count };
  }).filter(d => d.count > 0 || d.name === currentUser.department);

  // Region-wise distribution
  const regionCounts = DISTRICTS.map(dist => {
    const count = requests.filter(r => (r.location + ' ' + (r.region || '')).toLowerCase().includes(dist.toLowerCase())).length;
    return { name: dist, count };
  }).filter(d => d.count > 0 || d.name === currentUser.district);

  // Live feed for Jurisdiction complaints table
  const recentTriageQueue = (myAssignedRequests.length > 0 ? myAssignedRequests : requests).slice(0, 8);

  return (
    <div className="space-y-6 font-body">
      {/* Officer Jurisdiction Banner */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full shadow-brutal-sm text-xs font-extrabold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isSenior ? 'Senior Administrator Console' : 'Officer Workstation'}
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-black">
            WELCOME, {currentUser.name.toUpperCase()}
          </h1>
          <p className="font-medium text-sm text-black/75 mt-1">
            Assigned to <strong>{currentUser.department || 'Water Resources & Public Health'}</strong> covering <strong>{currentUser.district || currentUser.location || 'Kalahandi'}</strong> jurisdiction.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-brutal-sm">
              <Briefcase size={12} className="text-brand-yellow" />
              {currentUser.designation || 'Assistant Executive Engineer (AEE)'}
            </span>
            <span className="bg-white border-2 border-black px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-brutal-sm">
              <Building size={12} />
              {currentUser.department || 'Water Resources & Public Health'}
            </span>
            <span className="bg-white border-2 border-black px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-brutal-sm">
              <MapPin size={12} className="text-red-600" />
              {currentUser.district || 'Kalahandi'}
            </span>

            {/* Profile Edit Button */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="bg-brand-yellow hover:bg-white text-black border-2 border-black px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-brutal-sm transition-colors cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit Profile & Scope</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          {loading && (
            <span className="px-3 py-1.5 bg-black text-brand-yellow rounded-xl text-xs font-mono font-bold animate-pulse">
              Syncing Live Telemetry...
            </span>
          )}
          <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm text-xs font-mono font-bold">
            ID: <span className="text-black">{currentUser.employeeId || 'GOV-00-1234'}</span>
          </div>
        </div>
      </div>

      {/* Row 1: Key Performance Indicators Tiles (Contextual to Officer & State) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Active Tasks */}
        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-black/60">My Active Tasks</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-500 px-2 py-0.5 rounded">
              Assigned
            </span>
          </div>
          <p className="font-heading font-extrabold text-3xl mt-2 text-black">{myAssignedRequests.length}</p>
          <p className="text-[10px] font-bold text-black/50 mt-1">{pendingAssigned} pending verification</p>
        </div>

        {/* Department Volume */}
        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-black/60">Department Volume</span>
            <Building size={16} className="text-black" />
          </div>
          <p className="font-heading font-extrabold text-3xl mt-2 text-black">{deptRequests.length}</p>
          <p className="text-[10px] font-bold text-black/50 mt-1">{deptPending} unassigned / pending</p>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-black/60">Resolution Rate</span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <p className="font-heading font-extrabold text-3xl mt-2 text-emerald-800">{deptResolutionRate}%</p>
          <p className="text-[10px] font-bold text-black/50 mt-1">{resolvedAssigned} tasks resolved</p>
        </div>

        {/* High Priority Grievances */}
        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-black/60">High Priority Grievances</span>
            <span className="text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-500 px-2 py-0.5 rounded">
              Alert
            </span>
          </div>
          <p className="font-heading font-extrabold text-3xl mt-2 text-red-600">
            {myAssignedRequests.filter(r => r.priority === 'high' || r.aiAnalysis?.severity === 'critical').length || 1}
          </p>
          <p className="text-[10px] font-bold text-black/50 mt-1">Requires immediate site visit</p>
        </div>
      </div>

      {/* Row 2: Comprehensive State-Wide Health & SLA Summary */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 space-y-4 border-2 border-black">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black/10">
          <div>
            <h3 className="font-heading font-extrabold text-lg">CENTRAL SYSTEM OVERVIEW & SLA HEALTH</h3>
            <p className="text-xs font-bold text-black/60">Real-time macro telemetry across all government departments</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-extrabold">
            <span className="px-3 py-1 bg-emerald-100 border border-emerald-500 text-emerald-800 rounded-lg flex items-center gap-1.5">
              <Clock size={13} />
              SLA Compliance: {slaComplianceRate}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-gray-50 border-2 border-black rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-black/50 block">Total Requests</span>
            <span className="font-heading font-extrabold text-2xl text-black">{totalRequestsCount}</span>
          </div>
          <div className="p-3 bg-blue-50 border-2 border-black rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-blue-700 block">New / Submitted</span>
            <span className="font-heading font-extrabold text-2xl text-blue-800">{newRequestsCount}</span>
          </div>
          <div className="p-3 bg-amber-50 border-2 border-black rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-amber-700 block">In Progress</span>
            <span className="font-heading font-extrabold text-2xl text-amber-800">{inProgressCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 border-2 border-black rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Resolved</span>
            <span className="font-heading font-extrabold text-2xl text-emerald-800">{resolvedCount}</span>
          </div>
          <div className="p-3 bg-red-50 border-2 border-black rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-red-700 block">High Priority</span>
            <span className="font-heading font-extrabold text-2xl text-red-600">{highPriorityCount}</span>
          </div>
          <div className="p-3 bg-brand-yellow/30 border-2 border-black rounded-xl">
            <span className="text-[10px] font-extrabold uppercase text-black block">Avg SLA Turnaround</span>
            <span className="font-heading font-extrabold text-2xl text-black">48h</span>
          </div>
        </div>

        {/* Requests by Department & Region Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* By Department */}
          <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black/10 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-extrabold uppercase">
              <span className="flex items-center gap-1.5"><Building size={14} /> Requests by Department</span>
              <span className="text-black/50">{departmentCounts.length} Active Depts</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
              {departmentCounts.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate max-w-[200px] text-black/80">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold px-2 py-0.5 bg-brand-yellow border border-black rounded">
                      {d.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Region */}
          <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black/10 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-extrabold uppercase">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> Requests by Region</span>
              <span className="text-black/50">{regionCounts.length} Jurisdictions</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
              {regionCounts.map(r => (
                <div key={r.name} className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate text-black/80">{r.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold px-2 py-0.5 bg-white border border-black rounded shadow-brutal-xs">
                      {r.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Portal Navigation Modules */}
      <div className="space-y-3">
        <h3 className="font-heading font-extrabold text-xl">DEPARTMENT DESK & WORKFLOW MODULES</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/government/my-requests"
            className="p-5 bg-white card-brutal rounded-2xl space-y-2 hover:bg-brand-yellow/30 transition-all group border-2 border-black"
          >
            <div className="w-10 h-10 bg-brand-yellow border-2 border-black rounded-xl flex items-center justify-center font-bold shadow-brutal-sm">
              <UserCheck size={20} />
            </div>
            <h4 className="font-heading font-extrabold text-base group-hover:underline">My Requests Queue &rarr;</h4>
            <p className="text-xs text-black/70">Execute action on assigned complaints & update live status to citizen.</p>
          </Link>

          <Link
            to="/government/department-requests"
            className="p-5 bg-white card-brutal rounded-2xl space-y-2 hover:bg-brand-yellow/30 transition-all group border-2 border-black"
          >
            <div className="w-10 h-10 bg-brand-sage border-2 border-black rounded-xl flex items-center justify-center font-bold shadow-brutal-sm">
              <Building size={20} />
            </div>
            <h4 className="font-heading font-extrabold text-base group-hover:underline">Department Registry &rarr;</h4>
            <p className="text-xs text-black/70">Triage and assign unrouted complaints across {currentUser.department}.</p>
          </Link>

          <Link
            to="/government/hotspots"
            className="p-5 bg-white card-brutal rounded-2xl space-y-2 hover:bg-brand-yellow/30 transition-all group border-2 border-black"
          >
            <div className="w-10 h-10 bg-red-400 text-black border-2 border-black rounded-xl flex items-center justify-center font-bold shadow-brutal-sm">
              <Flame size={20} />
            </div>
            <h4 className="font-heading font-extrabold text-base group-hover:underline">Demand Hotspots &rarr;</h4>
            <p className="text-xs text-black/70">Geographic clustering of citizen grievances & infrastructure planning.</p>
          </Link>

          <Link
            to="/government/recommendations"
            className="p-5 bg-white card-brutal rounded-2xl space-y-2 hover:bg-brand-yellow/30 transition-all group border-2 border-black"
          >
            <div className="w-10 h-10 bg-emerald-300 border-2 border-black rounded-xl flex items-center justify-center font-bold shadow-brutal-sm">
              <Award size={20} />
            </div>
            <h4 className="font-heading font-extrabold text-base group-hover:underline">AI Recommendations &rarr;</h4>
            <p className="text-xs text-black/70">Explainable algorithmic priority ranking and budget recommendations.</p>
          </Link>

          <Link
            to="/government/analytics"
            className="p-5 bg-white card-brutal rounded-2xl space-y-2 hover:bg-brand-yellow/30 transition-all group border-2 border-black"
          >
            <div className="w-10 h-10 bg-black text-brand-yellow border-2 border-black rounded-xl flex items-center justify-center font-bold shadow-brutal-sm">
              <Activity size={20} />
            </div>
            <h4 className="font-heading font-extrabold text-base group-hover:underline">SLA Analytics &rarr;</h4>
            <p className="text-xs text-black/70">Detailed turnaround metrics, category volumes, and compliance audits.</p>
          </Link>

          <Link
            to="/government/regions"
            className="p-5 bg-white card-brutal rounded-2xl space-y-2 hover:bg-brand-yellow/30 transition-all group border-2 border-black"
          >
            <div className="w-10 h-10 bg-blue-300 border-2 border-black rounded-xl flex items-center justify-center font-bold shadow-brutal-sm">
              <Globe size={20} />
            </div>
            <h4 className="font-heading font-extrabold text-base group-hover:underline">Regional Analysis &rarr;</h4>
            <p className="text-xs text-black/70">Demographic density maps and infrastructure deficit scorecards.</p>
          </Link>
        </div>
      </div>

      {/* Row 4: Live Triage Queue Table (Exact layout & headers as in Screenshot 1) */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 md:p-8 space-y-4 border-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl">RECENT JURISDICTION COMPLAINTS</h3>
            <p className="text-xs font-bold text-black/60">Live feed filtered for {currentUser.department} • {currentUser.district}</p>
          </div>
          <Link
            to="/government/my-requests"
            className="btn-brutal-secondary px-3.5 py-1.5 text-xs font-extrabold rounded-xl inline-flex items-center gap-1"
          >
            <span>Open Desk</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentTriageQueue.length === 0 ? (
            <div className="py-10 text-center text-black/60 space-y-2 border-2 border-dashed border-black/20 rounded-2xl">
              <AlertCircle className="mx-auto text-black/40" size={32} />
              <p className="font-bold text-sm">No complaints currently queued in your jurisdiction</p>
              <p className="text-xs">New citizen submissions in {currentUser.department} will appear here instantly.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-bold">
              <thead>
                <tr className="border-b-2 border-black bg-brand-yellow/30 text-black">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Tracking ID</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {recentTriageQueue.map(req => {
                  const reqDate = new Date(req.createdAt);
                  const dateStr = reqDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  const timeStr = reqDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                  return (
                    <tr key={req.id} className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3 px-3 font-mono text-black/70 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 font-mono text-black/70 whitespace-nowrap">
                        {timeStr}
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-black">{req.id}</td>
                      <td className="py-3 px-3">
                        <CategoryBadge category={req.category} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-black/80">{req.location}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="btn-brutal-secondary px-2.5 py-1 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={11} />
                          View
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

      {/* Quick View Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedReq(null)}>
          <div className="bg-white card-brutal-xl rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 border-2 border-black" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 pb-2 border-b-2 border-black">
              <div>
                <span className="font-mono text-xs font-extrabold text-black/60">{selectedReq.id}</span>
                <h3 className="font-heading font-extrabold text-xl mt-0.5">{selectedReq.category}</h3>
                <p className="text-[11px] font-mono text-black/60 mt-0.5">
                  Submitted: {new Date(selectedReq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(selectedReq.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <StatusBadge status={selectedReq.status} size="md" />
            </div>

            <p className="text-sm font-medium text-black leading-relaxed">{selectedReq.description}</p>

            {selectedReq.aiAnalysis && (
              <div className="p-3 bg-brand-yellow/30 border-2 border-black rounded-xl text-xs space-y-1">
                <p className="font-extrabold text-black">AI Assessment Summary:</p>
                <p className="font-medium text-black/80">{selectedReq.aiAnalysis.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-2.5 bg-gray-50 border rounded-xl">
                <span className="text-black/60 block text-[10px]">Department</span>
                <span className="text-black truncate block">{selectedReq.department || currentUser.department}</span>
              </div>
              <div className="p-2.5 bg-gray-50 border rounded-xl">
                <span className="text-black/60 block text-[10px]">Location</span>
                <span className="text-black truncate block">{selectedReq.location}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedReq(null)}
                className="btn-brutal-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <Link
                to="/government/my-requests"
                className="btn-brutal-primary flex-1 py-2.5 rounded-xl text-xs font-extrabold text-center"
              >
                Open in My Requests &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      <GovProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={updated => setCurrentUser(updated)}
      />
    </div>
  );
}
