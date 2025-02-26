import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import './SearchBar.css';
import FilterSidebar from './FilterSideBar';

export default function SearchBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State to control the filter sidebar

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen); // Toggle the filter sidebar visibility
  };

  return (
    <div className="search-bar-container w-50 position-relative">
      {/* Input Group */}
      <div className="input-group shadow d-flex gap-2">
        <input
          type="text"
          className="form-control form-control-lg rounded"
          placeholder="Rechercher une ville, un quartier..."
          aria-label="Search"
        />
        <button className="btn btn-primary btn-md rounded" type="submit">
          Rechercher
        </button>
        <button className="btn btn-light rounded-circle" onClick={toggleFilter}>
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`filter-sidebar bg-dark text-white ${isFilterOpen ? 'open' : ''}`}
        style={{ minWidth: '0px', zIndex: 1000 }}
      >
        <FilterSidebar onClose={() => setIsFilterOpen(false)} /> {/* Pass onClose handler */}
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