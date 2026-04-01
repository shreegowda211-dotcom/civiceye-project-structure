import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, Calendar, ShieldBan, UserCheck, Users } from 'lucide-react';
import { adminAPI } from '@/services/api';
import { useDebounce } from '@/hooks/use-debounce';
import UsersFilters from './components/UsersFilters';
import UsersTable from './components/UsersTable';
import UserModal from './components/UserModal';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' });
  const debouncedSearch = useDebounce(searchInput, 300);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

  const parseList = (payload) => {
    const root = payload?.data ?? payload;
    const directArray = Array.isArray(root) ? root : null;
    const nestedArray = Array.isArray(root?.data) ? root.data : null;
    const resultsArray = Array.isArray(root?.results) ? root.results : null;
    const items = resultsArray || nestedArray || directArray || [];

    const inferredTotal =
      typeof root?.total === 'number'
        ? root.total
        : typeof root?.count === 'number'
          ? root.count
          : items.length;
    const inferredPage = typeof root?.page === 'number' ? root.page : 1;
    const inferredTotalPages =
      typeof root?.totalPages === 'number'
        ? root.totalPages
        : Math.max(1, Math.ceil(inferredTotal / Number(limit || 10)));

    return {
      results: items,
      total: Number(inferredTotal),
      page: Number(inferredPage),
      totalPages: Number(inferredTotalPages),
    };
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-citizens', page, limit, debouncedSearch, statusFilter],
    queryFn: async () => {
      const token = localStorage.getItem('civiceye_token');
      const params = { page, limit, search: debouncedSearch.trim(), status: statusFilter };
      try {
        const res = await axios.get(`${API_URL}/admin/citizens`, { params, headers: { 'auth-token': token } });
        return parseList(res.data);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('civiceye_token');
          window.location.href = '/login';
        }
        throw err;
      }
    },
    keepPreviousData: true,
  });

  const users = data?.results || [];

  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || u?.name?.toLowerCase().includes(q) || u?.email?.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || (statusFilter === 'blocked' ? !!u.blocked : !u.blocked);
      return matchesSearch && matchesStatus;
    });
  }, [users, debouncedSearch, statusFilter]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    list.sort((a, b) => {
      const av = a?.[sort.field];
      const bv = b?.[sort.field];
      const dir = sort.direction === 'asc' ? 1 : -1;
      if (sort.field === 'createdAt') return (new Date(av || 0).getTime() - new Date(bv || 0).getTime()) * dir;
      if (typeof av === 'boolean' || typeof bv === 'boolean') return (Number(av) - Number(bv)) * dir;
      return String(av || '').localeCompare(String(bv || '')) * dir;
    });
    return list;
  }, [filteredUsers, sort]);

  const updateUsersCache = (updater) => {
    queryClient.setQueryData(['admin-citizens', page, limit, debouncedSearch, statusFilter], (old) =>
      old ? { ...old, results: updater(old.results || []) } : old
    );
  };

  const deleteMutation = useMutation({
    mutationFn: async (user) => {
      try {
        return await axios.delete(`${API_URL}/admin/users/${user._id}`, {
          headers: { 'auth-token': localStorage.getItem('civiceye_token') },
        });
      } catch (err) {
        if (err?.response?.status === 404) {
          return adminAPI.deleteCitizen(user._id);
        }
        throw err;
      }
    },
    onMutate: async (user) => updateUsersCache((rows) => rows.filter((r) => r._id !== user._id)),
    onError: (err) => setActionError(err?.response?.data?.message || err?.message || 'Failed to delete user'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-citizens'] }),
  });

  const blockMutation = useMutation({
    mutationFn: async (user) => {
      const nextBlocked = !user.blocked;
      try {
        return await axios.put(
          `${API_URL}/admin/users/${user._id}/block`,
          { isBlocked: nextBlocked },
          { headers: { 'auth-token': localStorage.getItem('civiceye_token') } }
        );
      } catch (err) {
        if (err?.response?.status === 404) {
          return adminAPI.blockCitizen(user._id, nextBlocked);
        }
        throw err;
      }
    },
    onMutate: async (user) => updateUsersCache((rows) => rows.map((r) => (r._id === user._id ? { ...r, blocked: !r.blocked } : r))),
    onError: (err) => setActionError(err?.response?.data?.message || err?.message || 'Failed to update block status'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-citizens'] }),
  });

  const summary = useMemo(() => {
    const total = data?.total || sortedUsers.length;
    const active = sortedUsers.filter((u) => !u.blocked).length;
    const blocked = sortedUsers.filter((u) => !!u.blocked).length;
    const now = new Date();
    const newThisMonth = sortedUsers.filter((u) => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, blocked, newThisMonth };
  }, [data?.total, sortedUsers]);

  const handleSort = (field) =>
    setSort((prev) => ({ field, direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const handleDelete = (user) => {
    setActionError('');
    if (!window.confirm(`Are you sure you want to delete ${user.name || 'this user'}?`)) return;
    deleteMutation.mutate(user);
  };

  const totalPages = Math.max(1, data?.totalPages || 1);

  return (
    <DashboardLayout>
      <div className="space-y-6 rounded-2xl bg-white/40 p-5 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Citizens Management</h1>
          <p className="mt-1 text-sm text-slate-200">Manage citizen accounts with search, status filters, and actions.</p>
        </div>

        <Card className="border-white/40 bg-white/70">
          <CardHeader><CardTitle className="text-lg">Filters</CardTitle></CardHeader>
          <CardContent>
            <UsersFilters
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              statusFilter={statusFilter}
              onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1); }}
            />
          </CardContent>
        </Card>

        {isError && (
          <Card className="border-rose-200 bg-rose-50/70">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-rose-700"><AlertTriangle className="h-4 w-4" />Failed to load users: {error?.message || 'Unknown error'}</div>
              <button onClick={() => refetch()} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white">Retry</button>
            </CardContent>
          </Card>
        )}
        {!!actionError && (
          <Card className="border-rose-200 bg-rose-50/70">
            <CardContent className="p-4 text-sm text-rose-700">{actionError}</CardContent>
          </Card>
        )}

        <Card className="border-white/40 bg-white/70">
          <CardHeader className="border-b border-slate-200/70"><CardTitle className="text-lg">Citizens ({data?.total || sortedUsers.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <UsersTable
              users={sortedUsers}
              isLoading={isLoading}
              sort={sort}
              onSort={handleSort}
              onDelete={handleDelete}
              onToggleBlock={(user) => blockMutation.mutate(user)}
              onView={(user) => { setSelectedUser(user); setIsModalOpen(true); }}
              deletingId={deleteMutation.variables?._id}
              togglingBlockId={blockMutation.variables?._id}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3">
          <div className="text-sm text-slate-600">Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span> | Total users: <span className="font-semibold text-slate-900">{data?.total || sortedUsers.length}</span></div>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-white/75"><CardContent className="p-4"><div className="text-sm text-slate-500">Total Users</div><div className="mt-1 flex items-center justify-between"><div className="text-2xl font-bold">{summary.total}</div><Users className="h-6 w-6 text-blue-500" /></div></CardContent></Card>
          <Card className="bg-white/75"><CardContent className="p-4"><div className="text-sm text-slate-500">Active Users</div><div className="mt-1 flex items-center justify-between"><div className="text-2xl font-bold">{summary.active}</div><UserCheck className="h-6 w-6 text-emerald-500" /></div></CardContent></Card>
          <Card className="bg-white/75"><CardContent className="p-4"><div className="text-sm text-slate-500">Blocked Users</div><div className="mt-1 flex items-center justify-between"><div className="text-2xl font-bold">{summary.blocked}</div><ShieldBan className="h-6 w-6 text-rose-500" /></div></CardContent></Card>
          <Card className="bg-white/75"><CardContent className="p-4"><div className="text-sm text-slate-500">New This Month</div><div className="mt-1 flex items-center justify-between"><div className="text-2xl font-bold">{summary.newThisMonth}</div><Calendar className="h-6 w-6 text-violet-500" /></div></CardContent></Card>
        </div>
      </div>
      <UserModal user={selectedUser} open={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedUser(null); }} />
    </DashboardLayout>
  );
}
