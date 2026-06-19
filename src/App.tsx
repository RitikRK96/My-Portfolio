import React, { useEffect, lazy, Suspense } from "react";
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

// Pages - Lazy loaded for code splitting
import Home from "./pages/Home";
const Projects = lazy(() => import("./pages/Projects"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Photos = lazy(() => import("./pages/Photos"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookWriter = lazy(() => import("./pages/BookWriter"));
const BooksLibrary = lazy(() => import("./pages/BooksLibrary"));

const BookDetail = lazy(() => import("./pages/BookDetail"));
const PublicBooks = lazy(() => import("./pages/PublicBooks"));
const PublicBookDetail = lazy(() => import("./pages/PublicBookDetail"));

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
                className={`flex-1 flex flex-col ${location.pathname === "/" ? "pt-0" : location.pathname === "/admin/books" || location.pathname.startsWith("/admin/books/") || location.pathname === "/admin/book-writer" || location.pathname.startsWith("/books/") ? "pt-16" : "pt-20"}`}
              >
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin text-orange-500 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                        <p className="text-gray-500 text-sm">Loading page...</p>
                      </div>
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:id" element={<BlogPost />} />
                    <Route path="/photos" element={<Photos />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/books" element={<PublicBooks />} />
                    <Route path="/books/:bookId" element={<PublicBookDetail />} />

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
                </Suspense>
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
