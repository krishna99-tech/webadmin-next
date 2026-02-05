import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IoTProvider } from '../context/IoTContext';
import MainLayout from '../components/Layout/MainLayout.jsx';
import Loading from '../components/UI/Loading';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  useEffect(() => {
    // This effect ensures we check auth state
  }, [currentUser, loading]);

  if (loading) {
    return <Loading fullScreen label="Loading IoT Console..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

  return (
    <IoTProvider isAdmin={isAdmin}>
      <MainLayout>{children}</MainLayout>
    </IoTProvider>
  );
};

export default ProtectedRoute;
