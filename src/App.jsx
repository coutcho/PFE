import { useState } from 'react'; // Add useState for sign-in trigger
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/navbar';
import SearchBar from './Components/Navbar/Searchbar';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PropertyListings from './Components/Body/PropertyListings';
import Footer from './Components/Footer/Footer';
import ListingPage from './Components/ListingPage/ListingPage';
import ResetPasswordModal from './Components/Navbar/ResetPasswordModal';

export default function App() {
  const [openSignIn, setOpenSignIn] = useState(null); // To trigger SignInModal from Navbar

  return (
    <Router>
      <Navbar onSignInTrigger={(fn) => setOpenSignIn(() => fn)} /> {/* Pass callback */}
      <Routes>
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
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route
          path="/reset-password"
          element={
            <ResetPasswordModal
              show={true}
              onClose={() => window.history.pushState({}, "", "/")} // Still works, but navigate is better
              onSignInClick={() => {
                if (openSignIn) openSignIn(); // Trigger SignInModal
              }}
            />
          }
        />
      </Routes>
    </Router>
  );
}