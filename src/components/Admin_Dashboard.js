import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';
import Footer from './Footer';
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert
} from 'react-bootstrap';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');

  const [adminData, setAdminData] = useState(null);
  const [countcitizens, setCount] = useState(0);
  const [countevents, setCountEvent] = useState(0);
  const [countofficers, setCountOfficer] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? 200 : 60;

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

  // Fetch admin data by email
  useEffect(() => {
    if (!email) {
      navigate('/Login');
      return;
    }
    const interval = setInterval(() => {
      fetch(`http://localhost:8080/api/admins/get_by_email/${email}`)
        .then(res => res.json())
        .then(data => setAdminData(data))
        .catch(error => console.error('Error fetching admin:', error));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  // Count citizens
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:8080/api/citizens/count')
        .then(res => res.json())
        .then(data => setCount(data.count))
        .catch(error => console.error('Error:', error));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Count reports
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:8080/api/reports/count')
        .then(res => res.json())
        .then(data => setCountEvent(data.count))
        .catch(error => console.error('Error:', error));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Count ward officers
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch('http://localhost:8080/api/wardofficers/count')
        .then(res => res.json())
        .then(data => setCountOfficer(data.count))
        .catch(error => console.error('Error:', error));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Add Ward Officer
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

  // update admin password
  const handleShowProfileModal = () => setShowProfileModal(true);
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setNewPassword('');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!adminData?.id) {
      setAlert({ show: true, variant: 'danger', message: 'Admin ID not found. Please try again.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admins/${adminData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        setAlert({ show: true, variant: 'success', message: 'Admin Password updated successfully' });
        handleCloseProfileModal();
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ show: true, variant: 'danger', message: 'Error updating password. Try again.' });
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', flexDirection: 'row' }}>
      <nav className="text-white" style={{ width: sidebarWidth, position: 'fixed', top: 0, background: '#1b4f72', left: 0, height: '100vh', transition: 'width 0.4s ease', overflowX: 'hidden', zIndex: 1000 }}>
        <div className="d-flex flex-column align-items-center pt-3">
          <button className="btn btn-outline-light btn-sm mb-4" onClick={toggleSidebar}>
            <i className="bi bi-list fs-5"></i>
          </button>
          <ul className="nav flex-column mt-4 px-2">
            <li className="nav-item mb-2">
              <Link to="/Admin_Dashboard" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-house-door-fill me-2"></i>{isOpen && 'Dashboard'}
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/AdminViewOfficer" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-people-fill me-2"></i>{isOpen && 'Officers'}
                <span style={{color:'orange'}}>({countofficers})</span>
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
            <img src={logo} alt="Profile" className="rounded-circle" style={{ marginTop: isOpen ? '120px' : '120px', width: isOpen ? '100px' : '50px', height: isOpen ? '100px' : '50px', transition: 'all 0.3s ease' }} />
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
          <h3>Admin Dashboard</h3>
          <Row className="my-4">
            <Col md={3}><Card className="text-center border-0 shadow-sm" style={{ background: '#d6eaf8' }}><Card.Body><h4>{countcitizens}</h4><p>Total Citizens <i className="bi bi-people-fill me-2"></i>
</p></Card.Body></Card></Col>
            <Col md={3}><Card className="text-center border-0 shadow-sm" style={{ background: '#fae5d3' }}><Card.Body><h4>{countevents}</h4><p>Total Events <i className="bi bi-calendar-fill me-2"></i>
</p></Card.Body></Card></Col>
            <Col md={3}><Card className="text-center border-0 shadow-sm" style={{ background: '#f9e79f' }}><Card.Body><h4>{countofficers}</h4><p>Total Ward Officers &nbsp;
              
              <i className="bi bi-people-fill me-2"></i>

              </p></Card.Body></Card></Col>
          </Row>

          <Button variant="primary" className="mb-4" onClick={handleShowAddModal}>+ Add New Ward Officer <i className="bi bi-person-fill me-2"></i></Button>

          <Card className="flex-grow-1"><Card.Body><h3>About</h3><hr /><Card.Title>Admin Informations</Card.Title><Card.Text>
            <div className="mb-2"><strong>Full Name:</strong> &nbsp;{adminData?.name}</div>
            <div className="mb-2"><strong><i className="bi bi-envelope-fill me-2"></i>Email:</strong> &nbsp;{adminData?.email}</div>
            <div className="mb-2"><strong><i className="bi bi-shield-lock-fill me-2"></i>Password:</strong> &nbsp;{adminData?.password}</div>
          </Card.Text></Card.Body></Card>
        </Container>
        <Footer />
      </div>

      {/* Add Ward Officer Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton><Modal.Title><i className="bi bi-person-fill me-2"></i> Add New Ward Officer</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitWardOfficer}>
            <Form.Group className="mb-3"><Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleFormChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Postcode</Form.Label>
              <Form.Control type="number" name="postcode" value={formData.postcode} onChange={handleFormChange} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Ward</Form.Label>
              <Form.Select name="ward" value={formData.ward} onChange={handleFormChange} required>
                <option value="">Select Ward</option>
                <option value="kwerekwe">M/Kwerekwe</option>
                <option value="pangawe">Pangawe</option>
                <option value="kwahani">Kwahani</option>
                <option value="kijito">K/Upele</option>
                <option value="kinuni">Kinuni</option>
                <option value="mtoni">Mtoni</option>
              </Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Address</Form.Label>
              <Form.Control type="text" name="address" value={formData.address} onChange={handleFormChange} required /></Form.Group>
            <Button variant="primary" type="submit" className="w-100">Register</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Profile Settings Modal */}
      <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-shield-lock-fill me-2"></i>
 Admin Update Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Set New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Update Password</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
