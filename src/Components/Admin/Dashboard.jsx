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
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const labels = ['January', 'February', 'March', 'April', 'May', 'June'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Property Views',
        data: labels.map(() => faker.number.int({ min: 1000, max: 5000 })),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Properties</h5>
              <p className="card-text display-4">120</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Active Listings</h5>
              <p className="card-text display-4">85</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <p className="card-text display-4">$50K</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Property Views Over Time</h5>
              <Line data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;