export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  TOKEN_EXPIRY: 'auth_token_expiry',
  GUEST_MODE: 'guest_mode',
  BOOKMARKED_EXAMS: 'bookmarkedExams',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://testly-server.vercel.app/testly/v1',
  AUTH: 'https://testly-server.vercel.app/testly/v1/auth',
  ADMIN: 'https://testly-server.vercel.app/testly/v1/admin',
  EXAM: 'https://testly-server.vercel.app/testly/v1/exam',
  CONTACT: 'https://testly-server.vercel.app/testly/v1/contact',
};

export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
};

export const FILTER_TYPES = {
  ALL: 'all',
  RECENT: 'recent',
  POPULAR: 'popular',
  BOOKMARKED: 'bookmarked',
  COMPLETED: 'completed',
};
