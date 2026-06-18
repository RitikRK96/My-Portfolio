import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { ProjectProvider } from "./context/ProjectContext";
import { BlogProvider } from "./context/BlogContext";
import { PhotoProvider } from "./context/PhotoContext";
import { ContactProvider } from "./context/ContactContext";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingAddButton from "./components/FloatingAddButton";
import { useAuth } from "./context/AuthContext";

// Pages - Placeholders for now
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import Photos from "./pages/Photos";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import BookWriter from "./pages/BookWriter";
import BooksLibrary from "./pages/BooksLibrary";

import BookDetail from "./pages/BookDetail";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Unauthorized access. Redirecting to home...", {
        id: "unauth-redirect",
      });
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin text-orange-500 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          <p className="text-gray-600 text-sm">Checking authentication…</p>
        </div>
      </div>
    );
  if (!user) return null;
  return <>{children}</>;
};

const NotFoundRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    toast.error("Wrong or broken link. Redirecting to home...", {
      id: "notfound-redirect",
    });
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
};

const App = () => {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <ProjectProvider>
      <BlogProvider>
        <PhotoProvider>
          <ContactProvider>
            <div className="min-h-screen w-full flex flex-col overflow-x-hidden font-sans text-gray-100 selection:bg-orange-500 selection:text-white">
              <div className="naruto-bg"></div>
              <div className="grid-bg"></div>
              <Navbar />
              <main
                className={`flex-1 flex flex-col ${location.pathname === "/" ? "pt-0" : location.pathname === "/admin/books" || location.pathname.startsWith("/admin/books/") || location.pathname === "/admin/book-writer" ? "pt-16" : "pt-20"}`}
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:id" element={<BlogPost />} />
                  <Route path="/photos" element={<Photos />} />
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

                  <Route
                    path="/admin/books"
                    element={
                      <ProtectedRoute>
                        <BooksLibrary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/books/:bookId"
                    element={
                      <ProtectedRoute>
                        <BookDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/book-writer"
                    element={
                      <ProtectedRoute>
                        <BookWriter />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundRedirect />} />
                </Routes>
              </main>
              <ScrollToTop />
              <FloatingAddButton />
              <Footer />
              <Toaster
                position="bottom-right"
                containerClassName="z-[9999999]"
                toastOptions={{
                  className:
                    "glass !bg-gray-900 !text-white !border !border-white/10",
                }}
              />
            </div>
          </ContactProvider>
        </PhotoProvider>
      </BlogProvider>
    </ProjectProvider>
  );
};

export default App;
