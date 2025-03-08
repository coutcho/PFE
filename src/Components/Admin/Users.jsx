import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api/users';
  const token = localStorage.getItem('authToken');

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError('Please sign in as an admin to view users');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_BASE_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed or admin access required. Please sign in as an admin.');
          }
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        const filteredUsers = data.filter(user => ['admin', 'chauffeur', 'agent'].includes(user.role));
        setUsers(filteredUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please sign in as an admin to add or edit users');
      return;
    }

    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      joinDate: formData.get('joinDate') || new Date().toISOString().split('T')[0],
      password: formData.get('password'), // Send password for both add and edit (optional for edit)
    };

    try {
      let response;
      if (editingUser) {
        response = await fetch(`${API_BASE_URL}/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      } else {
        if (!userData.password) {
          throw new Error('Password is required for new users');
        }
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed or admin access required. Please sign in as an admin.');
        }
        throw new Error(errorData.message || (editingUser ? 'Failed to update user' : 'Failed to add user'));
      }
      const savedUser = await response.json();

      if (editingUser) {
        setUsers(users.map(u => (u.id === editingUser.id ? savedUser : u)));
        setEditingUser(null);
      } else {
        if (['admin', 'chauffeur', 'agent'].includes(savedUser.role)) {
          setUsers([...users, savedUser]);
        }
      }
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError('Please sign in as an admin to delete users');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed or admin access required. Please sign in as an admin.');
          }
          throw new Error('Failed to delete user');
        }
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'chauffeur':
        return 'primary';
      case 'agent':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (!token) return <div>Please sign in as an admin to manage users.</div>;
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Users</h1>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    defaultValue={editingUser?.name}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    defaultValue={editingUser?.email}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    {editingUser ? 'New Password (optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    required={!editingUser} // Required only for new users
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    defaultValue={editingUser?.phone}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select 
                    className="form-select" 
                    id="role" 
                    name="role" 
                    defaultValue={editingUser?.role || ''}
                    required
                  >
                    <option value="">Select role...</option>
                    <option value="admin">Admin</option>
                    <option value="chauffeur">Chauffeur</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="joinDate" className="form-label">Join Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="joinDate"
                    name="joinDate"
                    defaultValue={editingUser?.joinDate}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">User List</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge bg-${getRoleBadgeColor(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(user)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(user.id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;