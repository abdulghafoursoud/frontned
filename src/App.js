import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Welcome from "./components/Welcome";
// import StudentRegistrationForm from "./components/StudentRegistrationForm";
import { BrowserRouter as Router, Route, Routes,useLocation } from "react-router-dom";
// import StudentLogin from "./components/StudentLogin";
// import InstructorLogin from "./components/InstructorLogin";
// import InstructorDashboard from "./components/InstructorDashboard";
// import InstructorProject from "./components/InstructorProject";
// import StudentDashboard from "./components/StudentDashboard";
// import StudentSetting from "./components/StudentSetting";
// import StudentProject from "./components/StudentProject";
// import InstructorSetting from "./components/InstructorSetting";
import Login from "./components/Login";
import LoadingScreen from './components/LoadingScreen';
import CitizenRegister from './components/CitizenRegister';
import Citizen_Dashboard from './components/Citizen_Dashboard';
import Ward_Dashboard from './components/Ward_Dashboard';
import Admin_Dashboard from './components/Admin_Dashboard';
import CitizenEvent from './components/CitizenEvent';
import AdminViewOfficer from './components/AdminViewOfficer';
import WardOfficerViewCitizens from './components/WardOfficerViewCitizens';
import WardOfficerViewEvent from './components/WardOfficerViewEvent';



import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 
import "bootstrap-icons/font/bootstrap-icons.css";


function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2000); // adjust duration as needed
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) return <LoadingScreen />;

  return ( 
    <Routes>
      <Route path="/" element={<Welcome />} /> 
                {/* <Route path="/StudentRegistrationForm" element={<StudentRegistrationForm />} />
                <Route path="/Studentlogin" element={<StudentLogin />} /> */}
                <Route path="/Login" element={<Login />} />
                {/* <Route path="/InstructorLogin" element={<InstructorLogin />} />
                <Route path="/InstructorDashboard" element={<InstructorDashboard />} />
                <Route path="/InstructorProject" element={<InstructorProject />} />
                <Route path="/StudentDashboard" element={<StudentDashboard />} />
                <Route path="/StudentSetting" element={<StudentSetting />} />
                <Route path="/StudentProject" element={<StudentProject />} />
                <Route path="/InstructorSetting" element={<InstructorSetting />} /> */}
                <Route path="/CitizenRegister" element={<CitizenRegister />} />
                <Route path="/Citizen_Dashboard" element={<Citizen_Dashboard />} /> 
                <Route path="/Ward_Dashboard" element={<Ward_Dashboard />} /> 
                <Route path="/Admin_Dashboard" element={<Admin_Dashboard />} /> 
                <Route path="/CitizenEvent" element={<CitizenEvent />} />
                <Route path="/AdminViewOfficer" element={<AdminViewOfficer />} /> 
                <Route path="/WardOfficerViewCitizens" element={<WardOfficerViewCitizens />} />
                <Route path="/WardOfficerViewEvent" element={<WardOfficerViewEvent />} />
                
    </Routes>
  ); 
}


const App = () => {


  return ( 

     <Router>
      <AppWrapper />
    </Router>

    
              
            



           


  );
};


export default App;
