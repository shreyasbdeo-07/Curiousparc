import { companyInfo } from '../data/mockData';

export default function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div className="topbar-info">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="api-pill">
          <div className="api-pill-dot" />
          EduVerify API Connected
        </div>
        <button className="topbar-icon-btn" title="Notifications">
          🔔
          <span className="dot" />
        </button>
        <button className="topbar-icon-btn" title="Help">❓</button>
      </div>
    </header>
  );
}
