import React from 'react';
import { Palette, Type, MousePointerClick, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const DesignDetails = () => {
  const colorCategories = [
    {
      title: "Brand & Core Colors",
      colors: [
        { name: "Brand Primary (Blue)", var: "--btn-primary-bg", defaultHex: "#3B82F6" },
        { name: "Primary Hover", var: "--btn-primary-hover", defaultHex: "#2563EB" },
        { name: "Brand Accent (Green)", var: "--color-brand-accent", defaultHex: "#10B981" },
        { name: "Success", var: "--text-success", defaultHex: "#34d399 / #059669" },
      ]
    },
    {
      title: "Dark Theme (Default) Backgrounds",
      colors: [
        { name: "Main Background", var: "--bg-auth-main", defaultHex: "#0B0F19" },
        { name: "Surface (5% White)", var: "--bg-auth-surface", defaultHex: "rgba(255,255,255,0.05)" },
        { name: "Card (8% White)", var: "--bg-auth-card", defaultHex: "rgba(255,255,255,0.08)" },
        { name: "Input Default", var: "--bg-auth-input", defaultHex: "rgba(255,255,255,0.05)" },
        { name: "Card Border", var: "--border-auth-card", defaultHex: "rgba(255,255,255,0.1)" },
      ]
    },
    {
      title: "Typography Colors",
      colors: [
        { name: "Primary Text", var: "--text-auth-primary", defaultHex: "#e2e8f0 / #0F172A" },
        { name: "Label Text", var: "--text-auth-label", defaultHex: "#e2e8f0 / #1E293B" },
        { name: "Muted Text", var: "--text-auth-muted", defaultHex: "#94a3b8 / #475569" },
        { name: "Placeholder Text", var: "--text-auth-placeholder", defaultHex: "#64748b / #94A3B8" },
        { name: "Button Text", var: "--btn-primary-text", defaultHex: "#FFFFFF" },
      ]
    }
  ];

  const ColorCard = ({ color }) => (
    <motion.div 
      whileHover={{ y: -4 }}
      className="flex flex-col rounded-xl overflow-hidden shadow-lg border border-opacity-20"
      style={{ borderColor: 'var(--border-auth-card)' }}
    >
      <div 
        className="h-24 w-full" 
        style={{ backgroundColor: `var(${color.var})` }}
      >
        {/* Transparency pattern for semi-transparent colors */}
        {color.defaultHex.includes('rgba') && (
          <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
        )}
      </div>
      <div className="p-4" style={{ backgroundColor: 'var(--bg-auth-card)' }}>
        <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-auth-primary)' }}>{color.name}</p>
        <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-auth-muted)' }}>{color.var}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-auth-surface)', color: 'var(--text-auth-primary)' }}>
            {color.defaultHex}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>
          Design <span className="text-brand-accent">System</span>
        </h1>
        <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{ color: 'var(--text-auth-muted)' }}>
          This page documents the typography, color palette, and component design logic used across the Emper.ai platform.
        </p>
      </div>

      {/* Colors Section */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b pb-4" style={{ borderColor: 'var(--border-auth-card)' }}>
          <Palette className="w-8 h-8 text-brand-primary" />
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-auth-primary)' }}>Color Palette</h2>
        </div>
        
        {colorCategories.map((category, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-auth-label)' }}>{category.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.colors.map((color, cIdx) => (
                <ColorCard key={cIdx} color={color} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Typography Section */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b pb-4" style={{ borderColor: 'var(--border-auth-card)' }}>
          <Type className="w-8 h-8 text-brand-accent" />
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-auth-primary)' }}>Typography</h2>
        </div>
        
        <div className="rounded-xl p-8 shadow-lg space-y-6 border" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-auth-card)' }}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-auth-muted)' }}>Font Family</p>
              <p className="text-2xl mt-1" style={{ color: 'var(--text-auth-primary)', fontFamily: '"Outfit", sans-serif' }}>Outfit, sans-serif</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm" style={{ color: 'var(--text-auth-muted)' }}>Used for all platform text</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-sm font-mono" style={{ color: 'var(--text-auth-muted)' }}>Heading 1 / 4xl-5xl / Black</div>
              <div className="md:col-span-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>The quick brown fox</h1>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-sm font-mono" style={{ color: 'var(--text-auth-muted)' }}>Heading 2 / 3xl / Bold</div>
              <div className="md:col-span-3">
                <h2 className="text-3xl font-bold" style={{ color: 'var(--text-auth-primary)' }}>The quick brown fox</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-sm font-mono" style={{ color: 'var(--text-auth-muted)' }}>Heading 3 / xl-2xl / Semibold</div>
              <div className="md:col-span-3">
                <h3 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-auth-primary)' }}>The quick brown fox jumps over the lazy dog</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-sm font-mono" style={{ color: 'var(--text-auth-muted)' }}>Body / base / Normal</div>
              <div className="md:col-span-3">
                <p className="text-base" style={{ color: 'var(--text-auth-primary)' }}>The quick brown fox jumps over the lazy dog. This is a standard paragraph that demonstrates the readability of the body font at normal weights.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="text-sm font-mono" style={{ color: 'var(--text-auth-muted)' }}>Small / sm / Medium</div>
              <div className="md:col-span-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-auth-muted)' }}>The quick brown fox jumps over the lazy dog. Used for secondary information or labels.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Elements Section */}
      <section className="space-y-8 pb-16">
        <div className="flex items-center space-x-3 border-b pb-4" style={{ borderColor: 'var(--border-auth-card)' }}>
          <MousePointerClick className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-auth-primary)' }}>Buttons & Inputs</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl p-8 shadow-lg space-y-6 border" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-auth-primary)' }}>Button Variants</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs mb-2 uppercase tracking-wide" style={{ color: 'var(--text-auth-muted)' }}>Primary Button</p>
                <button 
                  className="w-full py-3 px-4 rounded-xl font-bold transition-all shadow-md focus:ring-2 focus:ring-brand-primary"
                  style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                >
                  Primary Action
                </button>
              </div>
              
              <div>
                <p className="text-xs mb-2 uppercase tracking-wide" style={{ color: 'var(--text-auth-muted)' }}>Secondary/Outline Button</p>
                <button 
                  className="w-full py-3 px-4 rounded-xl font-bold transition-all border hover:bg-white/5"
                  style={{ borderColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-bg)' }}
                >
                  Secondary Action
                </button>
              </div>

              <div>
                <p className="text-xs mb-2 uppercase tracking-wide" style={{ color: 'var(--text-auth-muted)' }}>Accent Button</p>
                <button 
                  className="w-full py-3 px-4 rounded-xl font-bold transition-all shadow-md hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-brand-accent)', color: 'white' }}
                >
                  Confirm / Proceed
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-8 shadow-lg space-y-6 border" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-auth-primary)' }}>Form Elements</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-auth-label)' }}>Standard Text Input</label>
                <input 
                  type="text" 
                  placeholder="Enter some text..." 
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-auth-input)', 
                    borderColor: 'var(--border-auth-card)',
                    color: 'var(--text-auth-primary)' 
                  }} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-auth-label)' }}>Select Dropdown</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--bg-auth-input)', 
                    borderColor: 'var(--border-auth-card)',
                    color: 'var(--text-auth-primary)' 
                  }}
                >
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignDetails;
