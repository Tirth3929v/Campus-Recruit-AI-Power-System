import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, User, Mail, Lock, Globe, Phone, MapPin, Briefcase,
  Users, Calendar, ChevronRight, ChevronLeft, CheckCircle2,
  Flame, Eye, EyeOff, FileText, UserCog,
} from 'lucide-react';

// ── validation helpers ────────────────────────────────────────
const validators = {
  name:             v => v.trim().length >= 2          ? '' : 'Full name must be at least 2 characters',
  email:            v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address',
  password:         v => v.length >= 8                 ? '' : 'Password must be at least 8 characters',
  confirmPassword:  (v, form) => v === form.password   ? '' : 'Passwords do not match',
  companyName:      v => v.trim().length >= 2          ? '' : 'Company name is required',
  location:         v => v.trim().length >= 2          ? '' : 'Location is required',
  contactNumber:    v => /^[+\d\s\-()]{7,15}$/.test(v) ? '' : 'Enter a valid contact number',
  website:          v => !v || /^https?:\/\/.+\..+/.test(v) ? '' : 'Enter a valid URL (https://...)',
  mainManagerEmail: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email',
  foundedYear:      v => !v || (Number(v) >= 1800 && Number(v) <= new Date().getFullYear()) ? '' : 'Enter a valid year',
};

const EMPLOYEE_COUNTS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Manufacturing',
  'Retail & E-commerce', 'Media & Entertainment', 'Consulting', 'Real Estate',
  'Transportation & Logistics', 'Energy', 'Other',
];

const STEPS = [
  { label: 'Account',  icon: User },
  { label: 'Company',  icon: Building2 },
  { label: 'Details',  icon: FileText },
  { label: 'Review',   icon: CheckCircle2 },
];

