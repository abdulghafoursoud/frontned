import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';
import Footer from './Footer';
import {
  Container, Row, Col, Card, Button, Modal, Form, Alert, InputGroup
} from 'react-bootstrap';

const WardOfficerViewCitizens = () => {
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
const [countCitizens, setCountCitizens] = useState(0);
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
  const [allCitizens, setAllCitizens] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [searchZanId, setSearchZanId] = useState('');
  const [searchNotFound, setSearchNotFound] = useState(false);

  const fetchCitizens = () => {
    if (!officerData?.ward) return;
    const ward = officerData.ward.trim();
    fetch(`http://localhost:8080/api/citizens/ward?ward=${encodeURIComponent(ward)}`)
      .then(res => {
        if (res.status === 204) {
          setAllCitizens([]);
          setCitizens([]);
          return;
        }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data) {
          setAllCitizens(data);
          setCitizens(data);
          setSearchNotFound(false);
        }
      })
      .catch(() => {
        setAllCitizens([]);
        setCitizens([]);
      });
  };

  useEffect(() => {
    if (officerData) {
      fetchCitizens();
    }
  }, [officerData]);

  useEffect(() => {
    if (searchZanId.trim() === '') {
      setCitizens(allCitizens);
      setSearchNotFound(false);
    } else {
      const filtered = allCitizens.filter(c =>
        c.zanId && c.zanId.toLowerCase().includes(searchZanId.trim().toLowerCase())
      );
      setCitizens(filtered);
      setSearchNotFound(filtered.length === 0);
    }
  }, [searchZanId, allCitizens]);

  const handleDeleteCitizen = async (id) => {
    if (!window.confirm('Delete this Citizen?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/citizens/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Citizen deleted successfully' });
        fetchCitizens();
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [editPassword, setEditPassword] = useState('');

  const handleShowEditModal = (id) => {
    setSelectedCitizenId(id);
    setEditPassword('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPassword('');
  };

  const handleUpdateCitizenPassword = async (e) => {
    e.preventDefault();
    if (!selectedCitizenId) {
      setAlert({ show: true, variant: 'danger', message: 'Citizen ID missing.' });
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/citizens/update_password/${selectedCitizenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editPassword }),
      });
      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Citizen Password updated successfully' });
        handleCloseEditModal();
        fetchCitizens();
      } else throw new Error();
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Error updating password.' });
    }
  };

  // Add New Citizen Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const handleShowRegisterModal = () => setShowRegisterModal(true);
  const handleCloseRegisterModal = () => setShowRegisterModal(false);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zanId: '',
    age: '',
    phoneNumber: '',
    houseNo: '',
    ward: '',
    gender: '',
    password: '',
    profile: null,
    birthDate: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile') {
      setFormData({ ...formData, profile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    for (const key in formData) {
      if (!formData[key] && key !== 'profile') {
        newErrors[key] = 'This field is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkZanIdExists = async (zanId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/citizens/check-zan-id/${zanId}`);
      if (!res.ok) return false;
      return await res.json();
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false });

    if (!validateForm()) {
      setAlert({ show: true, variant: 'danger', message: 'Please fill in all required fields.' });
      return;
    }

    if (await checkZanIdExists(formData.zanId)) {
      setAlert({ show: true, variant: 'danger', message: 'Citizen with that Zan ID already exists.' });
      return;
    }

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'profile' && formData.profile) {
        formDataToSend.append(key, formData.profile);
      } else if (formData[key] != null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch('http://localhost:8080/api/citizens', {
        method: 'POST',
        body: formDataToSend
      });

      if (res.ok) {
        setAlert({ show: true, variant: 'success', message: 'Citizen Registration successful!' });
        handleCloseRegisterModal();
        fetchCitizens();
      } else {
        throw new Error();
      }
    } catch {
      setAlert({ show: true, variant: 'danger', message: 'Registration failed. Please try again.' });
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
                <i className="bi bi-people-fill me-2"></i> {isOpen && 'Citizens'} 
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
          <h3 style={{ color: '#566573' }}>Citizens Management</h3>

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
                  <Button variant="primary" onClick={handleShowRegisterModal}>
  + Add New Citizen <i className="bi bi-person-fill me-2"></i>
</Button>
                </Col>
                <Col xs={12} md={6}>
                  <Form className="d-flex">
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Search citizens by ZanID..."
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
                  ? `All Citizens Registered (Total: ${citizens.length})`
                  : `Search for ZanID "${searchZanId}" (Total: ${citizens.length} found)`}
              </h3>

              {searchNotFound ? (
                <div className="alert alert-warning text-center" style={{ width: '50%', margin: '0 auto' }}>
                  Citizen not found. No such ZanID matched.
                </div>
              ) : (
                <Card className="mt-3">
                  <Card.Body>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Profile</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Age</th>
                            <th>Password</th>
                            <th>Phone Number</th>
                            <th>Ward</th>
                            <th>ZanID</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {citizens.map((c) => (
                            <tr key={c.id}>
                              <td><img src={`data:image/jpeg;base64,${c.profile}`} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} className="rounded" /></td>
                              <td>{c.name}</td>
                              <td>{c.address}</td>
                              <td>{c.age}</td>
                              <td>{c.password}</td>
                              <td>{c.phoneNumber}</td>
                              <td>{c.ward}</td>
                              <td>{c.zanId}</td>
                              <td>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(c.id)}>
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteCitizen(c.id)}>
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

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-shield-lock-fill me-2"></i> Update Citizen Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateCitizenPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Set New Password</Form.Label>
              <Form.Control type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Update Password</Button>
          </Form>
        </Modal.Body>
      </Modal>



      {/* citizens regiatrations */}


      <Modal
  show={showRegisterModal}
  onHide={handleCloseRegisterModal}
  size="xl"
  centered
  
>
  <Modal.Header closeButton>
    <Modal.Title><i className="bi bi-person-fill me-2"></i> Register New Citizen</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Container>
      <Row>
        <Col md={12}>
          <Form onSubmit={handleSubmit} className="p-3 border rounded bg-white shadow-sm">
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    isInvalid={!!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="zanId">
                  <Form.Label>Zan ID</Form.Label>
                  <Form.Control
                    type="number"
                    name="zanId"
                    value={formData.zanId}
                    onChange={handleChange}
                    isInvalid={!!errors.zanId}
                  />
                  <Form.Control.Feedback type="invalid">{errors.zanId}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-3">
              <Col md={4}>
                <Form.Group controlId="birthDate">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    isInvalid={!!errors.birthDate}
                  />
                  <Form.Control.Feedback type="invalid">{errors.birthDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="age">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    isInvalid={!!errors.age}
                  />
                  <Form.Control.Feedback type="invalid">{errors.age}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-3">
              <Col md={4}>
                <Form.Group controlId="houseNo">
                  <Form.Label>House Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleChange}
                    isInvalid={!!errors.houseNo}
                  />
                  <Form.Control.Feedback type="invalid">{errors.houseNo}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="phoneNumber">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    isInvalid={!!errors.phoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="profile">
                  <Form.Label>Profile Picture</Form.Label>
                  <Form.Control
                    type="file"
                    name="profile"
                    accept="image/*"
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-3">
              <Col md={4}>
                <Form.Group controlId="ward">
                  <Form.Label>Ward</Form.Label>
                  <Form.Select
  name="ward"
  value={formData.ward}
  onChange={handleChange}
  isInvalid={!!errors.ward}
>
  <option value="">Select Ward</option>
  {officerData && officerData.ward && (
    <option value={officerData.ward}>{officerData.ward}</option>
  )}
</Form.Select>

                  <Form.Control.Feedback type="invalid">{errors.ward}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                  /> 
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Group> 
              </Col>

              <Col md={4}>
                <Button variant="primary" type="submit" className="w-100" style={{marginTop:'30px'}}>
                  Register
                </Button>
              </Col>
            </Row>

           
          </Form>
        </Col>
      </Row>
    </Container>
  </Modal.Body>
</Modal>


    </div>
  );
};

export default WardOfficerViewCitizens;
