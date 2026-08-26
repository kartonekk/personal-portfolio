import { site } from "../content/site";
import { links } from "../lib/links";
import { groupDigits } from "../lib/format";
import type { DownloadsResult } from "../lib/data";
import styles from "./SideProjects.module.css";

function ModrinthIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.252.004a11.78 11.768 0 0 0-8.92 3.73 11 10.999 0 0 0-2.17 3.11 11.37 11.359 0 0 0-1.16 5.169c0 1.42.17 2.5.6 3.77.24.759.77 1.899 1.17 2.529a12.3 12.298 0 0 0 8.85 5.639c.44.05 2.54.07 2.76.02 3.7-.6 6.8-3.15 8.16-6.63.28-.73.53-1.7.62-2.44.1-.72.1-2.15 0-2.87a11.6 11.6 0 0 0-1.65-4.729A11.87 11.86 0 0 0 12.252.004Z" />
    </svg>
  );
}

function CurseForgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857 3.86.065 5.9-1.86 5.9-1.86-3.13.44-4.96-.42-4.96-.42 4.55-.6 5.6-3.44 5.6-3.44-2.42 1.02-4.53.6-4.53.6 3.38-1.4 3.32-4.1 3.32-4.1z" />
    </svg>
  );
}

function GroupedNumber({
  value,
  className,
}: {
  value: number | null;
  className: string;
}) {
  if (value === null) {
    return <div className={className}>&mdash;</div>;
  }
  const groups = groupDigits(value);
  return (
    <div className={className}>
      {groups.map((g, i) => (
        <span key={i} className={styles.digitGroup}>
          {g}
        </span>
      ))}
    </div>
  );
}

export default function SideProjects({
  downloads,
}: {
  downloads: DownloadsResult;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <p className={styles.sectionTitle}>{site.sideProjects.title}</p>
      </div>
      <div className={styles.card} data-mc-trigger="">
        <div className={styles.top}>
          <div className={styles.left}>
            <p className={styles.description}>{site.sideProjects.description}</p>
            <div className={styles.links}>
              <a className={styles.chip} href={links.modrinth} target="_blank" rel="noreferrer">
                <ModrinthIcon />
                {site.sideProjects.modrinth}
              </a>
              <a className={styles.chip} href={links.curseforge} target="_blank" rel="noreferrer">
                <CurseForgeIcon />
                {site.sideProjects.curseforge}
              </a>
            </div>
          </div>
          <div className={styles.stat}>
            <GroupedNumber value={downloads.total} className={styles.value} />
            <div className={styles.label}>{site.sideProjects.downloadsLabel}</div>
            <div className={styles.breakdown}>
              <div className={styles.breakdownItem}>
                <GroupedNumber value={downloads.modrinth} className={styles.breakdownValue} />
                <span className={styles.breakdownLabel}>{site.sideProjects.modrinth}</span>
              </div>
              <div className={styles.breakdownDivider} />
              <div className={styles.breakdownItem}>
                <GroupedNumber value={downloads.curseforge} className={styles.breakdownValue} />
                <span className={styles.breakdownLabel}>{site.sideProjects.curseforge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
