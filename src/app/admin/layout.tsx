'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication has finished loading and user is not authenticated or not admin
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/'); // Redirect to homepage
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  // Show loading state or render admin content
  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f1f5f9' 
      }}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Render admin content for authenticated admin users
  return <>{children}</>;
} 