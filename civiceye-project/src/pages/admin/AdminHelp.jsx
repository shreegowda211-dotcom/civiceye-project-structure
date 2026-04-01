import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, GradientCard } from '@/components/ui/card';
import { helpAPI } from '@/services/api';
import { BookOpen, Users, UserCheck, Building, AlertCircle, BarChart3, Phone, Lock, Search } from 'lucide-react';

const iconMap = {
  BookOpen: <BookOpen className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  UserCheck: <UserCheck className="h-6 w-6" />,
  Building: <Building className="h-6 w-6" />,
  AlertCircle: <AlertCircle className="h-6 w-6" />,
  BarChart3: <BarChart3 className="h-6 w-6" />,
  Phone: <Phone className="h-6 w-6" />,
  Lock: <Lock className="h-6 w-6" />,
};

export default function AdminHelp() {
  const [helpContent, setHelpContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchHelpContent();
  }, []);

  const fetchHelpContent = async () => {
    try {
      setLoading(true);
      const response = await helpAPI.getAllHelp();
      if (response.data.success) {
        setHelpContent(response.data.data);
        setFilteredContent(response.data.data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(response.data.data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching help content:', err);
      setError('Failed to load help content');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      // Reset to category filter if search is empty
      if (selectedCategory === 'All') {
        setFilteredContent(helpContent);
      } else {
        setFilteredContent(helpContent.filter(item => item.category === selectedCategory));
      }
      return;
    }

    try {
      const response = await helpAPI.searchHelp(query);
      if (response.data.success) {
        setFilteredContent(response.data.data);
      }
    } catch (err) {
      console.error('Error searching help:', err);
      setFilteredContent([]);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');

    if (category === 'All') {
      setFilteredContent(helpContent);
    } else {
      setFilteredContent(helpContent.filter(item => item.category === category));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-slate-50/80 p-6 rounded-3xl backdrop-blur shadow-lg">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Help & Documentation</h1>
          <p className="text-slate-600">Find answers, guides, and support for the CivicEye admin portal</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-black shadow-lg'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border border-emerald-300 border-t-emerald-600"></div>
          </div>
        )}

        {/* Help Articles Grid */}
        {!loading && (
          <>
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No help articles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContent.map(article => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-emerald-600 mt-1">
                          {iconMap[article.icon] || <BookOpen className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full mb-2 font-medium">
                            {article.category}
                          </span>
                          <CardTitle className="text-lg text-slate-900">{article.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm leading-relaxed">{article.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600" />
              Still need help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-3">
              Can't find what you're looking for? Contact our support team:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                📧 Email: <span className="font-semibold text-emerald-700">support@civiceye.com</span>
              </p>
              <p>
                📞 Phone: <span className="font-semibold text-emerald-700">1-800-CIVIC-EYE</span>
              </p>
              <p>
                🕐 Support Hours: <span className="font-semibold text-emerald-700">Monday - Friday, 9AM - 6PM EST</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
