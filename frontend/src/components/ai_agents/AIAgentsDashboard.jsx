import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { Activity, ShieldAlert, LineChart, Loader2, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AIAgentsDashboard() {
  const { user } = useAuth();
  const [activeAgent, setActiveAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAgentData = async (agentType) => {
    setActiveAgent(agentType);
    setLoading(true);
    setAgentData(null);
    setError(null);

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
        <p className="text-sm md:text-base leading-relaxed bg-[var(--bg-auth-secondary)] p-4 rounded-xl shadow-inner font-medium">
          {data.savings_plan}
        </p>
        <div className="w-full h-[320px] md:h-[380px] mt-4 bg-[var(--bg-auth-secondary)] p-2 rounded-xl shadow-sm border border-[var(--border-auth-primary)]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, bottom: 20, left: 10, right: 10 }}>
              <Pie
                data={data.investment_split}
                dataKey="percentage"
                nameKey="category"
                cx="50%"
                cy="45%"
                outerRadius={100}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.investment_split.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-[var(--border-auth-primary)] shadow-sm">
            <h4 className="font-bold mb-2 flex items-center text-brand-accent"><Activity className="mr-2 h-4 w-4" /> Emergency Fund</h4>
            <p className="text-sm">{data.emergency_fund}</p>
          </div>
          <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-[var(--border-auth-primary)] shadow-sm">
            <h4 className="font-bold mb-2 flex items-center text-brand-accent"><ShieldAlert className="mr-2 h-4 w-4" /> Retirement Planning</h4>
            <p className="text-sm">{data.retirement_planning}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderHealthRisk = (data) => {
    if (!data.health_risk_score) return null;
    
    // Normalize score for progress bar color
    const getRiskColor = (score) => {
        if (score < 40) return 'text-green-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
      <div className="space-y-6 text-[var(--text-auth-primary)]">
        <div className="bg-[var(--bg-auth-secondary)] p-6 rounded-xl border border-[var(--border-auth-primary)] shadow-sm text-center">
            <h3 className="text-xl font-bold mb-4">Estimated Health Risk Score</h3>
            <div className={`text-6xl font-black ${getRiskColor(data.health_risk_score)}`}>{data.health_risk_score}</div>
            <p className="text-sm text-[var(--text-auth-muted)] mt-2">Lower is better. Max 100.</p>
        </div>

        <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-[var(--border-auth-primary)] shadow-sm">
          <h4 className="font-bold mb-3 text-brand-accent">Recommended Healthy Habits</h4>
          <ul className="list-disc pl-5 space-y-2">
            {data.healthy_habits?.map((habit, i) => (
              <li key={i} className="text-sm font-medium">{habit}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-[var(--border-auth-primary)] shadow-sm">
          <h4 className="font-bold mb-2 text-brand-accent">Lifestyle Improvement</h4>
          <p className="text-sm leading-relaxed">{data.lifestyle_improvement}</p>
        </div>
      </div>
    );
  };

  const renderPolicyExplainer = (data) => {
    if (!data.benefits) return null;
    return (
      <div className="space-y-6 text-[var(--text-auth-primary)]">
        <p className="text-sm md:text-base leading-relaxed bg-[var(--bg-auth-secondary)] p-4 rounded-xl shadow-inner font-medium">
          {data.policy_explanation}
        </p>

        <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-green-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <h4 className="font-bold mb-3 flex items-center text-green-500"><ShieldAlert className="mr-2 h-4 w-4" /> Current Benefits</h4>
          <ul className="list-disc pl-5 space-y-2">
            {data.benefits?.map((b, i) => (
              <li key={i} className="text-sm">{b}</li>
            ))}
          </ul>
        </div>

        <div className="bg-[var(--bg-auth-secondary)] p-4 rounded-xl border border-red-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h4 className="font-bold mb-3 flex items-center text-red-500"><Activity className="mr-2 h-4 w-4" /> Identified Gaps</h4>
          <ul className="list-disc pl-5 space-y-2">
            {data.gaps?.map((g, i) => (
              <li key={i} className="text-sm">{g}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-brand-accent to-purple-600 bg-clip-text text-transparent mb-2">
          AI Persona Agents
        </h1>
        <p className="text-[var(--text-auth-muted)]">Select an AI agent tailored to analyze {user.first_name}'s profile data.</p>
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
