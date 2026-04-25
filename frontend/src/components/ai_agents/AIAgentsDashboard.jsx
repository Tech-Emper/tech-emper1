import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { Activity, ShieldAlert, LineChart, Loader2, ArrowLeft, TrendingUp, PiggyBank, Target, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AIAgentsDashboard() {
  const { user, profile } = useAuth();
  const [activeAgent, setActiveAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAgentData = async (agentType) => {
    setActiveAgent(agentType);
    setLoading(true);
    setAgentData(null);
    setError(null);

    const storageKey = `ai_agent_data_${user?.email}_${agentType}`;
    const cachedData = localStorage.getItem(storageKey);
    
    if (cachedData) {
      try {
        setAgentData(JSON.parse(cachedData));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    }

    let endpoint = '';
    if (agentType === 'financial') endpoint = '/api/ai-agents/financial-planning';
    else if (agentType === 'health') endpoint = '/api/ai-agents/health-risk';
    else if (agentType === 'policy') endpoint = '/api/ai-agents/policy-explainer';

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch insights from AI agent.');
      }

      localStorage.setItem(storageKey, JSON.stringify(data));
      setAgentData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch insights from AI agent.');
    } finally {
      setLoading(false);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderFinancialPlan = (data) => {
    if (!data.investment_split) return null;
    return (
      <div className="space-y-6 text-[var(--text-auth-primary)]">
        
        <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-6 rounded-xl border border-indigo-500/20 shadow-sm flex flex-col md:flex-row gap-4 items-start">
            <div className="bg-indigo-500/20 p-3 rounded-full shrink-0">
                <Target className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
                <h4 className="font-bold text-indigo-500 mb-2">Overall Savings Strategy</h4>
                <p className="text-sm md:text-base leading-relaxed font-medium">
                {data.savings_plan}
                </p>
            </div>
        </div>

        <div className="w-full h-[320px] md:h-[380px] bg-[var(--bg-auth-secondary)] p-4 rounded-xl shadow-sm border border-[var(--border-auth-primary)] flex flex-col">
            <h4 className="font-bold text-center text-[var(--text-auth-muted)] mb-2 uppercase tracking-wide text-xs">Recommended Investment Split</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, bottom: 20, left: 10, right: 10 }}>
              <Pie
                data={data.investment_split}
                dataKey="percentage"
                nameKey="category"
                cx="50%"
                cy="45%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.investment_split.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-auth-primary)', borderColor: 'var(--border-auth-primary)', borderRadius: '8px', color: 'var(--text-auth-primary)' }} itemStyle={{ color: 'var(--text-auth-primary)' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "20px", fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-auth-primary)] p-5 rounded-xl border-l-4 border-l-[#f59e0b] shadow-sm flex items-start gap-3 border-y border-r border-[var(--border-auth-primary)]">
            <PiggyBank className="h-6 w-6 text-[#f59e0b] shrink-0 mt-1" />
            <div>
                <h4 className="font-bold mb-1 text-[var(--text-auth-primary)]">Emergency Fund</h4>
                <p className="text-sm text-[var(--text-auth-muted)]">{data.emergency_fund}</p>
            </div>
          </div>
          <div className="bg-[var(--bg-auth-primary)] p-5 rounded-xl border-l-4 border-l-[#10b981] shadow-sm flex items-start gap-3 border-y border-r border-[var(--border-auth-primary)]">
            <TrendingUp className="h-6 w-6 text-[#10b981] shrink-0 mt-1" />
            <div>
                <h4 className="font-bold mb-1 text-[var(--text-auth-primary)]">Retirement Planning</h4>
                <p className="text-sm text-[var(--text-auth-muted)]">{data.retirement_planning}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthRisk = (data) => {
    if (!data.health_risk_score) return null;

    const getRiskColor = (score) => {
      if (score < 40) return '#10b981';
      if (score < 70) return '#f59e0b';
      return '#ef4444';
    };

    const getRiskTextColor = (score) => {
      if (score < 40) return 'text-green-500';
      if (score < 70) return 'text-yellow-500';
      return 'text-red-500';
    };

    const chartData = [
      { name: 'Your Score', score: data.health_risk_score, fill: getRiskColor(data.health_risk_score) },
      { name: 'Avg. Adult', score: 35, fill: '#6366f1' },
      { name: 'High Risk', score: 75, fill: '#ef4444' }
    ];

    return (
      <div className="space-y-6 text-[var(--text-auth-primary)]">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-[var(--bg-auth-secondary)] p-6 rounded-xl border border-[var(--border-auth-primary)] shadow-sm text-center flex-1 flex flex-col justify-center items-center">
              <h3 className="text-xl font-bold mb-4">Your Risk Score</h3>
              <div className={`text-6xl font-black ${getRiskTextColor(data.health_risk_score)}`}>{data.health_risk_score}</div>
              <p className="text-sm text-[var(--text-auth-muted)] mt-2">Scale: 0 to 100.</p>
            </div>
            
            <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-[var(--border-auth-primary)] shadow-sm flex-1 h-[250px]">
              <h4 className="font-bold mb-2 text-center text-sm text-[var(--text-auth-muted)]">Benchmark Comparison</h4>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-auth-primary)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-auth-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-auth-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--bg-auth-primary)', borderColor: 'var(--border-auth-primary)', borderRadius: '8px' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-[var(--bg-auth-secondary)] p-5 rounded-xl border border-[var(--border-auth-primary)] shadow-sm">
          <h4 className="font-bold mb-4 flex items-center text-brand-accent"><Activity className="mr-2 h-5 w-5" /> Recommended Habits</h4>
          <div className="flex flex-wrap gap-3">
            {data.healthy_habits?.map((habit, i) => (
              <span key={i} className="px-4 py-2 bg-green-500/10 text-green-500 text-sm font-semibold rounded-full border border-green-500/20 shadow-sm flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {habit}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-5 rounded-xl border border-blue-500/20 shadow-sm">
          <h4 className="font-bold mb-2 text-blue-500 flex items-center"><LineChart className="mr-2 h-5 w-5" /> Improvement Scope</h4>
          <p className="text-sm leading-relaxed text-[var(--text-auth-primary)] font-medium">{data.lifestyle_improvement}</p>
        </div>
      </div>
    );
  };

  const renderPolicyExplainer = (data) => {
    if (!data.benefits) return null;
    return (
      <div className="space-y-6 text-[var(--text-auth-primary)]">
        <div className="bg-[var(--bg-auth-secondary)] p-5 rounded-xl border border-[var(--border-auth-primary)] shadow-sm flex flex-col items-center text-center">
            <h4 className="text-lg font-bold mb-3 text-purple-500 flex items-center justify-center w-full"><ShieldAlert className="mr-2 h-5 w-5" /> Portfolio Summary</h4>
            <p className="text-sm md:text-base leading-relaxed font-medium">
            {data.policy_explanation}
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-500/5 p-5 rounded-xl border border-green-500/20 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <h4 className="font-bold mb-4 flex items-center text-green-500 border-b border-green-500/20 pb-2">
                <Activity className="mr-2 h-5 w-5" /> Current Benefits
            </h4>
            <div className="flex flex-col gap-3 flex-grow">
                {data.benefits?.map((b, i) => (
                <div key={i} className="flex items-start bg-[var(--bg-auth-primary)] p-3 rounded-lg border border-[var(--border-auth-primary)] shadow-sm">
                    <div className="min-w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✓</div>
                    <span className="text-sm">{b}</span>
                </div>
                ))}
            </div>
            </div>

            <div className="bg-red-500/5 p-5 rounded-xl border border-red-500/20 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h4 className="font-bold mb-4 flex items-center text-red-500 border-b border-red-500/20 pb-2">
                <ShieldAlert className="mr-2 h-5 w-5" /> Identified Gaps
            </h4>
            <div className="flex flex-col gap-3 flex-grow">
                {data.gaps?.map((g, i) => (
                <div key={i} className="flex items-start bg-[var(--bg-auth-primary)] p-3 rounded-lg border border-[var(--border-auth-primary)] shadow-sm">
                    <div className="min-w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">!</div>
                    <span className="text-sm">{g}</span>
                </div>
                ))}
            </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-brand-accent via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
          Intelligent Advisory Hub
        </h1>
        <p className="text-[var(--text-auth-muted)] max-w-2xl mx-auto text-base md:text-lg mb-6">
          Leverage our advanced AI models tailored specifically to {profile?.first_name || 'your'} profile. Gain personalized insights into your financial future, health risks, and insurance coverage gaps instantly.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeAgent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Agent 1 */}
            <button
              onClick={() => fetchAgentData('financial')}
              className="flex flex-col items-center p-8 bg-[var(--bg-auth-primary)] rounded-3xl border border-[var(--border-auth-primary)] shadow-lg hover:shadow-brand-accent/20 hover:border-brand-accent transition-all duration-300 group"
            >
              <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LineChart className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-auth-primary)] mb-2">Financial Planner</h3>
              <p className="text-sm text-[var(--text-auth-muted)] text-center">Get investment splits & savings strategies.</p>
            </button>

            {/* Agent 2 */}
            <button
              onClick={() => fetchAgentData('health')}
              className="flex flex-col items-center p-8 bg-[var(--bg-auth-primary)] rounded-3xl border border-[var(--border-auth-primary)] shadow-lg hover:shadow-green-500/20 hover:border-green-500 transition-all duration-300 group"
            >
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-auth-primary)] mb-2">Health Risk Agent</h3>
              <p className="text-sm text-[var(--text-auth-muted)] text-center">Discover health risk score & wellness tips.</p>
            </button>

            {/* Agent 3 */}
            <button
              onClick={() => fetchAgentData('policy')}
              className="flex flex-col items-center p-8 bg-[var(--bg-auth-primary)] rounded-3xl border border-[var(--border-auth-primary)] shadow-lg hover:shadow-purple-500/20 hover:border-purple-500 transition-all duration-300 group"
            >
              <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-auth-primary)] mb-2">Policy Explainer</h3>
              <p className="text-sm text-[var(--text-auth-muted)] text-center">Understand your current policies & gaps.</p>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-auth-primary)] border border-[var(--border-auth-primary)] rounded-3xl p-6 md:p-10 shadow-xl relative"
          >
            <button
              onClick={() => { setActiveAgent(null); setAgentData(null); }}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-[var(--bg-auth-secondary)] transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="h-6 w-6 text-[var(--text-auth-muted)]" />
            </button>
            <h2 className="text-2xl mt-4 md:mt-0 font-bold text-center text-[var(--text-auth-primary)] mb-8">
              {activeAgent === 'financial' && "Your Financial Plan"}
              {activeAgent === 'health' && "Health Risk Assessment"}
              {activeAgent === 'policy' && "Existing Policy Breakdown"}
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-10 w-10 text-brand-accent animate-spin mb-4" />
                <p className="text-[var(--text-auth-muted)] animate-pulse">Our AI is analyzing your profile...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center">
                {error}
              </div>
            ) : agentData ? (
              <div>
                {activeAgent === 'financial' && renderFinancialPlan(agentData)}
                {activeAgent === 'health' && renderHealthRisk(agentData)}
                {activeAgent === 'policy' && renderPolicyExplainer(agentData)}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
