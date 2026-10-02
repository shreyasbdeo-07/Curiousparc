import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { getStats, activityFeed, employees, interns } from '../data/mockData';

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.25rem' }}>{trend}</div>}
    </div>
  );
}

export default function DashboardPage({ requests }) {
  const navigate = useNavigate();
  const stats = getStats(requests);
  const pending = requests.filter(r => r.status === 'pending');
  const activeEmps = employees.filter(e => e.status === 'active');

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Welcome back, Kavitha 👋 — ABC Technologies Verification Portal`} />
      <main className="page anim-fade">

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon="⏳" label="Pending Requests" value={stats.pending} color="warning" />
          <StatCard icon="✅" label="Verified" value={stats.verified} color="success" />
          <StatCard icon="⚠️" label="Verified w/ Correction" value={stats.verified_with_correction} color="info" />
          <StatCard icon="❌" label="Rejected" value={stats.rejected} color="error" />
          <StatCard icon="👔" label="Active Employees" value={stats.totalEmployees} color="primary" />
          <StatCard icon="🎓" label="Intern Records" value={stats.totalInterns} color="primary" />
        </div>

        {/* Main content */}
        <div className="two-col">
          <div>
            {/* Pending requests preview */}
            <div className="card mb-5">
              <div className="card-hd">
                <div>
                  <div className="card-title">Pending Verification Requests</div>
                  <div className="card-sub">{pending.length} awaiting your response</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/verifications')}>
                  View All →
                </button>
              </div>

              {pending.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🛡️</div>
                  <h3>All caught up!</h3>
                  <p>No pending verification requests at this time.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pending.slice(0, 3).map(req => (
                    <div
                      key={req.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.875rem 1rem', borderRadius: 'var(--r-lg)',
                        border: '1.5px solid var(--warning-100)', background: 'var(--warning-50)',
                        cursor: 'pointer', transition: 'all var(--t-fast)',
                      }}
                      onClick={() => navigate('/verifications')}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--warning-300)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--warning-100)'}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--gray-900)' }}>{req.candidateName}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', marginTop: 2 }}>
                          Claimed: {req.claimedRole} · {req.claimedStartDate} → {req.claimedEndDate}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>
                          Received: {new Date(req.receivedAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                        <span className={`badge badge-${req.priority}`} style={{ fontSize: '0.6875rem' }}>
                          {req.priority} priority
                        </span>
                        <span className="badge badge-pending">⏳ Pending</span>
                      </div>
                    </div>
                  ))}
                  {pending.length > 3 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/verifications')}>
                      + {pending.length - 3} more pending requests
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick stats table */}
            <div className="card">
              <div className="card-hd">
                <div className="card-title">Request Summary</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pending', stats.pending, 'badge-pending'],
                    ['Verified', stats.verified, 'badge-verified'],
                    ['Verified w/ Correction', stats.verified_with_correction, 'badge-correction'],
                    ['Rejected', stats.rejected, 'badge-rejected'],
                  ].map(([label, count, badgeClass]) => {
                    const total = requests.length;
                    return (
                      <tr key={label}>
                        <td><span className={`badge ${badgeClass}`}>{label}</span></td>
                        <td style={{ fontWeight: 700 }}>{count}</td>
                        <td style={{ color: 'var(--gray-500)' }}>{total ? Math.round((count / total) * 100) : 0}%</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Total</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-700)' }}>{requests.length}</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel */}
          <div>
            {/* Activity feed */}
            <div className="card mb-5">
              <div className="card-hd">
                <div className="card-title">Recent Activity</div>
              </div>
              <div className="activity-list">
                {activityFeed.map(item => (
                  <div className="act-item" key={item.id}>
                    <div className="act-icon">{item.icon}</div>
                    <div>
                      <div className="act-text">{item.text}</div>
                      <div className="act-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="card">
              <div className="card-title mb-4">Quick Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={() => navigate('/verifications')}>
                  🛡️ Review Pending Requests ({stats.pending})
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
                  👔 Employee Records ({activeEmps.length} active)
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/interns')}>
                  🎓 Intern Records ({interns.length} total)
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/history')}>
                  🕑 Verification History
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
