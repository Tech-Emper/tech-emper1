import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Plus, AlertTriangle, Phone, Download, RefreshCw } from 'lucide-react';

const Report = () => {
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    family: true,
    healthAddons: true,
    lifeAddons: true,
  });

  const [activeFamilyTab, setActiveFamilyTab] = useState('Health');
  const [activePolicyTab, setActivePolicyTab] = useState('Protection');
  const [animate, setAnimate] = useState(false);

  React.useEffect(() => {
    // Small timeout to ensure DOM is ready so transition triggers
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const cardHoverEffect = "transition-all duration-300 hover:-translate-y-1 hover:shadow-md";

  return (
    <div className="min-h-screen w-full bg-[#fcfaf8] text-gray-900 font-sans pb-0">

      {/* Header Section (Non-sticky for the main title as per screenshot) */}
      <div className="bg-[#fcfaf8] pt-8 md:pt-16 pb-4 px-6 relative z-30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="max-w-2xl">
            <p className="text-[10px] md:text-xs font-bold tracking-widest text-gray-500 mb-2 uppercase">Employee Insurance Analysis · 2026</p>
            <div className="flex flex-col mb-1">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Insurance Policy</h1>
              <h1 className="text-4xl md:text-5xl font-black text-emerald-500 italic">Coverage Report</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-3 max-w-lg leading-relaxed">
              A structured assessment of your current insurance policy coverage — what you hold, what you're missing, and how you compare to peers at your career stage.
            </p>
          </div>
          <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-0">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold border border-emerald-200">
              Generated: March 2026
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <svg viewBox="0 0 36 36" className="w-12 h-12 md:w-14 md:h-14">
                  <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={animate ? "60, 100" : "0, 100"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-emerald-500 leading-none">60</div>
                <div className="text-[9px] md:text-[11px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Coverage Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Line Navbar below Header */}
      <div className="sticky top-16 md:top-24 z-40 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500 h-1.5 w-full shadow-sm"></div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 space-y-16 pt-8">

        {/* Section 1: MY PROFILE */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              1 MY PROFILE
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs text-gray-500">Rohan Mehta · TechCorp · Mid-Level IT</div>
          </div>

          <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${cardHoverEffect}`}>
            <div
              className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection('profile')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                  👨
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Rohan Mehta, 35</h3>
                  <p className="text-sm text-gray-500">Senior Software Engineer · TechCorp India · Family of 4</p>
                </div>
              </div>
              {expandedSections.profile ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>

            {expandedSections.profile && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex flex-wrap gap-3">
                <div className="bg-gray-100/80 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span className="text-indigo-600">👤</span>
                  <span className="font-bold text-gray-800">Rohan Mehta</span> <span className="text-gray-500">Age 35</span>
                </div>
                <div className="bg-gray-100/80 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span className="text-orange-600">💼</span>
                  <span className="font-bold text-gray-800">TechCorp India</span> <span className="text-gray-500">Senior Software Engineer</span>
                </div>
                <div className="bg-gray-100/80 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span className="text-blue-600">🏢</span>
                  <span className="font-bold text-gray-800">IT / Software</span> <span className="text-gray-500">Mid-Level · 5 yrs</span>
                </div>
                <div className="bg-gray-100/80 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span className="text-emerald-600">👨‍👩‍👧‍👦</span>
                  <span className="font-bold text-gray-800">Family of 4</span> <span className="text-gray-500">Spouse + 2 Kids</span>
                </div>
                <div className="bg-gray-100/80 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <span className="text-orange-400">📍</span>
                  <span className="font-bold text-gray-800">Mumbai</span> <span className="text-gray-500">Maharashtra</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: PERSONAL COVERAGE */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              2 PERSONAL COVERAGE
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs text-gray-500">Score 60 / 100 · 2 critical gaps</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative ${cardHoverEffect}`}>
              <div className="relative w-26 h-26 mb-4">
                <svg viewBox="0 0 36 36" className="w-26 h-26">
                  <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={animate ? "60, 100" : "0, 100"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <div className="absolute top-[64px] flex flex-col items-center">
                <div className="text-3xl font-black text-emerald-500">60<span className="text-lg text-gray-400 font-sans">/100</span></div>
              </div>
              <h3 className="font-bold text-gray-900 mt-2 mb-2">Insurance Policy Coverage Score</h3>
              <p className="text-xs text-gray-500 mb-4 max-w-[250px]">
                Partial cover exists but critical gaps in health and life insurance expose your family to significant financial risk.
              </p>
              <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Action Required
              </div>
            </div>

            <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col justify-start ${cardHoverEffect}`}>
              <h3 className="font-bold text-gray-900 mb-6 text-sm">Score Breakdown</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Health Insurance</span>
                    <span className="text-gray-500">15 / 35</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: animate ? '42%' : '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Life Insurance</span>
                    <span className="text-gray-500">12 / 35</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full transition-all duration-1000 ease-out" style={{ width: animate ? '34%' : '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>Other Policies</span>
                    <span className="text-gray-500">18 / 30</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-1000 ease-out" style={{ width: animate ? '60%' : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 mb-4 text-gray-800">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h3 className="font-black text-xl">Your Insurance Policy Coverage</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${cardHoverEffect}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                    🏥
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Health Insurance</h4>
                    <p className="text-xs text-gray-500">Family Floater</p>
                  </div>
                </div>
                <div className="bg-orange-50 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">GAP</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">You Have</p>
                  <p className="text-xl font-bold text-emerald-500">₹5L</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">You Need</p>
                  <p className="text-xl font-bold text-blue-500">₹20L</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full mb-4 flex overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-l-full transition-all duration-1000 ease-out" style={{ width: animate ? '25%' : '0%' }}></div>
                <div className="bg-blue-300 h-full rounded-r-full opacity-50 transition-all duration-1000 ease-out" style={{ width: animate ? '75%' : '0%' }}></div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                ₹15L gap — one major hospitalisation can drain savings. Mumbai medical inflation ~15%/yr. Upgrade or add a super top-up.
              </p>
            </div>

            <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${cardHoverEffect}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                    💙
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Life Insurance</h4>
                    <p className="text-xs text-gray-500">Term Cover</p>
                  </div>
                </div>
                <div className="bg-orange-50 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Critical</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">You Have</p>
                  <p className="text-xl font-bold text-emerald-500">₹50L</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">You Need</p>
                  <p className="text-xl font-bold text-orange-500">₹2.4Cr</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full mb-4 flex overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-l-full transition-all duration-1000 ease-out" style={{ width: animate ? '20%' : '0%' }}></div>
                <div className="bg-orange-300 h-full rounded-r-full opacity-50 transition-all duration-1000 ease-out" style={{ width: animate ? '80%' : '0%' }}></div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                ₹1.9Cr gap — 10× income benchmark for families with dependants. ₹2Cr term at age 35 costs ~₹1,200/month.
              </p>
            </div>

            <div className={`border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 h-full ${cardHoverEffect}`}>
              <Plus className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-xs text-gray-500 mb-2 max-w-[150px]">
                Add another policy type to your map
              </p>
              <span className="text-sm font-bold text-emerald-600">+ Add Policy</span>
            </div>
          </div>
        </section>

        {/* Section 3: FAMILY COVERAGE & ADD-ONS */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              3 FAMILY COVERAGE & ADD-ONS
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs text-gray-500">5 members · 3 gaps identified</div>
          </div>

          <div className="space-y-4">
            {/* Family Map */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${cardHoverEffect}`}>
              <button onClick={() => toggleSection('family')} className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">👨‍👩‍👧‍👦</div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-gray-900">Family Coverage Map</h4>
                    <p className="text-xs text-gray-500">Individual needs across all family members</p>
                  </div>
                </div>
                {expandedSections.family ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSections.family && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  <div className="flex mb-6 bg-gray-100 w-max rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => setActiveFamilyTab('Health')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${activeFamilyTab === 'Health' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Health
                    </button>
                    <button
                      onClick={() => setActiveFamilyTab('Life')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${activeFamilyTab === 'Life' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Life
                    </button>
                  </div>
                  <div className="w-full">
                    <div className="grid grid-cols-4 text-xs text-gray-400 font-medium mb-3 pb-2 border-b border-gray-100">
                      <div>Member</div>
                      <div>Current</div>
                      <div>Recommended</div>
                      <div>Status</div>
                    </div>
                    <div className="space-y-4">
                      {activeFamilyTab === 'Health' ? [
                        { name: 'Rohan (Self)', current: '₹5L floater', rec: '₹10L', status: 'GAP', color: 'orange' },
                        { name: 'Priya (Spouse)', current: '₹5L floater', rec: '₹10L', status: 'GAP', color: 'orange' },
                        { name: 'Aryan (Son, 8)', current: 'Floater included', rec: '₹5L', status: 'REVIEW', color: 'orange' },
                        { name: 'Meera (Daughter, 5)', current: 'Floater included', rec: '₹5L', status: 'REVIEW', color: 'orange' },
                        { name: 'Parents (65+)', current: 'None', rec: '₹10L senior', status: 'CRITICAL', color: 'orange' },
                      ].map((m, i) => (
                        <div key={i} className="grid grid-cols-4 items-center text-sm">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px]">👤</span>
                            {m.name}
                          </div>
                          <div className="text-gray-500">{m.current}</div>
                          <div className="font-medium">{m.rec}</div>
                          <div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-${m.color}-50 text-${m.color}-600`}>{m.status}</span>
                          </div>
                        </div>
                      )) : [
                        { name: 'Rohan (Self)', current: '₹50L Term', rec: '₹2.4Cr', status: 'CRITICAL', color: 'orange' },
                        { name: 'Priya (Spouse)', current: 'None', rec: '₹1Cr Term', status: 'GAP', color: 'orange' },
                        { name: 'Aryan (Son, 8)', current: 'N/A', rec: 'Child Edu Plan', status: 'OPTIONAL', color: 'gray' },
                        { name: 'Meera (Daughter, 5)', current: 'N/A', rec: 'Child Edu Plan', status: 'OPTIONAL', color: 'gray' },
                      ].map((m, i) => (
                        <div key={i} className="grid grid-cols-4 items-center text-sm">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full ${m.color === 'gray' ? 'bg-gray-100' : 'bg-orange-50'} flex items-center justify-center text-[10px]`}>👤</span>
                            {m.name}
                          </div>
                          <div className="text-gray-500">{m.current}</div>
                          <div className="font-medium">{m.rec}</div>
                          <div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-${m.color}-50 text-${m.color}-600`}>{m.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Health Add-ons */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${cardHoverEffect}`}>
              <button onClick={() => toggleSection('healthAddons')} className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">🏥</div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-gray-900">Health Insurance Add-ons</h4>
                    <p className="text-xs text-gray-500">6 riders that significantly improve your cover</p>
                  </div>
                </div>
                {expandedSections.healthAddons ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSections.healthAddons && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-blue-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">⬆️</div><span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">MUST HAVE</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Super Top-Up</h5>
                      <p className="text-xs text-gray-500 mb-4">Covers hospitalisation above ₹5L threshold. Best value upgrade.</p>
                      <div className="bg-blue-50 text-blue-700 text-xs p-2 rounded flex gap-2">
                        <span className="mt-0.5">👥</span><span><strong>68%</strong> of your peers have a super top-up</span>
                      </div>
                    </div>
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-blue-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">🦠</div><span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">MUST HAVE</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Critical Illness Rider</h5>
                      <p className="text-xs text-gray-500 mb-4">Lump sum for cancer, heart attack, stroke — covers income loss.</p>
                      <div className="bg-blue-50 text-blue-700 text-xs p-2 rounded flex gap-2">
                        <span className="mt-0.5">👥</span><span><strong>52%</strong> of peers carry standalone CI.</span>
                      </div>
                    </div>
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">🏠</div><span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">RECOMMENDED</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">OPD Coverage</h5>
                      <p className="text-xs text-gray-500 mb-4">Outpatient consults, diagnostics and pharmacy bills covered.</p>
                    </div>
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">🤰</div><span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">RECOMMENDED</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Maternity Benefit</h5>
                      <p className="text-xs text-gray-500 mb-4">Delivery costs + newborn cover for 90 days post birth.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Life Add-ons */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${cardHoverEffect}`}>
              <button onClick={() => toggleSection('lifeAddons')} className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">💙</div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-gray-900">Life Insurance Add-ons</h4>
                    <p className="text-xs text-gray-500">4 riders to strengthen your term plan</p>
                  </div>
                </div>
                {expandedSections.lifeAddons ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expandedSections.lifeAddons && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-orange-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">♿</div><span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">MUST HAVE</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Accidental Disability</h5>
                      <p className="text-xs text-gray-500 mb-4">Payout for permanent disability from accidents.</p>
                      <div className="bg-orange-50 text-orange-700 text-xs p-2 rounded flex gap-2">
                        <span className="mt-0.5">👥</span><span><strong>68%</strong> of your peers have a super top-up</span>
                      </div>
                    </div>
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-orange-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">🎗️</div><span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest">MUST HAVE</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Critical Illness</h5>
                      <p className="text-xs text-gray-500 mb-4">Lump sum on diagnosis, independent of health claim.</p>
                    </div>
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">📋</div><span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">RECOMMENDED</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Waiver of Premium</h5>
                      <p className="text-xs text-gray-500 mb-4">Premiums waived if you become disabled or ill.</p>
                    </div>
                    <div className="bg-[#edeae4] rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-xl">📈</div><span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">RECOMMENDED</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">Increasing Cover</h5>
                      <p className="text-xs text-gray-500 mb-4">Sum assured grows annually to keep pace with inflation.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: INDUSTRY & PEER BENCHMARK */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              4 INDUSTRY & PEER BENCHMARK
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs text-gray-500">Mid-Level IT · Mumbai · ₹20-30L CTC</div>
          </div>

          <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-xl p-5 mb-6 flex gap-3 text-sm">
            <span className="text-xl">🏢</span>
            <p>Benchmarked against 2,400+ Mid-Level IT professionals in the ₹20-30L CTC bracket in Mumbai. Your score is 14 points below the peer average — closing your health and life gaps alone would push you above 74.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center ${cardHoverEffect}`}>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-24 h-24">
                  <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={animate ? "60, 100" : "0, 100"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute top-[28px] left-[32px] flex flex-col items-center">
                  <div className="text-3xl font-black text-emerald-500">60</div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Your Score</h3>
              <p className="text-xs text-gray-500 mt-1">Partial cover — critical gaps in core policies remain</p>
            </div>

            <div className={`bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm text-center ${cardHoverEffect}`}>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-24 h-24">
                  <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={animate ? "74, 100" : "0, 100"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute top-[28px] left-[32px] flex flex-col items-center">
                  <div className="text-3xl font-black text-blue-700">74</div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">Industry Avg · Mid-Level IT</h3>
              <p className="text-xs text-gray-500 mt-1">Top 25% in this bracket score 75+ with full coverage</p>
            </div>
          </div>

          <div className={`bg-white border border-blue-200 rounded-xl p-5 mb-6 ${cardHoverEffect}`}>
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-4 flex items-center gap-2">
              📊 Coverage Score Distribution · Mid-Level IT
            </h4>
            <div className="relative pt-6 pb-8 px-2">
              <div className="h-3 bg-stone-200 rounded-full w-full overflow-hidden flex relative">
                <div className="bg-emerald-500 h-full absolute z-10 rounded-l-full transition-all duration-1000 ease-out" style={{ width: animate ? '60%' : '0%' }}></div>
              </div>

              {/* Markers & Labels positioned precisely */}
              <div className="absolute top-8 left-[60%] -translate-x-1/2 flex flex-col items-center">
                <div className="text-[10px] font-bold text-emerald-600 mt-1">You</div>
              </div>

              <div className="absolute top-[16px] left-[74%] -translate-x-1/2 flex flex-col items-center h-14">
                <div className="h-[12px] border-l-2 border-blue-500 w-px relative top-[8px]"></div>
                <div className="text-[10px] text-blue-500 font-bold whitespace-nowrap mt-2">Avg 74</div>
              </div>

              <div className="absolute top-[16px] left-[85%] -translate-x-1/2 flex flex-col items-center h-14">
                <div className="h-[12px] border-l-2 border-blue-500 w-px relative top-[8px]"></div>
                <div className="text-[10px] text-blue-400 font-bold whitespace-nowrap mt-2">Top 75%</div>
              </div>
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> You · 60</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Peer Avg · 74</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Top 25% · 85</div>
            </div>
          </div>

          <div className={`bg-white border border-blue-200 rounded-xl p-6 ${cardHoverEffect}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-3 items-center">
                <div className="bg-blue-50 text-blue-500 p-2 rounded-lg">📈</div>
                <div>
                  <h3 className="font-bold text-gray-900">Policy Coverage Comparison</h3>
                  <p className="text-xs text-gray-500">You vs Peers Avg vs Top 25% in your CTC bracket</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-orange-500 font-bold">-14</div>
                <div className="text-[10px] text-gray-500 uppercase">vs peer avg</div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Health Cover Sum Assured', targetLabel: 'Lower is worse', you: '₹5L', avg: '₹12L', top: '₹20L', youW: '25%', avgW: '60%', topW: '100%', colorClass: 'bg-orange-500', textClass: 'text-orange-500' },
                { label: 'Life Cover (× Income Multiple)', targetLabel: 'Recommended: 10×', you: '2×', avg: '7×', top: '12×', youW: '16%', avgW: '58%', topW: '100%', colorClass: 'bg-orange-500', textClass: 'text-orange-500' },
                { label: 'Critical Illness Cover', targetLabel: 'Often neglected', you: 'None', avg: '₹25L', top: '₹50L', youW: '0%', avgW: '50%', topW: '100%', colorClass: 'bg-orange-500', textClass: 'text-orange-500' },
                { label: 'No. of Active Policies', targetLabel: 'Breadth of coverage', you: '2', avg: '4', top: '6', youW: '33%', avgW: '66%', topW: '100%', colorClass: 'bg-orange-500', textClass: 'text-orange-500' },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-900">{row.label}</span>
                    <span className="text-gray-400">{row.targetLabel}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-4 text-xs items-center mb-1">
                    <div className="col-span-2 md:col-span-1 text-gray-500">You</div>
                    <div className="col-span-8 md:col-span-9 h-1.5 bg-gray-100 rounded-full"><div className={`${row.colorClass} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: animate ? row.youW : '0%' }}></div></div>
                    <div className={`col-span-2 text-right font-bold ${row.textClass}`}>{row.you}</div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 text-xs items-center mb-1">
                    <div className="col-span-2 md:col-span-1 text-gray-500">Peers Avg</div>
                    <div className="col-span-8 md:col-span-9 h-1.5 bg-gray-100 rounded-full"><div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: animate ? row.avgW : '0%' }}></div></div>
                    <div className="col-span-2 text-right text-blue-500 font-medium">{row.avg}</div>
                  </div>
                  <div className="grid grid-cols-12 gap-4 text-xs items-center">
                    <div className="col-span-2 md:col-span-1 text-gray-500">Top 25%</div>
                    <div className="col-span-8 md:col-span-9 h-1.5 bg-gray-100 rounded-full"><div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: animate ? row.topW : '0%' }}></div></div>
                    <div className="col-span-2 text-right text-emerald-500 font-medium">{row.top}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2">
              <span>💡</span>
              <p>Mid-Level IT professionals in Mumbai typically spend ₹8,000–15,000/yr on insurance. You're at ~₹6,000/yr — a ₹500/month increase can close your two biggest gaps and lift your score above the peer average.</p>
            </div>
          </div>
        </section>

        {/* Section 5: OTHER KEY POLICIES */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              5 OTHER KEY POLICIES SUGGESTED FOR YOU
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs text-gray-500">Based on your profile & industry</div>
          </div>

          <div className="flex gap-4 mb-6 bg-gray-100 p-1 rounded-full w-max border border-gray-200">
            <button
              onClick={() => setActivePolicyTab('Protection')}
              className={`px-4 py-1.5 rounded-full text-xs flex gap-2 items-center font-bold transition-colors ${activePolicyTab === 'Protection' ? 'bg-gray-900 !text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Shield className="w-3 h-3" /> Protection
            </button>
            <button
              onClick={() => setActivePolicyTab('Assets')}
              className={`px-4 py-1.5 rounded-full text-xs flex gap-2 items-center font-bold transition-colors ${activePolicyTab === 'Assets' ? 'bg-gray-900 !text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              🏠 Assets
            </button>
            <button
              onClick={() => setActivePolicyTab('Future Planning')}
              className={`px-4 py-1.5 rounded-full text-xs flex gap-2 items-center font-bold transition-colors ${activePolicyTab === 'Future Planning' ? 'bg-gray-900 !text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              🎓 Future Planning
            </button>
          </div>

          <div className="space-y-4">
            {activePolicyTab === 'Protection' && (
              <>
                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverEffect}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-blue-50 flex items-center justify-center rounded-lg text-xl">✈️</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Travel Insurance</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Trip cancellation, medical abroad, baggage loss — essential for IT professionals who travel internationally.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right ml-14 md:ml-0 whitespace-nowrap min-w-[120px]">
                    <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">High Priority</div>
                    <div className="text-xs text-gray-400">~₹600-1,200/trip</div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverEffect}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-emerald-50 flex items-center justify-center rounded-lg text-xl">💼</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Income Protection</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Monthly payout if illness or injury prevents you from working — protects family cash flow.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right ml-14 md:ml-0 whitespace-nowrap min-w-[120px]">
                    <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">High Priority</div>
                    <div className="text-xs text-gray-400">~₹800-1,500/mo</div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverEffect}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-blue-50 flex items-center justify-center rounded-lg text-xl">⚖️</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Professional Liability</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Legal cover from professional services — increasingly relevant for senior IT roles and consultants.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right ml-14 md:ml-0 whitespace-nowrap min-w-[120px]">
                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">Recommended</div>
                    <div className="text-xs text-gray-400">~₹5,000-10,000/yr</div>
                  </div>
                </div>
              </>
            )}

            {activePolicyTab === 'Assets' && (
              <>
                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverEffect}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-blue-50 flex items-center justify-center rounded-lg text-xl">🚗</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Car / Motor Insurance</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Comprehensive cover beyond mandatory third-party — protects against theft, accident damage.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right ml-14 md:ml-0 whitespace-nowrap min-w-[120px]">
                    <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">High Priority</div>
                    <div className="text-xs text-gray-400">~₹8,000-15,000/yr</div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverEffect}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-emerald-50 flex items-center justify-center rounded-lg text-xl">🏠</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Home Insurance</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Structure and contents protection for your Mumbai flat — covers earthquake, flood, fire and theft.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right ml-14 md:ml-0 whitespace-nowrap min-w-[120px]">
                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">Recommended</div>
                    <div className="text-xs text-gray-400">~₹3,000-6,000/yr</div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverEffect}`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 min-w-[40px] bg-blue-50 flex items-center justify-center rounded-lg text-xl">🐾</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Pet Insurance</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Vet bills, surgery and illness cover — worth considering if you have pets in the household.</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right ml-14 md:ml-0 whitespace-nowrap min-w-[120px]">
                    <div className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">Consider</div>
                    <div className="text-xs text-gray-400">~₹500-1,500/mo</div>
                  </div>
                </div>
              </>
            )}

            {activePolicyTab === 'Future Planning' && (
              <>
                <div className={`bg-white rounded-xl p-5 border border-gray-100 flex items-center justify-center h-32 ${cardHoverEffect}`}>
                  <p className="text-gray-500 font-medium">Future planning recommendations are currently being calculated.</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Section 6: SUGGESTED ACTIONS */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              6 SUGGESTED ACTIONS
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs text-gray-500">4 actions · Est. ₹2,250/month total</div>
          </div>

          <div className="space-y-4">
            {[
              { num: 1, title: 'Upgrade Health Cover to ₹20L via Super Top-Up', desc: 'A ₹15L super top-up on your existing ₹5L base plan costs ~₹4,000/yr for the family. One hospitalisation can wipe out 2 years of savings.', status: 'DO NOW', color: 'orange', price: '~₹350/mo · 30 min' },
              { num: 2, title: 'Increase Life Term Cover to ₹2.4Cr', desc: 'At age 35, premiums are still very affordable — ~₹1,200/month for ₹2Cr cover. Lock in before any health changes increase loading.', status: 'DO NOW', color: 'orange', price: '~₹1,200/mo · 45 min' },
              { num: 3, title: 'Buy Term Cover for Priya (₹1Cr)', desc: 'Dual-income families need dual coverage. Priya\'s ₹1Cr term at ~₹700/month ensures the family is protected even if her income is lost.', status: 'THIS QUARTER', color: 'blue', price: '~₹700/mo · 1 hr' },
              { num: 4, title: 'Senior Health Policy for Parents (₹10L)', desc: 'Medical costs spike sharply post-65. A dedicated senior citizen policy keeps your savings ring-fenced from parent hospitalisation costs.', status: 'PLAN AHEAD', color: 'emerald', price: '~₹2,500/mo · 1 hr' },
            ].map(act => (
              <div key={act.num} className={`bg-white rounded-xl p-5 border border-gray-100 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row ${cardHoverEffect}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full bg-${act.color}-50 text-${act.color}-600 font-bold flex flex-shrink-0 items-center justify-center text-sm mt-1 sm:mt-0`}>
                    {act.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{act.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{act.desc}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pl-12 sm:pl-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className={`bg-${act.color}-50 text-${act.color}-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block`}>{act.status}</div>
                  <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{act.price}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: MARKETING CTA */}
        <section className="pb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-900 text-white rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              7 MARKETING BANNER & CTA
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className={`bg-gray-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden ${cardHoverEffect}`}>
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
            <div className="absolute bottom-0 right-32 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:items-center">
              <div className="max-w-xl">
                <p className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-3 text-opacity-80">READY TO ACT?</p>
                <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight">Close Your Insurance Policy <span className="text-emerald-400 italic">Coverage Gaps</span> Today</h3>
                <p className="text-gray-300 text-sm mb-8 leading-relaxed max-w-md">
                  Talk to a licensed advisor, compare plans from 30+ insurers, or download your full personalised coverage report — no paperwork required to get started.
                </p>

                <div className="grid grid-cols-3 gap-6 border-t border-gray-700 pt-6">
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">₹2,250</p>
                    <p className="text-xs text-gray-400 mt-1">Est. Monthly Cost</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-blue-400">30 min</p>
                    <p className="text-xs text-gray-400 mt-1">Time to buy</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">78</p>
                    <p className="text-xs text-gray-400 mt-1">New Score Potential</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 min-w-[240px]">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 !text-white">
                  <Phone className="w-4 h-4 text-white" /> Speak to an Advisor
                </button>
                <button className="bg-transparent hover:bg-white/5 border border-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 !text-white">
                  <Download className="w-4 h-4 text-white" /> Download Full Report
                </button>
                <button className="bg-transparent hover:bg-white/5 border border-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 !text-white">
                  <RefreshCw className="w-4 h-4 text-white" /> Re-run Analysis
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Report;
