import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Building2, Users, MessageSquare, TrendingUp, UserCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://localhost:3001/api/analytics';
const token = localStorage.getItem('authToken') || '';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { Authorization: `Bearer ${token}` }
});

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    totalInquiries: 0,
    averagePrice: 0
  });

  const [analytics, setAnalytics] = useState({
    propertiesByType: [],
    propertiesByLocation: [],
    propertiesByStatus: [],
    usersByRole: [],
    priceTrends: [],
    newProperties: [],
    propertiesPerAgent: [],
    inquiriesOverTime: []
  });

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/signin', {
        email: 'rayan.adjina2002@gmail.com', // Replace with real admin credentials
        pass: '0791939541Ra'           // Replace with real password
      });
      localStorage.setItem('authToken', response.data.token);
      window.location.reload(); // Reload to fetch analytics
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        console.log('Fetching analytics with token:', token);
        const [
          totalProps,
          totalUsrs,
          totalInq,
          avgPrice,
          propTypes,
          propLocations,
          propStatus,
          usrRoles,
          priceHistory,
          newProps,
          agentProps,
          inquiryHistory
        ] = await Promise.all([
          axiosInstance.get('/properties/total'),
          axiosInstance.get('/users/total'),
          axiosInstance.get('/inquiries/total'),
          axiosInstance.get('/properties/average-price'),
          axiosInstance.get('/properties/by-type'),
          axiosInstance.get('/properties/by-location'),
          axiosInstance.get('/properties/by-status'),
          axiosInstance.get('/users/by-role'),
          axiosInstance.get('/properties/price-trends'),
          axiosInstance.get('/properties/new-over-time'),
          axiosInstance.get('/properties/per-agent'),
          axiosInstance.get('/inquiries/over-time')
        ]);

        console.log('Stats data:', {
          totalProps: totalProps.data,
          totalUsrs: totalUsrs.data,
          totalInq: totalInq.data,
          avgPrice: avgPrice.data
        });
        console.log('Analytics data:', {
          propTypes: propTypes.data,
          propLocations: propLocations.data,
          propStatus: propStatus.data,
          usrRoles: usrRoles.data,
          priceHistory: priceHistory.data,
          newProps: newProps.data,
          agentProps: agentProps.data,
          inquiryHistory: inquiryHistory.data
        });

        setStats({
          totalProperties: totalProps.data.totalProperties,
          totalUsers: totalUsrs.data.totalUsers,
          totalInquiries: totalInq.data.totalInquiries,
          averagePrice: avgPrice.data.averagePrice
        });

        setAnalytics({
          propertiesByType: propTypes.data,
          propertiesByLocation: propLocations.data,
          propertiesByStatus: propStatus.data,
          usersByRole: usrRoles.data,
          priceTrends: priceHistory.data,
          newProperties: newProps.data,
          propertiesPerAgent: agentProps.data,
          inquiriesOverTime: inquiryHistory.data
        });
      } catch (err) {
        console.error('Analytics fetch error:', err.response || err);
        setError(err.response?.data?.message || err.message || 'Network Error');
      } finally {
        console.log('Loading complete, setting loading to false');
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    } else {
      console.log('No token found, setting error');
      setError('Please log in to view analytics');
      setLoading(false);
    }
  }, [token]);

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const propertyTrends = {
    labels: analytics.priceTrends.map(item => new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [{
      label: 'Average Property Price',
      data: analytics.priceTrends.map(item => item.averageprice),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: true,
      backgroundColor: 'rgba(75, 192, 192, 0.1)'
    }]
  };

  const propertyTypeChart = {
    labels: analytics.propertiesByType.map(item => item.type),
    datasets: [{
      data: analytics.propertiesByType.map(item => parseInt(item.count, 10)), // Convert to integer
      backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)']
    }]
  };

  const propertiesByStatusChart = {
    labels: analytics.propertiesByStatus.map(item => item.status),
    datasets: [{
      data: analytics.propertiesByStatus.map(item => parseInt(item.count, 10)), // Convert to integer
      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(54, 162, 235, 0.8)']
    }]
  };

  const inquiriesChart = {
    labels: analytics.inquiriesOverTime.map(item => new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [{
      label: 'Monthly Inquiries',
      data: analytics.inquiriesOverTime.map(item => parseInt(item.count, 10)), // Convert to integer
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  };

  console.log('New Properties Data:', analytics.newProperties); // Debug the data

  const newPropertiesChart = {
    labels: analytics.newProperties.map(item => new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [{
      label: 'New Properties',
      data: analytics.newProperties.map(item => parseInt(item.count, 10)), // Convert to integer
      borderColor: 'rgb(255, 159, 64)',
      tension: 0.1,
      fill: true,
      backgroundColor: 'rgba(255, 159, 64, 0.1)'
    }]
  };

  const newPropertiesChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true, // Start at 0
        min: 0, // Explicitly set minimum to 0
        ticks: {
          stepSize: 1, // Force jump by 1
          precision: 0, // Ensure integer ticks
          callback: (value) => Number(value).toFixed(0) // Format as integers
        }
      }
    }
  };

  // Aggregate duplicates and ensure numeric counts for propertiesByLocation
  const locationMap = new Map();
  analytics.propertiesByLocation.forEach(item => {
    const loc = item.location;
    const count = parseInt(item.count, 10); // Convert string to integer
    if (locationMap.has(loc)) {
      locationMap.set(loc, locationMap.get(loc) + count);
    } else {
      locationMap.set(loc, count);
    }
  });
  const uniqueLocations = Array.from(locationMap, ([location, count]) => ({ location, count }));

  const propertiesByLocationChart = {
    labels: uniqueLocations.map(item => item.location),
    datasets: [{
      data: uniqueLocations.map(item => item.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',  // Adrar
        'rgba(54, 162, 235, 0.8)',  // Chlef
        'rgba(255, 206, 86, 0.8)',  // Laghouat
        'rgba(75, 192, 192, 0.8)',  // Oum El Bouaghi
        'rgba(153, 102, 255, 0.8)', // Batna
        'rgba(255, 159, 64, 0.8)',  // Béjaïa
        'rgba(99, 255, 132, 0.8)',  // Biskra
        'rgba(235, 54, 162, 0.8)',  // Béchar
        'rgba(86, 255, 206, 0.8)',  // Blida
        'rgba(192, 75, 192, 0.8)',  // Algiers
        'rgba(128, 128, 128, 0.8)'  // Others (gray)
      ].slice(0, uniqueLocations.length)
    }]
  };

  console.log('Current state:', { loading, error, stats, analytics });
  console.log('Processed uniqueLocations:', uniqueLocations);

  if (error) {
    console.log('Rendering error:', error);
    return (
      <div className="alert alert-danger m-4" role="alert">
        Error loading analytics: {error}
        {!token && (
          <div className="mt-2">
            <button className="btn btn-primary" onClick={login}>Log In</button>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Real Estate Analytics</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Properties</h6>
                  <h3>{stats.totalProperties.toLocaleString()}</h3>
                </div>
                <Building2 size={24} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Users</h6>
                  <h3>{stats.totalUsers.toLocaleString()}</h3>
                </div>
                <Users size={24} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Inquiries</h6>
                  <h3>{stats.totalInquiries.toLocaleString()}</h3>
                </div>
                <MessageSquare size={24} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Average Price</h6>
                  <h3>${stats.averagePrice.toLocaleString()}</h3>
                </div>
                <TrendingUp size={24} className="text-danger" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <div className="chart-container" style={{ height: '300px' }}>
            <h5>Property Price Trends</h5>
            <Line data={propertyTrends} options={chartOptions} />
          </div>
        </Col>
        <Col md={6}>
          <div className="chart-container" style={{ height: '300px' }}>
            <h5>New Properties Over Time</h5>
            <Line data={newPropertiesChart} options={newPropertiesChartOptions} />
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <div className="chart-container" style={{ height: '300px' }}>
            <h5>Properties by Type</h5>
            <Doughnut data={propertyTypeChart} options={chartOptions} />
          </div>
        </Col>
        <Col md={4}>
          <div className="chart-container" style={{ height: '300px' }}>
            <h5>Properties by Status</h5>
            <Pie data={propertiesByStatusChart} options={chartOptions} />
          </div>
        </Col>
        <Col md={4}>
          <div className="chart-container" style={{ height: '300px' }}>
            <h5>Properties by Location</h5>
            <Pie data={propertiesByLocationChart} options={chartOptions} />
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <div className="chart-container" style={{ height: '300px' }}>
            <h5>Monthly Inquiries</h5>
            <Bar data={inquiriesChart} options={chartOptions} />
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Top Performing Agents</h5>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Agent Name</th>
                    <th>Properties Listed</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.propertiesPerAgent.slice(0, 5).map((agent, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <UserCheck size={18} className="me-2 text-primary" />
                          {agent.agentname}
                        </div>
                      </td>
                      <td>{agent.propertycount}</td>
                      <td>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${(agent.propertycount / Math.max(...analytics.propertiesPerAgent.map(a => a.propertycount))) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;