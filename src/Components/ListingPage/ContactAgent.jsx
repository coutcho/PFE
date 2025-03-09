import React, { useState, useEffect } from 'react';
import { Phone, Mail } from 'lucide-react';
import PropertyInquiryModal from './PropertyInquiryModal';

export default function ContactAgent({ property, refreshAgent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');
  const AGENT_API_URL = 'http://localhost:3001/api/users/agents';

  // Fetch agent details based on property.agent_id
  useEffect(() => {
    console.log('useEffect triggered - property.agent_id:', property?.agent_id, 'refreshAgent:', refreshAgent);
    const fetchAgent = async () => {
      if (!property?.agent_id) {
        setLoading(false);
        setError('No agent assigned to this property.');
        console.log('No agent_id provided for property:', property);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Remove the Authorization header since we want this to be public
        const response = await fetch(`${AGENT_API_URL}/${property.agent_id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch agent details');
        }
        
        const agentData = await response.json();
        setAgent(agentData);
        console.log('Agent data fetched successfully:', agentData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [property?.agent_id, refreshAgent]); // Removed token from dependencies since it's not needed for fetch

  // Function to open the modal (still requires login)
  const openModal = () => {
    if (!token) {
      setError('Please sign in to contact the agent.');
      return;
    }
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Render loading, error, or no-agent states
  if (loading) return <div>Loading agent details...</div>;
  if (error) return <div className="card mt-4 agent"><div className="card-body"><p className="text-danger">{error}</p></div></div>;
  if (!property?.agent_id || !agent) {
    return (
      <div className="card mt-4 agent">
        <div className="card-body">
          <h2 className="h4 fw-bold">Contact Agent</h2>
          <p className="text-muted mt-3">No agent assigned to this property.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4 agent">
      <div className="card-body">
        <h2 className="h4 fw-bold">Contact Agent</h2>

        {/* Agent Details */}
        <div className="d-flex align-items-center gap-3 mt-3">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
            alt={agent.name}
            className="rounded-circle"
            style={{ width: '64px', height: '64px', objectFit: 'cover' }}
          />
          <div>
            <h3 className="h5 fw-semibold mb-1">{agent.name}</h3>
            <p className="text-muted mb-0">Real Estate Agent</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Phone className="text-primary" size={20} />
            <span>{agent.phone || 'Phone not available'}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Mail className="text-primary" size={20} />
            <span>{agent.email || 'Email not available'}</span>
          </div>
        </div>

        {/* Form to Trigger Modal */}
        <form className="mt-4">
          <button type="button" className="btn btn-primary w-100" onClick={openModal}>
            Contacter
          </button>
        </form>

        {/* Embed the Modal Component */}
        <PropertyInquiryModal 
          show={isModalOpen} 
          onClose={closeModal} 
          property={property}
        />
      </div>
    </div>
  );
}