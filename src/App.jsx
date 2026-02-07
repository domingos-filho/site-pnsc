
import React from 'react';
    import { Routes, Route, Navigate } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import { AuthProvider } from '@/contexts/AuthContext';
    import { DataProvider } from '@/contexts/DataContext';
    import Layout from '@/components/Layout';
    import Home from '@/pages/Home';
    import Communities from '@/pages/Communities';
    import CommunityDetail from '@/pages/CommunityDetail';
    import Pastorals from '@/pages/Pastorals';
    import Gallery from '@/pages/Gallery';
    import Events from '@/pages/Events';
    import About from '@/pages/About';
    import Team from '@/pages/Team';
    import Contact from '@/pages/Contact';
    import Login from '@/pages/Login';
    import Dashboard from '@/pages/Dashboard';
    import ManageGallery from '@/pages/admin/ManageGallery';
    import ManageUsers from '@/pages/admin/ManageUsers';
    import SiteSettings from '@/pages/admin/SiteSettings';
    import PrivateRoute from '@/components/PrivateRoute';
    
    function App() {
      return (
        <AuthProvider>
          <DataProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/comunidades" element={<Communities />} />
                <Route path="/comunidades/:id" element={<CommunityDetail />} />
                <Route path="/pastorais" element={<Pastorals />} />
                <Route path="/galeria" element={<Gallery />} />
                <Route path="/agenda" element={<Events />} />
                <Route path="/quem-somos" element={<About />} />
                <Route path="/equipe" element={<Team />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/login" element={<Login />} />
      
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route
                  path="/dashboard/events"
                  element={
                    <PrivateRoute requiredRole="secretary">
                      <Navigate to="/agenda" replace />
                    </PrivateRoute>
                  }
                />
                <Route path="/dashboard/gallery" element={<PrivateRoute requiredRole="member"><ManageGallery /></PrivateRoute>} />
                <Route path="/dashboard/users" element={<PrivateRoute requiredRole="admin"><ManageUsers /></PrivateRoute>} />
                <Route path="/dashboard/settings" element={<PrivateRoute requiredRole="admin"><SiteSettings /></PrivateRoute>} />
              </Routes>
            </Layout>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      );
    }
    
    export default App;
