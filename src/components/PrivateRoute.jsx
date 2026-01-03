import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    
    const PrivateRoute = ({ children, requiredRole }) => {
      const { user, loading } = useAuth();
      const location = useLocation();
    
      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <p>Carregando...</p>
          </div>
        );
      }
    
      if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    
      if (requiredRole) {
        const hasRequiredRole = requiredRole === 'member' 
          ? (user.role === 'member' || user.role === 'admin') 
          : user.role === requiredRole;
        
        if (!hasRequiredRole) {
          return <Navigate to="/dashboard" replace />;
        }
      }
    
      return children;
    };
    
    export default PrivateRoute;