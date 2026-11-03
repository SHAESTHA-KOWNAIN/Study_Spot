import { Clock3 } from "lucide-react";
import { formatDate } from "../utils/dateUtils.js";
import StatusBadge from "./StatusBadge.jsx";
import FreshnessBadge from "./FreshnessBadge.jsx";

export default function ReportHistory({ reports, now }) {
  if (!reports.length) return <div className="empty-panel compact-empty"><p>No reports have been shared for this space yet.</p><span>Be the first to let other students know what it is like.</span></div>;
  return (
    <ol className="report-history">
      {reports.map((report) => (
        <li key={report.id} className="report-history-item">
          <div className="history-main"><StatusBadge status={report.status} /><FreshnessBadge timestamp={report.createdAt} now={now} reportedFreshness={report.freshness} reportedThresholdMinutes={report.freshnessThresholdMinutes} /><time dateTime={report.createdAt}><Clock3 size={14} />{formatDate(report.createdAt)}</time></div>
          {report.note && <p>{report.note}</p>}
          <span className="reporter-name">{report.reporterName || "Community member"}</span>
        </li>
      ))}
    </ol>
  );
}
