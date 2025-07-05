import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import backgroundImage from '../assets/images/background.jpg';
import logo from '../assets/images/logo.jpg';


const WelcomePage = () => {
    return (
        <div>



  <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{background: '#1b4f72'}}>
      <div className="container">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img
            src={logo}
            alt="Logo"
            width="40"
            height="40"
            className="d-inline-block align-text-top me-2" style={{borderRadius:'50%'}}
          />
          <span className="fw-bold">Boresha Mtaa</span>
        </a>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <a className="nav-link active" href="/">Home</a></Link>
            </li>
            <li className="nav-item">
                <Link to="/Login" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="btn btn-outline-light ms-lg-3">Login</span></Link>
            </li>
            <li className="nav-item">
              <Link to="/CitizenRegister" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="btn btn-light ms-2">Sign Up</span></Link>
            </li>
          </ul>
        </div>
      </div> 
    </nav>



            
           
                       
                           
          {/* <Link to="/InstructorLogin" style={{ textDecoration: "none", color: "inherit" }}>
                                    Instructor Login </Link> */}
                              


                            
                   


 
     <div>

      {/* Hero Section */}
      <div className="bg-light text-center py-5" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", color: "#fff" }}>
        <div className="container py-5">
          <h1 className="display-4 fw-bold">Events. Track. Improve Your Neighborhood.</h1>
          <p className="lead mt-3">Boresha Mtaa empowers citizens to report issues and improve their communities.</p>
          {/* <div className="mt-4">
            <a href="#" className="btn btn-primary me-3" >Get Started</a>
            <a href="#" className="btn btn-outline-light">Learn More</a>
          </div> */}
        </div>
      </div>

      {/* Key Features */}
      <div className="container text-center my-5">
        <h2 className="mb-4 fw-semibold">Key Features</h2>
        <div className="row">
          <div className="col-md-3 mb-4">
            <i className="bi bi-geo-alt-fill display-4 text-primary"></i>
            <h5 className="mt-3">Report Local Issues</h5>
            <p>Easily report problems in your neighborhood.</p>
          </div>
          <div className="col-md-3 mb-4">
            <i className="bi bi-shield-fill-check display-4 text-primary"></i>
            <h5 className="mt-3">Assigned to Ward Officers</h5>
            <p>Reports are sent to appropriate officers for action.</p>
          </div>
          <div className="col-md-3 mb-4">
            <i className="bi bi-graph-up-arrow display-4 text-primary"></i>
            <h5 className="mt-3">Track Real-Time Updates</h5>
            <p>Monitor the progress of your reports as they’re addressed.</p>
          </div>
          <div className="col-md-3 mb-4">
            <i className="bi bi-phone display-4 text-primary"></i>
            <h5 className="mt-3">Mobile-Friendly</h5>
            <p>Access the platform anytime, anywhere.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-4 fw-semibold">How It Works</h2>
          <div className="row justify-content-center">
            <div className="col-md-3 mb-4">
              <i className="bi bi-person-circle display-4 text-primary"></i>
              <h6 className="mt-2">Create an Account</h6>
            </div>
            <div className="col-md-3 mb-4">
              <i className="bi bi-file-earmark-text display-4 text-primary"></i>
              <h6 className="mt-2">Submit Your Report</h6>
            </div>
            <div className="col-md-3 mb-4">
              <i className="bi bi-clock-history display-4 text-primary"></i>
              <h6 className="mt-2">Track Resolution Status</h6>
            </div>
            <div className="col-md-3 mb-4">
              <i className="bi bi-bell display-4 text-primary"></i>
              <h6 className="mt-2">Get Notified When Resolved</h6>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-5">
        <h4>Join thousands of citizens making a difference.</h4>
        <Link to="/CitizenRegister" style={{ textDecoration: "none", color: "inherit" }}>
        <a  className="btn btn-primary mt-3">Create Account</a></Link>
      </div>

    </div>


    

    <footer class="text-light pt-5 pb-4" style={{ backgroundColor: '#5d6d7e' }}>
  <div class="container text-md-start text-center">
    <div class="row">
      <div class="col-md-3 mb-4">
        <h5 class="text-uppercase fw-bold mb-3">Boresha Mtaa</h5>
        <p>" Together We Build Progress "</p>
      </div>

      <div class="col-md-3 mb-4">
        <h6 class="text-uppercase fw-bold mb-3">Links</h6>
        <ul class="list-unstyled">
          <li><a href="#" class="text-light text-decoration-none">Home</a></li>
         
        </ul>
      </div>

      <div class="col-md-3 mb-4">
        <h6 class="text-uppercase fw-bold mb-3">Follow Us On</h6>
        <a href="#" class="text-light me-3 fs-5"><i class="bi bi-facebook"></i></a>
        <a href="#" class="text-light me-3 fs-5"><i class="bi bi-twitter"></i></a>
        <a href="#" class="text-light me-3 fs-5"><i class="bi bi-instagram"></i></a>
        <a href="#" class="text-light fs-5"><i class="bi bi-linkedin"></i></a>
      </div>

      <div class="col-md-3 mb-4">
        <h6 class="text-uppercase fw-bold mb-3">Subscribe</h6>
        <form>
          <div class="mb-2">
            <input type="email" class="form-control form-control-sm" placeholder="Email address" />
          </div>
          <button type="submit" class="btn btn-sm btn-outline-light">Subscribe</button>
        </form>
      </div>
    </div>

    <hr class="border-light" />

    <div class="text-center">
      <small>© 2025 Boresha Mtaa. All rights reserved.</small>
    </div>
  </div>
</footer>
        </div>
    );
};

export default WelcomePage;