// ── reusable field ────────────────────────────────────────────
const Field = ({ label, error, required, children }) => (
  <div>
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
      {label}{required && <span className="text-amber-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full bg-white/5 border ${err ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/60 transition-colors`;

// ── main component ────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    // Step 0 — Account
    name: '', email: '', password: '', confirmPassword: '',
    // Step 1 — Company basics
    companyName: '', industry: '', location: '', address: '',
    contactNumber: '', website: '',
    // Step 2 — Details
    ownerName: '', mainManagerName: '', mainManagerEmail: '',
    employeeCount: '', foundedYear: '', description: '',
  });

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  // Fields to validate per step
  const STEP_FIELDS = [
    ['name', 'email', 'password', 'confirmPassword'],
    ['companyName', 'location', 'contactNumber', 'website'],
    ['mainManagerEmail', 'foundedYear'],
  ];

  const validateStep = (s) => {
    const newErrors = {};
    STEP_FIELDS[s]?.forEach(field => {
      const fn = validators[field];
      if (fn) {
        const msg = fn(form[field], form);
        if (msg) newErrors[field] = msg;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setApiError('');
    try {
      const { confirmPassword, ...payload } = form;
      const res = await fetch('/api/company/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setApiError(data.error || 'Registration failed');
      }
    } catch {
      setApiError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Registration Submitted!</h2>
          <p className="text-gray-400 text-sm mb-2">
            <strong className="text-white">{form.companyName}</strong> has been registered successfully.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            An employee will review your details and approve your account. You'll receive a confirmation email at <span className="text-amber-400">{form.email}</span>.
          </p>
          <div className="space-y-2 text-left bg-white/5 rounded-xl p-4 mb-8 text-xs text-gray-400">
            <p>✅ Registration received</p>
            <p>⏳ Employee verification — <span className="text-amber-400">Pending</span></p>
            <p className="opacity-40">🔓 Portal access granted</p>
          </div>
          <Link to="/login" className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-center hover:opacity-90 transition-opacity">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-900/15 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">Campus<span className="text-amber-400">Hire</span></span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                  ${active ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : done ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/5 text-white/25 border border-white/5'}`}>
                  <Icon size={11} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-4 ${i < step ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 backdrop-blur-xl shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

              {/* ── Step 0: Account ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white">Create Account</h2>
                    <p className="text-white/30 text-sm mt-0.5">Your login credentials</p>
                  </div>
                  <Field label="Contact Person Name" error={errors.name} required>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="John Smith" className={`${inputCls(errors.name)} pl-9`} />
                    </div>
                  </Field>
                  <Field label="Email Address" error={errors.email} required>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="you@company.com" className={`${inputCls(errors.email)} pl-9`} />
                    </div>
                  </Field>
                  <Field label="Password" error={errors.password} required>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  type={showPass ? 'text' : 'password'} value={form.password}
                        onChange={e => set('password', e.target.value)}
                        placeholder="Min. 8 characters" className={`${inputCls(errors.password)} pl-9 pr-10`} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm Password" error={errors.confirmPassword} required>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  type={showConf ? 'text' : 'password'} value={form.confirmPassword}
                        onChange={e => set('confirmPassword', e.target.value)}
                        placeholder="Re-enter password" className={`${inputCls(errors.confirmPassword)} pl-9 pr-10`} />
                      <button type="button" onClick={() => setShowConf(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Step 1: Company Basics ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white">Company Information</h2>
                    <p className="text-white/30 text-sm mt-0.5">Basic details about your company</p>
                  </div>
                  <Field label="Company Name" error={errors.companyName} required>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  value={form.companyName} onChange={e => set('companyName', e.target.value)}
                        placeholder="Acme Corp" className={`${inputCls(errors.companyName)} pl-9`} />
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Industry" error={errors.industry}>
                      <select value={form.industry} onChange={e => set('industry', e.target.value)}
                        className={inputCls(errors.industry)}>
                        <option value="" className="bg-[#0B0F19]">Select...</option>
                        {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#0B0F19]">{i}</option>)}
                      </select>
                    </Field>
                    <Field label="Founded Year" error={errors.foundedYear}>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input aria-label="Input field"  type="number" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)}
                          placeholder="2010" min="1800" max={new Date().getFullYear()}
                          className={`${inputCls(errors.foundedYear)} pl-9`} />
                      </div>
                    </Field>
                  </div>
                  <Field label="Location / City" error={errors.location} required>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  value={form.location} onChange={e => set('location', e.target.value)}
                        placeholder="Mumbai, India" className={`${inputCls(errors.location)} pl-9`} />
                    </div>
                  </Field>
                  <Field label="Full Address" error={errors.address}>
                    <textarea value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="123 Business Park, Andheri East..." rows={2}
                      className={`${inputCls(errors.address)} resize-none`} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Contact Number" error={errors.contactNumber} required>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input aria-label="Input field"  value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)}
                          placeholder="+91 98765 43210" className={`${inputCls(errors.contactNumber)} pl-9`} />
                      </div>
                    </Field>
                    <Field label="Website" error={errors.website}>
                      <div className="relative">
                        <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input aria-label="Input field"  value={form.website} onChange={e => set('website', e.target.value)}
                          placeholder="https://acme.com" className={`${inputCls(errors.website)} pl-9`} />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Step 2: People & Size ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white">People & Size</h2>
                    <p className="text-white/30 text-sm mt-0.5">Leadership and company size</p>
                  </div>
                  <Field label="Owner / Founder Name" error={errors.ownerName}>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input aria-label="Input field"  value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
                        placeholder="Jane Doe" className={`${inputCls(errors.ownerName)} pl-9`} />
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Main Manager Name" error={errors.mainManagerName}>
                      <div className="relative">
                        <UserCog size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input aria-label="Input field"  value={form.mainManagerName} onChange={e => set('mainManagerName', e.target.value)}
                          placeholder="Bob Smith" className={`${inputCls(errors.mainManagerName)} pl-9`} />
                      </div>
                    </Field>
                    <Field label="Manager Email" error={errors.mainManagerEmail}>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input aria-label="Input field"  type="email" value={form.mainManagerEmail} onChange={e => set('mainManagerEmail', e.target.value)}
                          placeholder="manager@co.com" className={`${inputCls(errors.mainManagerEmail)} pl-9`} />
                      </div>
                    </Field>
                  </div>
                  <Field label="Number of Employees" error={errors.employeeCount}>
                    <div className="grid grid-cols-3 gap-2">
                      {EMPLOYEE_COUNTS.map(c => (
                        <button key={c} type="button" onClick={() => set('employeeCount', c)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all
                            ${form.employeeCount === c
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
                          <Users size={11} className="inline mr-1" />{c}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Company Description" error={errors.description}>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Tell us about your company, what you do, your mission..." rows={3}
                      className={`${inputCls(errors.description)} resize-none`} />
                  </Field>
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white">Review & Submit</h2>
                    <p className="text-white/30 text-sm mt-0.5">Confirm your details before submitting</p>
                  </div>
                  {apiError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {apiError}
                    </div>
                  )}
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Contact Person', value: form.name },
                      { label: 'Email', value: form.email },
                      { label: 'Company Name', value: form.companyName },
                      { label: 'Industry', value: form.industry || '—' },
                      { label: 'Location', value: form.location },
                      { label: 'Contact Number', value: form.contactNumber },
                      { label: 'Website', value: form.website || '—' },
                      { label: 'Owner', value: form.ownerName || '—' },
                      { label: 'Main Manager', value: form.mainManagerName || '—' },
                      { label: 'Employees', value: form.employeeCount || '—' },
                      { label: 'Founded', value: form.foundedYear || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-white/5">
                        <span className="text-white/40 text-xs font-semibold uppercase tracking-wider flex-shrink-0">{label}</span>
                        <span className="text-white/80 text-right text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-amber-400/80 text-xs">
                    ⚠️ After submission, an employee will review your details. You'll receive an email once approved.
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className={`flex gap-3 mt-6 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
            {step > 0 && (
              <button onClick={back}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-all text-sm font-medium">
                <ChevronLeft size={15} /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity ml-auto">
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 ml-auto">
                {loading ? 'Submitting...' : <><CheckCircle2 size={15} /> Submit Registration</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
