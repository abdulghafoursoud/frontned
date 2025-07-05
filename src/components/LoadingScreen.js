import React, { useEffect, useState } from 'react';
import logo from '../assets/images/logo.jpg';

const LoadingScreen = () => {
  const [shift, setShift] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setShift(prevShift => {
        if (prevShift >= 20) {
          setDirection(-1);
        } else if (prevShift <= 0) {
          setDirection(1);
        }
        return prevShift + direction;
      });
    },100); // Adjust speed of the animation

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
        {['primary', 'success', 'danger'].map((color) => (
          <div
            key={color}
            className={`spinner-grow text-${color}`}
            role="status"
            style={{
              width: '1.6rem',
              height: '1.6rem',
              transform: `translateY(-${shift}px)`,
              transition: 'transform 0.4s ease-in-out',
            }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        ))}
      </div>
      {/* <h4 className="text-center text-dark">Loading...</h4>
      <small className="text-muted mt-2">Please wait...</small> */}

      <img
            src={logo}
            alt="Logo"
            width="90"
            height="90"
            className="d-inline-block align-text-top me-2" style={{borderRadius:'50%'}}
          />
    </div>
  );
};

export default LoadingScreen;