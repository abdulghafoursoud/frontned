import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import logo from '../assets/images/logo.jpg';
import { Link } from "react-router-dom";


const CitizenRegistrationForm = () => {
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
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [errors, setErrors] = useState({}); // Object to track validation errors

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile') {
      setFormData({ ...formData, profile: files[0] });
    } else if (name === 'birthDate') {
      setFormData({ ...formData, birthDate: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for the field being changed
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    for (const key in formData) {
      if (!formData[key] && key !== 'profile') {
        newErrors[key] = 'This field is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const checkZanIdExists = async (zanId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/citizens/check-zan-id/${zanId}`);
      if (!response.ok) return false;
      const exists = await response.json();
      return exists;
    } catch (error) {
      console.error('Error checking Zan ID:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate form inputs
    if (!validateForm()) {
      showMessage('Please fill in all required fields.', 'danger');
      return;
    }

    const zanIdExists = await checkZanIdExists(formData.zanId);
    if (zanIdExists) {
      showMessage('Citizen with that Zan ID already exists.', 'danger');
      return;
    }

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'profile' && formData.profile) {
        formDataToSend.append(key, formData.profile);
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch('http://localhost:8080/api/citizens', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        showMessage('Citizen Registration successful!', 'success');
        setTimeout(() => {
          window.location.reload(); // Reload the page after 3 seconds
        }, 3000);
      } else {
        showMessage('Registration failed. Please try again.', 'danger');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showMessage('Registration failed due to network error.', 'danger');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 3000); // Clear message after 3 seconds
  };

  return (
    <Container className="mt-5" style={{ width: '80%' , marginTop:'0px' }}>
      <Row className="justify-content-center">
        <Col md={12}>
          <div className="d-flex align-items-center mb-3">
            <img src={logo} alt="Logo" style={{ width: '80px', marginRight: '10px' }} />
            <h3 className="mt-2">Citizen Registration</h3>
          </div>
          {message && (
            <div className={`alert alert-${messageType} position-fixed top-0 end-0 m-3`} style={{ zIndex: 1000 }}>
              <i
              className="bi bi-check-circle-fill"
              style={{ fontSize: "18px", color: "green" }}
            ></i> {message}
            </div>
          )}
          <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm"
          style={{marginBottom:'20px'}}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name} // Show red border if error
                    isValid={!!formData.name && !errors.name} // Show green border if valid
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    isInvalid={!!errors.address}
                    isValid={!!formData.address && !errors.address}
                  />
                  <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="zanId">
                  <Form.Label>Zan ID</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 748327645"
                    name="zanId"
                    value={formData.zanId}
                    onChange={(e) => {
        const value = e.target.value;
        // Allow only numbers and limit to 2 digits
        if (/^\d{0,9}$/.test(value)) {
          setFormData({ ...formData, zanId: value });
          setErrors((prevErrors) => ({ ...prevErrors, zanId: null })); // Clear error if valid
        }
      }}
      isInvalid={!!errors.zanId}
      isValid={!!formData.age && !errors.zanId}
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
                    isValid={!!formData.birthDate && !errors.birthDate}
                  />
                  <Form.Control.Feedback type="invalid">{errors.birthDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="age">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter your age"
                    name="age"
                    value={formData.age}
                    onChange={(e) => {
        const value = e.target.value;
        // Allow only numbers and limit to 2 digits
        if (/^\d{0,2}$/.test(value)) {
          setFormData({ ...formData, age: value });
          setErrors((prevErrors) => ({ ...prevErrors, age: null })); // Clear error if valid
        }
      }}
      min={0} max={99}
      isInvalid={!!errors.age}
      isValid={!!formData.age && !errors.age}
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
                    isValid={!!formData.gender && !errors.gender}
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
                    placeholder="Enter your house number"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleChange}
                    isInvalid={!!errors.houseNo}
                    isValid={!!formData.houseNo && !errors.houseNo}
                  />
                  <Form.Control.Feedback type="invalid">{errors.houseNo}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="phoneNumber">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 07XXXXXXXX"
                    name="phoneNumber" 
                    value={formData.phoneNumber}
                    onChange={(e) => {
        const value = e.target.value;
        // Allow only numbers and limit to 2 digits
        if (/^\d{0,10}$/.test(value)) {
          setFormData({ ...formData, phoneNumber: value });
          setErrors((prevErrors) => ({ ...prevErrors, phoneNumber: null })); // Clear error if valid
        }
      }}
      
      isInvalid={!!errors.phoneNumber}
      isValid={!!formData.phoneNumber && !errors.phoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="profile">
                  <Form.Label>Profile Picture</Form.Label>
                  <Form.Control
                    type="file" required
                    name="profile"
                    accept="image/*"
                    onChange={handleChange}
                    isInvalid={!!errors.profile}
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
                    isValid={!!formData.ward && !errors.ward}
                  >
                    <option value="">Select Ward</option>
                    <option value="kwerekwe">M/Kwerekwe</option>
                    <option value="pangawe">Pangawe</option>
                    <option value="kwahani">Kwahani</option>
                    <option value="kijito">K/Upele</option>
                    <option value="kinuni">Kinuni</option>
                    <option value="mtoni">Mtoni</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.ward}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="password">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      isValid={!!formData.password && !errors.password}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? <EyeSlash /> : <Eye />}
                    </Button>
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
              </Col></Row>
               <Row className="g-3 mt-3">
              <Col md={4}>
                <Form.Group controlId="submit">
                  <Button variant="primary" type="submit" className="w-100 mt-4" style={{margin:'0px'}}>
                    Register 
                  </Button> 
                </Form.Group>
              </Col>

              <Col md={4}>&nbsp;<br></br><p>Already Registered? 
               &nbsp; <Link to="/Login" style={{ textDecoration: "none", color: "blue" }}>
              Click here to Login</Link></p></Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CitizenRegistrationForm;