import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  CATEGORY_DEPARTMENT_MAP,
} from '../types';
import type {
  CitizenRequest,
  Category,
  RequestStatus,
  AIAnalysis,
  OfficialResponse,
  PriorityLevel,
  RequestLocation,
  User,
} from '../types';
import { MOCK_REQUESTS } from '../data/mockData';

const STORAGE_KEY = 'jansetu_requests_store';
type RequestListener = (requests: CitizenRequest[]) => void;

const listeners: Set<RequestListener> = new Set();
let isFirestoreListenerActive = false;

function validCoordinates(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== 'object') return false;
  const point = value as { lat?: unknown; lng?: unknown };
  return typeof point.lat === 'number' && Number.isFinite(point.lat) && point.lat >= -90 && point.lat <= 90 &&
    typeof point.lng === 'number' && Number.isFinite(point.lng) && point.lng >= -180 && point.lng <= 180;
}

function validLocationDetails(value: unknown): value is RequestLocation {
  if (!value || typeof value !== 'object') return false;
  const location = value as Partial<RequestLocation>;
  return typeof location.latitude === 'number' && Number.isFinite(location.latitude) &&
    location.latitude >= -90 && location.latitude <= 90 &&
    typeof location.longitude === 'number' && Number.isFinite(location.longitude) &&
    location.longitude >= -180 && location.longitude <= 180 &&
    typeof location.address === 'string' && location.address.trim().length > 0;
}

function normalizeRequest(req: any): CitizenRequest {
  const category = (req.category || 'Roads') as Category;
  const dept = req.department || CATEGORY_DEPARTMENT_MAP[category] || 'Public Works Department (PWD)';
  const locationDetails = validLocationDetails(req.locationDetails)
    ? req.locationDetails
    : validLocationDetails(req.location) ? req.location : undefined;
  const location = typeof req.location === 'string'
    ? req.location
    : locationDetails?.address || 'Location not provided';
  const region = req.region || location.split(',')[0].trim() || 'Kalahandi';

  return {
    ...req,
    category,
    location,
    department: dept,
    region,
    status: req.status || 'pending',
    coordinates: validCoordinates(req.coordinates)
      ? req.coordinates
      : locationDetails ? { lat: locationDetails.latitude, lng: locationDetails.longitude } : undefined,
    locationDetails,
  };
}

function loadRequestsFromLocal(): CitizenRequest[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initialized = MOCK_REQUESTS.map(normalizeRequest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialized));
    return initialized;
  }
  try {
    const parsed = JSON.parse(raw) as CitizenRequest[];
    return parsed.map(normalizeRequest);
  } catch {
    return MOCK_REQUESTS.map(normalizeRequest);
  }
}

