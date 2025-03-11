import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './ChatCSS.css';

function Chat({ refresh, onRefreshComplete }) {
  const [inquiries, setInquiries] = useState([]);
  const [homeValues, setHomeValues] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const API_INQUIRIES_URL = 'http://localhost:3001/api/inquiries';
  const API_USERS_URL = 'http://localhost:3001/api/users';
  const API_HOME_VALUES_URL = 'http://localhost:3001/api/home-values';

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchInquiries();
      fetchHomeValues();
    } else {
      setError('Veuillez vous connecter pour voir les messages');
    }
  }, [token]);

  useEffect(() => {
    if (refresh) {
      fetchInquiries();
      fetchHomeValues();
      if (onRefreshComplete) onRefreshComplete();
    }
  }, [refresh]);

  useEffect(() => {
    if (selectedItem) {
      fetchMessages(selectedItem.id, selectedItem.type);
    } else {
      setMessages([]);
    }
  }, [selectedItem]);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_USERS_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const userData = await response.json();
      setCurrentUserId(userData.id);
      setUserRole(userData.role);
      console.log('Current user:', userData);
    } catch (err) {
      setError('Impossible de récupérer les informations utilisateur');
      console.error('fetchCurrentUser error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_INQUIRIES_URL}/user/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch inquiries');
      const data = await response.json();
      setInquiries(data.map(item => ({ ...item, type: 'inquiry' })));
      console.log('Inquiries fetched:', data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('fetchInquiries error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHomeValues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_HOME_VALUES_URL}/user-and-expert`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch home values');
      }
      const data = await response.json();
      setHomeValues(data.map(item => ({ ...item, type: 'home_value' })));
      console.log('Home values fetched:', data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('fetchHomeValues error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (itemId, itemType) => {
    setIsLoading(true);
    try {
      const url = itemType === 'inquiry' 
        ? `${API_INQUIRIES_URL}/${itemId}/messages` 
        : `${API_HOME_VALUES_URL}/${itemId}/messages`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
      console.log(`Messages for ${itemType} ${itemId}:`, data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('fetchMessages error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedItem) return;

    setIsLoading(true);
    try {
      const url = selectedItem.type === 'inquiry' 
        ? `${API_INQUIRIES_URL}/${selectedItem.id}/messages` 
        : `${API_HOME_VALUES_URL}/${selectedItem.id}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      setNewMessage('');
      await fetchMessages(selectedItem.id, selectedItem.type);
    } catch (err) {
      setError(err.message);
      console.error('handleSendMessage error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateRequest = async (requestId, e) => {
    e.stopPropagation();
    if (userRole !== 'expert') {
      alert('Only experts can validate requests.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_HOME_VALUES_URL}/${requestId}/validate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to validate request');
      const data = await response.json();
      console.log('Validated request:', data);
      fetchHomeValues();
    } catch (err) {
      setError(err.message);
      console.error('handleValidateRequest error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInquiry = async (itemId, type, e) => {
    e.stopPropagation();
    
    // For home_value, check if user owns it or is an expert with the right permission
    if (type === 'home_value') {
      const homeValue = homeValues.find(item => item.id === itemId);
      
      // Expert can only delete if they're assigned to it
      if (userRole === 'expert' && homeValue.expert_id !== currentUserId) {
        alert('Only the assigned expert can delete this home value request.');
        return;
      }
      
      // Regular user can only delete their own requests
      if (userRole !== 'expert' && homeValue.user_id !== currentUserId) {
        alert('You can only delete your own home value requests.');
        return;
      }
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément?')) return;
    
    setIsLoading(true);
    try {
      const url = type === 'inquiry' ? `${API_INQUIRIES_URL}/${itemId}` : `${API_HOME_VALUES_URL}/${itemId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      if (type === 'inquiry') {
        setInquiries(inquiries.filter(item => item.id !== itemId));
      } else {
        setHomeValues(homeValues.filter(item => item.id !== itemId));
      }
      if (selectedItem?.id === itemId && selectedItem?.type === type) {
        setSelectedItem(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('handleDeleteInquiry error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldAlignRight = (message) => message.message_type === 'self';

  const hasUnreadMessages = (itemId, itemType) => {
    if (!selectedItem || selectedItem.id !== itemId || selectedItem.type !== itemType) return false;
    return messages.some(msg => msg.sender_id !== currentUserId && !msg.is_read);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Helper function to determine if user can delete a home value request
  const canDeleteHomeValue = (item) => {
    // Expert can delete if they're assigned to it
    if (userRole === 'expert' && item.expert_id === currentUserId) return true;
    
    // User can delete their own requests
    if (item.user_id === currentUserId) return true;
    
    return false;
  };

  const combinedItems = [...inquiries, ...homeValues];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4 col-lg-3 sidebar p-4">
          <h5 className="mb-4">Messages</h5>
          {isLoading && <p className="text-muted">Chargement...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {combinedItems.length === 0 && !error && !isLoading ? (
            <p className="text-muted small">Aucune conversation.</p>
          ) : (
            <ul className="list-group">
              {combinedItems.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className={`list-group-item list-group-item-action ${selectedItem?.id === item.id && selectedItem?.type === item.type ? 'active' : ''}`}
                  onClick={() => setSelectedItem(item)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>
                        {item.type === 'inquiry'
                          ? (item.property_title || `Demande #${item.id}`)
                          : `Estimation: ${item.address}`}
                        {item.type === 'home_value' && item.expert_id ? ' (Réservée)' : ''}
                      </strong>
                      <br />
                      <small className="text-muted">{format(new Date(item.created_at), 'MMM d, yyyy')}</small>
                    </div>
                    <div className="d-flex gap-2">
                      {item.type === 'home_value' && !item.expert_id && userRole === 'expert' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={(e) => handleValidateRequest(item.id, e)}
                          title="Valider"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      
                      {/* Delete button for home_value - for both experts (assigned) and users (own requests) */}
                      {item.type === 'home_value' && canDeleteHomeValue(item) && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleDeleteInquiry(item.id, item.type, e)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      {/* Delete button for inquiries */}
                      {item.type === 'inquiry' && (item.role === 'user' || item.role === 'agent') && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleDeleteInquiry(item.id, item.type, e)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {hasUnreadMessages(item.id, item.type) && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-8 col-lg-9 messages-container p-4">
          {isLoading && <p className="text-center">Chargement des messages...</p>}
          {!selectedItem && !isLoading ? (
            <div className="text-center mt-5">
              <MessageSquare size={48} className="text-muted mb-3" />
              <h4>Aucun Élément Sélectionné</h4>
            </div>
          ) : (
            selectedItem && (
              <div>
                <h5 className="mb-3">
                  {selectedItem.type === 'inquiry'
                    ? (selectedItem.property_title || `Demande #${selectedItem.id}`)
                    : `Estimation: ${selectedItem.address}`}
                  {selectedItem.type === 'home_value' && selectedItem.expert_id ? ' (Réservée)' : ''}
                </h5>
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="mb-3">
                    <h6>Images:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedItem.images.map((img, index) => (
                        <img
                          key={index}
                          src={`http://localhost:3001${img}`}
                          alt={`Image ${index + 1}`}
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => handleImageClick(`http://localhost:3001${img}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="chat-messages p-3" style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  {messages.length === 0 && !isLoading ? (
                    <p className="text-muted">Aucun message pour cet élément.</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} style={{ width: '100%', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: shouldAlignRight(msg) ? 'flex-end' : 'flex-start' }}>
                          <div
                            style={{
                              backgroundColor: shouldAlignRight(msg) ? '#007bff' : '#f8f9fa',
                              color: shouldAlignRight(msg) ? 'white' : 'black',
                              padding: '8px 12px',
                              borderRadius: shouldAlignRight(msg) ? '18px 18px 0 18px' : '18px 18px 18px 0',
                              maxWidth: '70%',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              border: shouldAlignRight(msg) ? 'none' : '1px solid #dee2e6',
                            }}
                          >
                            {msg.message}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '4px' }}>
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                            {msg.is_read ? ' (Lu)' : ' (Non lu)'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="input-group mt-3">
                  <input
                    type="text"
                    className="form-control"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    disabled={isLoading}
                  />
                  <button className="btn btn-primary" onClick={handleSendMessage} disabled={isLoading}>
                    Envoyer
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseImage}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
          />
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              fontSize: '20px',
              cursor: 'pointer',
            }}
            onClick={handleCloseImage}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Chat;