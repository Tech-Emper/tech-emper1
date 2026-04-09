import React from 'react';
import './CoverageReport.css';

const SuggestedActions = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">6</span> SUGGESTED ACTIONS
        </div>
        <div className="cr-section-line"></div>
        <div className="cr-section-subline">4 actions · Est. ₹2,250/month total</div>
      </div>

      <div className="cr-action-item">
        <div className="cr-action-num cr-num-red">1</div>
        <div className="cr-action-content">
          <h4 className="cr-action-title">Upgrade Health Cover to ₹20L via Super Top-Up</h4>
          <p className="cr-action-desc">
            A ₹15L super top-up on your existing ₹5L base plan costs ~₹4,000/yr for the family. One hospitalisation can wipe out 2 years of savings.
          </p>
        </div>
        <div className="cr-action-right">
          <span className="cr-action-tag cr-tag-donow">DO NOW</span>
          <span className="cr-action-meta">~₹350/mo · 30 min</span>
        </div>
      </div>

      <div className="cr-action-item">
        <div className="cr-action-num cr-num-orange">2</div>
        <div className="cr-action-content">
          <h4 className="cr-action-title">Increase Life Term Cover to ₹2.4Cr</h4>
          <p className="cr-action-desc">
            At age 35, premiums are still very affordable — ~₹1,200/month for ₹2Cr cover. Lock in before any health changes increase loading.
          </p>
        </div>
        <div className="cr-action-right">
          <span className="cr-action-tag cr-tag-donow">DO NOW</span>
          <span className="cr-action-meta">~₹1,200/mo · 45 min</span>
        </div>
      </div>

      <div className="cr-action-item">
        <div className="cr-action-num cr-num-orange">3</div>
        <div className="cr-action-content">
          <h4 className="cr-action-title">Buy Term Cover for Priya (₹1Cr)</h4>
          <p className="cr-action-desc">
            Dual-income families need dual coverage. Priya's ₹1Cr term at ~₹700/month ensures the family is protected even if her income is lost.
          </p>
        </div>
        <div className="cr-action-right">
          <span className="cr-action-tag cr-tag-quarter">THIS QUARTER</span>
          <span className="cr-action-meta">~₹700/mo · 1 hr</span>
        </div>
      </div>

      <div className="cr-action-item">
        <div className="cr-action-num cr-num-green">4</div>
        <div className="cr-action-content">
          <h4 className="cr-action-title">Senior Health Policy for Parents (₹10L)</h4>
          <p className="cr-action-desc">
            Medical costs spike sharply post-65. A dedicated senior citizen policy keeps your savings ring-fenced from parent hospitalisation costs.
          </p>
        </div>
        <div className="cr-action-right">
          <span className="cr-action-tag cr-tag-planahead">PLAN AHEAD</span>
          <span className="cr-action-meta">~₹2,500/mo · 1 hr</span>
        </div>
      </div>

    </div>
  );
};

export default SuggestedActions;
