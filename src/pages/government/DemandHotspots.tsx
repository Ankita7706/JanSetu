import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  FolderPlus,
  CheckCircle,
  X,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { projectService } from '../../services/projectService';
import { useCitizenRequests } from '../../services/requestService';
import MapHotspotsView from '../../components/common/MapHotspotsView';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import type { Hotspot } from '../../types';

export default function DemandHotspots() {
  const navigate = useNavigate();
  const { requests } = useCitizenRequests();
  const allHotspots = analyticsService.getHotspots(requests);

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(() => allHotspots[0] || null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectBudget, setProjectBudget] = useState(25000000);
  const [projectDesc, setProjectDesc] = useState('');
  const [projectCreated, setProjectCreated] = useState(false);

  const handleProposeProjectClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setProjectTitle(`${hotspot.region} — ${hotspot.category} Urgent Capital Rehabilitation`);
    setProjectDesc(
      `Directly addresses ${hotspot.requestCount} clustered citizen complaints in ${hotspot.region}. ${hotspot.summary}`
    );
    setProjectBudget(hotspot.requestCount > 100 ? 45000000 : 22000000);
    setProjectModalOpen(true);
    setProjectCreated(false);
  };

  const handleCreateProject = () => {
    if (!selectedHotspot) return;
    projectService.createProject(
      projectTitle,
      selectedHotspot.category,
      selectedHotspot.region,
      projectBudget,
      projectDesc,
      selectedHotspot.priority,
      selectedHotspot.requestCount,
      selectedHotspot.affectedPopulation
    );
    setProjectCreated(true);
    setTimeout(() => {
      setProjectModalOpen(false);
      navigate('/government/recommendations');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full shadow-brutal-sm text-xs font-extrabold uppercase tracking-wider mb-2">
            <Flame size={13} className="text-red-500" />
            AI Demand Clustering Engine
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-black">
            DEMAND HOTSPOTS INTELLIGENCE
          </h1>
          <p className="font-medium text-sm text-black/75 mt-1">
            Geospatial concentration of similar citizen grievances mapped to assist infrastructure planning.
          </p>
        </div>

        <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm text-xs font-bold text-black/75 max-w-xs">
          <span className="text-black font-extrabold">DEMO TELEMETRY: </span>
          Real-time AI spatial clustering fusing voice, text & photo coordinates without external API fees.
        </div>
      </div>

      {/* Main Interactive Map Section */}
      <MapHotspotsView
        hotspots={allHotspots}
        selectedHotspot={selectedHotspot}
        onSelectHotspot={setSelectedHotspot}
        onProposeProject={handleProposeProjectClick}
      />

      {/* Hotspots Grid Cards Section (As detailed in prompt) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-2xl">PRIORITY HOTSPOT QUEUE</h2>
            <p className="text-xs font-bold text-black/60">Ranked by population impact and infrastructure deficit index</p>
          </div>
          <span className="text-xs font-mono font-bold bg-white border-2 border-black px-3 py-1 rounded-xl">
            {allHotspots.length} Active Hotspots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allHotspots.map((h, idx) => (
            <div
              key={h.id}
              onClick={() => setSelectedHotspot(h)}
              className={`bg-white card-brutal rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer hover:border-black ${
                selectedHotspot?.id === h.id ? 'ring-4 ring-black bg-brand-yellow/10' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-extrabold bg-brand-yellow text-black border border-black px-2.5 py-1 rounded-lg">
                    HOTSPOT #{idx + 1}
                  </span>
                  <PriorityBadge priority={h.priority} size="sm" />
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-xl text-black">{h.region}</h3>
                  <div className="mt-1">
                    <CategoryBadge category={h.category} size="md" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 bg-gray-50 border border-black/20 rounded-xl">
                    <p className="text-[10px] uppercase font-extrabold text-black/50">Grievances</p>
                    <p className="font-heading font-extrabold text-lg text-black mt-0.5">{h.requestCount}</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 border border-black/20 rounded-xl">
                    <p className="text-[10px] uppercase font-extrabold text-black/50">Citizens Affected</p>
                    <p className="font-heading font-extrabold text-lg text-black mt-0.5">
                      {(h.affectedPopulation / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>

                <p className="text-xs font-medium text-black/80 line-clamp-2 leading-relaxed">{h.summary}</p>
              </div>

              <div className="pt-4 mt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-emerald-700">{h.trend}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleProposeProjectClick(h);
                  }}
                  className="btn-brutal-secondary px-3 py-1.5 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1"
                >
                  <FolderPlus size={12} />
                  <span>Propose Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Propose Infrastructure Project Modal */}
      {projectModalOpen && selectedHotspot && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setProjectModalOpen(false)}
        >
          <div
            className="bg-white card-brutal-xl rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-black">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold bg-brand-yellow px-2 py-0.5 border border-black rounded">
                    HOTSPOT ORIGIN
                  </span>
                  <CategoryBadge category={selectedHotspot.category} size="sm" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-black mt-1">
                  PROPOSE INFRASTRUCTURE PROJECT
                </h3>
              </div>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center font-extrabold hover:bg-black hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="w-full border-2 border-black rounded-xl p-3 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                    Region Jurisdiction
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedHotspot.region}
                    className="w-full bg-gray-100 border-2 border-black rounded-xl p-3 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                    Estimated Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={projectBudget}
                    onChange={e => setProjectBudget(Number(e.target.value))}
                    className="w-full border-2 border-black rounded-xl p-3 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold uppercase text-[10px] text-black/70 mb-1">
                  Scope & Justification (Derived from {selectedHotspot.requestCount} Citizen Logs)
                </label>
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-black rounded-xl p-3 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="p-3 bg-brand-yellow/30 border-2 border-black rounded-xl space-y-1">
                <span className="font-extrabold text-[10px] uppercase text-black">Project Impact Forecast</span>
                <p className="font-bold text-black">
                  Directly addresses {selectedHotspot.requestCount} verified complaints and benefits ~
                  {selectedHotspot.affectedPopulation.toLocaleString()} citizens.
                </p>
              </div>

              {projectCreated && (
                <div className="p-3 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-emerald-800 font-extrabold text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Project successfully added to the Projects Pipeline!</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-black/10">
              <button
                onClick={() => setProjectModalOpen(false)}
                className="btn-brutal-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="btn-brutal-primary flex-1 py-2.5 rounded-xl text-xs font-extrabold"
              >
                Create Project &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
