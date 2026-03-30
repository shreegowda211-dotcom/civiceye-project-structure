import React from 'react';
import { render, screen } from '@testing-library/react';
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'officer1', name: 'Test Officer' } })
}));

// Mock API
jest.mock('../services/api', () => ({
  officerAPI: {
    getAssignedComplaints: jest.fn(() => Promise.resolve({ data: { complaints: [] } }))
  }
}));

describe('OfficerDashboard', () => {
  it('renders dashboard layout', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <OfficerDashboard />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Welcome, Test Officer/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <OfficerDashboard />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Loading assigned complaints/i)).toBeInTheDocument();
  });
});
