import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Building, MapPin, User, Star } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Utility function for authenticated API calls
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found. Please sign in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// StatCard Component
const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex align-items-center">
        <Icon size={24} className="me-3 text-primary" />
        <div>
          <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
          <h2 className="card-title mb-0">{value}</h2>
        </div>
      </div>
    </div>
  );
};

// PropertyCard Component
const PropertyCard = ({ name, location, agent, image }) => {
  return (
    <div className="card shadow-sm h-100 transition-shadow hover-shadow">
      <img src={image} className="card-img-top" alt={name} style={{ height: '200px', objectFit: 'cover' }} />
      <div className="card-body">
        <h5 className="card-title">{name}</h5>
        <p className="card-text text-muted">
          <MapPin size={16} className="me-1" />
          {location}
        </p>
        <div className="d-flex align-items-center mt-3">
          <User size={16} className="me-2" />
          <span>{agent}</span>
        </div>
      </div>
    </div>
  );
};

// AgentCard Component
const AgentCard = ({ name, avatar, rating, bio }) => {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <img src={avatar} alt={name} className="rounded-circle me-3" width="50" height="50" />
          <div>
            <h6 className="mb-0">{name}</h6>
            <div className="text-warning">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>
        <p className="card-text mt-2 small text-muted">{bio}</p>
      </div>
    </div>
  );
};

// MessageList Component
const MessageList = ({ messages }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">Recent Messages</h5>
      </div>
      <div className="card-body p-0">
        {messages.map((message, index) => (
          <div key={index} className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h6 className="mb-0">{message.user}</h6>
              <small className="text-muted">{message.timestamp}</small>
            </div>
            <p className="mb-0 small text-muted">{message.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chart Component
const Chart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'New Properties Over Time' }
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [totalProperties, setTotalProperties] = useState(0);
  const [forRentCount, setForRentCount] = useState(0);
  const [forSaleCount, setForSaleCount] = useState(0);
  const [popularProperties, setPopularProperties] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await fetchWithAuth('http://localhost:3001/api/users/me');
        setUserRole(userData.role); // e.g., "admin", "agent", "expert"
        setIsAuthenticated(true);

        if (userData.role === 'admin') {
          fetchAdminData();
        } else {
          fetchRegularData();
        }
      } catch (error) {
        setError(error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (localStorage.getItem('authToken')) {
      fetchUserData();
    } else {
      window.location.href = 'http://localhost:5173/signin';
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      const [
        totalProps,
        propsByStatus,
        inquiriesPerProperty,
        propsPerAgent,
        newPropsOverTime,
      ] = await Promise.all([
        fetchWithAuth('http://localhost:3001/api/analytics/properties/total'),
        fetchWithAuth('http://localhost:3001/api/analytics/properties/by-status'),
        fetchWithAuth('http://localhost:3001/api/analytics/inquiries/per-property'),
        fetchWithAuth('http://localhost:3001/api/analytics/properties/per-agent'),
        fetchWithAuth('http://localhost:3001/api/analytics/properties/new-over-time'),
      ]);

      setTotalProperties(totalProps.totalProperties || 0);
      const forRent = propsByStatus.find((s) => s.status.toLowerCase() === 'for rent');
      const forSale = propsByStatus.find((s) => s.status.toLowerCase() === 'active');
      setForRentCount(forRent ? forRent.count : 0);
      setForSaleCount(forSale ? forSale.count : 0);

      const topPropertyIds = inquiriesPerProperty
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map((item) => item.property_id);
      const popularPropsDetails = await Promise.all(
        topPropertyIds.map((id) => fetchWithAuth(`http://localhost:3001/api/properties/${id}`))
      );
      setPopularProperties(popularPropsDetails);

      const sortedAgents = propsPerAgent
        .sort((a, b) => b.propertycount - a.propertycount)
        .slice(0, 2);
      setTopAgents(
        sortedAgents.map((agent) => ({
          name: agent.agentname,
          avatar: agent.avatar || 'default-avatar.png',
          rating: agent.rating || 0,
          bio: agent.bio || 'No bio available',
        }))
      );

      setRecentMessages([]); // Placeholder

      const labels = newPropsOverTime.map((item) => item.month);
      const data = newPropsOverTime.map((item) => item.count);
      setChartData({
        labels,
        datasets: [
          {
            label: 'New Properties',
            data,
            borderColor: '#0d6efd',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      setError(error.message);
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchRegularData = async () => {
    try {
      const totalProps = await fetchWithAuth('http://localhost:3001/api/analytics/properties/total');
      setTotalProperties(totalProps.totalProperties || 0);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching regular data:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  if (isLoading) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
          <br />
          <button
            className="btn btn-primary mt-2"
            onClick={() => {
              localStorage.removeItem('authToken');
              setIsAuthenticated(false);
            }}
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  if (userRole && userRole !== 'admin') {
    window.location.href = 'http://localhost:5173/user-dashboard'; // Redirect non-admins
    return null;
  }

  return (
    <div className="container-fluid p-4 bg-white">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard title="Total Properties" value={totalProperties} icon={Home} />
        </div>
        {userRole === 'admin' && (
          <>
            <div className="col-md-4">
              <StatCard title="For Rent" value={forRentCount} icon={DollarSign} />
            </div>
            <div className="col-md-4">
              <StatCard title="For Sale" value={forSaleCount} icon={Building} />
            </div>
          </>
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Popular Properties</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {popularProperties.map((property, index) => (
                  <div key={index} className="col-md-6">
                    <PropertyCard
                      name={property.name}
                      location={property.location}
                      agent={property.agent_name}
                      image={property.image_url}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Chart data={chartData} />
        </div>

        <div className="col-lg-4">
          {userRole === 'admin' && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Top Agents</h5>
              </div>
              <div className="card-body">
                {topAgents.map((agent, index) => (
                  <AgentCard
                    key={index}
                    name={agent.name}
                    avatar={agent.avatar}
                    rating={agent.rating}
                    bio={agent.bio}
                  />
                ))}
              </div>
            </div>
          )}

          <MessageList messages={recentMessages} />
        </div>
      </div>
    </div>
  );
}

export default App;