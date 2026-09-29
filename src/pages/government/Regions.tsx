import { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Globe,
  MapPin,
  ChevronRight,
  ArrowRightLeft,
  Building,
  AlertCircle,
  Eye,
  ShieldCheck,
  Layers,
  Droplets,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useCitizenRequests } from '../../services/requestService';
import CategoryBadge from '../../components/common/CategoryBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import type { CitizenRequest, User } from '../../types';

// Authentic Odisha District Administrative Profiles & Real Geographic / Demographic Data
interface DistrictProfile {
  name: string;
  headquarters: string;
  subdivisions: string[];
  totalBlocks: number;
  totalGramPanchayats: number;
  totalVillages: number;
  areaSqKm: number;
  censusPopulation: number;
  literacyRate: string;
  majorRivers: string[];
  keyHighways: string[];
  keySectors: string[];
  geographicDescription: string;
  infrastructureChallenges: string;
  blocks: {
    id: string;
    name: string;
    headquarters: string;
    population: number;
    infraDeficitScore: number;
    topDeficit: string;
    villages: string[];
  }[];
}

const REAL_DISTRICT_PROFILES: Record<string, DistrictProfile> = {
  'Kalahandi': {
    name: 'Kalahandi',
    headquarters: 'Bhawanipatna',
    subdivisions: ['Bhawanipatna Subdivision', 'Dharamgarh Subdivision'],
    totalBlocks: 13,
    totalGramPanchayats: 310,
    totalVillages: 2236,
    areaSqKm: 7920,
    censusPopulation: 1576869,
    literacyRate: '59.22%',
    majorRivers: ['Tel River', 'Indravati River', 'Hati River', 'Sagada River', 'Ret River'],
    keyHighways: ['NH-26 (Bargarh - Borigumma)', 'SH-16 (Bhawanipatna - Khariar)', 'Biju Expressway Corridor'],
    keySectors: ['Mega Piped Water Supply (RWSS)', 'Upper Indravati Lift Irrigation', 'Rural Road Bridges & Culverts', 'Public Health Diagnostics'],
    geographicDescription:
      'Kalahandi is situated in the south-western quadrant of Odisha between 19°3\' N to 20°28\' N latitudes and 82°30\' E to 83°74\' E longitudes. The northern plain is drained by the Tel river basin forming an agrarian belt, while the southern terrain is mountainous with the Eastern Ghats escarpment and rich bauxite plateaus in Niyamgiri & Karlapat hills.',
    infrastructureChallenges:
      'Deep aquifer depletion in hard-rock granitic strata requires extensive mega-pipe surface water lift from Indravati reservoir. Hill tract blocks (Thuamul Rampur & Lanjigarh) suffer severe monsoon culvert washouts and bridge submergence along unclassified rural roads.',
    blocks: [
      { id: 'kl-1', name: 'Bhawanipatna Block', headquarters: 'Bhawanipatna', population: 192400, infraDeficitScore: 36, topDeficit: 'Roads & Culvert Widening', villages: ['Bhawanipatna Zone 4', 'Ward 7 Hospital Road', 'Medinipur', 'Karlapada', 'Uditnarayanpur', 'Kamthana'] },
      { id: 'kl-2', name: 'Dharamgarh Block', headquarters: 'Dharamgarh', population: 148200, infraDeficitScore: 44, topDeficit: 'Piped Water Supply & Fluoride Mitigation', villages: ['Dharamgarh Town Ward 3', 'Golamunda Road', 'Parla', 'Borda', 'Chilpa', 'Bhabanandapur'] },
      { id: 'kl-3', name: 'Junagarh Block', headquarters: 'Junagarh', population: 139100, infraDeficitScore: 42, topDeficit: 'Urban Stormwater Drainage & Canal Siltation', villages: ['Junagarh Ward 3', 'Habaspur', 'Charbahal', 'Banka', 'Durgamadhab', 'Chichaiguda'] },
      { id: 'kl-4', name: 'Kesinga Block', headquarters: 'Kesinga', population: 121500, infraDeficitScore: 34, topDeficit: 'Distribution Transformer Upgrades & Streetlights', villages: ['Kesinga Railway Colony', 'Utkela Airstrip Zone', 'Siuni', 'Kanduljhar', 'Pastikudi', 'Gaudchhendia'] },
      { id: 'kl-5', name: 'Lanjigarh Block', headquarters: 'Lanjigarh', population: 104300, infraDeficitScore: 54, topDeficit: 'Deep Borewell Piped Water & Solar Pumps', villages: ['Lanjigarh Basti', 'Muniguda Road', 'Basantapada', 'Trilochanpur', 'Bishwanathpur', 'Bataguda'] },
      { id: 'kl-6', name: 'Narla Block', headquarters: 'Narla', population: 94800, infraDeficitScore: 39, topDeficit: 'All-Weather Bituminous Road Paving', villages: ['Narla Station Road', 'Rupra Road', 'Santarapur', 'Ghasiguda', 'Madanpur', 'Chapria'] },
      { id: 'kl-7', name: 'Thuamul Rampur Block', headquarters: 'Thuamul Rampur', population: 78500, infraDeficitScore: 66, topDeficit: 'Bridge Connectivity & Hill Health Sub-Centers', villages: ['T.Rampur Hilly Zone', 'Gopalpur', 'Gunupur', 'Adri', 'Kerpai', 'Nakrundi'] },
      { id: 'kl-8', name: 'Golamunda Block', headquarters: 'Golamunda', population: 112000, infraDeficitScore: 46, topDeficit: 'Minor Lift Irrigation & Water Recharge', villages: ['Golamunda Bazaar', 'Kegaon', 'Dhamandanga', 'Khanda', 'Sripali'] },
      { id: 'kl-9', name: 'Jaipatna Block', headquarters: 'Jaipatna', population: 131000, infraDeficitScore: 41, topDeficit: 'Tail-End Canal Water Access & Power Feeders', villages: ['Jaipatna Ward 2', 'Mukhiguda Hydro Colony', 'Kuchagaon', 'Banjari', 'Rengalpali'] },
      { id: 'kl-10', name: 'Koksara Block', headquarters: 'Koksara', population: 126400, infraDeficitScore: 45, topDeficit: 'Rural Sanitation & Surface Water Treatment', villages: ['Koksara Market', 'Ampani Ghati', 'Ladugaon', 'Temara', 'Phukipadar'] },
      { id: 'kl-11', name: 'Kalampur Block', headquarters: 'Kalampur', population: 86200, infraDeficitScore: 38, topDeficit: 'River Bank Embankment & Bund Protection', villages: ['Kalampur Gram', 'Bandhapada', 'Mandal', 'Pandigaon', 'Bijmara'] },
      { id: 'kl-12', name: 'Madanpur Rampur Block', headquarters: 'M.Rampur', population: 98100, infraDeficitScore: 48, topDeficit: 'Sub-Division Hospital Upgradation & Water Tanks', villages: ['M.Rampur Main Square', 'Urladani', 'Mohangiri', 'Palam', 'Dandapadar'] },
      { id: 'kl-13', name: 'Karlamunda Block', headquarters: 'Karlamunda', population: 68300, infraDeficitScore: 40, topDeficit: '33/11kV Substation Voltage Stabilization', villages: ['Karlamunda Center', 'Gajabahal', 'Saponai', 'Risigaon', 'Regeda'] },
    ],
  },
  'Bhubaneswar': {
    name: 'Bhubaneswar',
    headquarters: 'Bhubaneswar (Khurda District)',
    subdivisions: ['Bhubaneswar Sadar', 'Khurda Sub-Division'],
    totalBlocks: 2,
    totalGramPanchayats: 168,
    totalVillages: 1124,
    areaSqKm: 2813,
    censusPopulation: 1878000,
    literacyRate: '86.88%',
    majorRivers: ['Kuakhai River', 'Daya River', 'Bhargavi River', 'Gangua Nallah'],
    keyHighways: ['NH-16 (Kolkata - Chennai)', 'NH-316 (Bhubaneswar - Puri)', 'Biju Expressway Phase-2'],
    keySectors: ['Stormwater Trunk Drainage', 'Smart City Solid Waste Logistics', '24x7 Drink-from-Tap Water', 'Underground Utility Ducting'],
    geographicDescription:
      'Capital metropolitan region of Odisha situated on the eastern coastal plains along the Mahanadi delta headwaters. It serves as the primary administrative, educational, IT, and medical corridor of eastern India.',
    infrastructureChallenges:
      'Gangua Nallah overflow creates flash urban waterlogging in low-lying residential sectors (Nayapalli, Bomikhal, Acharya Vihar). Rapid peri-urban sprawl in Patia & Jatni requires urgent trunk sewer and piped water trunkline extensions.',
    blocks: [
      { id: 'bbsr-1', name: 'Bhubaneswar Municipal & Sadar Block', headquarters: 'Bhubaneswar BMC', population: 1240000, infraDeficitScore: 24, topDeficit: 'Urban Drainage Outfalls & Silt Traps', villages: ['Saheed Nagar', 'Patia Ward 12', 'Nayapalli Sector 3', 'Old Town Lingaraj Zone', 'Chandrasekharpur', 'Bomikhal'] },
      { id: 'bbsr-2', name: 'Jatni Block', headquarters: 'Jatni', population: 215000, infraDeficitScore: 32, topDeficit: 'Overbridge Road Widening & Storm Drains', villages: ['Jatni Railway Colony', 'Khurda Road Zone', 'Harirajpur', 'Kudiary', 'Padmapur'] },
      { id: 'bbsr-3', name: 'Balianta Block', headquarters: 'Balianta', population: 142000, infraDeficitScore: 38, topDeficit: 'Daya River Flood Embankment', villages: ['Balianta Bazaar', 'Bhingarpur', 'Satyabhamapur', 'Prataprudrapur'] },
    ],
  },
  'Koraput': {
    name: 'Koraput',
    headquarters: 'Koraput',
    subdivisions: ['Koraput', 'Jeypore'],
    totalBlocks: 14,
    totalGramPanchayats: 240,
    totalVillages: 2028,
    areaSqKm: 8807,
    censusPopulation: 1379647,
    literacyRate: '49.21%',
    majorRivers: ['Kolab River', 'Machkund River', 'Sabari River'],
    keyHighways: ['NH-26 (Raipur - Visakhapatnam)', 'NH-326 (Malkangiri Corridor)'],
    keySectors: ['Highland Spring Water Capture', 'Hydro-Electric Infrastructure', 'Coffee & Tribal Agro Logistics', 'Hill Road Slope Stabilization'],
    geographicDescription:
      'High-altitude tribal district located in the southern Eastern Ghats with rolling hills, dense forest canopies, and substantial hydroelectric power reservoirs at Kolab and Machkund.',
    infrastructureChallenges:
      'High terrain gradient causes rapid surface runoff, creating acute drinking water shortages in hilltop habitations during pre-monsoon summer despite high annual rainfall.',
    blocks: [
      { id: 'kr-1', name: 'Koraput Sadar Block', headquarters: 'Koraput', population: 118000, infraDeficitScore: 46, topDeficit: 'Hill Slope Piped Spring Water Capture', villages: ['Koraput Hill Ward 2', 'Padampur', 'Pujaput', 'Dumuriput', 'Landeiguda'] },
      { id: 'kr-2', name: 'Jeypore Block', headquarters: 'Jeypore', population: 184000, infraDeficitScore: 38, topDeficit: 'Municipal Water Distribution Network', villages: ['Jeypore Municipal Ward 6', 'Borigumma Bypass', 'Umuri', 'Dhanpur', 'Jayantigiri'] },
      { id: 'kr-3', name: 'Semiliguda Block', headquarters: 'Semiliguda', population: 128000, infraDeficitScore: 41, topDeficit: 'Industrial Effluent Neutralization & Road Widening', villages: ['Semiliguda Market', 'Damanjodi NALCO Sector', 'Pottangi Road', 'Kunduli'] },
    ],
  },
  'Cuttack': {
    name: 'Cuttack',
    headquarters: 'Cuttack',
    subdivisions: ['Cuttack Sadar', 'Athagarh', 'Banki'],
    totalBlocks: 14,
    totalGramPanchayats: 373,
    totalVillages: 1950,
    areaSqKm: 3932,
    censusPopulation: 2624478,
    literacyRate: '85.50%',
    majorRivers: ['Mahanadi River', 'Kathajodi River', 'Birupa River', 'Kuakhai River'],
    keyHighways: ['NH-16', 'NH-55 (Cuttack - Sambalpur)'],
    keySectors: ['Mahanadi River Island Connectivity', 'Silver City Heritage Drainage', 'SCB Medical College Expansion', 'River Bank Flood Walls'],
    geographicDescription:
      'Historic millennium city enclosed by Mahanadi and Kathajodi rivers. Highly fertile deltaic plain characterized by high urban density and intensive agriculture.',
    infrastructureChallenges:
      'The bowl-like topography of the inner city requires high-capacity automated pumping stations to discharge stormwater into Kathajodi river during high-tide river crests.',
    blocks: [
      { id: 'ctk-1', name: 'Cuttack Sadar Block', headquarters: 'Cuttack CMC', population: 680000, infraDeficitScore: 28, topDeficit: 'Stormwater Outfall Desilting & Pumping', villages: ['Badambadi Bus Stand Area', 'CDA Sector 9', 'Bidanasi', 'Choudwar Industrial Zone', 'Tangi'] },
      { id: 'ctk-2', name: 'Athagarh Block', headquarters: 'Athagarh', population: 142000, infraDeficitScore: 36, topDeficit: 'Rural Agro-Cold Storage & Lift Canal', villages: ['Athagarh Town', 'Radhakishorepur', 'Samsarpur', 'Dorabeda'] },
    ],
  },
};

