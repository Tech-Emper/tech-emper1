import React, { useEffect } from 'react';
import ProfileSection from './ProfileSection';
import PersonalCoverage from './PersonalCoverage';
import FamilyAndAddons from './FamilyAndAddons';
import BenchmarkSection from './BenchmarkSection';
import OtherPolicies from './OtherPolicies';
import SuggestedActions from './SuggestedActions';
import MarketingCTA from './MarketingCTA';
import './CoverageReport.css';

const CoverageReport = () => {
  return (
    <div className="cr-container">
      <div className="cr-content">
        {/* Header */}
        <header className="cr-header">
          <div className="cr-header-left">
            <p>EMPLOYEE INSURANCE ANALYSIS · 2026</p>
            <h1 className="cr-header-title">
              Insurance Policy
              <span className="cr-header-title-highlight">Coverage Report</span>
            </h1>
            <p className="cr-header-desc">
              A structured assessment of your current insurance policy coverage — what you hold, what you're missing, and how you compare to peers at your career stage.
            </p>
          </div>
          
          <div className="cr-header-right">
            <div className="cr-gen-badge">Generated: March 2026</div>
            <div className="cr-score-mini">
              <div className="cr-score-mini-circle">
                <div className="cr-score-mini-circle-inner mb-px ml-px">.</div>
              </div>
              <div className="cr-score-mini-labels">
                <p className="cr-score-mini-num">60</p>
                <p className="cr-score-mini-text">Coverage Score</p>
              </div>
            </div>
          </div>
        </header>

        {/* Sections */}
        <ProfileSection />
        <PersonalCoverage />
        <FamilyAndAddons />
        <BenchmarkSection />
        <OtherPolicies />
        <SuggestedActions />
        <MarketingCTA />
        
        {/* Bottom spacer for the browser mockup style bar */}
        <div style={{height: '24px', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
           <div style={{width: '60px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--cr-border-strong)'}}></div>
        </div>
      </div>
    </div>
  );
};

export default CoverageReport;
