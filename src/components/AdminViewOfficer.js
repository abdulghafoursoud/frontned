import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';
import Footer from './Footer';
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert
} from 'react-bootstrap';

const AdminViewOfficer = () => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('email');

  // Sidebar
  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? 200 : 60;
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Alerts
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ ...alert, show: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/Login');
  };

  // Admin Data
  const [adminData, setAdminData] = useState(null);
  useEffect(() => {
    if (!email) {
      navigate('/Login');
      return;
    }
    const interval = setInterval(() => {
      fetch(`http://localhost:8080/api/admins/get_by_email/${email}`)
        .then(res => res.json())
        .then(data => setAdminData(data))
        .catch(console.error);
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  // Ward Officers
  const [wardOfficers, setWardOfficers] = useState([]);
  const [searchPostcode, setSearchPostcode] = useState('');
  const [notFound, setNotFound] = useState(false); // NEW: to track no results

  const fetchWardOfficers = (postcode = '') => {
    let url = 'http://localhost:8080/api/wardofficers';
    if (postcode.trim() !== '') {
      url = `http://localhost:8080/api/wardofficers/search?postcode=${postcode.trim()}`;
    }

    fetch(url)
      .then(res => {
        if (res.status === 204) {
          // No Content - no officers found
          setWardOfficers([]);
          setNotFound(true);
          return null;
        }
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        setNotFound(false);
        return res.json();
      })
      .then(data => {
        if (data) {
          setWardOfficers(data);
        }
      })
      .catch(err => {
        console.error(err);
        setWardOfficers([]);
        setNotFound(true);
      });
  };

  useEffect(() => {
    fetchWardOfficers();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchWardOfficers(searchPostcode);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchPostcode]);

  // Add Officer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', password: '', postcode: '', ward: '', address: ''
  });

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
        setAlert({ show: true, variant: 'danger', message: 'Ward Officer already registered.' });
        return;
      }
      const res = await fetch('http://localhost:8080/api/wardofficers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Ward Officer registered successfully' });
        handleCloseAddModal();
        fetchWardOfficers(searchPostcode);
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error saving. Try again.' });
    }
  };

  // Delete Officer
  const handleDeleteWardOfficer = async (id) => {
    if (!window.confirm('Delete this Ward Officer?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/wardofficers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Ward Officer deleted successfully' });
        fetchWardOfficers(searchPostcode);
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error deleting. Try again.' });
    }
  };

  // Admin Password Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleShowProfileModal = () => setShowProfileModal(true);
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setNewPassword('');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!adminData?.id) {
      setAlert({ show: true, variant: 'danger', message: 'Admin ID not found.' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/admins/${adminData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Admin Password updated successfully' });
        handleCloseProfileModal();
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error updating password.' });
    }
  };

  // Edit Ward Officer Password Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState(null);
  const [editPassword, setEditPassword] = useState('');

  const handleShowEditModal = (id) => {
    setSelectedOfficerId(id);
    setEditPassword('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPassword('');
  };

  const handleUpdateOfficerPassword = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) {
      setAlert({ show: true, variant: 'danger', message: 'Ward Officer ID missing.' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/wardofficers/${selectedOfficerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editPassword }),
      });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Ward Officer Password updated successfully' });
        handleCloseEditModal();
        fetchWardOfficers(searchPostcode);
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error updating password.' });
    }
  };


  // Count ward officers
    const [countofficers, setCountOfficer] = useState(0);
    useEffect(() => {
      const intervalId = setInterval(() => {
        fetch('http://localhost:8080/api/wardofficers/count')
          .then(res => res.json())
          .then(data => setCountOfficer(data.count))
          .catch(error => console.error('Error:', error));
      }, 1000);
      return () => clearInterval(intervalId);
    }, []);
  
  return (
    <div className="d-flex" style={{ minHeight: '100vh', flexDirection: 'row' }}>
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
            <img src={logo} alt="Profile" className="rounded-circle" style={{
              marginTop: isOpen ? '120px' : '120px',
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
          <h3 style={{ color: '#566573' }}>Ward Officers Management</h3>
          <Row className="align-items-center mb-4" style={{ marginTop: '40px' }}>
            <Col xs={12} md={6} className="d-flex justify-content-start">
              <Button variant="primary" onClick={handleShowAddModal}>
                + Add New Ward Officer <i className="bi bi-person-fill me-2"></i>
              </Button>
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-end">
              <Form className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search Ward Officers by postcode..."
                    value={searchPostcode}
                    onChange={(e) => setSearchPostcode(e.target.value)}
                  />
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </Form>
            </Col>
          </Row>

          <h3 style={{ color: '#566573' }}>
  {searchPostcode.trim() === ''
    ? `All Ward Officers Registered (Total: ${wardOfficers.length})`
    : `Search for Postcode "${searchPostcode}" (Total: ${wardOfficers.length} found)`}
</h3>
          <Card className="mt-3">
            <Card.Body>
              <div className="table-responsive">
                {notFound ? (
<div
  className="alert alert-warning text-center"
  style={{ width: '50%', margin: '0 auto' }}
>
  Ward Officer not found, No such postcode matched
</div>
                ) : (
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Name</th>
                        <th>Password</th>
                        <th>Postcode</th>
                        <th>Ward</th>
                        <th>Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wardOfficers.length > 0 ? (
                        wardOfficers.map((officer) => (
                          <tr key={officer.id}>
                            <td>{officer.name}</td>
                            <td>{officer.password}</td>
                            <td>{officer.postcode}</td>
                            <td>{officer.ward}</td>
                            <td>{officer.address}</td>
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => handleShowEditModal(officer.id)}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteWardOfficer(officer.id)}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">Loading ward officers...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </Card.Body>
          </Card>
        </Container>

        <Footer />
      </div>

      {/* Modals (Add / Admin Password / Edit Officer Password) */}

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-person-fill me-2"></i> Add New Ward Officer </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitWardOfficer}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Postcode</Form.Label>
              <Form.Control type="number" name="postcode" value={formData.postcode} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ward</Form.Label>
              <Form.Select name="ward" value={formData.ward} onChange={handleFormChange} required>
                <option value="">Select Ward</option>
                <option value="kwerekwe">M/Kwerekwe</option>
                <option value="pangawe">Pangawe</option>
                <option value="kwahani">Kwahani</option>
                <option value="kijito">K/Upele</option>
                <option value="kinuni">Kinuni</option>
                <option value="mtoni">Mtoni</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" name="address" value={formData.address} onChange={handleFormChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Register</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Admin Password Modal */}
      <Modal show={showProfileModal} onHide={handleCloseProfileModal} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-shield-lock-fill me-2"></i> Admin Update Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Set New Password</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Update Password</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Ward Officer Password Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-shield-lock-fill me-2"></i> Update Ward Officer Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateOfficerPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Set New Password</Form.Label>
              <Form.Control type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Update Password</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminViewOfficer;