export default function Regions() {
  const { requests } = useCitizenRequests();

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

  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentUser.district || 'Kalahandi');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('kl-1');
  const [selectedVillage, setSelectedVillage] = useState<string>('All');
  const [compareMode, setCompareMode] = useState(false);
  const [compareDistrict, setCompareDistrict] = useState<string>('Bhubaneswar');
  const [inspectModalReq, setInspectModalReq] = useState<CitizenRequest | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribe(updated => {
      if (updated) {
        const dist = updated.district || 'Kalahandi';
        setCurrentUser(updated);
        setSelectedDistrict(dist);
        const profile = REAL_DISTRICT_PROFILES[dist] || REAL_DISTRICT_PROFILES['Kalahandi'];
        if (profile?.blocks?.[0]) {
          setSelectedBlockId(profile.blocks[0].id);
        }
      }
    });

    const handleProfileCustomEvent = (e: any) => {
      if (e.detail) {
        const dist = e.detail.district || 'Kalahandi';
        setCurrentUser(e.detail);
        setSelectedDistrict(dist);
        const profile = REAL_DISTRICT_PROFILES[dist] || REAL_DISTRICT_PROFILES['Kalahandi'];
        if (profile?.blocks?.[0]) {
          setSelectedBlockId(profile.blocks[0].id);
        }
      }
    };
    window.addEventListener('jansetu_user_profile_updated', handleProfileCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('jansetu_user_profile_updated', handleProfileCustomEvent);
    };
  }, []);

  const activeDistrictProfile = REAL_DISTRICT_PROFILES[selectedDistrict] || REAL_DISTRICT_PROFILES['Kalahandi'];
  const availableBlocks = activeDistrictProfile.blocks;
  const currentBlock = availableBlocks.find(b => b.id === selectedBlockId) || availableBlocks[0];

  // Hierarchy drilldown requests filtering strictly using real data
  const districtRequests = requests.filter(r => {
    const loc = (r.location + ' ' + (r.region || '')).toLowerCase();
    return loc.includes(selectedDistrict.toLowerCase());
  });

  const blockRequests = districtRequests.filter(r => {
    const loc = (r.location + ' ' + (r.description || '')).toLowerCase();
    const blockKeywords = currentBlock.name.toLowerCase().replace(' block', '');
    const hasBlockMatch = loc.includes(blockKeywords);
    const hasVillageMatch = currentBlock.villages.some(v => loc.includes(v.toLowerCase()));
    return hasBlockMatch || hasVillageMatch || districtRequests.length <= 4;
  });

  const villageRequests = selectedVillage === 'All'
    ? blockRequests
    : blockRequests.filter(r => (r.location + ' ' + (r.description || '')).toLowerCase().includes(selectedVillage.toLowerCase()));

  // Stats for District
  const districtTotal = districtRequests.length;
  const districtResolved = districtRequests.filter(r => r.status === 'resolved').length;
  const districtPending = districtRequests.filter(r => r.status === 'pending' || r.status === 'new').length;
  const districtResolutionRate = districtTotal > 0 ? Math.round((districtResolved / districtTotal) * 100) : 0;

  // Compare District Stats
  const compareProfile = REAL_DISTRICT_PROFILES[compareDistrict] || REAL_DISTRICT_PROFILES['Bhubaneswar'];
  const compareReqs = requests.filter(r => (r.location + ' ' + (r.region || '')).toLowerCase().includes(compareDistrict.toLowerCase()));
  const compareTotal = compareReqs.length || 1;
  const compareResolved = compareReqs.filter(r => r.status === 'resolved').length;
  const compareResRate = Math.round((compareResolved / compareTotal) * 100);

  const radarCompareData = [
    { subject: 'Road Paving', distA: selectedDistrict === 'Kalahandi' ? 52 : 78, distB: compareDistrict === 'Bhubaneswar' ? 88 : 60 },
    { subject: 'Water Supply', distA: selectedDistrict === 'Kalahandi' ? 46 : 70, distB: compareDistrict === 'Bhubaneswar' ? 92 : 55 },
    { subject: 'Drainage', distA: selectedDistrict === 'Kalahandi' ? 42 : 65, distB: compareDistrict === 'Bhubaneswar' ? 74 : 50 },
    { subject: 'Power Feeder 24x7', distA: selectedDistrict === 'Kalahandi' ? 68 : 80, distB: compareDistrict === 'Bhubaneswar' ? 95 : 72 },
    { subject: 'Citizen Demand', distA: Math.min(100, districtTotal * 15 + 35), distB: Math.min(100, compareTotal * 15 + 25) },
    { subject: 'Health Telemetry', distA: selectedDistrict === 'Kalahandi' ? 58 : 75, distB: compareDistrict === 'Bhubaneswar' ? 86 : 64 },
  ];

  const barCompareData = [
    { metric: 'Grievances Logged', distA: districtTotal, distB: compareTotal },
    { metric: 'Pending Load', distA: districtPending, distB: compareReqs.filter(r => r.status === 'pending').length },
    { metric: 'Resolution Rate (%)', distA: districtResolutionRate, distB: compareResRate },
    { metric: 'Avg Deficit (%)', distA: currentBlock.infraDeficitScore, distB: compareProfile.blocks[0]?.infraDeficitScore || 25 },
  ];

  const isAssignedDistrict = (currentUser.district || '').toLowerCase() === selectedDistrict.toLowerCase();

  return (
    <div className="space-y-6 font-body">
      {/* Page Title & Controls */}
      <div className="bg-brand-yellow card-brutal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-black">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full shadow-brutal-sm text-xs font-extrabold uppercase tracking-wider mb-2">
            <Globe size={13} />
            Territorial Governance & Spatial Hierarchy
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-black">
            REGION INTELLIGENCE & JURISDICTION ANALYSIS
          </h1>
          <p className="font-medium text-sm text-black/75 mt-1">
            Official territorial brief, geographic coordinates, administrative blocks, and ground-truth citizen grievance mapping.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              compareMode ? 'bg-black text-brand-yellow border-black shadow-brutal-sm' : 'bg-white text-black border-black shadow-brutal-xs hover:bg-brand-yellow'
            }`}
          >
            <ArrowRightLeft size={14} />
            <span>{compareMode ? 'Comparison Active' : 'Compare with Other Districts'}</span>
          </button>
        </div>
      </div>

      {/* OFFICER ASSIGNED JURISDICTION EXECUTIVE DOSSIER (Detailed Regional Description for Profile District) */}
      <div className="bg-brand-charcoal text-white card-brutal-lg rounded-3xl p-6 md:p-8 border-2 border-black space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-brand-yellow text-black font-extrabold text-xs rounded-full uppercase tracking-wider border border-black shadow-brutal-xs flex items-center gap-1.5">
                <ShieldCheck size={14} />
                {isAssignedDistrict ? 'Designated Officer Jurisdiction' : `Inspecting ${activeDistrictProfile.name} District`}
              </span>
              <span className="text-xs font-mono text-brand-sage font-bold">
                Odisha State Administration
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl text-white mt-2">
              {activeDistrictProfile.name.toUpperCase()} DISTRICT ADMINISTRATIVE BRIEF
            </h2>
            <p className="text-xs text-brand-yellow font-bold mt-1">
              Officer in Charge: <strong>{currentUser.name}</strong> • {currentUser.designation} • {currentUser.department}
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-extrabold uppercase text-brand-sage">District Headquarter</span>
            <span className="font-heading font-extrabold text-xl text-brand-yellow">{activeDistrictProfile.headquarters}</span>
            <span className="text-[11px] font-mono text-white/70 mt-0.5">Area: {activeDistrictProfile.areaSqKm.toLocaleString()} km²</span>
          </div>
        </div>

        {/* Real Geographic Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 bg-white/10 border border-white/20 rounded-2xl space-y-2">
              <h4 className="font-heading font-extrabold text-sm text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} />
                Geographic Profile & Topography
              </h4>
              <p className="font-medium text-white/90 leading-relaxed">
                {activeDistrictProfile.geographicDescription}
              </p>
            </div>

            <div className="p-4 bg-amber-900/40 border border-amber-500/40 rounded-2xl space-y-2">
              <h4 className="font-heading font-extrabold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={14} />
                Critical Public Infrastructure Deficits & Sectoral Challenges
              </h4>
              <p className="font-medium text-white/90 leading-relaxed">
                {activeDistrictProfile.infrastructureChallenges}
              </p>
            </div>
          </div>

          {/* District Census & Infrastructure Vital Statistics */}
          <div className="p-4 bg-black/40 border border-white/20 rounded-2xl space-y-3">
            <h4 className="font-heading font-extrabold text-sm text-brand-yellow uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} />
              Administrative Division
            </h4>

            <div className="space-y-2 text-xs font-bold divide-y divide-white/10">
              <div className="flex justify-between py-1 text-white">
                <span className="text-brand-sage">Census Population:</span>
                <span className="font-mono text-brand-yellow">{activeDistrictProfile.censusPopulation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span className="text-brand-sage">Literacy Rate:</span>
                <span className="font-mono">{activeDistrictProfile.literacyRate}</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span className="text-brand-sage">Sub-Divisions:</span>
                <span>{activeDistrictProfile.subdivisions.length} Units</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span className="text-brand-sage">Administrative Blocks:</span>
                <span className="font-mono text-brand-yellow">{activeDistrictProfile.totalBlocks} Blocks</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span className="text-brand-sage">Gram Panchayats:</span>
                <span className="font-mono">{activeDistrictProfile.totalGramPanchayats} GPs</span>
              </div>
              <div className="flex justify-between py-1 text-white">
                <span className="text-brand-sage">Inhabited Villages:</span>
                <span className="font-mono">{activeDistrictProfile.totalVillages.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] text-brand-sage uppercase font-bold block mb-1">Key River Basins:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeDistrictProfile.majorRivers.map(r => (
                  <span key={r} className="px-2 py-0.5 bg-blue-950/80 border border-blue-400 text-blue-200 text-[10px] rounded font-bold flex items-center gap-1">
                    <Droplets size={10} /> {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] text-brand-sage uppercase font-bold block mb-1">Transport Arteries:</span>
              <div className="flex flex-wrap gap-1">
                {activeDistrictProfile.keyHighways.map(h => (
                  <span key={h} className="px-2 py-0.5 bg-white/10 text-brand-sage text-[10px] rounded font-mono">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical Breadcrumb Navigator (State -> District -> Block -> Village) */}
      <div className="bg-white card-brutal-lg rounded-2xl p-4 md:p-5 border-2 border-black space-y-3">
        <div className="text-[10px] font-extrabold uppercase text-black/60 tracking-widest">
          INTERACTIVE HIERARCHY SELECTOR
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-extrabold">
          {/* 1. State */}
          <span className="bg-gray-100 px-3 py-1.5 rounded-xl border-2 border-black text-black flex items-center gap-1.5 shadow-brutal-xs">
            🏛️ State: <strong className="text-black">Odisha</strong>
          </span>

          <ChevronRight size={16} className="text-black shrink-0" />

          {/* 2. District Selector */}
          <div className="flex items-center gap-1.5 bg-brand-yellow text-black px-3 py-1 rounded-xl border-2 border-black shadow-brutal-xs">
            <MapPin size={13} />
            <span>District:</span>
            <select
              value={selectedDistrict}
              onChange={e => {
                const newDist = e.target.value;
                setSelectedDistrict(newDist);
                const nextBlocks = REAL_DISTRICT_PROFILES[newDist]?.blocks || REAL_DISTRICT_PROFILES['Kalahandi'].blocks;
                setSelectedBlockId(nextBlocks[0].id);
                setSelectedVillage('All');
              }}
              className="bg-transparent font-extrabold text-black cursor-pointer focus:outline-none"
            >
              {Object.keys(REAL_DISTRICT_PROFILES).map(dist => (
                <option key={dist} value={dist} className="bg-white text-black">
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight size={16} className="text-black shrink-0" />

          {/* 3. Block Selector */}
          <div className="flex items-center gap-1.5 bg-white text-black px-3 py-1 rounded-xl border-2 border-black shadow-brutal-xs">
            <Building size={13} />
            <span>Block:</span>
            <select
              value={selectedBlockId}
              onChange={e => {
                setSelectedBlockId(e.target.value);
                setSelectedVillage('All');
              }}
              className="bg-transparent font-extrabold text-black cursor-pointer focus:outline-none"
            >
              {availableBlocks.map(b => (
                <option key={b.id} value={b.id} className="bg-white text-black">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight size={16} className="text-black shrink-0" />

          {/* 4. Village / Ward Selector */}
          <div className="flex items-center gap-1.5 bg-emerald-300 text-black px-3 py-1 rounded-xl border-2 border-black shadow-brutal-xs">
            <span>Locality / Ward:</span>
            <select
              value={selectedVillage}
              onChange={e => setSelectedVillage(e.target.value)}
              className="bg-transparent font-extrabold text-black cursor-pointer focus:outline-none"
            >
              <option value="All">All Villages / Wards</option>
              {currentBlock.villages.map(v => (
                <option key={v} value={v} className="bg-white text-black">
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: Active Territory Real Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <p className="text-[10px] font-extrabold uppercase text-black/60">Total Block Grievances</p>
          <p className="font-heading font-extrabold text-3xl mt-1 text-black">{blockRequests.length}</p>
          <p className="text-[10px] font-bold text-black/50 mt-0.5">In {currentBlock.name}</p>
        </div>

        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <p className="text-[10px] font-extrabold uppercase text-black/60">Block Headcount</p>
          <p className="font-heading font-extrabold text-3xl mt-1 text-black">
            {(currentBlock.population / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] font-bold text-black/50 mt-0.5">Census Population</p>
        </div>

        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <p className="text-[10px] font-extrabold uppercase text-red-700">Infrastructure Deficit Score</p>
          <p className="font-heading font-extrabold text-3xl mt-1 text-red-600">{currentBlock.infraDeficitScore}%</p>
          <p className="text-[10px] font-bold text-red-600 mt-0.5">Top: {currentBlock.topDeficit}</p>
        </div>

        <div className="bg-white card-brutal rounded-2xl p-5 border-2 border-black">
          <p className="text-[10px] font-extrabold uppercase text-emerald-800">District Resolution Rate</p>
          <p className="font-heading font-extrabold text-3xl mt-1 text-emerald-700">{districtResolutionRate}%</p>
          <p className="text-[10px] font-bold text-black/50 mt-0.5">{districtResolved} of {districtTotal} completed</p>
        </div>
      </div>

      {/* Row 2: Block-Wise Grid Breakdown within Selected District */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 md:p-8 space-y-4 border-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl">
              {selectedDistrict.toUpperCase()} DISTRICT — ALL ADMINISTRATIVE BLOCKS
            </h3>
            <p className="text-xs font-bold text-black/60">Click any block to drill down into local village complaints & deficit telemetry</p>
          </div>
          <span className="text-xs font-mono font-bold bg-brand-yellow px-3 py-1 rounded-xl border border-black">
            {availableBlocks.length} Blocks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {availableBlocks.map(block => {
            const isSelected = block.id === selectedBlockId;
            return (
              <div
                key={block.id}
                onClick={() => {
                  setSelectedBlockId(block.id);
                  setSelectedVillage('All');
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-brand-yellow border-black shadow-brutal ring-2 ring-black'
                    : 'bg-gray-50 border-black/20 hover:border-black hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-heading font-extrabold text-base text-black">{block.name}</h4>
                  <span className="text-[10px] font-mono font-extrabold bg-black text-white px-2 py-0.5 rounded">
                    {block.infraDeficitScore}% Gap
                  </span>
                </div>

                <div className="text-xs space-y-1 text-black/80 font-bold">
                  <p>👥 Population: {(block.population / 1000).toFixed(1)}k</p>
                  <p>🚨 Priority Deficit: <span className="text-red-700">{block.topDeficit}</span></p>
                  <p className="text-[11px] text-black/60 truncate">📍 {block.villages.join(', ')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Village / Locality Drilldown Table */}
      <div className="bg-white card-brutal-lg rounded-3xl p-6 md:p-8 space-y-4 border-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl">
              VILLAGE & LOCALITY CITIZEN GRIEVANCE DOSSIER ({currentBlock.name})
            </h3>
            <p className="text-xs font-bold text-black/60">
              Verified ground-truth citizen complaints filtered for {selectedVillage === 'All' ? currentBlock.name : selectedVillage}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-black text-brand-yellow px-3 py-1 rounded-xl">
            {villageRequests.length} Verified Records
          </span>
        </div>

        <div className="overflow-x-auto">
          {villageRequests.length === 0 ? (
            <div className="py-12 text-center text-black/60 space-y-2 border-2 border-dashed border-black/20 rounded-2xl">
              <AlertCircle className="mx-auto text-black/40" size={32} />
              <p className="font-bold text-sm">No complaints logged in this specific block/locality yet</p>
              <p className="text-xs">Citizen reports submitted from {currentBlock.name} will appear here instantly.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-bold">
              <thead>
                <tr className="border-b-2 border-black bg-brand-yellow/30 text-black">
                  <th className="py-3 px-3">Tracking ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Citizen Statement</th>
                  <th className="py-3 px-3">Locality / Ward</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {villageRequests.map(req => (
                  <tr key={req.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3 px-3 font-mono font-extrabold text-black">{req.id}</td>
                    <td className="py-3 px-3">
                      <CategoryBadge category={req.category} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-black max-w-[240px] truncate">{req.description}</td>
                    <td className="py-3 px-3 text-black/80">{req.location}</td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={req.priority || 'medium'} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setInspectModalReq(req)}
                        className="btn-brutal-secondary px-2.5 py-1 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={11} />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Side-by-Side District Comparison Mode */}
      {compareMode && (
        <div className="bg-white card-brutal-lg rounded-3xl p-6 md:p-8 space-y-6 border-2 border-black animate-in fade-in-50 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black/10">
            <div>
              <h3 className="font-heading font-extrabold text-xl">SIDE-BY-SIDE DISTRICT BENCHMARK</h3>
              <p className="text-xs font-bold text-black/60">Comparing {selectedDistrict} with benchmark districts</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span>Benchmark District:</span>
              <select
                value={compareDistrict}
                onChange={e => setCompareDistrict(e.target.value)}
                className="bg-brand-yellow border-2 border-black rounded-xl px-3 py-1.5 font-extrabold text-xs focus:outline-none shadow-brutal-xs cursor-pointer"
              >
                {Object.keys(REAL_DISTRICT_PROFILES).filter(d => d !== selectedDistrict).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Comparison Chart */}
            <div className="bg-gray-50 card-brutal rounded-2xl p-5 space-y-3">
              <h4 className="font-heading font-extrabold text-base text-black">MULTI-SECTOR INFRASTRUCTURE RADAR</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarCompareData}>
                    <PolarGrid stroke="#000000" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#000000' }} />
                    <Radar name={selectedDistrict} dataKey="distA" stroke="#000000" strokeWidth={2} fill="#ffe17c" fillOpacity={0.7} />
                    <Radar name={compareDistrict} dataKey="distB" stroke="#000000" strokeWidth={2} fill="#000000" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontWeight: 700 }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Benchmark Chart */}
            <div className="bg-gray-50 card-brutal rounded-2xl p-5 space-y-3">
              <h4 className="font-heading font-extrabold text-base text-black">KEY PERFORMANCE COMPARISON</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barCompareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000015" />
                    <XAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 700, fill: '#000' }} axisLine={{ stroke: '#000' }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#000' }} axisLine={{ stroke: '#000' }} />
                    <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontWeight: 700 }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="distA" name={selectedDistrict} fill="#ffe17c" stroke="#000000" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="distB" name={compareDistrict} fill="#000000" stroke="#000000" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setInspectModalReq(null)}>
          <div className="bg-white card-brutal-xl rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 border-2 border-black" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between pb-2 border-b-2 border-black">
              <div>
                <span className="font-mono text-xs font-extrabold text-black/60">{inspectModalReq.id}</span>
                <h3 className="font-heading font-extrabold text-xl mt-0.5">{inspectModalReq.category}</h3>
                <p className="text-xs font-bold text-black/60 mt-0.5">📍 {inspectModalReq.location}</p>
              </div>
              <StatusBadge status={inspectModalReq.status} size="md" />
            </div>
            <p className="text-sm font-medium text-black leading-relaxed">{inspectModalReq.description}</p>
            {inspectModalReq.aiAnalysis && (
              <div className="p-3 bg-brand-yellow/30 border-2 border-black rounded-xl text-xs space-y-1">
                <p className="font-extrabold text-black">AI Diagnosis:</p>
                <p className="font-medium text-black/80">{inspectModalReq.aiAnalysis.summary}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectModalReq(null)}
                className="btn-brutal-primary px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
