import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  X,
  UserPlus,
  AlertCircle,
  Building,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { requestService, useCitizenRequests } from '../../services/requestService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import type { CitizenRequest, RequestStatus, User } from '../../types';
import { DISTRICTS, DESIGNATIONS } from '../../types';

export default function DepartmentRequests() {
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
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');

  // Assign Modal
  const [assignReq, setAssignReq] = useState<CitizenRequest | null>(null);
  const [officerName, setOfficerName] = useState(currentUser.name);
  const [officerDesignation, setOfficerDesignation] = useState(DESIGNATIONS[0]);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const deptRequests = requestService.getByDepartment(currentUser.department, districtFilter !== 'All' ? districtFilter : undefined);

  // Metrics required by Photo 3 & 4:
  // - Total department requests, Pending, In progress, Resolved, High priority, SLA breached
  const totalDeptRequests = deptRequests.length;
  const pendingCount = deptRequests.filter(r => r.status === 'pending' || r.status === 'new').length;
  const inProgressCount = deptRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned' || r.status === 'under_review').length;
  const resolvedCount = deptRequests.filter(r => r.status === 'resolved').length;
  const highPriorityCount = deptRequests.filter(r => r.priority === 'high' || r.aiAnalysis?.severity === 'critical' || r.aiAnalysis?.severity === 'high').length;
  const slaBreachedCount = deptRequests.filter(r => (r.status === 'pending' || r.status === 'new') && r.priority === 'high').length;

  const filtered = deptRequests.filter(req => {
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
        req.category.toLowerCase().includes(q) ||
        (req.assignedOfficerName && req.assignedOfficerName.toLowerCase().includes(q));
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

  const handleAssign = () => {
    if (!assignReq) return;
    requestService.assignOfficer(assignReq.id, `OFF-${Date.now().toString().slice(-4)}`, officerName.trim(), officerDesignation);
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setAssignReq(null);
    }, 900);
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-black">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full shadow-brutal-sm text-xs font-extrabold uppercase tracking-wider mb-2">
            <Building size={13} className="text-black" />
            Automated AI Department Routing Desk
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-black">
            {currentUser.department?.toUpperCase() || 'WATER RESOURCES'} REGISTRY
          </h1>
          <p className="font-medium text-sm text-black/75 mt-1">
            Grievances automatically routed from citizen category detection directly into {currentUser.department}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="px-3 py-1.5 bg-black text-brand-yellow rounded-xl text-xs font-mono font-bold animate-pulse">
              Syncing Live...
            </span>
          )}
          <div className="bg-black text-white px-4 py-2.5 rounded-xl border-2 border-black shadow-brutal-sm font-mono text-xs font-extrabold">
            <span>Total in Department: {totalDeptRequests}</span>
          </div>
        </div>
      </div>

      {/* AI Routing Workflow Demonstration Card (From Photo 3) */}
      <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black">
          <Sparkles size={16} className="text-amber-600" />
          <span>Intelligent Auto-Routing Architecture</span>
        </div>
        <div className="bg-brand-charcoal text-white p-4 rounded-xl border-2 border-black font-mono text-xs space-y-2">
          <div className="text-brand-sage">Citizen submits: <span className="text-white font-bold">"Water supply pipeline burst in Ward 4, Bhawanipatna"</span></div>
          <div className="flex items-center gap-2 text-brand-yellow font-bold">
            <ArrowRight size={14} /> AI Processing (NLP Classification & Entity Extraction)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/20">
            <div><span className="text-white/60 block">Category:</span> <span className="text-brand-yellow font-bold">Water</span></div>
            <div><span className="text-white/60 block">Department:</span> <span className="text-brand-yellow font-bold">{currentUser.department || 'Water Resources'}</span></div>
            <div><span className="text-white/60 block">Region:</span> <span className="text-brand-yellow font-bold">{currentUser.district || 'Kalahandi'}</span></div>
            <div><span className="text-white/60 block">Priority:</span> <span className="text-red-400 font-bold">High / Critical</span></div>
          </div>
          <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
            <CheckCircle size={13} />
            <span>Successfully dispatched into {currentUser.department} Action Registry.</span>
          </div>
        </div>
      </div>

      {/* KPI Tiles as requested in Photo 3 & 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white card-brutal rounded-2xl border-2 border-black text-center">
          <p className="text-[10px] font-extrabold uppercase text-black/50">Total Dept Requests</p>
          <p className="font-heading font-extrabold text-2xl text-black mt-1">{totalDeptRequests}</p>
        </div>
        <div className="p-4 bg-white card-brutal rounded-2xl border-2 border-black text-center">
          <p className="text-[10px] font-extrabold uppercase text-blue-700">Pending / New</p>
          <p className="font-heading font-extrabold text-2xl text-blue-800 mt-1">{pendingCount}</p>
        </div>
        <div className="p-4 bg-white card-brutal rounded-2xl border-2 border-black text-center">
          <p className="text-[10px] font-extrabold uppercase text-amber-700">In Progress</p>
          <p className="font-heading font-extrabold text-2xl text-amber-800 mt-1">{inProgressCount}</p>
        </div>
        <div className="p-4 bg-white card-brutal rounded-2xl border-2 border-black text-center">
          <p className="text-[10px] font-extrabold uppercase text-emerald-700">Resolved</p>
          <p className="font-heading font-extrabold text-2xl text-emerald-800 mt-1">{resolvedCount}</p>
        </div>
        <div className="p-4 bg-white card-brutal rounded-2xl border-2 border-black text-center">
          <p className="text-[10px] font-extrabold uppercase text-red-700">High Priority</p>
          <p className="font-heading font-extrabold text-2xl text-red-600 mt-1">{highPriorityCount}</p>
        </div>
        <div className="p-4 bg-white card-brutal rounded-2xl border-2 border-black text-center">
          <p className="text-[10px] font-extrabold uppercase text-rose-700 flex items-center justify-center gap-1">
            <AlertTriangle size={11} /> SLA Breached
          </p>
          <p className="font-heading font-extrabold text-2xl text-rose-700 mt-1">{slaBreachedCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white card-brutal rounded-2xl p-5 space-y-3 border-2 border-black">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, officer..."
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
              <option value="High">High / Critical</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Districts</option>
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
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

      {/* Main Table */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 space-y-4 border-2 border-black">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-xl">DEPARTMENT REGISTRY QUEUE</h3>
          <span className="text-xs font-bold text-black/60">Showing {filtered.length} of {deptRequests.length}</span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-black/60 space-y-2 border-2 border-dashed border-black/20 rounded-2xl">
              <AlertCircle className="mx-auto text-black/40" size={32} />
              <p className="font-bold text-sm">No department grievances found</p>
              <p className="text-xs">Citizen grievances in {currentUser.department} will be automatically routed here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-bold">
              <thead>
                <tr className="border-b-2 border-black bg-brand-yellow/30 text-black">
                  <th className="py-3 px-3">Tracking ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">District / Ward</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Assigned Officer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3 px-3 font-mono text-black font-extrabold">{req.id}</td>
                    <td className="py-3 px-3">
                      <CategoryBadge category={req.category} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-black/80">{req.location}</td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={req.priority || 'medium'} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      {req.assignedOfficerName ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold border border-blue-400">
                          👤 {req.assignedOfficerName}
                        </span>
                      ) : (
                        <span className="text-black/40 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setAssignReq(req);
                          setOfficerName(req.assignedOfficerName || currentUser.name);
                        }}
                        className="btn-brutal-secondary px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus size={12} />
                        <span>Assign / Route</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {assignReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setAssignReq(null)}>
          <div className="bg-white card-brutal-xl rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 border-2 border-black" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between pb-2 border-b-2 border-black">
              <div>
                <span className="font-mono text-xs font-extrabold text-black/60">{assignReq.id}</span>
                <h3 className="font-heading font-extrabold text-xl mt-0.5">Assign Officer to Request</h3>
              </div>
              <button onClick={() => setAssignReq(null)} className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center hover:bg-black hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-xs uppercase tracking-wider block mb-1">Officer Name</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={e => setOfficerName(e.target.value)}
                  placeholder="Officer name"
                  className="w-full border-2 border-black rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-xs uppercase tracking-wider block mb-1">Designation</label>
                <select
                  value={officerDesignation}
                  onChange={e => setOfficerDesignation(e.target.value)}
                  className="w-full border-2 border-black rounded-xl p-2.5 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {DESIGNATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {assignSuccess && (
              <div className="p-2.5 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Assigned successfully! Status changed to 'Assigned'.</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setAssignReq(null)} className="btn-brutal-secondary flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAssign} className="btn-brutal-primary flex-1 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
