import {
  MOCK_REGIONS,
  MOCK_HOTSPOTS,
} from '../data/mockData';
import { requestService } from './requestService';
import type { Region, Hotspot, CitizenRequest, Category } from '../types';

const CATEGORY_LIST: Category[] = [
  'Roads',
  'Water',
  'Drainage',
  'Streetlights',
  'Electricity',
  'Public Transport',
  'Schools & Hospitals',
  'Sanitation',
  'Digital Infrastructure',
  'Other Development',
];

export const analyticsService = {
  getRegions(customRequests?: CitizenRequest[]): Region[] {
    const reqs = customRequests || requestService.getAll();
    return MOCK_REGIONS.map(reg => {
      const matchingReqs = reqs.filter(r =>
        r.location.toLowerCase().includes(reg.name.toLowerCase())
      );
      const reqCount = matchingReqs.length;
      return {
        ...reg,
        requestCount: reqCount > 0 ? reqCount : reg.requestCount,
        citizenDemand: reqCount > 0 ? Math.min(100, Math.round((reqCount / (reqs.length || 1)) * 100 + 30)) : reg.citizenDemand,
      };
    });
  },

  getRegionById(id: string, customRequests?: CitizenRequest[]): Region | undefined {
    return this.getRegions(customRequests).find(r => r.id === id);
  },

  getRegionsByCountry(country: string, customRequests?: CitizenRequest[]): Region[] {
    const all = this.getRegions(customRequests);
    if (country === 'All') return all;
    return all.filter(r => r.country === country);
  },

  getOverviewStats(customRequests?: CitizenRequest[]) {
    const reqs = customRequests || requestService.getAll();
    const total = reqs.length;
    const pending = reqs.filter(r => r.status === 'pending').length;
    const inProgress = reqs.filter(r => r.status === 'in_progress' || r.status === 'under_review').length;
    const resolved = reqs.filter(r => r.status === 'resolved').length;
    const highPriority = reqs.filter(
      r => r.priority === 'high' || r.aiAnalysis?.severity === 'critical' || r.aiAnalysis?.severity === 'high'
    ).length;

    const serviceLevelRate = total > 0
      ? Math.min(100, Math.round(((resolved + inProgress * 0.5) / total) * 100))
      : 100;

    const citizensBenefited = reqs.reduce((sum, r) => sum + (r.affectedCount || 0), 0);
    const feedbackRating = total > 0 ? (4.2 + (resolved / total) * 0.7).toFixed(1) : '5.0';

    return {
      totalRequests: total,
      pendingRequests: pending,
      inProgressRequests: inProgress,
      resolvedRequests: resolved,
      highPriorityRequests: highPriority,
      highPriorityAreas: Math.max(1, highPriority),
      infrastructureGap: Math.max(10, Math.round((pending / (total || 1)) * 100)),
      serviceLevelRate,
      feedbackRating,
      citizensBenefited: citizensBenefited > 0 ? citizensBenefited : 24580,
      projectsCompleted: 36,
    };
  },

  getRequestsOverTime(customRequests?: CitizenRequest[]) {
    const reqs = customRequests || requestService.getAll();
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];

    return months.map((m, idx) => {
      // Scale based on real requests proportion
      const multiplier = (idx + 1) / months.length;
      const totalForMonth = Math.round(reqs.length * multiplier) || reqs.length;
      const inProg = Math.round(totalForMonth * 0.35);
      const res = Math.round(totalForMonth * 0.45);
      return {
        month: m,
        requests: totalForMonth,
        inProgress: inProg,
        resolved: res,
      };
    });
  },

  getByCategory(customRequests?: CitizenRequest[]) {
    const reqs = customRequests || requestService.getAll();
    const total = reqs.length;

    const counts: Record<string, number> = {};
    reqs.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    const list = CATEGORY_LIST.map(category => {
      const count = counts[category] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        category,
        count,
        percentage,
      };
    });

    // Sort by count descending
    return list.sort((a, b) => b.count - a.count);
  },

  getSeverityDistribution(customRequests?: CitizenRequest[]) {
    const reqs = customRequests || requestService.getAll();
    const total = reqs.length || 1;
    const critical = reqs.filter(r => r.aiAnalysis?.severity === 'critical').length;
    const high = reqs.filter(r => r.aiAnalysis?.severity === 'high').length;
    const medium = reqs.filter(r => r.aiAnalysis?.severity === 'medium').length;
    const low = reqs.filter(r => r.aiAnalysis?.severity === 'low').length;

    return [
      { level: 'Critical', count: critical, percentage: Math.round((critical / total) * 100) },
      { level: 'High Priority', count: high, percentage: Math.round((high / total) * 100) },
      { level: 'Medium', count: medium, percentage: Math.round((medium / total) * 100) },
      { level: 'Low / Minor', count: low, percentage: Math.round((low / total) * 100) },
    ];
  },

  getHotspots(customRequests?: CitizenRequest[]): Hotspot[] {
    const reqs = customRequests || requestService.getAll();
    if (reqs.length === 0) return MOCK_HOTSPOTS;

    const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
      'Kalahandi': { lat: 19.904, lng: 82.802 },
      'Bhubaneswar': { lat: 20.296, lng: 85.824 },
      'Cuttack': { lat: 20.462, lng: 85.882 },
      'Koraput': { lat: 18.813, lng: 82.711 },
      'Malkangiri': { lat: 18.351, lng: 81.897 },
      'Rayagada': { lat: 19.167, lng: 83.417 },
      'Nuapada': { lat: 20.833, lng: 82.533 },
      'Sambalpur': { lat: 21.467, lng: 83.983 },
      'Puri': { lat: 19.813, lng: 85.831 },
      'Balasore': { lat: 21.493, lng: 86.933 },
      'Ganjam': { lat: 19.380, lng: 85.050 },
      'Mayurbhanj': { lat: 21.930, lng: 86.720 },
    };

    // Group real requests by region + category
    const clusterGroups: Record<string, CitizenRequest[]> = {};
    reqs.forEach(r => {
      const reg = r.region || r.location.split(',')[0].trim() || 'Kalahandi';
      const cat = r.category || 'Roads';
      const key = `${reg}:::${cat}`;
      if (!clusterGroups[key]) clusterGroups[key] = [];
      clusterGroups[key].push(r);
    });

    const computedHotspots: Hotspot[] = Object.entries(clusterGroups).map(([key, items], index) => {
      const [region, category] = key.split(':::') as [string, Category];
      const count = items.length;
      const affected = items.reduce((sum, i) => sum + (i.affectedCount || 3500), 0);
      const isCritical = items.some(i => i.aiAnalysis?.severity === 'critical' || i.aiAnalysis?.severity === 'high' || i.priority === 'high');
      
      const coords = DISTRICT_COORDS[region] || { lat: 19.9 + (index * 0.15), lng: 82.8 + (index * 0.2) };
      const aiSummary = items[0]?.aiAnalysis?.summary || `AI detected ${count} correlated ${category.toLowerCase()} grievances within ${region} jurisdiction.`;

      return {
        id: `HOTSPOT-${index + 1}`,
        name: `${region} ${category} Hotspot`,
        region,
        category,
        requestCount: count,
        affectedPopulation: affected > 0 ? affected : count * 2800,
        priority: isCritical || count >= 2 ? 'high' : 'medium',
        lat: items[0]?.coordinates?.lat || coords.lat,
        lng: items[0]?.coordinates?.lng || coords.lng,
        radius: Math.min(5000, 1500 + count * 600),
        severityScore: isCritical ? 92 : Math.min(88, 65 + count * 5),
        trend: '+24% concentration this month',
        summary: `${aiSummary} Direct feedback from ${count} citizens indicates infrastructure deficit affecting estimated ${affected.toLocaleString()} residents.`,
      };
    });

    return computedHotspots.length > 0 ? computedHotspots : MOCK_HOTSPOTS;
  },

  getHotspotById(id: string, customRequests?: CitizenRequest[]): Hotspot | undefined {
    return this.getHotspots(customRequests).find(h => h.id === id);
  },

  getCountries(): string[] {
    const set = new Set(MOCK_REGIONS.map(r => r.country));
    return ['All', ...Array.from(set)];
  },
};
