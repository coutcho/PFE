// src/Components/ListingPage/PropertyInquiryModal.jsx
import { useState } from 'react';
import { format, addDays } from 'date-fns';
import './ListingCSS.css';

function PropertyInquiryModal({ show, onClose, property }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: 'Hi, I would like to know more about this listing.'
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [avecVTC, setAvecVTC] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const timeSlots = [
    { time: '9:00 AM', label: 'Morning - 9:00 AM' },
    { time: '10:00 AM', label: 'Morning - 10:00 AM' },
    { time: '11:00 AM', label: 'Morning - 11:00 AM' },
    { time: '12:00 PM', label: 'Afternoon - 12:00 PM' },
    { time: '1:00 PM', label: 'Afternoon - 1:00 PM' },
    { time: '2:00 PM', label: 'Afternoon - 2:00 PM' },
    { time: '3:00 PM', label: 'Afternoon - 3:00 PM' },
    { time: '4:00 PM', label: 'Afternoon - 4:00 PM' }
  ];

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date,
      formatted: format(date, 'MMM d'),
      day: format(date, 'EEE'),
      fullDate: format(date, 'EEEE, MMMM d, yyyy')
    };
  });

  const handleSubmit = () => {
    console.log({
      ...formData,
      selectedDate: selectedDate ? format(selectedDate, 'MMM d, yyyy') : null,
      selectedTime,
      avecVTC
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content scrollable-content">
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title">{property?.title || 'Property Title'}</h5>
              <small className="text-muted">Schedule a tour or request information</small>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Contact Information */}
            <div className="row mb-4">
              <div className="col-md-12">
                <h6 className="mb-3">Contact Information</h6>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Full Name*</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email Address*</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <h6 className="mb-3">Your Message</h6>
              <textarea
                name="message"
                className="form-control"
                rows="3"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            {/* Tour Request */}
            <div className="mb-4">
              <h6 className="mb-3">Request a Tour (Optional)</h6>
              <div className="date-selection mb-3">
                <label className="form-label">Select a Date</label>
                <div className="d-flex flex-wrap gap-2">
                  {dateOptions.map(({ date, formatted, day, fullDate }) => (
                    <button
                      key={formatted}
                      className={`btn btn-outline-primary position-relative ${
                        selectedDate && format(selectedDate, 'MMM d') === formatted ? 'active' : ''
                      }`}
                      onClick={() => setSelectedDate(date)}
                      title={fullDate}
                    >
                      <small className="d-block text-muted">{day}</small>
                      <strong>{formatted}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-selection">
                <label className="form-label">Select a Time</label>
                <div className="row g-2">
                  {timeSlots.map(({ time, label }) => (
                    <div className="col-md-3" key={time}>
                      <button
                        className={`btn btn-outline-primary w-100 ${selectedTime === time ? 'active' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    </div>
                  ))}
                </div>
                <small className="text-muted d-block mt-2">
                  ⏰ Times shown are in the listing's local time
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top">
            <div className="form-check form-switch mb-2 w-100">
              <input
                className="form-check-input"
                type="checkbox"
                id="avecVTCSwitch"
                checked={avecVTC}
                onChange={(e) => setAvecVTC(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="avecVTCSwitch">
                avec VTC
              </label>
            </div>

            <button
              className="btn btn-warning w-100"
              style={{ backgroundColor: '#fd7e14' }}
              onClick={handleSubmit}
            >
              {avecVTC ? 'Send Message / Checkout' : 'Send a Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyInquiryModal;