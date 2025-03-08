import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import './ChatCSS.css';

function Chat({ refresh, onRefreshComplete }) {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const token = localStorage.getItem('authToken');
  const API_INQUIRIES_URL = 'http://localhost:3001/api/inquiries';
  const API_USERS_URL = 'http://localhost:3001/api/users';

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchInquiries();
    } else {
      setError('Please sign in to view messages');
    }
  }, [token]);

  useEffect(() => {
    if (refresh) {
      fetchInquiries();
      if (onRefreshComplete) onRefreshComplete();
    }
  }, [refresh]);

  useEffect(() => {
    if (selectedInquiry) {
      fetchMessages(selectedInquiry.id);
    }
  }, [selectedInquiry]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_USERS_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
      }
      const userData = await response.json();
      setCurrentUserId(userData.id);
      console.log('Current User ID:', userData.id);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError('Could not fetch user information');
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await fetch(`${API_INQUIRIES_URL}/user/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch inquiries: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setInquiries(data);
      setError(null);
      console.log('Inquiries:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inquiries:', err);
    }
  };

  const fetchMessages = async (inquiryId) => {
    try {
      const response = await fetch(`${API_INQUIRIES_URL}/${inquiryId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setMessages(data);
      setError(null);
      console.log('Messages for inquiry', inquiryId, ':', data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedInquiry || !token) {
      setError('Message, inquiry, or authentication token is missing');
      return;
    }

    try {
      const response = await fetch(`${API_INQUIRIES_URL}/${selectedInquiry.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Message sent successfully:', data);
      setNewMessage('');
      setError(null);
      await fetchMessages(selectedInquiry.id);
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
    }
  };

  const shouldAlignRight = (message) => {
    if (!selectedInquiry || !currentUserId) {
      console.log('Missing data - selectedInquiry:', selectedInquiry, 'currentUserId:', currentUserId);
      return false;
    }
    const shouldAlign = message.message_type === 'self';
    console.log('Message:', message.message, 'message_type:', message.message_type, 'shouldAlignRight:', shouldAlign);
    return shouldAlign;
  };

  const isUserAgent = () => {
    const isAgent = selectedInquiry && selectedInquiry.agent_id === currentUserId;
    console.log('isUserAgent - agent_id:', selectedInquiry?.agent_id, 'currentUserId:', currentUserId, 'isAgent:', isAgent);
    return isAgent;
  };

  const handleDeleteInquiry = async (inquiryId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    try {
      const response = await fetch(`${API_INQUIRIES_URL}/${inquiryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete conversation: ${response.status} - ${errorText}`);
      }
      setInquiries(inquiries.filter(inquiry => inquiry.id !== inquiryId));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(null);
        setMessages([]);
      }
      console.log('Conversation deleted successfully');
    } catch (err) {
      setError(err.message);
      console.error('Error deleting conversation:', err);
    }
  };

  // Check if an inquiry has unread messages
  const hasUnreadMessages = (inquiryId) => {
    if (!selectedInquiry || selectedInquiry.id !== inquiryId) {
      return false; // Only check unread messages for unselected inquiries
    }
    return messages.some(msg => msg.sender_id !== currentUserId && !msg.is_read);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-4 col-lg-3 sidebar p-4">
          <h5 className="mb-4">Messages</h5>
          {error && <div className="alert alert-danger">{error}</div>}
          {inquiries.length === 0 && !error ? (
            <div className="text-muted small">
              <p>No conversations. Send a message from a listing to get started.</p>
            </div>
          ) : (
            <ul className="list-group">
              {inquiries.map((inquiry) => (
                <li
                  key={inquiry.id}
                  className={`list-group-item list-group-item-action ${
                    selectedInquiry?.id === inquiry.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedInquiry(inquiry)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>
                        {inquiry.property_title || `Inquiry #${inquiry.id}`}
                        {inquiry.agent_name ? ` - ${inquiry.agent_name}` : ''}
                      </strong>
                      <br />
                      <small className="text-muted">
                        {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                      </small>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={(e) => handleDeleteInquiry(inquiry.id, e)}
                      style={{ marginLeft: '8px' }}
                      title="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {hasUnreadMessages(inquiry.id) && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Content Area */}
        <div className="col-md-8 col-lg-9 messages-container p-4">
          {!selectedInquiry ? (
            <div className="text-center mt-5">
              <MessageSquare size={48} className="text-muted mb-3" />
              <h4>No Conversation Selected</h4>
              <p className="text-muted mb-4">Select an inquiry to view or start a conversation</p>
            </div>
          ) : (
            <div>
              <h5 className="mb-3">
                {selectedInquiry.property_title || `Inquiry #${selectedInquiry.id}`}
                {selectedInquiry.agent_name ? ` - ${selectedInquiry.agent_name}` : ''}
              </h5>
              <div 
                className="chat-messages p-3" 
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px'
                }}
              >
                {messages.map((msg) => (
                  <div key={msg.id} style={{ width: '100%', marginBottom: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: shouldAlignRight(msg) ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}>
                      {msg.message_type === 'agent' && !shouldAlignRight(msg) && selectedInquiry.agent_name && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6c757d',
                          marginBottom: '4px',
                          alignSelf: shouldAlignRight(msg) ? 'flex-end' : 'flex-start',
                        }}>
                          Agent: {selectedInquiry.agent_name}
                        </div>
                      )}
                      <div 
                        style={{
                          backgroundColor: shouldAlignRight(msg) ? '#007bff' : '#f8f9fa',
                          color: shouldAlignRight(msg) ? 'white' : 'black',
                          padding: '8px 12px',
                          borderRadius: shouldAlignRight(msg) ? '18px 18px 0 18px' : '18px 18px 18px 0',
                          maxWidth: '70%',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          border: shouldAlignRight(msg) ? 'none' : '1px solid #dee2e6',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.message}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d',
                        marginTop: '4px'
                      }}>
                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                        {msg.is_read ? ' (Read)' : ' (Unread)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="input-group mt-3">
                <input
                  type="text"
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <button className="btn btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;