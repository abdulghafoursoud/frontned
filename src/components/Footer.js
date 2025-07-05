import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Footer = () => {
    return (
        <>

   <footer style={{ backgroundColor: '#5d6d7e' }} className="text-light py-3 mt-auto text-center">
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
        </>
    );
};

export default Footer;
