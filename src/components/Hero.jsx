import React, { useState, useEffect, useRef } from 'react';
import Typed from 'typed.js';
import AuthModal from './AuthModal';
import './Hero.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Hero = () => {
  const typedRef = useRef(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ['Welcome to Document Management System', 'By Navriti Technologies (P). Ltd.', 'Hope you will like it!'],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  return (
    <div className="hero">
      <a href="#" className="logo">
        <i className=""></i>
      </a>

      <div className="nav-buttons">
        <button onClick={() => setShowAuthModal(true)}>
          <i className="fas fa-sign-in-alt"></i> Login / Sign Up
        </button>
      </div>

      <div className="typed-text">
        <span ref={typedRef}></span>
      </div>

      <p>
        A modern document management system designed to help you organize, store, and access your documents efficiently.
      </p>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Hero;