import { getFreshness } from "../utils/statusUtils.js";

export default function FreshnessBadge({ timestamp, now }) {
  const freshness = getFreshness(timestamp, undefined, now);
  if (freshness === "none") return null;
  return <span className={`freshness-badge freshness-${freshness}`}>{freshness === "fresh" ? "Fresh" : "Stale"}</span>;
}
