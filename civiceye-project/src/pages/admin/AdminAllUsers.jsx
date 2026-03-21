import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Table } from '../../components/table/Table';
import { Button } from '../../components/ui/button';
import adminAPI from '../../services/api';
// ...existing code...
// ...existing code removed...
function AdminAllUsers() {
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Make `areas` safe in UI in case data is delayed/missing
  // (if there is already a query in omitted code, this fallback won't create issues)
  const safeAreas = [];

  // ...existing code...
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
  // ...existing code...
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
              className="input input-bordered"
            />
            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="select select-bordered"
            >
              <option value="">All Areas</option>
              {(areas || safeAreas).map(area => (
                <option key={area._id} value={area._id}>{area.name}</option>
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
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >Previous</button>
              <button
                className="btn btn-sm"
                disabled={endIndex >= filteredUsers.length}
                onClick={() => setPage(page + 1)}
              >Next</button>
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
              <Button type="submit" variant="primary" disabled={editUserMutation.isPending}>Save</Button>
              <Button type="button" variant="outline" onClick={() => { setEditUser(null); editModalRef.current?.close(); }}>Cancel</Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}

export default AdminAllUsers;
