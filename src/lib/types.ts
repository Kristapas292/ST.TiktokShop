export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  expiresAt: string | null;
  isActive?: boolean;
};

export type Product = {
  id: string;
  tiktokId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  commission: number | null;
  category: string | null;
  status: string;
};

export type Workflow = {
  id: string;
  name: string;
  status: string;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
  items: WorkflowItem[];
  videos?: VideoJob[];
  _count?: { items: number; videos: number };
};

export type WorkflowItem = {
  id: string;
  step: string;
  cartPinned: boolean;
  product: Product;
};

export type VideoJob = {
  id: string;
  status: string;
  script: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  error: string | null;
  createdAt: string;
};

export type DashboardData = {
  stats: {
    products: number;
    workflows: number;
    completed: number;
    videos: number;
    pinned: number;
  };
  recentWorkflows: Workflow[];
  weeklyActivity: { day: string; workflows: number; videos: number }[];
};

export type AuthResponse = {
  token: string;
  user: User;
  tenant: Tenant;
};

export type TikTokStatus = {
  isConfigured: boolean;
  isConnected: boolean;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  tiktokOpenId: string | null;
  tokenExpiresAt?: string | null;
};
