import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle, GradientCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Edit, Trash, X, Download } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { adminAPI, categoryAPI } from '@/services/api';

const ICONS = [
  "BookOpen", "Users", "UserCheck", "Building", "AlertCircle", "BarChart3", "Phone", "Lock"
];

function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ICONS.map((icon) => (
        <button
          key={icon}
          className={`border rounded p-2 flex flex-col items-center ${value === icon ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
          onClick={() => onChange(icon)}
          type="button"
        >
          <span className="text-2xl mb-1">
            <i className={`lucide lucide-${icon.toLowerCase()}`}></i>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide">{icon}</span>
        </button>
      ))}
    </div>
  );
}

export default function AdminCategoryDashboard() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: "", icon: ICONS[0] });
  const [saving, setSaving] = useState(false);

  // Chart data
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data || [])).finally(() => setLoading(false));
    // Fetch complaints and officers for charts
    adminAPI.getAllComplaints().then(res => setComplaints(res.data.complaints || []));
    adminAPI.getAllOfficers().then(res => setOfficers(res.data.data || []));
  }, []);

  // Complaint resolution time chart
  const resolutionTimeData = useMemo(() => {
    // Example: group by category, average resolution time
    return categories.map(cat => {
      const catComplaints = complaints.filter(c => c.category === cat.name && c.resolvedAt && c.createdAt);
      const avgTime = catComplaints.length ? Math.round(catComplaints.reduce((sum, c) => sum + (new Date(c.resolvedAt) - new Date(c.createdAt)), 0) / catComplaints.length / 3600000) : 0;
      return { category: cat.name, avgResolutionHours: avgTime };
    });
  }, [categories, complaints]);

  // Monthly complaint trends
  const monthlyTrends = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return months.map(m => {
      const monthComplaints = complaints.filter(c => new Date(c.createdAt).getMonth() === m);
      return {
        month: new Date(2026, m, 1).toLocaleString('en', { month: 'short' }),
        reported: monthComplaints.length,
        resolved: monthComplaints.filter(c => c.status === 'Resolved').length,
      };
    });
  }, [complaints]);

  // Officer efficiency comparison
  const officerEfficiency = useMemo(() => {
    return officers.map(officer => {
      const assigned = complaints.filter(c => c.assignedOfficerId === officer._id).length;
      const resolved = complaints.filter(c => c.assignedOfficerId === officer._id && c.status === 'Resolved').length;
      return {
        officer: officer.name,
        efficiency: assigned ? Math.round((resolved / assigned) * 100) : 0,
      };
    });
  }, [officers, complaints]);

  // Area problem heat analysis
  const areaHeat = useMemo(() => {
    const areaMap = {};
    complaints.forEach(c => {
      const area = c.location || 'Unknown';
      areaMap[area] = (areaMap[area] || 0) + 1;
    });
    return Object.entries(areaMap).map(([area, count]) => ({ area, count }));
  }, [complaints]);

  // Category CRUD
  const openAddModal = () => {
    setEditCategory(null);
    setForm({ name: "", icon: ICONS[0] });
    setModalOpen(true);
  };
  const openEditModal = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name, icon: cat.icon });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditCategory(null);
    setForm({ name: "", icon: ICONS[0] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editCategory) {
      await categoryAPI.edit(editCategory._id, form);
    } else {
      await categoryAPI.add(form);
    }
    setSaving(false);
    closeModal();
    categoryAPI.getAll().then(res => setCategories(res.data.data));
  };
  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category '${cat.name}'?`)) return;
    await categoryAPI.delete(cat._id);
    categoryAPI.getAll().then(res => setCategories(res.data.data));
  };

  // Export report UI
  const handleExport = (type) => {
    alert(`Export as ${type} (UI only)`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-slate-50/80 p-6 rounded-3xl backdrop-blur shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 drop-shadow-sm uppercase">Category & Transparency Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="civic" onClick={() => handleExport('PDF')}><Download className="mr-2" /> Export PDF</Button>
            <Button variant="civic" onClick={() => handleExport('CSV')}><Download className="mr-2" /> Export CSV</Button>
          </div>
        </div>
        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GradientCard title="Complaint Resolution Time">
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={resolutionTimeData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgResolutionHours" fill="#ffffff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          <GradientCard title="Monthly Complaint Trends">
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyTrends}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reported" stroke="#ffffff" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="resolved" stroke="#a7f3d0" strokeWidth={3} dot={false} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          <GradientCard title="Officer Efficiency Comparison">
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={officerEfficiency}>
                  <XAxis dataKey="officer" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="efficiency" fill="#ffffff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>

          <GradientCard title="Area Problem Heat Analysis">
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={areaHeat}>
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffffff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GradientCard>
        </div>
        {/* Category List */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900">Category List</h2>
            <Button variant="civic" onClick={openAddModal}><Plus className="mr-2" /> Add Category</Button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-white border border-blue-200 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center p-6 relative group">
                  <span className="text-blue-700 text-4xl mb-2"><i className={`lucide lucide-${cat.icon.toLowerCase()}`}></i></span>
                  <div className="font-bold text-lg text-blue-900 uppercase tracking-wide mb-1 text-center">{cat.name}</div>
                  <div className="flex gap-2 mt-4 opacity-80 group-hover:opacity-100 transition">
                    <button
                      className="text-blue-700 hover:text-blue-900"
                      onClick={() => openEditModal(cat)}
                      title="Edit"
                    >
                      <Edit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(cat)}
                      title="Delete"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Add/Edit Category Modal */}
        <Dialog.Root open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative" aria-describedby={undefined}>
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeModal}><X /></button>
              <Dialog.Title className="text-xl font-bold mb-4 uppercase tracking-widest">
                {editCategory ? "Edit Category" : "Add Category"}
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1">Name</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1">Icon</label>
                  <IconPicker value={form.icon} onChange={icon => setForm(f => ({ ...f, icon }))} />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-black py-2 rounded font-bold uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : (editCategory ? "Update Category" : "Add Category")}
                </button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </DashboardLayout>
  );
}
