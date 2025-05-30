export interface User {
  _id?: string;
  id?: string;
  username?: string;
  name?: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'teacher';
  isTeacher?: boolean;
  createdAt?: Date;
  selectedTeachers?: string[];
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  expiresIn?: number; // seconds until token expires
  user: {
    id?: string;
    _id?: string;
    username?: string;
    name?: string;
    email: string;
    role: 'student' | 'admin' | 'teacher';
    isTeacher?: boolean;
  };
  success?: boolean;
  message?: string;
}
