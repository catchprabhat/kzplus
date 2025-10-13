import { useState, useEffect } from 'react';
import { CarSubmission } from '../types';

// Mock data for car submissions
const mockSubmissions: CarSubmission[] = [
  {
    id: '1',
    name: 'Honda Civic LX 2023',
    brand: 'Honda',
    model: 'Civic LX',
    year: 2023,
    type: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 75,
    features: ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Backup Camera'],
    description: 'Well-maintained Honda Civic with excellent fuel efficiency and modern features.',
    images: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg'],
    documents: {
      registration: 'rc_honda_civic.pdf',
      insurance: 'insurance_honda_civic.pdf',
      pollution: 'puc_honda_civic.pdf'
    },
    ownerDetails: {
      name: 'Prasanth Kumar',
      email: 'pkumargr26@gmail.com',
      phone: '+1-9972099669',
      address: 'Electronic City,Bangalore',
      licenseNumber: 'HR-21-xxxx',
      registration: ''
    },
    status: 'pending',
    submittedAt: new Date(2025, 0, 10),
  },
  {
    id: '2',
    name: 'Tesla Model 3 Standard',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2022,
    type: 'Electric',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Electric',
    pricePerDay: 120,
    features: ['Autopilot', 'Premium Audio', 'Heated Seats', 'Fast Charging'],
    description: 'Premium electric vehicle with cutting-edge technology and zero emissions.',
    images: ['https://images.pexels.com/photos/193991/pexels-photo-193991.jpeg'],
    documents: {
      registration: 'rc_tesla_model3.pdf',
      insurance: 'insurance_tesla_model3.pdf',
      pollution: 'puc_tesla_model3.pdf'
    },
    ownerDetails: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1-555-0456',
      address: '456 Oak Ave, Somewhere, ST 67890',
      licenseNumber: 'DL0987654321',
      registration: ''
    },
    status: 'approved',
    submittedAt: new Date(2025, 0, 8),
    reviewedAt: new Date(2025, 0, 9),
    reviewedBy: 'admin',
    adminNotes: 'Excellent condition, approved for premium listing'
  },
  {
    id: '3',
    name: 'BMW X5 xDrive40i',
    brand: 'BMW',
    model: 'X5 xDrive40i',
    year: 2021,
    type: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Petrol',
    pricePerDay: 150,
    features: ['4WD', 'Panoramic Roof', 'Premium Sound', 'Navigation', 'Leather Seats'],
    description: 'Luxury SUV with premium features and excellent performance.',
    images: ['https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg'],
    documents: {
      registration: 'rc_bmw_x5.pdf',
      insurance: 'insurance_bmw_x5.pdf',
      pollution: 'puc_bmw_x5.pdf'
    },
    ownerDetails: {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1-555-0789',
      address: '789 Pine St, Elsewhere, ST 13579',
      licenseNumber: 'DL1357924680',
      registration: ''
    },
    status: 'rejected',
    submittedAt: new Date(2025, 0, 5),
    reviewedAt: new Date(2025, 0, 6),
    reviewedBy: 'admin',
    rejectionReason: 'Vehicle maintenance records incomplete',
    adminNotes: 'Please provide complete service history'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCarSubmissions = () => {
  const [submissions, setSubmissions] = useState<CarSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      await delay(500);
      
      // Sort submissions by submission date (newest first)
      const sortedSubmissions = [...mockSubmissions].sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      
      setSubmissions(sortedSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  // Create a new submission
  const createSubmission = async (submission: CarSubmission): Promise<CarSubmission> => {
    try {
      setError(null);
      await delay(800);
      
      const newSubmission = {
        ...submission,
        id: Date.now().toString(),
        submittedAt: new Date()
      };

      // Add to mock data (in real app, this would be an API call)
      mockSubmissions.unshift(newSubmission);
      setSubmissions(prev => [newSubmission, ...prev]);
      
      return newSubmission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Approve a submission
  const approveSubmission = async (id: string, adminNotes?: string): Promise<CarSubmission> => {
    try {
      setError(null);
      await delay(300);
      
      // Find and update in mock data
      const submissionIndex = mockSubmissions.findIndex(s => s.id === id);
      if (submissionIndex === -1) throw new Error('Submission not found');
      
      mockSubmissions[submissionIndex] = {
        ...mockSubmissions[submissionIndex],
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: 'admin',
        adminNotes
      };
      
      const updatedSubmission = mockSubmissions[submissionIndex];
      
      setSubmissions(prev => prev.map(submission => 
        submission.id === id ? updatedSubmission : submission
      ));
      
      return updatedSubmission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Reject a submission
  const rejectSubmission = async (id: string, reason: string, adminNotes?: string): Promise<CarSubmission> => {
    try {
      setError(null);
      await delay(300);
      
      // Find and update in mock data
      const submissionIndex = mockSubmissions.findIndex(s => s.id === id);
      if (submissionIndex === -1) throw new Error('Submission not found');
      
      mockSubmissions[submissionIndex] = {
        ...mockSubmissions[submissionIndex],
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: 'admin',
        rejectionReason: reason,
        adminNotes
      };
      
      const updatedSubmission = mockSubmissions[submissionIndex];
      
      setSubmissions(prev => prev.map(submission => 
        submission.id === id ? updatedSubmission : submission
      ));
      
      return updatedSubmission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete a submission
  const deleteSubmission = async (id: string) => {
    try {
      setError(null);
      await delay(300);
      
      // Remove from mock data
      const submissionIndex = mockSubmissions.findIndex(s => s.id === id);
      if (submissionIndex === -1) throw new Error('Submission not found');
      
      mockSubmissions.splice(submissionIndex, 1);
      setSubmissions(prev => prev.filter(submission => submission.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load submissions on mount
  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    createSubmission,
    approveSubmission,
    rejectSubmission,
    deleteSubmission
  };
};