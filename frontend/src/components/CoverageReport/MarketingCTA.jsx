import React from 'react';
import { PhoneCall, FileText, RefreshCw } from 'lucide-react';
import './CoverageReport.css';

const MarketingCTA = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">7</span> MARKETING BANNER & CTA
        </div>
        <div className="cr-section-line" style={{backgroundColor: 'transparent', borderTop: '1px solid var(--cr-border-strong)'}}></div>
      </div>

      <div className="cr-marketing-banner">
        <div className="cr-mb-left">
          <div className="cr-mb-tag">READY TO ACT?</div>
          <h2 className="cr-mb-title">
            Close Your Insurance<br />Policy <span className="cr-mb-highlight">Coverage Gaps</span> Today
          </h2>
          <p className="cr-mb-desc">
            Talk to a licensed advisor, compare plans from 30+ insurers, or download your full personalised coverage report — no paperwork required to get started.
          </p>
          
          <div className="cr-mb-stats">
            <div className="cr-stat">
              <h4>₹2,250</h4>
              <p>Est. monthly premium to close all 4 gaps</p>
            </div>
            <div className="cr-stat">
              <h4>30 min</h4>
              <p>To get your first gap covered</p>
            </div>
            <div className="cr-stat">
              <h4>78</h4>
              <p>Projected score after top 2 actions done</p>
            </div>
          </div>
        </div>
        
        <div className="cr-mb-right">
          <a href="#" className="cr-btn cr-btn-solid">
            <PhoneCall size={18} fill="currentColor" /> Speak to an Advisor
          </a>
          <a href="#" className="cr-btn cr-btn-outline">
            <FileText size={18} /> Download Full Report
          </a>
          <a href="#" className="cr-btn cr-btn-outline">
            <RefreshCw size={18} /> Re-run Analysis
          </a>
        </div>
      </div>
      
      <p className="cr-disclaimer">
        This analysis is indicative and based on information provided. Coverage needs vary by individual circumstances. Please consult a licensed IRDAI-registered insurance advisor before making any purchase decisions. Premiums and sums assured are illustrative for Mumbai, India as of March 2026.
      </p>
    </div>
  );
};

export default MarketingCTA;
