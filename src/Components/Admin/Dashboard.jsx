import React from 'react';
import { Home, DollarSign, Building, Users, Star, MapPin, User, MessageCircle, TrendingUp } from 'lucide-react';
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

const StatCard = ({ title, value, percentage, icon: Icon }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
            <h2 className="card-title mb-0">{value}</h2>
            {percentage && (
              <small className="text-success">
                <TrendingUp size={16} className="me-1" />
                {percentage}% this month
              </small>
            )}
          </div>
          {Icon && <Icon size={24} className="text-primary" />}
        </div>
      </div>
    </div>
  );
};

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

const Chart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Property Types Trend'
      }
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

const chartData = {
  labels: ['Nov 1', 'Nov 2', 'Nov 3', 'Nov 4', 'Nov 5', 'Nov 6'],
  datasets: [
    {
      label: 'Luxury',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#0d6efd',
      tension: 0.1
    },
    {
      label: 'Commercial',
      data: [28, 48, 40, 19, 86, 27],
      borderColor: '#6c757d',
      tension: 0.1
    }
  ]
};

const properties = [
  {
    name: 'Luxury Villa',
    location: 'Beverly Hills, CA',
    agent: 'John Smith',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Modern Apartment',
    location: 'Manhattan, NY',
    agent: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  }
];

const agents = [
  {
    name: 'John Smith',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    bio: 'Top performer with 10+ years of experience'
  },
  {
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    bio: 'Luxury property specialist'
  }
];

const messages = [
  {
    user: 'John Smith',
    message: 'New listing available in Beverly Hills',
    timestamp: '2h ago',
    status: 'unread'
  },
  {
    user: 'Sarah Johnson',
    message: 'Client meeting scheduled for tomorrow',
    timestamp: '5h ago',
    status: 'read'
  }
];

function App() {
  return (
    <div className="container-fluid p-4 bg-white">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard title="Total Properties" value="5.6k" percentage="8" icon={Home} />
        </div>
        <div className="col-md-4">
          <StatCard title="For Rent" value="3.4k" percentage="8" icon={DollarSign} />
        </div>
        <div className="col-md-4">
          <StatCard title="For Sale" value="1.6k" percentage="8" icon={Building} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Popular Properties</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {properties.map((property, index) => (
                  <div key={index} className="col-md-6">
                    <PropertyCard {...property} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Chart data={chartData} />
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Top Agents</h5>
            </div>
            <div className="card-body">
              {agents.map((agent, index) => (
                <AgentCard key={index} {...agent} />
              ))}
            </div>
          </div>

          <MessageList messages={messages} />
        </div>
      </div>
    </div>
  );
}

export default App;