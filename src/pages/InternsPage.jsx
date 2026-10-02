import { useState } from 'react';
import Topbar from '../components/Topbar';
import { interns } from '../data/mockData';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ratingColors = {
  Excellent: { bg: 'var(--success-50)', color: 'var(--success-700)' },
  Good: { bg: 'var(--info-50)', color: 'var(--info-600)' },
  Average: { bg: 'var(--warning-50)', color: 'var(--warning-700)' },
};

export default function InternsPage() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const departments = [...new Set(interns.map(i => i.department))];

  const filtered = interns.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterDept !== 'all' && i.department !== filterDept) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !i.role.toLowerCase().includes(q) && !i.id.toLowerCase().includes(q) && !i.college.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <Topbar title="Intern Records" subtitle="Internship database — all past and current interns at ABC Technologies." />
      <main className="page anim-fade">
        <div className="ph-row ph">
          <div>
            <h2>Intern Records</h2>
            <p>{interns.filter(i => i.status === 'completed').length} completed · {interns.filter(i => i.status === 'ongoing').length} ongoing</p>
          </div>
        </div>

        <div className="alert alert-info mb-5">
          <span className="alert-icon">🎓</span>
          <div>
            <strong>Intern Database</strong> — These are authoritative records of all internships at ABC Technologies. They are matched against candidate claims during EduVerify employment verification.
          </div>
        </div>

        <div className="sf-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Search by name, role, ID, or college..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="f-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="f-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Intern ID</th>
                  <th>Name & College</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th>Supervisor</th>
                  <th>Performance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(intern => (
                  <tr key={intern.id}>
                    <td>
                      <span style={{ fontFamily: 'Courier New', fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600 }}>{intern.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-400), var(--violet-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                          {intern.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="table-name">{intern.name}</div>
                          <div className="table-sub">{intern.college}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{intern.role}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>{intern.project}</div>
                    </td>
                    <td>{intern.department}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      <div>{fmtDate(intern.startDate)}</div>
                      <div style={{ color: 'var(--gray-400)' }}>→ {fmtDate(intern.endDate)}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{intern.supervisor}</td>
                    <td>
                      {intern.performanceRating ? (
                        <span style={{ ...ratingColors[intern.performanceRating], padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {intern.performanceRating}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.8125rem' }}>In Progress</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${intern.status}`}>
                        {intern.status === 'completed' ? 'Completed' : 'Ongoing'}
                      </span>
                      {intern.offerConverted && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--success-600)', marginTop: 3, fontWeight: 600 }}>→ Converted to FTE</div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No intern records match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
          Showing {filtered.length} of {interns.length} records
        </p>
      </main>
    </>
  );
}
