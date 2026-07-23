import Cookies from "js-cookie";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return Cookies.get("eg_token") || null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth API
  auth: {
    login: (nid?: string, role: "voter" | "candidate" | "admin" = "voter") =>
      request<{
        token: string;
        user: {
          id: string;
          name: string;
          role: "voter" | "candidate" | "admin";
          constituencyId: string;
          constituencyName: string;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ nid, role }),
      }),

    register: (userData: { nid: string; name: string; dob?: string; phone?: string; constituencyId?: string; faceDescriptor?: string; fingerprintHash?: string }) =>
      request<{
        token: string;
        user: {
          id: string;
          name: string;
          role: "voter";
          constituencyId: string;
          constituencyName: string;
          faceDescriptor?: string;
          fingerprintHash?: string;
        };
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    verify: () =>
      request<{
        user: {
          userId: string;
          name: string;
          role: "voter" | "candidate" | "admin";
          constituencyId: string;
          constituencyName: string;
        };
      }>("/auth/verify"),
  },

  // WebAuthn API (real device fingerprint / Face ID / Windows Hello)
  webauthn: {
    registerOptions: (nid: string, name?: string) =>
      request<PublicKeyCredentialCreationOptionsJSON>("/webauthn/register-options", {
        method: "POST",
        body: JSON.stringify({ nid, name }),
      }),

    registerVerify: (nid: string, credential: RegistrationResponseJSON) =>
      request<{ verified: boolean; credentialId: string }>("/webauthn/register-verify", {
        method: "POST",
        body: JSON.stringify({ nid, credential }),
      }),

    loginOptions: (nid: string) =>
      request<PublicKeyCredentialRequestOptionsJSON>("/webauthn/login-options", {
        method: "POST",
        body: JSON.stringify({ nid }),
      }),

    loginVerify: (nid: string, credential: AuthenticationResponseJSON) =>
      request<{ verified: boolean }>("/webauthn/login-verify", {
        method: "POST",
        body: JSON.stringify({ nid, credential }),
      }),
  },

  // Election API
  election: {
    getConfig: () =>
      request<{
        electionName: string;
        startDate: string;
        endDate: string;
        chainId: number;
        contractAddress: string;
      }>("/election/config"),

    getStatus: () =>
      request<{
        status: "Created" | "NotStarted" | "Voting" | "Ongoing" | "Ended";
        stateIndex: number;
      }>("/election/status"),

    toggleStatus: (action: "start" | "end") =>
      request<{
        success: boolean;
        action: "start" | "end";
        txHash?: string;
      }>("/election/status", {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
  },

  // Candidates API
  candidates: {
    getAll: () =>
      request<{
        candidates: Array<{
          id: number;
          name: string;
          party: string;
          voteCount: number;
          icon?: string;
          manifesto?: string;
          constituencyName?: string;
          [key: string]: any;
        }>;
      }>("/candidates"),

    getById: (id: number) =>
      request<{
        candidate: {
          id: number;
          name: string;
          party: string;
          voteCount: number;
          icon?: string;
          manifesto?: string;
          constituencyName?: string;
          [key: string]: any;
        };
      }>(`/candidates/${id}`),

    add: (name: string, party: string) =>
      request<{ success: boolean; txHash?: string }>("/candidates", {
        method: "POST",
        body: JSON.stringify({ name, party }),
      }),
  },

  // Vote API
  vote: {
    submit: (candidateId: number) =>
      request<{ success: boolean; txHash?: string }>("/vote", {
        method: "POST",
        body: JSON.stringify({ candidateId }),
      }),

    getStatus: () =>
      request<{
        hasVoted: boolean;
        record: {
          userId: string;
          candidateId: number;
          txHash: string;
          timestamp: string;
        } | null;
      }>("/vote/status"),
  },

  // Turnout & Results API
  analytics: {
    getTurnout: () =>
      request<{
        totalRegistered: number;
        totalVoted: number;
        turnoutPercentage: number;
        constituencies: Array<{
          constituencyId: string;
          constituencyName: string;
          registered: number;
          voted: number;
        }>;
      }>("/turnout"),

    getResults: () =>
      request<{
        electionState: string;
        candidates: Array<{
          id: number;
          name: string;
          party: string;
          voteCount: number;
        }>;
      }>("/results"),
  },

  // Feed API
  feed: {
    getPosts: (constituencyId?: string) => {
      const query = constituencyId ? `?constituencyId=${encodeURIComponent(constituencyId)}` : "";
      return request<{
        posts: Array<{
          id: string;
          type: string;
          author: string;
          content: string;
          constituencyId: string;
          likes: number;
          createdAt: string;
        }>;
      }>(`/feed${query}`);
    },

    createPost: (content: string, type?: string) =>
      request<{
        success: boolean;
        post: {
          id: string;
          type: string;
          author: string;
          content: string;
          constituencyId: string;
          likes: number;
          createdAt: string;
        };
      }>("/feed", {
        method: "POST",
        body: JSON.stringify({ content, type }),
      }),
  },

  // Grievances API
  grievances: {
    getAll: () =>
      request<{
        grievances: Array<{
          id: string;
          voterId: string;
          voterName: string;
          category: string;
          description: string;
          status: string;
          createdAt: string;
        }>;
      }>("/grievances"),

    create: (category: string, description: string) =>
      request<{
        success: boolean;
        grievance: {
          id: string;
          voterId: string;
          voterName: string;
          category: string;
          description: string;
          status: string;
          createdAt: string;
        };
      }>("/grievances", {
        method: "POST",
        body: JSON.stringify({ category, description }),
      }),

    updateStatus: (id: string, status: string) =>
      request<{
        success: boolean;
        grievance: {
          id: string;
          voterId: string;
          voterName: string;
          category: string;
          description: string;
          status: string;
          createdAt: string;
        };
      }>(`/grievances/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Polling Centers API
  pollingCenters: {
    getAll: (constituencyId?: string) => {
      const query = constituencyId ? `?constituencyId=${encodeURIComponent(constituencyId)}` : "";
      return request<{
        pollingCenters: Array<{
          id: string;
          name: string;
          address: string;
          constituencyId: string;
          constituencyName: string;
          lat: number;
          lng: number;
          capacity: number;
          status: "active" | "inactive";
        }>;
      }>(`/polling-centers${query}`);
    },
  },

  // Audit Logs API
  audit: {
    getLogs: () =>
      request<{
        entries: Array<{
          id: string;
          actor: string;
          action: string;
          details: string;
          createdAt: string;
        }>;
      }>("/audit-logs"),

    createLog: (action: string, details: string) =>
      request<{
        success: boolean;
        entry: {
          id: string;
          actor: string;
          action: string;
          details: string;
          createdAt: string;
        };
      }>("/audit-logs", {
        method: "POST",
        body: JSON.stringify({ action, details }),
      }),
  },
};