function saveRequestsToLocal(requests: CitizenRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

let inMemoryRequests: CitizenRequest[] = loadRequestsFromLocal();

function notifyListeners() {
  const current = [...inMemoryRequests];
  listeners.forEach(listener => {
    try {
      listener(current);
    } catch (e) {
      console.error('Error in request listener:', e);
    }
  });
}

export const requestService = {
  /**
   * Check if a government officer is senior (District / Regional / State scope)
   */
  isSeniorOfficer(user?: User | null): boolean {
    if (!user) return false;
    const des = (user.designation || user.organization || '').toLowerCase();
    return (
      des.includes('executive') ||
      des.includes('superintending') ||
      des.includes('director') ||
      des.includes('magistrate') ||
      des.includes('collector') ||
      des.includes('chief') ||
      des.includes('head') ||
      des.includes('admin') ||
      des.includes('mp')
    );
  },

  /**
   * Initializes real-time Firestore listener to keep Citizen and Government portals in sync.
   */
  initFirestoreListener(): void {
    if (isFirestoreListenerActive || !isFirebaseConfigured) return;
    isFirestoreListenerActive = true;

    try {
      const colRef = collection(db, 'requests');
      onSnapshot(
        colRef,
        snapshot => {
          if (!snapshot.empty) {
            const firestoreList: CitizenRequest[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as CitizenRequest;
              firestoreList.push(
                normalizeRequest({
                  ...data,
                  id: docSnap.id || data.id,
                })
              );
            });

            // Sort by createdAt descending
            firestoreList.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );

            inMemoryRequests = firestoreList;
            saveRequestsToLocal(firestoreList);
            notifyListeners();
          } else {
            // Seed Firestore with initial requests if empty
            const localData = loadRequestsFromLocal();
            localData.forEach(async req => {
              try {
                await setDoc(doc(db, 'requests', req.id), req, { merge: true });
              } catch {
                // Ignore seed error
              }
            });
          }
        },
        error => {
          console.warn('Firestore real-time listener error, falling back to local cache:', error);
        }
      );
    } catch (err) {
      console.warn('Could not attach Firestore onSnapshot listener:', err);
    }
  },

  /**
   * Asynchronously fetch all requests from Firestore
   */
  async fetchAllFromFirestore(): Promise<CitizenRequest[]> {
    if (!isFirebaseConfigured) {
      return inMemoryRequests;
    }
    try {
      const colRef = collection(db, 'requests');
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 3000)
      );
      const snapshotPromise = getDocs(colRef);
      const snapshot = (await Promise.race([snapshotPromise, timeoutPromise])) as any;

      if (snapshot && !snapshot.empty) {
        const firestoreList: CitizenRequest[] = [];
        snapshot.forEach((docSnap: any) => {
          const data = docSnap.data() as CitizenRequest;
          firestoreList.push(
            normalizeRequest({
              ...data,
              id: docSnap.id || data.id,
            })
          );
        });

        firestoreList.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        inMemoryRequests = firestoreList;
        saveRequestsToLocal(firestoreList);
        notifyListeners();
        return firestoreList;
      }
    } catch (err) {
      console.warn('Firestore fetch failed or timed out:', err);
    }
    return inMemoryRequests;
  },

  /**
   * Subscribe to real-time request updates
   */
  subscribe(listener: RequestListener): () => void {
    listeners.add(listener);
    this.initFirestoreListener();
    listener([...inMemoryRequests]);
    return () => {
      listeners.delete(listener);
    };
  },

  getAll(): CitizenRequest[] {
    this.initFirestoreListener();
    return [...inMemoryRequests];
  },

  getByUserId(userId: string): CitizenRequest[] {
    this.initFirestoreListener();
    return inMemoryRequests.filter(r => r.userId === userId);
  },

  getById(id: string): CitizenRequest | undefined {
    return inMemoryRequests.find(r => r.id === id);
  },

  /**
   * Get requests specifically assigned or targeted to a specific Government Officer
   */
  getByOfficer(officer?: User | null): CitizenRequest[] {
    this.initFirestoreListener();
    if (!officer) return inMemoryRequests;

    const officerDept = officer.department?.toLowerCase();
    const officerDistrict = officer.district?.toLowerCase();

    return inMemoryRequests.filter(req => {
      // 1. Explicitly assigned to this officer
      if (req.assignedOfficerId === officer.id || req.assignedOfficerName === officer.name) {
        return true;
      }

      // 2. Department match
      const reqDept = (req.department || CATEGORY_DEPARTMENT_MAP[req.category] || '').toLowerCase();
      const matchesDept = !officerDept || reqDept.includes(officerDept) || officerDept.includes(reqDept);

      // 3. District / Region match
      const reqLoc = (req.location + ' ' + (req.region || '')).toLowerCase();
      const matchesRegion = !officerDistrict || officerDistrict === 'all districts' || reqLoc.includes(officerDistrict);

      return matchesDept && matchesRegion;
    });
  },

  /**
   * Get requests for a whole department (used by Department Requests page)
   */
  getByDepartment(department?: string, district?: string): CitizenRequest[] {
    this.initFirestoreListener();
    const deptNorm = department?.toLowerCase();
    const distNorm = district?.toLowerCase();

    return inMemoryRequests.filter(req => {
      const reqDept = (req.department || CATEGORY_DEPARTMENT_MAP[req.category] || '').toLowerCase();
      const matchesDept = !deptNorm || deptNorm === 'all' || reqDept.includes(deptNorm) || deptNorm.includes(reqDept);

      const reqLoc = (req.location + ' ' + (req.region || '')).toLowerCase();
      const matchesRegion = !distNorm || distNorm === 'all' || distNorm === 'all districts' || reqLoc.includes(distNorm);

      return matchesDept && matchesRegion;
    });
  },

  /**
   * Automatic routing: Citizen Request -> Category -> Department -> Region -> Officer
   */
  create(
    userId: string,
    category: Category,
    description: string,
    location: string,
    language: string,
    imageUrl: string | undefined,
    aiAnalysis: AIAnalysis,
    isVoice?: boolean,
    voiceTranscription?: string,
    priority?: PriorityLevel,
    coordinates?: { lat: number; lng: number },
    locationDetails?: RequestLocation
  ): CitizenRequest {
    const autoDept = CATEGORY_DEPARTMENT_MAP[category] || 'Public Works Department (PWD)';
    const autoRegion = location.split(',')[0].trim() || 'Kalahandi';

    const newRequest: CitizenRequest = {
      id: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      userName: 'Priya Sharma',
      category,
      department: autoDept,
      region: autoRegion,
      description,
      location,
      coordinates: validCoordinates(coordinates) ? coordinates : undefined,
      locationDetails: validLocationDetails(locationDetails) ? locationDetails : undefined,
      language,
      imageUrl,
      status: 'pending',
      priority: priority || (aiAnalysis.severity === 'critical' || aiAnalysis.severity === 'high' ? 'high' : 'medium'),
      affectedCount: Math.floor(2500 + Math.random() * 12000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiAnalysis,
      isVoice,
      voiceTranscription,
    };

    inMemoryRequests.unshift(newRequest);
    saveRequestsToLocal(inMemoryRequests);
    notifyListeners();

    // Persist to Firestore if configured
    if (isFirebaseConfigured) {
      try {
        const firestorePromise = setDoc(doc(db, 'requests', newRequest.id), newRequest, { merge: true });
        const timeoutPromise = new Promise(r => setTimeout(r, 2000));
        Promise.race([firestorePromise, timeoutPromise]).catch(err => {
          console.warn('Firestore write warning on create:', err);
        });
      } catch (e) {
        console.warn('Error queuing Firestore request creation:', e);
      }
    }

    return newRequest;
  },

  /**
   * Assign request to an officer: Transition to 'assigned' status
   */
  assignOfficer(
    requestId: string,
    officerId: string,
    officerName: string,
    officerDesignation: string
  ): CitizenRequest | null {
    const idx = inMemoryRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return null;

    const updatedRequest: CitizenRequest = {
      ...inMemoryRequests[idx],
      assignedOfficerId: officerId,
      assignedOfficerName: officerName,
      assignedOfficerDesignation: officerDesignation,
      status: inMemoryRequests[idx].status === 'pending' || inMemoryRequests[idx].status === 'new' ? 'assigned' : inMemoryRequests[idx].status,
      updatedAt: new Date().toISOString(),
    };

    inMemoryRequests[idx] = updatedRequest;
    saveRequestsToLocal(inMemoryRequests);
    notifyListeners();

    if (isFirebaseConfigured) {
      try {
        setDoc(doc(db, 'requests', requestId), {
          assignedOfficerId: officerId,
          assignedOfficerName: officerName,
          assignedOfficerDesignation: officerDesignation,
          status: updatedRequest.status,
          updatedAt: updatedRequest.updatedAt,
        }, { merge: true }).catch(err => console.warn('Assign error:', err));
      } catch (e) {
        console.warn('Assign officer error:', e);
      }
    }

    return updatedRequest;
  },

  /**
   * Status Transition Workflow: New -> Assigned -> In Progress -> Resolved
   */
  updateStatus(id: string, newStatus: RequestStatus, officialResponse?: OfficialResponse): CitizenRequest | null {
    const idx = inMemoryRequests.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const updatedRequest: CitizenRequest = {
      ...inMemoryRequests[idx],
      status: newStatus,
      updatedAt: new Date().toISOString(),
      officialResponse: officialResponse || inMemoryRequests[idx].officialResponse,
    };

    inMemoryRequests[idx] = updatedRequest;
    saveRequestsToLocal(inMemoryRequests);
    notifyListeners();

    // Sync update to Firestore
    if (isFirebaseConfigured) {
      try {
        const updateData: Partial<CitizenRequest> = {
          status: newStatus,
          updatedAt: updatedRequest.updatedAt,
        };
        if (officialResponse) {
          updateData.officialResponse = officialResponse;
        }
        setDoc(doc(db, 'requests', id), updateData, { merge: true }).catch(err => {
          console.warn('Firestore status update warning:', err);
        });
      } catch (e) {
        console.warn('Error queuing Firestore status update:', e);
      }
    }

    return updatedRequest;
  },

  getStats(userId?: string) {
    const all = userId ? inMemoryRequests.filter(r => r.userId === userId) : inMemoryRequests;
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending' || r.status === 'new').length,
      assigned: all.filter(r => r.status === 'assigned').length,
      underReview: all.filter(r => r.status === 'under_review').length,
      inProgress: all.filter(r => r.status === 'in_progress').length,
      resolved: all.filter(r => r.status === 'resolved').length,
      rejected: all.filter(r => r.status === 'rejected').length,
      highPriority: all.filter(r => r.priority === 'high' || r.aiAnalysis?.severity === 'critical' || r.aiAnalysis?.severity === 'high').length,
    };
  },

  reset(): void {
    inMemoryRequests = [...MOCK_REQUESTS].map(normalizeRequest);
    saveRequestsToLocal(inMemoryRequests);
    notifyListeners();
  },
};

/**
 * Custom React Hook for live synchronized citizen requests
 */
export function useCitizenRequests() {
  const [requests, setRequests] = useState<CitizenRequest[]>(() => requestService.getAll());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const unsubscribe = requestService.subscribe((updated: CitizenRequest[]) => {
      if (mounted) {
        setRequests(updated);
        setLoading(false);
      }
    });

    requestService.fetchAllFromFirestore().then(fetched => {
      if (mounted) {
        setRequests(fetched);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { requests, loading };
}
