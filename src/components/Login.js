import React, { useState, useEffect } from "react";
import logo from '../assets/images/logo.jpg';
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const LoginForm = () => {
  const [role, setRole] = useState("Citizen");
  const [zanId, setZanId] = useState("");
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [inputValid, setInputValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMessage("");
    setSuccessMessage("");
    setInputValid(true);
    setPasswordValid(true);
    setZanId("");
    setPostcode("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isInputValid = false;
    let apiUrl = "";
    let requestBody = {};

    if (role === "Citizen") {
      isInputValid = zanId.length > 0 && zanId.length <= 9 && password.length > 0;
      apiUrl = "http://localhost:8080/api/citizens/login";
      requestBody = { zanId, password };
    } else if (role === "Ward Officer") {
      isInputValid = postcode.length > 0 && password.length > 0;
      apiUrl = "http://localhost:8080/api/wardofficers/login";
      requestBody = { postcode, password };
    } else if (role === "Admin") {
      isInputValid = email.length > 0 && password.length > 0;
      apiUrl = "http://localhost:8080/api/admins/login";
      requestBody = { email, password };
    }

    setInputValid(isInputValid);
    setPasswordValid(password.length > 0);
    setSuccessMessage("");
    setErrorMessage("");

    if (!isInputValid || password.length === 0) {
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        sessionStorage.setItem("role", role);
        if (role === "Citizen") {
          sessionStorage.setItem("zanId", zanId);
        } else if (role === "Ward Officer") {
          sessionStorage.setItem("postcode", postcode);
        } else if (role === "Admin") {
          sessionStorage.setItem("email", email);
        }

        setSuccessMessage("Login Successfully. Please Wait...");
        setIsLoading(true);

        setTimeout(() => {
          if (role === "Citizen") {
            navigate("/Citizen_Dashboard");
          } else if (role === "Ward Officer") {
            navigate("/Ward_Dashboard");
          } else if (role === "Admin") {
            navigate("/Admin_Dashboard");
          }
        }, 2000);
      } else {
        setErrorMessage(`${role} Not Found or Invalid Credentials`);
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white" style={{ maxHeight: '100%' }}>
      <div className="card shadow-sm" style={{ marginTop: '10px', height: '95%', maxWidth: "400px", width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-3">
            <img src={logo} alt="Boresha Mtaa Logo" style={{ width: "100px" }} />
          </div>

          <div className="btn-group w-100 mb-4" role="group">
            {["Citizen", "Ward Officer", "Admin"].map((r) => (
              <button
                key={r}
                type="button"
                className={`btn ${role === r ? "btn-primary" : "btn-outline-primary"} text-capitalize`}
                onClick={() => handleRoleChange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="text-center mb-3">
            <h6>Log In as: <strong>{role}</strong></h6>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Dynamic Input Field */}
            {role === "Citizen" && (
              <div className="mb-3">
                <label htmlFor="zanId" className="form-label">Zan ID</label>
                <input
                  type="number"
                  id="zanId"
                  placeholder="ex 303827183"
                  className={`form-control ${inputValid ? "is-valid" : "is-invalid"}`}
                  value={zanId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 9) setZanId(value);
                  }}
                  onFocus={() => setInputValid(true)}
                />
                {!inputValid && <div className="invalid-feedback">Zan ID must be 1 to 9 characters.</div>}
              </div>
            )}

            {role === "Ward Officer" && (
              <div className="mb-3">
                <label htmlFor="postcode" className="form-label">Postcode</label>
                <input
                  type="text"
                  id="postcode"
                  placeholder="Enter postcode"
                  className={`form-control ${inputValid ? "is-valid" : "is-invalid"}`}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onFocus={() => setInputValid(true)}
                />
                {!inputValid && <div className="invalid-feedback">Postcode is required.</div>}
              </div>
            )}

            {role === "Admin" && (
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  className={`form-control ${inputValid ? "is-valid" : "is-invalid"}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setInputValid(true)}
                />
                {!inputValid && <div className="invalid-feedback">Valid Email is required.</div>}
              </div>
            )}

            {/* Password Field */}
            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  className={`form-control ${passwordValid ? "is-valid" : "is-invalid"}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordValid(true)}
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const inp = document.getElementById("password");
                    inp.type = inp.type === "password" ? "text" : "password";
                  }}
                >
                  <i className="bi bi-eye"></i>
                </span>
              </div>
              {!passwordValid && <div className="invalid-feedback">Password is required.</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100">Log in</button>
          </form>

          <br />

          {role === "Citizen" && (
            // <div className="d-flex justify-content-between align-items-center mb-4">
              <span>Haven't registered yet? 
                &nbsp;
                <Link to="/CitizenRegister" style={{ textDecoration: "none", color: "blue" }}>
                  Click here to register
                </Link>
              </span>
            // </div>
          )}

        </div>
      </div>

      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style={{ zIndex: 1050, minWidth: "250px" }}>
          <i className="bi bi-check-circle-fill text-success me-2"></i>
          {successMessage}
          {isLoading && (
            <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
          )}
        </div>
      )}

      {/* ERROR TOAST */}
      {showError && (
        <div className="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style={{ zIndex: 1050, minWidth: "250px" }}>
          <i className="bi bi-x-circle-fill text-danger me-2"></i>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default LoginForm;
