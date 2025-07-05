
  

 
        
         
            import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';
import Footer from './Footer';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
} from 'react-bootstrap';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const zanId = sessionStorage.getItem('zanId');

  const [citizenData, setCitizenData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [reportData, setReportData] = useState([]);
  const [reportCount, setReportCount] = useState(0);

  // NEW STATE: Counts for submitted and attended
  const [submittedCount, setSubmittedCount] = useState(0);
  const [attendedCount, setAttendedCount] = useState(0);

  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? 200 : 60;

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    dateSubmitted: '',
    zanId: zanId || '',
    ward: '',
    location: '',
    eventphoto: null,
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    address: '',
    password: '',
    age: '',
    ward: '',
    houseNo: '',
    profile: null,
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/Login');
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSettingsShow = () => {
    if (citizenData) {
      setSettingsForm({
        address: citizenData.address || '',
        password: citizenData.password || '',
        age: citizenData.age || '',
        ward: citizenData.ward || '',
        houseNo: citizenData.houseNo || '',
        profile: null,
      });
      setShowSettingsModal(true);
    }
  };
  const handleSettingsClose = () => setShowSettingsModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, files } = e.target;
    setSettingsForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('address', settingsForm.address);
    form.append('password', settingsForm.password);
    form.append('age', settingsForm.age);
    form.append('ward', settingsForm.ward);
    form.append('houseNo', settingsForm.houseNo);
    if (settingsForm.profile) {
      form.append('profile', settingsForm.profile);
    }

    fetch(`http://localhost:8080/api/citizens/update/${citizenData?.id}`, {
      method: 'PUT',
      body: form,
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update citizen');
        return res.text();
      })
      .then(() => {
        setSuccessMessage("Profile updated successfully");
        setShowSettingsModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to update profile");
      });
  };

  // Count All Reports
  useEffect(() => {
    let interval;
    if (zanId) {
      interval = setInterval(() => {
        fetch(`http://localhost:8080/api/reports/count_report/${zanId}`)
          .then((res) => res.json())
          .then((data) => setReportCount(data))
          .catch((error) => console.error('Error fetching report count:', error));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [zanId]);

  // Get Report Data and Calculate Submitted/Attended Counts
  useEffect(() => {
    let interval;
    if (zanId) {
      interval = setInterval(() => {
        fetch(`http://localhost:8080/api/reports/get_by_zanid/${zanId}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch reports');
            return res.json();
          })
          .then(data => {
            setReportData(data);

            // NEW: Count submitted and attended
            const submitted = data.filter(r => r.status?.toLowerCase() === 'submitted').length;
            const attended = data.filter(r => r.status?.toLowerCase() === 'attended').length;

            setSubmittedCount(submitted);
            setAttendedCount(attended);
          })
          .catch(error => console.error('Error fetching reports:', error));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [zanId]);

  // Get Citizen Data
  useEffect(() => {
    if (!zanId) {
      navigate('/Login');
      return;
    }

    const interval = setInterval(() => {
      fetch(`http://localhost:8080/api/citizens/get_by_zanid/${zanId}`)
        .then(res => res.json())
        .then(data => setCitizenData(data))
        .catch(error => console.error('Error fetching citizen:', error));
    }, 1000);

    return () => clearInterval(interval);
  }, [zanId, navigate]);

  const handleEvent = (e) => {
    e.preventDefault();
    const date = new Date(formData.dateSubmitted);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const data = new FormData();
    data.append("description", formData.description);
    data.append("dateSubmitted", formattedDate);
    data.append("zanId", citizenData?.zanId);
    data.append("status", "submitted");
    data.append("ward", citizenData?.ward);
    data.append("location", formData.location);
    if (formData.eventphoto) {
      data.append("eventphoto", formData.eventphoto);
    }

    fetch("http://localhost:8080/api/reports", {
      method: "POST",
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit report");
        return res.text();
      })
      .then(() => {
        setSuccessMessage("Event submitted successfully");
        setShowModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        alert("Failed to submit report");
      });
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', flexDirection: 'row' }}>
      {/* Sidebar */}
      <nav
        className="text-white"
        style={{
          position: 'fixed',
          top: 0,
          width: sidebarWidth,
          flexShrink: 0,
          transition: 'width 0.4s ease',
          background: '#1b4f72 ',
          left: 0,
          minHeight: '100vh',
          overflowX: 'hidden',
          zIndex: 1000,
        }}
      >
        <div className="d-flex flex-column align-items-center pt-3">
          <button className="btn btn-outline-light btn-sm mb-4" onClick={toggleSidebar}>
            <i className="bi bi-list fs-5"></i>
          </button>

          <ul className="nav flex-column mt-4 px-2">
            <li className="nav-item mb-2">
              <Link to="/Citizen_Dashboard" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-house-door-fill me-2"></i>
                {isOpen && 'Dashboard'}
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/CitizenEvent" className="nav-link text-white d-flex align-items-center">
                <i className="bi bi-calendar-event-fill me-2"></i>
                {isOpen && 'Events'} <span style={{color:'orange'}}>({reportCount})</span>
              </Link>
            </li>
            <li className="nav-item mb-2">
              <span className="nav-link text-white d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={handleSettingsShow}>
                <i className="bi bi-gear-fill me-2"></i>
                {isOpen && 'Settings'}
              </span>
            </li>
            <li className="nav-item mb-2">
              <span className="nav-link text-white d-flex align-items-center" onClick={handleLogout} role="button">
                <i className="bi bi-box-arrow-right me-2"></i>
                {isOpen && 'Logout'}
              </span>
            </li>
          </ul>

          <div className="mt-auto mb-4">
            <img
              src={logo}
              alt="Profile"
              className="rounded-circle"
              style={{
                marginTop: '120px',
                width: isOpen ? '100px' : '50px',
                height: isOpen ? '100px' : '50px',
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>
      </nav>

      <div style={{ marginLeft: `${sidebarWidth}px`, transition: 'margin-left 0.4s ease', flexGrow: 1 }}>
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 2000,
              minWidth: '250px',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            }}
            role="alert"
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
          </div>
        )}

        <Container fluid style={{ padding: '2rem' }}>
          <h3>Citizen Dashboard</h3>

          <Row className="my-4">
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#d6eaf8' }}>
                <Card.Body>
                  <h4>{reportCount}</h4>
                  <p>All Events Submitted</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#f9e79f' }}>
                <Card.Body>
                  <h4>{submittedCount}</h4>
                  <p>Pending Events</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm" style={{ background: '#abebc6' }}>
                <Card.Body>
                  <h4>{attendedCount}</h4>
                  <p>Event Resolved</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Rest of your code stays the same */}
          {/* ... */}


          <Button variant="primary" className="mb-4" onClick={handleShow}>
            + Submit New Event
          </Button>


{/* RECENT EVENTS SUBMITTED */}
         <div className="d-flex justify-content-between align-items-center mb-3">
  <h5 className="mb-0">Recent Events Reported</h5>
  <Link to="/CitizenEvent">
    <button className="btn btn-outline-primary btn-sm">
      View All Events Submitted <i className="bi bi-arrow-right"></i>
    </button>
  </Link>
</div>
         
          
                 <div className="table-responsive">
  <table className="table table-bordered table-striped align-middle text-center">
    <thead className="table-primary">
      <tr>
        <th>Event Photo</th>
        <th>Submission Date</th>
        <th>Event Description</th>
        <th>Location Occured</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {reportData.length > 0 ? (
        reportData.slice(0, 2).map((report, index) => (
          <tr key={index}>
            <td>
              <img
                src={`data:image/jpeg;base64,${report.eventphoto}`}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                className="rounded"
                alt="Event"
              />
            </td>
            <td>{report.dateSubmitted}</td>
            <td>{report.description}</td>
            <td>{report.location}</td>
            
<td>
  <span
    style={{
      borderRadius: '15px',
      padding: '3px',
      width:'100px',
      display: 'inline-block',
      backgroundColor:
        report.status?.toLowerCase() === 'submitted'
          ? '#f9e79f'
          : report.status?.toLowerCase() === 'attended'
            ? '#abebc6'
            : 'transparent'
    }}
  >
    {report.status}
  </span>
</td>




          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="text-center">
            No Events Found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

                {/* END OF RECENT EVENTS SUBMITTED */}

            

          <h4 style={{ marginTop: '50px' }} className="d-flex align-items-center">
  <i className="bi bi-person-circle me-2" style={{ fontSize: '1.1em' }}></i>
  Personal Informations
</h4>
          <div className="d-flex justify-content-between mt-4 flex-wrap">
            <Card className="me-3 mb-3" style={{ width: '18rem' }}>
              <Card.Img
                variant="top"
                src={`data:image/jpeg;base64,${citizenData?.profile}`}
                style={{ height: '290px', objectFit: 'cover' }}
              />
              <Card.Body className="text-center">
                <Card.Title><strong>{citizenData?.name}</strong></Card.Title>
              </Card.Body>
            </Card>

            <Card className="flex-grow-1">
              <Card.Body>
                <h3>About</h3>
                <hr />
                <Card.Title>Citizen Information</Card.Title>
                <Card.Text>
                  <div className="mb-2"><strong>Full Name:</strong> &nbsp;{citizenData?.name}</div>
     <div className="mb-2">
  <strong><i className="bi bi-geo-alt-fill me-2"></i>Address:</strong> &nbsp;{citizenData?.address}
</div>
<div className="mb-2">
  <strong><i className="bi bi-person-badge-fill me-2"></i>Age:</strong> &nbsp;{citizenData?.age}
</div>
<div className="mb-2">
  <strong><i className="bi bi-calendar-event-fill me-2"></i>Date Of Birth:</strong> &nbsp;{citizenData?.birthDate}
</div>
<div className="mb-2">
  <strong><i className="bi bi-telephone-fill me-2"></i>Phone Number:</strong> &nbsp;{citizenData?.phoneNumber}
</div>
<div className="mb-2">
  <strong><i className="bi bi-pin-map-fill me-2"></i>Ward Lived:</strong> &nbsp;{citizenData?.ward}
</div>
<div className="mb-2">
  <strong><i className="bi bi-gender-ambiguous me-2"></i>Gender:</strong> &nbsp;{citizenData?.gender}
</div>
<div className="mb-2">
  <strong><i className="bi bi-shield-lock-fill me-2"></i>Password:</strong> &nbsp;{citizenData?.password}
</div>
<div className="mb-2">
  <strong><i className="bi bi-house-door-fill me-2"></i>House Number:</strong> &nbsp;{citizenData?.houseNo}
</div>
<div className="mb-2">
  <strong><i className="bi bi-person-vcard-fill me-2"></i>Zan ID Number:</strong> &nbsp;{citizenData?.zanId}
</div>

                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          
       
      
     



      {/* ADD NEW EVENT */}
      <Modal show={showModal} onHide={handleClose} centered animation={true}>
        <Modal.Header closeButton>
          <Modal.Title>New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEvent}>
            <div className="mb-3">
              <label className="form-label">Event Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Date Submitted</label>
              <input
                type="date"
                name="dateSubmitted"
                className="form-control"
                value={formData.dateSubmitted}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ward</label>
              <input
                type="text"
                name="ward"
                className="form-control"
                value={citizenData?.ward}
                onChange={handleChange}
                required readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">ZanId</label>
              <input
                type="text"
                name="zanId"
                className="form-control"
                value={citizenData?.zanId}
                onChange={handleChange}
                required readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Location occured</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Attach Event Photo</label>
              <input
                type="file"
                name="eventphoto"
                className="form-control"
                onChange={handleChange}
                accept="image/*"
                required
              />
            </div>

            <div className="text-end">
              <Button variant="secondary" onClick={handleClose} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>




        </Container>

        {/* Footer aligned correctly */}
        <Footer />
      </div>

      {/* Event Modal */}
      
  



      {/* UPDATE FORM */}
      <Modal show={showSettingsModal} onHide={handleSettingsClose} centered animation={true}>
        <Modal.Header closeButton>
          <Modal.Title>Citizen Update Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSettingsSubmit}>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input type="text" name="address" className="form-control" value={settingsForm.address} onChange={handleSettingsChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" value={settingsForm.password} onChange={handleSettingsChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Age</label>
              <input type="number" name="age" className="form-control" value={settingsForm.age} onChange={handleSettingsChange} required />
            </div>
            <div className="mb-3">
  <label className="form-label">Ward</label>
  <select
    name="ward"
    className="form-control"
    value={settingsForm.ward}
    onChange={handleSettingsChange}
    required
  >

    <option value="kwerekwe">M/Kwerekwe</option>
    <option value="pangawe">Pangawe</option>
    <option value="kwahani">Kwahani</option>
    <option value="kijito">K/Upele</option>
    <option value="kinuni">Kinuni</option>
    <option value="mtoni">Mtoni</option>
  </select>
</div>
            <div className="mb-3">
              <label className="form-label">House Number</label>
              <input type="text" name="houseNo" className="form-control" value={settingsForm.houseNo} onChange={handleSettingsChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Update Profile Picture</label>
              <input type="file" name="profile" className="form-control" accept="image/*" onChange={handleSettingsChange} />
            </div>
            <div className="text-end">
              <Button variant="secondary" onClick={handleSettingsClose} className="me-2">Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CitizenDashboard;
