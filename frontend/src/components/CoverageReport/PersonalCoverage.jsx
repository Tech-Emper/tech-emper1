import React from 'react';
import { AlertTriangle, Heart, Shield, Plus } from 'lucide-react';
import './CoverageReport.css';

const PersonalCoverage = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">2</span> PERSONAL COVERAGE
        </div>
        <div className="cr-section-line"></div>
        <div className="cr-section-subline">Score 60 / 100 · 2 critical gaps</div>
      </div>

      <div className="cr-row">
        {/* Main Score Card */}
        <div className="cr-col cr-card">
          <div className="cr-score-container">
            <div className="cr-big-circle">
              <div className="cr-ring-center">
                <div className="cr-score-value">60</div>
              </div>
            </div>
            <div className="cr-score-title">Insurance Policy Coverage Score</div>
            <p className="cr-score-desc">
              Partial cover exists but critical gaps in health and life insurance expose your family to significant financial risk.
            </p>
            <button className="cr-btn-warning">
              <AlertTriangle size={12} /> Action Required
            </button>
          </div>
        </div>

        {/* Score Breakdown Card */}
        <div className="cr-col cr-card">
          <h4 className="cr-breakdown-title">Score Breakdown</h4>
          
          <div className="cr-breakdown-item">
            <div className="cr-breakdown-header">
              <span>Health Insurance</span>
              <span className="cr-breakdown-value">15 / 35</span>
            </div>
            <div className="cr-progress-bg">
              <div className="cr-progress-fill cr-progress-health"></div>
            </div>
          </div>

          <div className="cr-breakdown-item">
            <div className="cr-breakdown-header">
              <span>Life Insurance</span>
              <span className="cr-breakdown-value">12 / 35</span>
            </div>
            <div className="cr-progress-bg">
              <div className="cr-progress-fill cr-progress-life"></div>
            </div>
          </div>

          <div className="cr-breakdown-item">
            <div className="cr-breakdown-header">
              <span>Other Policies</span>
              <span className="cr-breakdown-value">18 / 30</span>
            </div>
            <div className="cr-progress-bg">
              <div className="cr-progress-fill cr-progress-other"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="cr-section-subtitle">
        <Shield size={18} color="var(--cr-accent-orange)" /> Your Insurance Policy Coverage
      </div>

      <div className="cr-cards-grid">
        {/* Health Insurance Card */}
        <div className="cr-policy-card">
          <div className="cr-policy-header">
            <div className="cr-policy-icon-wrapper">
              <div className="cr-policy-icon">🏥</div>
              <div>
                <h4 className="cr-policy-title">Health Insurance</h4>
                <p className="cr-policy-subtitle">Family Floater</p>
              </div>
            </div>
            <div className="cr-status-badge cr-bg-red">GAP</div>
          </div>
          
          <div className="cr-amount-row">
            <div className="cr-amount-col">
              <p>YOU HAVE</p>
              <div className="cr-amount-val cr-val-have">₹5L</div>
            </div>
            <div className="cr-amount-col">
              <p>YOU NEED</p>
              <div className="cr-amount-val cr-val-need">₹20L</div>
            </div>
          </div>
          
          <div className="cr-policy-bar-bg">
            <div className="cr-policy-bar-fill" style={{width: '25%'}}></div>
          </div>
          
          <p className="cr-policy-desc">
            ₹15L gap — one major hospitalisation can drain savings. Mumbai medical inflation ~15%/yr. Upgrade or add a super top-up.
          </p>
        </div>

        {/* Life Insurance Card */}
        <div className="cr-policy-card">
          <div className="cr-policy-header">
            <div className="cr-policy-icon-wrapper">
              <div className="cr-policy-icon"><Heart size={16} color="var(--cr-accent-purple)" /></div>
              <div>
                <h4 className="cr-policy-title">Life Insurance</h4>
                <p className="cr-policy-subtitle">Term Cover</p>
              </div>
            </div>
            <div className="cr-status-badge cr-bg-red">CRITICAL</div>
          </div>
          
          <div className="cr-amount-row">
            <div className="cr-amount-col">
              <p>YOU HAVE</p>
              <div className="cr-amount-val cr-val-red">₹50L</div>
            </div>
            <div className="cr-amount-col">
              <p>YOU NEED</p>
              <div className="cr-amount-val cr-val-need">₹2.4Cr</div>
            </div>
          </div>
          
          <div className="cr-policy-bar-bg">
            <div className="cr-policy-bar-fill" style={{width: '20%'}}></div>
          </div>
          
          <p className="cr-policy-desc">
            ₹1.9Cr gap — 10× income benchmark for families with dependents. ₹2Cr term at age 35 costs ~₹1,200/month.
          </p>
        </div>

        {/* Add Policy Card */}
        <div className="cr-policy-card cr-policy-add">
          <Plus size={24} style={{marginBottom: '12px', color: 'var(--cr-text-light)'}} />
          <p style={{fontSize: '11px', margin: '0 0 12px 0', maxWidth: '140px'}}>Add another insurance policy type to your coverage map</p>
          <span style={{fontSize: '12px', color: '#4A6BE5', fontWeight: '500'}}>+ Add Policy</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalCoverage;
