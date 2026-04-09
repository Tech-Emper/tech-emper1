import React from 'react';
import { Lightbulb, Building2 } from 'lucide-react';
import './CoverageReport.css';

const BenchmarkSection = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">4</span> INDUSTRY & PEER BENCHMARK
        </div>
        <div className="cr-section-line"></div>
        <div className="cr-section-subline">Mid-Level IT · Mumbai · ₹20-30L CTC</div>
      </div>

      <div className="cr-benchmark-container">
        <div className="cr-benchmark-notice">
          <Building2 size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}} />
          Benchmarked against 2,400+ Mid-Level IT professionals in the ₹20-30L CTC bracket in Mumbai. Your score is 14 points below the peer average — closing your health and life gaps alone would push you above 74.
        </div>

        <div className="cr-benchmark-charts">
          <div className="cr-chart-card">
            <div className="cr-score-ring-lg">
              <svg viewBox="0 0 100 100" className="cr-svg-ring" style={{width: '100%', height: '100%'}}>
                <circle cx="50" cy="50" r="45" className="cr-ring-bg"></circle>
                <circle cx="50" cy="50" r="45" className="cr-ring-fill cr-ring-orange" strokeDasharray="283" strokeDashoffset="113.2"></circle>
              </svg>
              <div className="cr-ring-center">
                <div className="cr-ring-score cr-score-orange">60<span className="cr-ring-max">/ 100</span></div>
              </div>
            </div>
            <h4 className="cr-chart-title">Your Score</h4>
            <p className="cr-chart-sub">Partial cover — critical gaps in core policies remain</p>
          </div>

          <div className="cr-chart-card" style={{border: '1px solid var(--cr-accent-purple)'}}>
            <div className="cr-score-ring-lg">
              <svg viewBox="0 0 100 100" className="cr-svg-ring" style={{width: '100%', height: '100%'}}>
                <circle cx="50" cy="50" r="45" className="cr-ring-bg"></circle>
                <circle cx="50" cy="50" r="45" className="cr-ring-fill cr-ring-purple" strokeDasharray="283" strokeDashoffset="75"></circle>
              </svg>
              <div className="cr-ring-center">
                <div className="cr-ring-score cr-score-purple">74<span className="cr-ring-max">/ 100</span></div>
              </div>
            </div>
            <h4 className="cr-chart-title">Industry Avg · Mid-Level IT</h4>
            <p className="cr-chart-sub">Top 25% in this bracket score 85+ with full coverage</p>
          </div>
        </div>

        <div className="cr-dist-card">
          <div className="cr-dist-header">
            <span>📊 Coverage Score Distribution · Mid-Level IT</span>
          </div>

          <div className="cr-dist-bar-container">
            <div className="cr-dist-bar-bg">
              <div className="cr-dist-bar-fill" style={{width: '60%'}}></div>
            </div>
            <div className="cr-dist-markers">
              <div className="cr-dist-marker" style={{left: '74%'}}>
                <div className="cr-dist-tick"></div>
                <div className="cr-dist-label">Avg 74</div>
              </div>
              <div className="cr-dist-marker" style={{left: '85%'}}>
                <div className="cr-dist-tick"></div>
                <div className="cr-dist-label">Top 85</div>
              </div>
            </div>
          </div>

          <div className="cr-dist-legend">
            <div className="cr-legend-item">
              <div className="cr-dot cr-dot-orange"></div> You · 60
            </div>
            <div className="cr-legend-item">
              <div className="cr-dot cr-dot-purple"></div> Peer Avg · 74
            </div>
            <div className="cr-legend-item">
              <div className="cr-dot cr-dot-light-purple"></div> Top 25% · 85
            </div>
          </div>
        </div>

        <div className="cr-comparison-box mt-4" style={{marginTop: '24px'}}>
          <div className="cr-comp-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span>📈 Policy Coverage Comparison</span>
              <span style={{fontSize: '10px', color: 'var(--cr-text-muted)', fontWeight: 'normal'}}>You vs Peers Avg vs Top 25% in your CTC bracket</span>
            </div>
            <div style={{color: 'var(--cr-accent-red)', fontSize: '18px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
              -14
              <span style={{fontSize: '9px', fontWeight: 'normal', color: 'var(--cr-text-muted)'}}>vs peer avg</span>
            </div>
          </div>

          <div className="cr-comp-row">
            <div className="cr-comp-header">
              <span>Health Cover Sum Assured</span>
              <span className="cr-comp-right">Lower is worse</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">You</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill cr-val-red" style={{width: '25%', backgroundColor: 'var(--cr-accent-red)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-red">₹5L</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">Peers Avg</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill" style={{width: '60%', backgroundColor: 'var(--cr-accent-purple)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-purple">₹12L</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">Top 25%</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill" style={{width: '100%', backgroundColor: 'var(--cr-accent-green)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-green">₹20L</span>
            </div>
          </div>

          <div className="cr-comp-row">
            <div className="cr-comp-header">
              <span>Life Cover (× Income Multiple)</span>
              <span className="cr-comp-right">Recommended: 10×</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">You</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill cr-val-red" style={{width: '20%', backgroundColor: 'var(--cr-accent-red)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-red">2×</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">Peers Avg</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill" style={{width: '70%', backgroundColor: 'var(--cr-accent-purple)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-purple">7×</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">Top 25%</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill" style={{width: '100%', backgroundColor: 'var(--cr-accent-green)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-green">12×</span>
            </div>
          </div>

          <div className="cr-comp-row">
            <div className="cr-comp-header">
              <span>Critical Illness Cover</span>
              <span className="cr-comp-right">Often neglected</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">You</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill cr-val-red" style={{width: '5%', backgroundColor: 'var(--cr-accent-red)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-red">None</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">Peers Avg</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill" style={{width: '50%', backgroundColor: 'var(--cr-accent-purple)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-purple">₹25L</span>
            </div>
            <div className="cr-bar-row">
              <span className="cr-bar-label">Top 25%</span>
              <div className="cr-bar-track-wrap">
                <div className="cr-policy-bar-fill" style={{width: '100%', backgroundColor: 'var(--cr-accent-green)', height: '6px'}}></div>
              </div>
              <span className="cr-bar-val cr-val-green">₹50L</span>
            </div>
          </div>
          
          <div className="cr-tip-box">
            <Lightbulb size={16} /> 
            <span>Mid-Level IT professionals in Mumbai typically spend ₹8,000–15,000/yr on insurance. You're at ~₹6,000/yr — a ₹500/month increase can close your two biggest gaps and lift your score above the peer average.</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BenchmarkSection;
