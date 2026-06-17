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
  tiktokPostId?: string | null;
  tiktokPostUrl?: string | null;
  postStatus?: string | null;
  postedAt?: string | null;
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

export type TenantSettings = {
  geminiApiKeySet: boolean;
  geminiApiKeyMasked: string | null;
  geminiModel: string;
  geminiVideoModel: string;
  timezone: string;
};

export type WorkflowSchedule = {
  id: string;
  name: string;
  isActive: boolean;
  runHours: string;
  runDays: string;
  productStrategy: string;
  maxProductsPerRun: number;
  videoStyle: string;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
  logs?: ScheduleRunLog[];
};

export type ScheduleRunLog = {
  id: string;
  scheduleId: string;
  workflowId: string | null;
  status: string;
  message: string | null;
  startedAt: string;
  completedAt: string | null;
  schedule?: { name: string };
};

export type WorkflowFlowStep = {
  key: string;
  label: string;
  status: "success" | "failed" | "skipped";
  message: string;
};

export type FlowStepStatus =
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "skipped";

export type FlowProgressStep = {
  key: string;
  label: string;
  status: FlowStepStatus;
  message: string;
};

export type RunProgress = {
  runId: string;
  tenantId: string;
  scheduleId: string;
  isTestRun: boolean;
  status: "running" | "success" | "failed";
  currentStepKey: string;
  steps: FlowProgressStep[];
  result: TestFlowResult | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
};

export type TestFlowStartResult = {
  runId: string;
  status: "running";
  isTestRun: boolean;
  prerequisites: { label: string; ok: boolean; message: string }[];
};

export type TestFlowResult = {
  success: boolean;
  message: string;
  workflowId: string;
  isTestRun: boolean;
  steps: WorkflowFlowStep[];
  prerequisites: { label: string; ok: boolean; message: string }[];
  products: { id: string; name: string; price: number; commission: number | null }[];
  product?: { id: string; name: string; price: number; imageUrl: string | null };
  video?: {
    script: string | null;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    status: string;
    tiktokPostUrl?: string | null;
    postedAt?: string | null;
  };
  post?: {
    posted: boolean;
    postUrl: string | null;
    postId: string | null;
    message: string;
  };
};
