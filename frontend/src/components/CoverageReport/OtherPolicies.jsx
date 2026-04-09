import React from 'react';
import { Plane, Briefcase, Scale } from 'lucide-react';
import './CoverageReport.css';

const OtherPolicies = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">5</span> OTHER KEY POLICIES SUGGESTED FOR YOU
        </div>
        <div className="cr-section-line"></div>
        <div className="cr-section-subline">Based on your profile & industry</div>
      </div>

      <div className="cr-policy-tabs">
        <div className="cr-ptab active">🛡️ Protection</div>
        <div className="cr-ptab">🏠 Assets</div>
        <div className="cr-ptab">🎓 Future Planning</div>
      </div>

      <div className="cr-other-card">
        <div className="cr-other-icon">✈️</div>
        <div className="cr-other-content">
          <h4 className="cr-other-title">Travel Insurance</h4>
          <p className="cr-other-desc">Trip cancellation, medical abroad, baggage loss — essential for IT professionals who travel internationally for projects.</p>
        </div>
        <div className="cr-other-right">
          <div className="cr-addon-tag cr-tag-must">HIGH PRIORITY</div>
          <div className="cr-other-price">~₹600–1,200/trip</div>
        </div>
      </div>

      <div className="cr-other-card">
        <div className="cr-other-icon">💼</div>
        <div className="cr-other-content">
          <h4 className="cr-other-title">Income Protection</h4>
          <p className="cr-other-desc">Monthly payout if illness or injury prevents you from working — protects family cash flow during extended recovery.</p>
        </div>
        <div className="cr-other-right">
          <div className="cr-addon-tag cr-tag-must">HIGH PRIORITY</div>
          <div className="cr-other-price">~₹800–1,500/mo</div>
        </div>
      </div>

      <div className="cr-other-card">
        <div className="cr-other-icon">⚖️</div>
        <div className="cr-other-content">
          <h4 className="cr-other-title">Professional Liability</h4>
          <p className="cr-other-desc">Legal cover from professional services — increasingly relevant for senior IT roles and consultants.</p>
        </div>
        <div className="cr-other-right">
          <div className="cr-addon-tag cr-tag-rec">RECOMMENDED</div>
          <div className="cr-other-price">~₹5,000–10,000/yr</div>
        </div>
      </div>

    </div>
  );
};

export default OtherPolicies;
