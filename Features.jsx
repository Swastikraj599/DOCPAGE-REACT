import React from 'react';
import { FaCloudUploadAlt, FaSearch, FaShieldAlt } from 'react-icons/fa';
import './Hero.css'; // Reusing same stylesheet

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="feature-card">
    <Icon className="feature-icon" />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const Features = () => {
  return (
    <div className="features">
      <FeatureCard icon={FaCloudUploadAlt} title="Easy Upload" description="Simple and intuitive interface for quick document uploads" />
      <FeatureCard icon={FaSearch} title="Quick Access" description="Efficiently organize and retrieve your documents" />
      <FeatureCard icon={FaShieldAlt} title="Secure Storage" description="Your documents are stored safely and securely" />
    </div>
  );
};

export default Features;

