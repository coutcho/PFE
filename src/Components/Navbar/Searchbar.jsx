import React, { useState, useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './SearchBar.css';
import FilterSidebar from './FilterSideBar';

export default function SearchBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation

  // Toggle filter sidebar visibility
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle input changes and fetch suggestions from Nominatim API
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion.display_name);
    setShowSuggestions(false);
    // Optionally navigate with search data (not required for this task)
    navigate('/listings'); // Navigate even with suggestion
  };

  // Handle search button click
  const handleSearchClick = () => {
    navigate('/listings'); // Navigate to AllListings page
  };

  // Hide suggestions when clicking outside
  const handleClickOutside = (event) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container w-50 position-relative">
      {/* Input Group */}
      <div className="input-group shadow d-flex gap-2 position-relative">
        <input
          type="text"
          className="form-control form-control-lg rounded"
          placeholder="Rechercher une ville, un quartier..."
          aria-label="Search"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button
          className="btn btn-primary btn-md rounded"
          type="button" // Change to button to prevent form submission
          onClick={handleSearchClick} // Add onClick handler
        >
          Rechercher
        </button>
        <button className="btn btn-light rounded-circle" onClick={toggleFilter}>
          <Filter className="w-5 h-5" />
        </button>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="list-group position-absolute w-75"
            style={{ top: '100%', zIndex: 1000 }}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="list-group-item list-group-item-action"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filter Sidebar */}
      <div
        className={`filter-sidebar bg-dark text-white ${isFilterOpen ? 'open' : ''}`}
        style={{ minWidth: '0px', zIndex: 1000 }}
      >
        <FilterSidebar onClose={() => setIsFilterOpen(false)} />
      </div>

      {/* Overlay to Close Sidebar */}
      {isFilterOpen && (
        <div
          className="filter-overlay"
          onClick={toggleFilter}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        ></div>
      )}
    </div>
  );
}