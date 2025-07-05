import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';
import Footer from './Footer';
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert
} from 'react-bootstrap';

const WardOfficerDashboard = () => {
  const navigate = useNavigate();
  const postcode = sessionStorage.getItem('postcode');
const [countEventsByWard, setCountEventsByWard] = useState(0);
  const [adminData, setAdminData] = useState(null);
  const [ward, setWard] = useState('');
  const [countCitizens, setCountCitizens] = useState(0);
  const [countEvents, setCountEvents] = useState(0);
  const [countOfficers, setCountOfficers] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? 200 : 60;
  const [allReports, setAllReports] = useState([]);
const [countSubmittedEventsByWard, setCountSubmittedEventsByWard] = useState(0);
const [countAttendedEventsByWard, setCountAttendedEventsByWard] = useState(0);


  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', password: '', postcode: '', ward: '', address: ''
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/Login');
  };



  // Auto-hide alert after 2 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Fetch officer data
  useEffect(() => {
    if (!postcode) {
      navigate('/Login');
      return;
    }
    const interval = setInterval(() => {
      fetch(`http://localhost:8080/api/wardofficers/get_by_postcode/${postcode}`)
        .then(res => res.json())
        .then(data => {
          setAdminData(data);
          setWard(data.ward);
        })
        .catch(console.error);
    }, 1000);
    return () => clearInterval(interval);
  }, [postcode, navigate]);

  // Poll citizen count for *this* ward only
  useEffect(() => {
    if (!ward) return;
    const intervalId = setInterval(() => {
      fetch(`http://localhost:8080/api/citizens/count-by-ward?ward=${encodeURIComponent(ward)}`)
        .then(res => res.json())
        .then(setCountCitizens)
        .catch(console.error);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [ward]);

  // Poll event count
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:8080/api/reports/count')
        .then(res => res.json())
        .then(data => setCountEvents(data.count))
        .catch(console.error);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Poll officer count
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:8080/api/wardofficers/count')
        .then(res => res.json())
        .then(data => setCountOfficers(data.count))
        .catch(console.error);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({ name: '', password: '', postcode: '', ward: '', address: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitWardOfficer = async (e) => {
    e.preventDefault();
    try {
      const checkRes = await fetch(`http://localhost:8080/api/wardofficers/check_postcode/${formData.postcode}`);
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setAlert({ show: true, variant: 'danger', message: 'Ward Officer already registered' });
        return;
      }
      const saveRes = await fetch('http://localhost:8080/api/wardofficers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (saveRes.ok) {
        setAlert({ show: true, variant: 'success', message: 'Ward Officer registered successfully' });
        handleCloseAddModal();
      } else {
        throw new Error('Failed to register');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ show: true, variant: 'danger', message: 'Error saving Ward Officer. Try again.' });
    }
  };

  const handleShowProfileModal = () => setShowProfileModal(true);
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setNewPassword('');
  };

  


// Officer update password
  const handleUpdateOfficerPassword = async (e) => {
    e.preventDefault();
    if (!adminData?.id) {
      setAlert({ show: true, variant: 'danger', message: 'Officer ID not found.' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/wardofficers/${adminData.id}`, {
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

// END update password

// count all events in ward

useEffect(() => {
  if (!ward) return;
  const intervalId = setInterval(() => {
    fetch(`http://localhost:8080/api/reports/count-by-ward?ward=${encodeURIComponent(ward)}`)
      .then(res => res.json())
      .then(data => setCountEventsByWard(data.count))
      .catch(console.error);
  }, 1000);
  return () => clearInterval(intervalId);
}, [ward]);

   // count pending events
// Fetch all reports and store in allReports
useEffect(() => {
  if (!ward) return;
  const intervalId = setInterval(() => {
    fetch('http://localhost:8080/api/reports')
      .then(res => res.json())
      .then(data => setAllReports(data))
      .catch(console.error);
  }, 1000);
  return () => clearInterval(intervalId);
}, [ward]);

// Count submitted events in my ward
useEffect(() => {
  if (!ward) return;

  const filtered = allReports.filter(r =>
    r.ward?.toLowerCase() === ward.toLowerCase() &&
    r.status?.toLowerCase() === 'submitted'
  );

  setCountSubmittedEventsByWard(filtered.length);
}, [allReports, ward]);

// event resolved
// Count attended events in this ward
useEffect(() => {
  if (!ward) return;

  const filtered = allReports.filter(r =>
    r.ward?.toLowerCase() === ward.toLowerCase() &&
    r.status?.toLowerCase() === 'attended'
  );

  setCountAttendedEventsByWard(filtered.length);
}, [allReports, ward]);


  return (
    <div className="d-flex" style={{ minHeight: '100vh', flexDirection: 'row' }}>
      <nav className="text-white" style={{
        width: sidebarWidth, position: 'fixed', top: 0, background: '#1b4f72',
        left: 0, height: '100vh', transition: 'width 0.4s ease', overflowX: 'hidden', zIndex: 1000
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
              marginTop: isOpen ? '80px' : '80px',
              width: isOpen ? '100px' : '50px',
              height: isOpen ? '100px' : '50px',
              transition: 'all 0.3s ease'
            }} />
          </div>
        </div>
      </nav>

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 0.4s ease',
        flexGrow: 1
      }}>
        {alert.show && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: '250px' }}>
            <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
              {alert.message}
            </Alert>
          </div>
        )}
        <Container fluid style={{ padding: '2rem' }}>
          <h3>Ward Officer Dashboard</h3>
          <Row className="my-4">
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#d6eaf8' }}>
                <Card.Body>
                  <h4>{countCitizens}</h4>
                  <p>Total Citizens in Ward <i className="bi bi-people-fill me-2"></i></p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#ebdef0' }}>
                <Card.Body>
                  <h4>{countEventsByWard}</h4>
                  <p>Total Events Reported <i className="bi bi-calendar-fill me-2"></i></p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#fae5d3' }}>
                <Card.Body>
                  <h4>{countSubmittedEventsByWard}</h4>
                  <p>Pending Events <i className="bi bi-calendar-fill me-2" style={{color:'orange'}}></i></p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#abebc6' }}>
                <Card.Body>
                  <h4>{countAttendedEventsByWard}</h4>
                  <p>Events Resolved <i className="bi bi-calendar-fill me-2" style={{color:'green'}}></i></p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          

          <Card className="flex-grow-1">
            <Card.Body>
              <h3>About</h3><hr />
              <Card.Title>Ward Officer Informations</Card.Title>
              <Card.Text>
                <div className="mb-2"><strong>Full Name:</strong> &nbsp;{adminData?.name}</div>
                <div className="mb-2"><strong><i className="bi bi-geo-alt-fill me-2"></i>Address:</strong> &nbsp;{adminData?.address}</div>
                <div className="mb-2"><strong><i className="bi bi-shield-lock-fill me-2"></i>Password:</strong> &nbsp;{adminData?.password}</div>
                <div className="mb-2"><strong><i className="bi bi-pin-map-fill me-2"></i>Ward Responsible:</strong> &nbsp;{adminData?.ward}</div>
                <div className="mb-2"><strong>PostCode:</strong> &nbsp;{adminData?.postcode}</div>
              </Card.Text>
            </Card.Body>
          </Card>
        </Container>
        <Footer />
      </div>

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

export default WardOfficerDashboard;
