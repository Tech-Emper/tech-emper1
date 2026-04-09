import React from 'react';
import { User, MapPin, Briefcase, Users, Heart } from 'lucide-react';
import './CoverageReport.css';

const ProfileSection = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">1</span> MY PROFILE
        </div>
        <div className="cr-section-line"></div>
        <div className="cr-section-subline">Rohan Mehta · TechCorp · Mid-Level IT</div>
      </div>

      <div className="cr-card">
        <div className="cr-profile-header">
          <div className="cr-profile-info">
            <div className="cr-profile-avatar">👨🏻</div>
            <div className="cr-profile-text">
              <h3>Rohan Mehta, 35</h3>
              <p>Senior Software Engineer · TechCorp India · Family of 4</p>
            </div>
          </div>
          <div>
            <Heart size={20} className="cr-badge-icon" />
          </div>
        </div>

        <div className="cr-badges-row">
          <div className="cr-badge">
            <User size={14} className="cr-badge-icon" /> Rohan Mehta <span className="cr-badge-light-text">Age 35</span>
          </div>
          <div className="cr-badge">
            <Briefcase size={14} className="cr-badge-icon" /> TechCorp India <span className="cr-badge-light-text">Senior Software Engineer</span>
          </div>
          <div className="cr-badge">
            <Briefcase size={14} className="cr-badge-icon" /> IT / Software <span className="cr-badge-light-text">Mid-Level - 5 yrs</span>
          </div>
          <div className="cr-badge">
            <Users size={14} className="cr-badge-icon" /> Family of 4 <span className="cr-badge-light-text">Spouse + 2 Kids</span>
          </div>
          <div className="cr-badge">
            <MapPin size={14} className="cr-badge-icon" /> Mumbai <span className="cr-badge-light-text">Maharashtra</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
