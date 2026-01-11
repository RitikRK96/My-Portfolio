import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

// Pages - Placeholders for now
import Home from './pages/Home';
import Projects from './pages/Projects';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import Photos from './pages/Photos';
import Songs from './pages/Songs';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const App = () => {

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-100 selection:bg-blue-500 selection:text-white pb-20">
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogPost />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Toaster position="bottom-right" toastOptions={{
        className: 'glass !bg-gray-900 !text-white !border !border-white/10',
      }} />
    </div>
  );
};

export default App;