import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  User,
  AlertCircle,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  ZoomIn,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { officerAPI } from '../../services/api';

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Timeline data generator
const generateTimeline = (complaint) => {
  const timeline = [
    {
      status: 'Complaint Submitted',
      date: complaint.createdAt,
      completed: true,
      icon: AlertCircle,
    },
    {
      status: 'Assigned to Officer',
      date: complaint.assignedOfficer ? complaint.createdAt : null,
      completed: !!complaint.assignedOfficer,
      icon: User,
    },
    {
      status: 'In Progress',
      date: complaint.status === 'In Progress' ? complaint.updatedAt : null,
      completed: complaint.status === 'In Progress' || complaint.status === 'Resolved',
      icon: Clock,
    },
    {
      status: 'Resolved',
      date: complaint.status === 'Resolved' ? complaint.updatedAt : null,
      completed: complaint.status === 'Resolved',
      icon: CheckCircle2,
    },
  ];

  return timeline;
};

// Image Modal Component
const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-3xl w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 bg-white text-black p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="h-6 w-6" />
        </button>
        <img
          src={image}
          alt="Enlarged complaint image"
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default function OfficerIssueDetails() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = React.useRef(null);

  // Fetch complaint details
  const { data: complaintData, isLoading, error } = useQuery({
    queryKey: ['complaint-details', complaintId],
    queryFn: async () => {
      const response = await officerAPI.getAssignedComplaints();
      const complaint = response.data.complaints.find(
        (c) => c._id === complaintId || c.issueId === complaintId
      );
      if (!complaint) throw new Error('Complaint not found');
      return complaint;
    },
  });

  const complaint = complaintData;

  // Update status mutation with image upload
  const updateStatusMutation = useMutation({
    mutationFn: async ({ newStatus, notes, image }) => {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('notes', notes || '');
      if (image) {
        formData.append('proofImage', image);
      }

      // Pass FormData to API function
      const response = await officerAPI.updateComplaintStatus(complaintId, newStatus, formData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['complaint-details', complaintId]);
      queryClient.invalidateQueries(['officer-assigned-issues']);
      
      // Show success message
      setSuccessMessage('✅ Complaint status updated successfully!');
      setErrorMessage('');
      
      // Reset form
      setSelectedStatus('');
      setResolutionNotes('');
      setProofImage(null);
      setPreviewImage(null);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/officer/update-status');
      }, 2000);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update complaint status';
      setErrorMessage('❌ Error: ' + errorMsg);
      setSuccessMessage('');
    },
  });

  // Form validation
  const validateForm = () => {
    if (!selectedStatus) {
      setErrorMessage('⚠️ Please select a status');
      return false;
    }

    if (selectedStatus === 'Resolved' && !resolutionNotes.trim()) {
      setErrorMessage('⚠️ Resolution notes are required when marking as Resolved');
      return false;
    }

    if ((selectedStatus === 'Resolved' || selectedStatus === 'Rejected') && !proofImage) {
      setErrorMessage('⚠️ Proof image is required for Resolved or Rejected status');
      return false;
    }

    return true;
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('⚠️ Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('⚠️ Image size must be less than 5MB');
        return;
      }

      setProofImage(file);
      setErrorMessage('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleUpdateStatus = async () => {
    if (!validateForm()) {
      return;
    }

    updateStatusMutation.mutate({
      newStatus: selectedStatus,
      notes: resolutionNotes,
      image: proofImage,
    });
  };

  const timeline = complaint ? generateTimeline(complaint) : [];

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading complaint details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/officer/update-status')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Issues
            </button>
            <Card className="bg-red-900/20 border border-red-500/50">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-white text-lg">
                  {error?.message || 'Complaint not found'}
                </p>
                <p className="text-slate-400 mt-2">Please try again or go back to the issues list.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate('/officer/update-status')}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Issues
              </button>
              <h1 className="text-4xl font-bold text-white">Complaint Details</h1>
              <p className="text-slate-400 mt-2">ID: {complaint.issueId}</p>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          {/* Main Content - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Complaint Title & Overview */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Priority</p>
                      <div className="mt-2">
                        <PriorityBadge priority={complaint.priority} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Status</p>
                      <div className="mt-2">
                        <StatusBadge status={complaint.status} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Category</p>
                      <span className="inline-block bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-medium mt-2">
                        {complaint.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Date</p>
                      <p className="text-white text-sm mt-2">{formatDate(complaint.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-200 leading-relaxed bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    {complaint.description}
                  </p>
                </CardContent>
              </Card>

              {/* Citizen Information */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all">
                <CardHeader>
                  <CardTitle className="text-white">Reported By</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Citizen Name</p>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700">
                        <User className="h-5 w-5 text-slate-400" />
                        <p className="text-white">
                          {complaint.citizen?.name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                        Contact Number
                      </p>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700">
                        <Phone className="h-5 w-5 text-slate-400" />
                        <p className="text-white">{complaint.citizenContact || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Location</p>
                      <div className="flex items-start gap-2 bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700">
                        <MapPin className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />
                        <p className="text-white">{complaint.location || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images Section */}
              {complaint.image && (
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-white">Uploaded Images</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div
                        className="relative overflow-hidden rounded-lg border border-slate-700 cursor-pointer hover:border-blue-500 transition group"
                        onClick={() => {
                          setSelectedImage(complaint.image);
                          setIsImageModalOpen(true);
                        }}
                      >
                        <img
                          src={complaint.image}
                          alt="Complaint"
                          className="w-full h-40 object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline Section */}
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all">
                <CardHeader>
                  <CardTitle className="text-white">Complaint Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {timeline.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={index} className="flex gap-4">
                          {/* Timeline connector */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`p-3 rounded-full border-2 ${
                                item.completed
                                  ? 'bg-green-500/20 border-green-500'
                                  : 'bg-slate-700/50 border-slate-600'
                              }`}
                            >
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            {index !== timeline.length - 1 && (
                              <div
                                className={`w-0.5 h-16 ${
                                  item.completed ? 'bg-green-500/50' : 'bg-slate-700/50'
                                }`}
                              ></div>
                            )}
                          </div>

                          {/* Timeline content */}
                          <div className="flex-1 pt-2">
                            <h4
                              className={`font-semibold ${
                                item.completed ? 'text-green-400' : 'text-slate-400'
                              }`}
                            >
                              {item.status}
                            </h4>
                            {item.date && (
                              <p className="text-sm text-slate-500 mt-1">
                                {formatDate(item.date)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Update Form */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all sticky top-6">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm">
                      {successMessage}
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {/* Assigned Officer Info */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                      Assigned Officer
                    </p>
                    <p className="text-white font-medium">
                      {complaint.assignedOfficer?.name || 'Unassigned'}
                    </p>
                    {complaint.assignedOfficer?.email && (
                      <p className="text-slate-400 text-sm mt-1">
                        {complaint.assignedOfficer.email}
                      </p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="text-sm font-semibold text-slate-300 uppercase block mb-3">
                      New Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Resolution Notes */}
                  <div>
                    <label className="text-sm font-semibold text-slate-300 uppercase block mb-3">
                      Resolution Notes {selectedStatus === 'Resolved' && <span className="text-red-400">*</span>}
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => {
                        setResolutionNotes(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder={selectedStatus === 'Resolved' ? 'Required for resolution' : 'Add resolution notes (optional)'}
                      rows="4"
                      disabled={updateStatusMutation.isPending}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none disabled:opacity-50"
                    />
                  </div>

                  {/* Upload Proof Image */}
                  <div>
                    <label className="text-sm font-semibold text-slate-300 uppercase block mb-3">
                      Upload Proof Image {(selectedStatus === 'Resolved' || selectedStatus === 'Rejected') && <span className="text-red-400">*</span>}
                    </label>
                    
                    {previewImage ? (
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                          onClick={() => {
                            setProofImage(null);
                            setPreviewImage(null);
                            setErrorMessage('');
                          }}
                          type="button"
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={handleFileInputClick}
                        className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer hover:bg-slate-800/30 disabled:opacity-50"
                      >
                        <Upload className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={updateStatusMutation.isPending}
                    />
                  </div>

                  {/* Update Button */}
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updateStatusMutation.isPending || !selectedStatus}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Update Status
                      </>
                    )}
                  </Button>

                  {/* Current Status Info */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                      Current Status
                    </p>
                    <StatusBadge status={complaint.status} />
                    <p className="text-slate-400 text-sm mt-2">
                      Last updated: {formatDate(complaint.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImage(null);
        }}
      />
    </DashboardLayout>
  );
}
