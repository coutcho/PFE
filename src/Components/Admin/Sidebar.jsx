import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaHome, FaUsers, FaInbox, FaCog } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="bg-dark text-white d-flex flex-column p-3 vh-100" style={{ width: '250px' }}>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/" className="nav-link text-white">
            <FaTachometerAlt className="me-2" />
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/properties" className="nav-link text-white">
            <FaHome className="me-2" />
            Properties
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/users" className="nav-link text-white">
            <FaUsers className="me-2" />
            Users
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/inquiries" className="nav-link text-white">
            <FaInbox className="me-2" />
            Inquiries
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/settings" className="nav-link text-white">
            <FaCog className="me-2" />
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;