import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Navbar from './Components/Navbar/Navbar';
import SearchBar from './Components/Navbar/Searchbar';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PropertyListings from './Components/Body/PropertyListings';
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

// Main App component
export default function App() {
  const [openSignIn, setOpenSignIn] = useState(null);

  return (
    <Router>
      <Navbar onSignInTrigger={(fn) => setOpenSignIn(() => fn)} />
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <>
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
            </>
          }
        />
        {/* Listing Page Route */}
        <Route path="/listing/:id" element={<ListingPage />} />
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
            <ResetPasswordModal
              show={true}
              onClose={() => window.history.pushState({}, "", "/")}
              onSignInClick={() => {
                if (openSignIn) openSignIn();
              }}
            />
          }
        />
        {/* Catch-All Route for Undefined Paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}