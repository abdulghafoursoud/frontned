import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import profile from '../assets/images/profile.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/images/logo.jpg';

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
} from 'react-bootstrap';
const EventManagement = () => {
  const navigate = useNavigate();
  const zanId = sessionStorage.getItem('zanId');
  const [citizenData, setCitizenData] = useState(null);
  const [reportData, setReportData] = useState([]);

  const [isOpen, setIsOpen] = useState(true);
  const sidebarWidth = isOpen ? 200 : 60;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/Login');
  };

  // Fetch citizen info
  useEffect(() => {
    if (!zanId) {
      console.error('No Zan ID found in sessionStorage');
      navigate('/Login');
    } else {
      fetch(`http://localhost:8080/api/citizens/get_by_zanid/${zanId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch citizen data');
          return res.json();
        })
        .then(data => setCitizenData(data))
        .catch(error => console.error('Error fetching citizen:', error));
    }
  }, [zanId, navigate]);

  
  // Fetch EVENT by Zan ID
  useEffect(() => {
  let interval;

  if (zanId) {
    interval = setInterval(() => {
      fetch(`http://localhost:8080/api/reports/get_by_zanid/${zanId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch reports');
          return res.json();
        })
        .then(data => setReportData(data))
        .catch(error => console.error('Error fetching reports:', error));
    }, 1000); 
  }
  return () => clearInterval(interval);
}, [zanId]);
// END FETCHING EVENT
 const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    address: '',
    password: '',
    age: '',
    ward: '',
    houseNo: '',
    profile: null,
  });

 //count report submitted
const [reportCount, setReportCount] = useState(0);
useEffect(() => {
  let interval;

  if (zanId) {
    // Start interval
    interval = setInterval(() => {
      fetch(`http://localhost:8080/api/reports/count_report/${zanId}`)
        .then((res) => res.json())
        .then((data) => setReportCount(data))
        .catch((error) => console.error('Error fetching report count:', error));
    }, 1000); // 1000 ms = 1 second
  }

  // Clear interval when component unmounts
  return () => clearInterval(interval);
}, [zanId]);


// UPDATE SETTINGS PROFILE
  const handleShow2 = () => setShowModal(true);
  const handleClose2 = () => setShowModal(false);
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

  const handleChange2 = (e) => {
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

// END OF UPDATE PROFILE






  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      fetch(`http://localhost:8080/api/reports/${id}`, {
        method: 'DELETE',
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete report');
          setReportData(prev => prev.filter(r => r.id !== id));
        })
        .catch(error => console.error('Error deleting report:', error));
    }
  };





  
  // EVENT SUBMISSION
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
        if (!res.ok) throw new Error("Failed to add event");
        return res.text();
      })
      .then(() => {
        setSuccessMessage("Event added successfully"); 
        setShowModal(false);

        // Auto-hide message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((error) => {
        console.error("Submission error:", error);
        alert("Failed to submit event");
      });
  };
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); 
    const [formData, setFormData] = useState({
      description: '',
      dateSubmitted: '',
      zanId: zanId || '',
      ward: '',
      location: '',
      eventphoto: null,
    });
  
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
  
    const handleChange = (e) => {
      const { name, value, files } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    };
    // END UPLOAD EVENT



    // UPDATE EVENT

    
      

// END OF UPDATE EVENT

  return (
    <div className="d-flex">

         {/* ✅ Success Alert for event uploaded */}
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show"
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

      {/* Sidebar */}
      <nav
        className="text-black"
        style={{
          width: sidebarWidth,
          position: 'fixed',
          top: 0,
          background: '#1b4f72',
          left: 0,
          color:'black',
          height: '100vh',
          transition: 'width 0.4s ease',
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
                {isOpen && 'Events'}<span style={{color:'orange'}}>({reportCount})</span>
              </Link>
            </li>
            <li className="nav-item mb-2">
  <span
    className="nav-link text-white d-flex align-items-center"
    style={{ cursor: 'pointer' }}
    onClick={handleSettingsShow}
  >
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
                marginTop: isOpen ? '120px' : '120px',
                width: isOpen ? '100px' : '50px',
                height: isOpen ? '100px' : '50px',
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>
      </nav>
      {/* End Sidebar */}

      {/* Main Content */}
      <div style={{ marginLeft: sidebarWidth, padding: '20px', width: '100%' }}>
        <h3 className="mb-4">Citizen Events Management</h3>

<Button variant="primary" className="mb-4" onClick={handleShow}>
            + Submit New Event
          </Button>

        <div className="table-responsive">
            <h3>All Events Submitted</h3><br></br>
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-primary">
              <tr>
                <th>Event Photo</th>
                <th>Submission Date</th>
                <th>Event Description</th>
                <th>Location Occured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((report, index) => (
                  <tr key={index}>
                    <td>
                        <img
                          src={`data:image/jpeg;base64,${report.eventphoto}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          className="rounded"
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


                    <td>
                      <div className="d-flex gap-2">
                        
                        <button
                          className="btn btn-sm btn-warning"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(report.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Events Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal */}
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

export default EventManagement;
