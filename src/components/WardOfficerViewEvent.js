import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';
import Footer from './Footer';
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert, InputGroup
} from 'react-bootstrap';

const WardOfficerViewEvents = () => {
  const navigate = useNavigate();
  const postcode = sessionStorage.getItem('postcode');

  // Sidebar
  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? 200 : 60;
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Alerts
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ ...alert, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/Login');
  };

  // Officer Data
  const [officerData, setOfficerData] = useState(null);
  const [loadingOfficer, setLoadingOfficer] = useState(true);
  const [officerNotFound, setOfficerNotFound] = useState(false);

  useEffect(() => {
    if (!postcode) {
      navigate('/Login');
      return;
    }
    fetch(`http://localhost:8080/api/wardofficers/get_by_postcode/${postcode}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setOfficerData(data);
        setOfficerNotFound(false);
      })
      .catch(() => {
        setOfficerNotFound(true);
        setOfficerData(null);
      })
      .finally(() => setLoadingOfficer(false));
  }, [postcode, navigate]);

  // Citizens
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchZanId, setSearchZanId] = useState('');
  const [searchNotFound, setSearchNotFound] = useState(false);

  const fetchEvents = () => {
    if (!officerData?.ward) return;
    const ward = officerData.ward.trim();
    fetch(`http://localhost:8080/api/reports/ward?ward=${encodeURIComponent(ward)}`)
      .then(res => {
        if (res.status === 204) {
          setAllEvents([]);
          setEvents([]);
          return;
        }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data) {
          setAllEvents(data);
          setEvents(data);
          setSearchNotFound(false);
        }
      })
      .catch(() => {
        setAllEvents([]);
        setEvents([]);
      });
  };

  useEffect(() => {
    if (officerData) {
      fetchEvents();
    }
  }, [officerData]);

  useEffect(() => {
    if (searchZanId.trim() === '') {
      setEvents(allEvents);
      setSearchNotFound(false);
    } else {
      const filtered = allEvents.filter(c =>
        c.zanId && c.zanId.toLowerCase().includes(searchZanId.trim().toLowerCase())
      );
      setEvents(filtered);
      setSearchNotFound(filtered.length === 0);
    }
  }, [searchZanId, allEvents]);

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this Event?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Event deleted successfully' });
        fetchEvents();
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error deleting. Try again.' });
    }
  };

  // Password Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleShowProfileModal = () => setShowProfileModal(true);
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setNewPassword('');
  };

  const handleUpdateOfficerPassword = async (e) => {
    e.preventDefault();
    if (!officerData?.id) {
      setAlert({ show: true, variant: 'danger', message: 'Officer ID not found.' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/wardofficers/${officerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Officer Password updated successfully' });
        handleCloseProfileModal();
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error updating password.' });
    }
  };

  
  // update status
  const handleAttendEvent = async (eventObj) => {
  if (eventObj.status.toLowerCase() === 'attended') {
    setAlert({
      show: true,
      variant: 'danger',
      message: 'Event has already been attended.',
    });
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/reports/status/${eventObj.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'attended' }),
    });

    if (res.ok) {
      setAlert({
        show: true,
        variant: 'success',
        message: 'Event marked as attended',
      });
      fetchEvents(); // Refresh the list
    } else {
      throw new Error();
    }
  } catch {
    setAlert({
      show: true,
      variant: 'danger',
      message: 'Error marking as attended. Try again.',
    });
  }
};


  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav className="text-white" style={{
        width: sidebarWidth,
        position: 'fixed',
        top: 0,
        background: '#1b4f72',
        left: 0,
        height: '100vh',
        transition: 'width 0.4s ease',
        overflowX: 'hidden',
        zIndex: 1000
      }}>
        <div className="d-flex flex-column align-items-center pt-3">
          <button className="btn btn-outline-light btn-sm mb-4" onClick={toggleSidebar}>
            <i className="bi bi-list fs-5"></i>
          </button>
          <ul className="nav flex-column mt-4 px-2">
            <li className="nav-item mb-2">
              <Link to="/Ward_Dashboard" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-house-door-fill me-2"></i>{isOpen && 'Dashboard'}
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/WardOfficerViewCitizens" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-people-fill me-2"></i>{isOpen && 'Citizens'}
              </Link>
            </li>  
             <li className="nav-item mb-2">
              <Link to="/WardOfficerViewEvent" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-calendar-event-fill me-2"></i>{isOpen && 'Events'}
              </Link>
            </li>
            <li className="nav-item mb-2">
              <span className="nav-link text-white d-flex align-items-center" onClick={handleShowProfileModal} role="button">
                <i className="bi bi-gear-fill me-2"></i>{isOpen && 'Settings'}
              </span>
            </li>
            <li className="nav-item mb-2">
              <span className="nav-link text-white d-flex align-items-center" onClick={handleLogout} role="button">
                <i className="bi bi-box-arrow-right me-2"></i>{isOpen && 'Logout'}
              </span>
            </li>
          </ul>
          <div className="mt-auto mb-4">
            <img src={logo} alt="Profile" className="rounded-circle" style={{
              marginTop: '80px',
              width: isOpen ? '100px' : '50px',
              height: isOpen ? '100px' : '50px',
              transition: 'all 0.3s ease'
            }} />
          </div>
        </div>
      </nav>

      <div style={{ marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0.4s ease', flexGrow: 1 }}>
        {alert.show && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: '250px' }}>
            <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
              {alert.message}
            </Alert>
          </div>
        )}

        <Container fluid style={{ padding: '2rem' }}>
          <h3 style={{ color: '#566573' }}>Events Management</h3>

          {loadingOfficer ? (
            <div className="text-center mt-5">Loading Officer Data...</div>
          ) : officerNotFound ? (
            <div className="alert alert-warning text-center mt-5" style={{ width: '50%', margin: '0 auto' }}>
              Ward Officer not found. No such postcode matched.
            </div>
          ) : (
            <>
              <Row className="align-items-center mb-4" style={{ marginTop: '40px' }}>
                
                <Col xs={12} md={6}>
                  <Form className="d-flex">
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Search Event by ZanID..."
                        value={searchZanId}
                        onChange={(e) => setSearchZanId(e.target.value)}
                      />
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                    </div>
                  </Form>
                </Col>
              </Row>

              <h3 style={{ color: '#566573' }}>
                {searchZanId.trim() === ''
                  ? `All Events Reported (Total: ${events.length})`
                  : `Search for ZanID "${searchZanId}" (Total: ${events.length} found)`}
              </h3>

              {searchNotFound ? (
                <div className="alert alert-warning text-center" style={{ width: '50%', margin: '0 auto' }}>
                  Events not found. No such ZanID matched for the Event.
                </div>
              ) : (
                <Card className="mt-3">
                  <Card.Body>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>EventPhoto</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Date Submitted</th>
                            <th>ZanID</th>
                            <th>Location Occured</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((c) => (
                            <tr key={c.id}>
                              <td><img src={`data:image/jpeg;base64,${c.eventphoto}`} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} className="rounded" /></td>
                              <td>{c.description}</td>
                              
<td>
  <span
    style={{
      borderRadius: '15px',
      padding: '5px',
      width:'85px',
      textAlign:'center',
      display: 'inline-block',
      backgroundColor:
        c.status?.toLowerCase() === 'submitted'
          ? '#f9e79f'
          : c.status?.toLowerCase() === 'attended'
            ? '#abebc6'
            : 'transparent'
    }}
  >
    {c.status}
  </span>
</td>




                              <td>{c.dateSubmitted}</td>
                              <td>{c.zanId}</td>
                              <td>{c.location}</td>
                              
                              <td>
  <Button
  variant="success"
  size="sm"
  className="me-2"
  onClick={() => handleAttendEvent(c)}
>
  <i className="bi bi-check-circle"></i> Attend
</Button>

  <Button
    variant="danger"
    size="sm"
    onClick={() => handleDeleteEvent(c.id)}
  >
    <i className="bi bi-trash"></i>
  </Button>
</td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Container>

        <Footer />
      </div>

      {/* Modals for Profile and Citizen Password */}
      <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-shield-lock-fill me-2"></i> Officer Update Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateOfficerPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Set New Password</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Update Password</Button>
          </Form>
        </Modal.Body>
      </Modal>

      



      


    </div>
  );
};

export default WardOfficerViewEvents;
