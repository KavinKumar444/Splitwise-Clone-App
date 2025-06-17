import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  members: User[];
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  split_type: 'equal' | 'percentage';
  paid_by: number;
  group_id: number;
  splits: {
    id: number;
    user_id: number;
    amount: number;
    percentage?: number;
  }[];
}

export interface Balance {
  user_id: number;
  amount: number;
  user_name: string;
}

export interface GroupBalance {
  group_id: number;
  group_name: string;
  balances: Balance[];
}

export interface UserBalance {
  user_id: number;
  user_name: string;
  group_balances: GroupBalance[];
}

export const apiService = {
  // User endpoints
  createUser: (user: { name: string; email: string }) =>
    api.post<User>('/users', user),
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: number) => api.get<User>(`/users/${id}`),

  // Group endpoints
  createGroup: (group: { name: string; user_ids: number[] }) =>
    api.post<Group>('/groups', group),
  getGroups: () => api.get<Group[]>('/groups'),
  getGroup: (id: number) => api.get<Group>(`/groups/${id}`),

  // Expense endpoints
  createExpense: (group_id: number, expense: {
    description: string;
    amount: number;
    paid_by: number;
    split_type: 'equal' | 'percentage';
    splits: { user_id: number; amount: number; percentage?: number }[];
  }) => api.post<Expense>(`/expenses/groups/${group_id}/expenses`, expense),
  getGroupExpenses: (group_id: number) =>
    api.get<Expense[]>(`/expenses/groups/${group_id}/expenses`),

  // Balance endpoints
  getGroupBalances: (group_id: number) =>
    api.get<GroupBalance>(`/balances/groups/${group_id}`),
  getUserBalances: (user_id: number) =>
    api.get<UserBalance>(`/balances/users/${user_id}`),
}; 