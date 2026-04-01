import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Table } from '../../components/table/Table';
import { Button } from '../../components/ui/button';
import { adminAPI } from '../../services/api';

function AdminAllUsers() {
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch all users (citizens + officers)
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async () => {
      const citizens = await adminAPI.getAllCitizens();
      const officers = await adminAPI.getAllOfficers();
      return [...(citizens.data || []), ...(officers.data || [])];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all areas for filter dropdown
  const { data: areas = [] } = useQuery({
    queryKey: ['admin-areas'],
    queryFn: async () => {
      const res = await adminAPI.getAllAreas();
      return res.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const editModalRef = useRef();
  
  const editUserMutation = useMutation({
    mutationFn: async ({ user, data }) => {
      if (user.role === 'Officer') {
        await adminAPI.updateOfficer(user._id, data);
      } else {
        await adminAPI.updateCitizen(user._id, data);
      }
    }
  });

  // Filter users based on search and area
  const filteredUsers = users.filter(user => {
    const matchesSearch = !search || 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesArea = !areaFilter || user.area === areaFilter;
    return matchesSearch && matchesArea;
  });

  // Pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'area', label: 'Area' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderRow = (user) => (
    <tr key={user._id} className="border-b hover:bg-slate-50">
      <td className="px-4 py-2">{user.name}</td>
      <td className="px-4 py-2">{user.email}</td>
      <td className="px-4 py-2">
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          {user.role || 'N/A'}
        </span>
      </td>
      <td className="px-4 py-2">{user.area || 'N/A'}</td>
      <td className="px-4 py-2">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => {
            setEditUser(user);
            setEditForm({ name: user.name, email: user.email, area: user.area || '' });
            editModalRef.current?.showModal();
          }}
        >
          Edit
        </Button>
      </td>
    </tr>
  );
  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">All Users</h2>
            <p className="text-sm text-gray-500">Manage all users in the system</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-slate-900 bg-white"
            />
            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 font-semibold text-slate-900 bg-white"
            >
              <option value="">All Areas</option>
              {areas?.map(area => (
                <option key={area._id} value={area._id}>{area.name || area.areaName}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table
            columns={columns}
            data={paginatedUsers}
            renderRow={renderRow}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >Previous</Button>
              <Button
                size="sm"
                variant="default"
                disabled={endIndex >= filteredUsers.length}
                onClick={() => setPage(page + 1)}
              >Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Edit User Modal - single instance outside Card/Table */}
      <dialog ref={editModalRef} className="rounded-lg shadow-xl p-0 w-full max-w-md bg-white border border-slate-200">
        {editUser && (
          <form
            className="p-6 space-y-4"
            onSubmit={e => {
              e.preventDefault();
              editUserMutation.mutate({ user: editUser, data: editForm });
            }}
          >
            <h2 className="text-lg font-semibold mb-2">Edit User</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={editForm.email || ''}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Area</label>
              <input
                type="text"
                value={editForm.area || ''}
                onChange={e => setEditForm(f => ({ ...f, area: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" variant="default" disabled={editUserMutation.isPending}>Save</Button>
              <Button type="button" variant="ghost" onClick={() => { setEditUser(null); editModalRef.current?.close(); }}>Cancel</Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}

export default AdminAllUsers;
