import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DEMO_EMAIL = 'hr-verification@abctech.in';
const DEMO_PASS = 'ABCTech@2026';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutoFill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setError('');
    if (addToast) {
      addToast('Demo credentials applied to form', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      login();
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use the demo credentials shown above.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade">
        {/* Left Panel: Purple Identity with Distinctive Convex Curve */}
        <div className="auth-panel-left">
          <div className="auth-panel-left-content">
            {/* Company Branding */}
            <div className="auth-brand">
              <div className="auth-brand-badge">AT</div>
              <div>
                <div className="auth-brand-name">ABC Technologies</div>
                <div className="auth-brand-tag">Verification Portal</div>
              </div>
            </div>

            {/* Welcome & Verification Messaging */}
            <div className="auth-welcome-block">
              <h1 className="auth-welcome-title">Welcome Back!</h1>
              <div className="auth-portal-badge">Employment Verification Portal</div>
              <p className="auth-welcome-desc">
                Authorized company personnel portal to review and respond to
                employment and internship verification requests.
              </p>
            </div>

            {/* Call To Action: Outlined Pill Button (matching reference) */}
            <div className="auth-left-cta-wrap">
              <button
                type="button"
                className="auth-outline-btn"
                onClick={handleAutoFill}
                id="btn-autofill-left"
              >
                Auto-fill Demo
              </button>
            </div>
          </div>

          <div className="auth-left-footer">
            <span>🔒 Enterprise Secure Gateway</span>
          </div>
        </div>

        {/* Right Panel: Clean White Authentication Section */}
        <div className="auth-panel-right">
          <div className="auth-form-container anim-slide">
            <h2 className="auth-right-heading">HR Portal Sign In</h2>

            {/* 3 Rounded Square Icons (recreating reference design) */}
            <div className="auth-social-row">
              <button
                type="button"
                className="auth-icon-box"
                title="Corporate SSO Login"
                onClick={() => addToast && addToast('Enterprise SSO configured for @abctech.in', 'info')}
              >
                🏢
              </button>
              <button
                type="button"
                className="auth-icon-box"
                title="Identity Provider (IdP) Active"
                onClick={() => addToast && addToast('Identity Provider (IdP) active', 'info')}
              >
                🛡️
              </button>
              <button
                type="button"
                className="auth-icon-box"
                title="Quick Demo Access"
                onClick={handleAutoFill}
              >
                🔑
              </button>
            </div>

            <div className="auth-divider-text">
              or use your authorized work credentials
            </div>

            {/* Demo Credentials Helper Card */}
            <div className="auth-demo-card">
              <div className="auth-demo-header">
                <span className="auth-demo-tag">🔑 Demo Credentials</span>
                <button
                  type="button"
                  className="auth-demo-pill-btn"
                  onClick={handleAutoFill}
                  id="btn-autofill-demo"
                >
                  Auto-fill
                </button>
              </div>
              <div className="auth-demo-details">
                <div className="auth-demo-row">
                  <span className="auth-demo-label">Email:</span>
                  <span className="auth-demo-code">{DEMO_EMAIL}</span>
                </div>
                <div className="auth-demo-row">
                  <span className="auth-demo-label">Pass:</span>
                  <span className="auth-demo-code">{DEMO_PASS}</span>
                </div>
              </div>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="auth-login-form">
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="email">
                  Work Email <span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="auth-input-field"
                    placeholder="hr-verification@abctech.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="password">
                  Password <span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-alert-error anim-fade">
                  <span className="auth-alert-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-submit-wrap">
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                  id="btn-sign-in"
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <p className="auth-footer-text">
              ABC Technologies · Employment Verification Portal · Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
