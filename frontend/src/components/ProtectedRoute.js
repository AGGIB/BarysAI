import { Navigate } from 'react-router-dom';

// A wrapper for <Route> that redirects to the login page if user isn't authenticated
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 