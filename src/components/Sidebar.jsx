import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { hrAdmin, companyInfo } from '../data/mockData';

const NAV = [
  {
    section: 'Main',
    items: [
      { icon: '◉', label: 'Dashboard', path: '/dashboard' },
    ],
  },
  {
    section: 'Verification',
    items: [
      { icon: '🛡️', label: 'Verification Requests', path: '/verifications', badge: 4 },
      { icon: '🕑', label: 'Verification History', path: '/history' },
    ],
  },
  {
    section: 'People',
    items: [
      { icon: '👔', label: 'Employees', path: '/employees' },
      { icon: '🎓', label: 'Interns', path: '/interns' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { icon: '🏢', label: 'Company Profile', path: '/company' },
    ],
  },
];

export default function Sidebar({ pendingCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">AT</div>
        <div className="brand-text">
          <span className="brand-name">ABC Technologies</span>
          <span className="brand-sub">Verification Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div className="nav-section" key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => {
              const active = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const badgeVal = item.path === '/verifications' ? pendingCount : item.badge;
              return (
                <div
                  key={item.path}
                  className={`nav-item${active ? ' active' : ''}`}
                  onClick={() => navigate(item.path)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {badgeVal > 0 && <span className="nav-badge">{badgeVal}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{hrAdmin.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{hrAdmin.name}</div>
            <div className="user-role">{hrAdmin.role}</div>
          </div>
        </div>
        <button className="signout-btn" onClick={logout}>
          🚪 Sign out
        </button>
      </div>
    </aside>
  );
}
