import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Navbar from './Components/Navbar/Navbar';
import SearchBar from './Components/Navbar/Searchbar';
import AuthCallback from './Components/Navbar/AuthCallback';
import Chat from './Components/Chat/Chat';
import Profile from './Components/Navbar/Profile'; // Add this import
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PropertyListings from './Components/Body/PropertyListings';
import AllListings from './Components/Body/AllListings';
import Footer from './Components/Footer/Footer';
import ListingPage from './Components/ListingPage/ListingPage';
import ResetPasswordModal from './Components/Navbar/ResetPasswordModal';
import AdminPage from "./Components/Admin/AdminPage";

// PrivateRoute component to protect admin routes
function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/" replace />;
  try {
    const { role } = jwtDecode(token);
    return role === "admin" ? children : <Navigate to="/" replace />;
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />;
  }
}

// Wrapper component to handle conditional Navbar rendering
function Layout({ children, onSignInTrigger }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar onSignInTrigger={onSignInTrigger} />}
      {children}
    </>
  );
}

// Main App component
export default function App() {
  const [openSignIn, setOpenSignIn] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <div className="min-h-screen flex flex-col justify-center items-center text-center">
                <main className="w-full max-w-7xl p-4">
                  <h1 className="text-4xl font-bold mb-6">Rechercher où habiter!</h1>
                </main>
                <SearchBar />
              </div>
              <div className="bg-light bg-gray-100">
                <PropertyListings />
              </div>
              <Footer />
            </Layout>
          }
        />
        {/* All Listings Route */}
        <Route
          path="/listings"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <AllListings />
              <Footer />
            </Layout>
          }
        />
        {/* Listing Page Route */}
        <Route
          path="/listing/:id"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <ListingPage />
            </Layout>
          }
        />
        {/* Inbox Route */}
        <Route
          path="/inbox"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <Chat />
              <Footer />
            </Layout>
          }
        />
        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <Profile />
              <Footer />
            </Layout>
          }
        />
        {/* Admin Route with Nested Sub-Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
        {/* Reset Password Route */}
        <Route
          path="/reset-password"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <ResetPasswordModal
                show={true}
                onClose={() => window.history.pushState({}, "", "/")}
                onSignInClick={() => {
                  if (openSignIn) openSignIn();
                }}
              />
            </Layout>
          }
        />
        {/* Auth Callback Route */}
        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />
        {/* Catch-All Route for Undefined Paths */}
        <Route
          path="*"
          element={
            <Layout onSignInTrigger={(fn) => setOpenSignIn(() => fn)}>
              <Navigate to="/" replace />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}