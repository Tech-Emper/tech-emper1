import React from 'react';
import { ArrowUpRight, Heart, Users } from 'lucide-react';
import './CoverageReport.css';

const FamilyAndAddons = () => {
  return (
    <div className="cr-section">
      <div className="cr-section-header">
        <div className="cr-section-title-wrapper">
          <span className="cr-section-num">3</span> FAMILY COVERAGE & ADD-ONS
        </div>
        <div className="cr-section-line"></div>
        <div className="cr-section-subline">5 members · 3 gaps identified</div>
      </div>

      {/* Family Coverage Map */}
      <div className="cr-family-header">
        <div className="cr-addon-header-left">
          <div className="cr-addon-icon-bg">👨‍👩‍👧‍👦</div>
          <div className="cr-addon-title-box">
            <h4>Family Coverage Map</h4>
            <p>Individual needs across all family members</p>
          </div>
        </div>
        <div>
          <ArrowUpRight size={16} color="var(--cr-text-muted)" />
        </div>
      </div>
      
      <div className="cr-family-table">
        <div className="cr-tabs">
          <div className="cr-tab active">Health</div>
          <div className="cr-tab">Life</div>
        </div>
        
        <div className="cr-table-header">
          <div>Member</div>
          <div>Current</div>
          <div>Recommended</div>
          <div>Status</div>
        </div>
        
        <div className="cr-table-row">
          <div className="cr-member-col">👨🏻 Rohan (Self)</div>
          <div className="cr-table-val">₹5L floater</div>
          <div className="cr-table-rec">₹10L</div>
          <div><span className="cr-status-badge cr-bg-red">GAP</span></div>
        </div>
        
        <div className="cr-table-row">
          <div className="cr-member-col">👩🏻 Priya (Spouse)</div>
          <div className="cr-table-val">₹5L floater</div>
          <div className="cr-table-rec">₹10L</div>
          <div><span className="cr-status-badge cr-bg-red">GAP</span></div>
        </div>
        
        <div className="cr-table-row">
          <div className="cr-member-col">👦🏻 Aryan (Son, 8)</div>
          <div className="cr-table-val">Floater included</div>
          <div className="cr-table-rec">₹5L</div>
          <div><span className="cr-status-badge cr-bg-yellow">REVIEW</span></div>
        </div>
        
        <div className="cr-table-row">
          <div className="cr-member-col">👧🏻 Meera (Daughter, 5)</div>
          <div className="cr-table-val">Floater included</div>
          <div className="cr-table-rec">₹5L</div>
          <div><span className="cr-status-badge cr-bg-yellow">REVIEW</span></div>
        </div>
        
        <div className="cr-table-row">
          <div className="cr-member-col">👴🏼 Parents (65+)</div>
          <div className="cr-table-val">None</div>
          <div className="cr-table-rec">₹10L senior</div>
          <div><span className="cr-status-badge cr-bg-red">CRITICAL</span></div>
        </div>
      </div>

      {/* Health Addons */}
      <div className="cr-addon-group">
        <div className="cr-addon-header">
          <div className="cr-addon-header-left">
            <div className="cr-addon-icon-bg"><span style={{fontSize: '18px'}}>🏥</span></div>
            <div className="cr-addon-title-box">
              <h4 style={{fontSize: '14px', fontWeight: '600'}}>Health Insurance Add-ons</h4>
              <p>6 riders that significantly improve your cover</p>
            </div>
          </div>
          <div>
            <ArrowUpRight size={16} color="var(--cr-text-muted)" />
          </div>
        </div>

        <div className="cr-addon-grid">
          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">⬆️</div>
              <div className="cr-addon-tag cr-tag-must">MUST HAVE</div>
            </div>
            <h5 className="cr-addon-name">Super Top-Up</h5>
            <p className="cr-addon-desc">Covers hospitalisation above ₹5L threshold. Best value upgrade.</p>
            <div className="cr-addon-peer">
              <Users size={12} className="cr-addon-peer-icon" /> 68% of your peers have a super top-up.
            </div>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">🦠</div>
              <div className="cr-addon-tag cr-tag-must">MUST HAVE</div>
            </div>
            <h5 className="cr-addon-name">Critical Illness Rider</h5>
            <p className="cr-addon-desc">Lump sum for cancer, heart attack, stroke — covers income loss.</p>
            <div className="cr-addon-peer">
              <Users size={12} className="cr-addon-peer-icon" /> 52% of Mid-Level IT peers carry standalone CI cover.
            </div>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">🏠</div>
              <div className="cr-addon-tag cr-tag-rec">RECOMMENDED</div>
            </div>
            <h5 className="cr-addon-name">OPD Coverage</h5>
            <p className="cr-addon-desc">Outpatient consults, diagnostics and pharmacy bills covered.</p>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">🤰</div>
              <div className="cr-addon-tag cr-tag-rec">RECOMMENDED</div>
            </div>
            <h5 className="cr-addon-name">Maternity Benefit</h5>
            <p className="cr-addon-desc">Delivery costs + newborn cover for 90 days post birth.</p>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">🧠</div>
              <div className="cr-addon-tag cr-tag-opt">OPTIONAL</div>
            </div>
            <h5 className="cr-addon-name">Mental Health Cover</h5>
            <p className="cr-addon-desc">Psychiatry, therapy and inpatient mental health treatment.</p>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">🌍</div>
              <div className="cr-addon-tag cr-tag-opt">OPTIONAL</div>
            </div>
            <h5 className="cr-addon-name">Global Emergency</h5>
            <p className="cr-addon-desc">International hospitalisation cover for work or leisure travel.</p>
          </div>
        </div>
      </div>

      {/* Life Addons */}
      <div className="cr-addon-group">
        <div className="cr-addon-header">
          <div className="cr-addon-header-left">
            <div className="cr-addon-icon-bg"><Heart size={18} color="var(--cr-accent-purple)" /></div>
            <div className="cr-addon-title-box">
              <h4 style={{fontSize: '14px', fontWeight: '600'}}>Life Insurance Add-ons</h4>
              <p>4 riders to strengthen your term plan</p>
            </div>
          </div>
          <div>
            <ArrowUpRight size={16} color="var(--cr-text-muted)" />
          </div>
        </div>

        <div className="cr-addon-grid">
          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">♿</div>
              <div className="cr-addon-tag cr-tag-must">MUST HAVE</div>
            </div>
            <h5 className="cr-addon-name">Accidental Disability</h5>
            <p className="cr-addon-desc">Additional payout for permanent disability from accidents.</p>
            <div className="cr-addon-peer">
              <Users size={12} className="cr-addon-peer-icon" /> 61% of IT professionals at your level have this rider.
            </div>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">🎗️</div>
              <div className="cr-addon-tag cr-tag-must">MUST HAVE</div>
            </div>
            <h5 className="cr-addon-name">Critical Illness</h5>
            <p className="cr-addon-desc">Lump sum on diagnosis, independent of health claim.</p>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">📋</div>
              <div className="cr-addon-tag cr-tag-rec">RECOMMENDED</div>
            </div>
            <h5 className="cr-addon-name">Waiver of Premium</h5>
            <p className="cr-addon-desc">Premiums waived if you become disabled or critically ill.</p>
          </div>

          <div className="cr-addon-card">
            <div className="cr-addon-card-header">
              <div className="cr-addon-icon-small">📈</div>
              <div className="cr-addon-tag cr-tag-rec">RECOMMENDED</div>
            </div>
            <h5 className="cr-addon-name">Increasing Cover</h5>
            <p className="cr-addon-desc">Sum assured grows annually to keep pace with inflation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyAndAddons;
