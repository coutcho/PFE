import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Users() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'agent', status: 'active' },
  ]);

  const [editingUser, setEditingUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      id: editingUser ? editingUser.id : Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      status: 'active',
      joinDate: formData.get('joinDate') || new Date().toISOString().split('T')[0]
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? newUser : u));
      setEditingUser(null);
    } else {
      setUsers([...users, newUser]);
    }
    e.target.reset();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

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
                    <option value="agent">Agent</option>
                    <option value="client">Client</option>
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
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge bg-${user.role === 'admin' ? 'danger' : user.role === 'agent' ? 'primary' : 'success'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">{user.status}</span>
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