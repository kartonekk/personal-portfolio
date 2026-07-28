import { site } from "../content/site";
import type { ActivityDay } from "../lib/data";
import styles from "./NowSection.module.css";

const HEATMAP_DAYS = 30;

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function tooltip(day: ActivityDay | null) {
  if (!day) return "No data";
  const label = day.count === 1 ? "contribution" : "contributions";
  return `${formatDay(day.date)}: ${day.count} ${label}`;
}

export default function NowSection({
  activity,
  stack,
}: {
  activity: ActivityDay[] | null;
  stack: string[];
}) {
  const days: (ActivityDay | null)[] =
    activity ?? Array.from({ length: HEATMAP_DAYS }, () => null);
  const max = activity ? Math.max(1, ...activity.map((d) => d.count)) : 1;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <p className={styles.sectionTitle}>{site.now.title}</p>
        <p className={styles.sectionNote}>{site.now.activityNote}</p>
      </div>
      <div className={styles.nowGrid}>
        <div className={styles.card}>
          <div className={styles.heatmap}>
            {days.map((day, i) => {
              const opacity =
                !day || day.count === 0 ? 0.12 : 0.32 + 0.68 * (day.count / max);
              return <div key={i} style={{ opacity }} title={tooltip(day)} />;
            })}
          </div>
        </div>
        <div className={styles.card}>
          <p className={styles.sectionNote}>{site.now.workingWithLabel}</p>
          <div className={styles.pills}>
            {stack.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
