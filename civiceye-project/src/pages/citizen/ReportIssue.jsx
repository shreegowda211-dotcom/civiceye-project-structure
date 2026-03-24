import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import LocationInput from '@/components/common/LocationInput';
import { reportAPI } from '@/services/api';

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: {}, // Now stores {address, lat, lng, placeId}
    image: null,
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    // Validate required fields
    if (!formData.title.trim()) {
      setStatusMessage('❌ Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setStatusMessage('❌ Description is required');
      return;
    }

    if (!formData.category) {
      setStatusMessage('❌ Category is required');
      return;
    }

    if (!formData.priority) {
      setStatusMessage('❌ Priority is required');
      return;
    }

    if (!formData.location?.lat || !formData.location?.lng) {
      setStatusMessage('❌ Please select a valid location');
      return;
    }

    if (!formData.image) {
      setStatusMessage('❌ Image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('location', formData.location.address);
      formDataToSend.append('latitude', formData.location.lat);
      formDataToSend.append('longitude', formData.location.lng);
      formDataToSend.append('image', formData.image);

      const response = await reportAPI.submitIssue(formDataToSend);

      if (response.status === 200 || response.status === 201) {
        setStatusMessage('✅ Issue reported successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: '',
          location: {},
          image: null,
        });
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatusMessage('❌ Failed to report the issue. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setStatusMessage(
        error.response?.data?.message ||
        '❌ An error occurred while reporting the issue.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        className="p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Report an Issue</h1>
          <p className="text-slate-600">Help us improve your area by reporting problems</p>
        </header>

        <Card className="glassmorphism p-6 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fill in the details below</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                  placeholder="Enter issue title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Streetlight">Streetlight</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                  rows="4"
                  placeholder="Describe the issue in detail"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                  required
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <LocationInput
                  value={formData.location}
                  onChange={handleLocationChange}
                  required={true}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Upload Image</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-all">
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadCloud className="h-10 w-10 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-600">Drag and drop or click to upload</p>
                  </label>
                  {formData.image && (
                    <p className="text-sm text-emerald-600 mt-2">{formData.image.name}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 text-center">
                <Button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
                >
                  <UploadCloud className="h-5 w-5 mr-2" /> Submit Complaint
                </Button>
              </div>
            </form>
            {statusMessage && (
              <p
                className={`mt-4 text-center font-medium ${
                  statusMessage.includes('✅')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {statusMessage}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
