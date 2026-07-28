import { site } from "../content/site";
import { links } from "../lib/links";
import styles from "./ContactSection.module.css";

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.21.67.8.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.075.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.076-.037A19.74 19.74 0 0 0 3.68 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.2 14.2 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.673-3.549-13.66a.06.06 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2a10 10 0 1 0 6.32 17.75L21 21l-1.3-2.9A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export default function ContactSection() {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <p className={styles.sectionTitle}>{site.contact.title}</p>
      </div>
      <div className={styles.links}>
        <a className={styles.row} href={links.github} target="_blank" rel="noreferrer">
          <span className={styles.icon}>
            <GithubIcon />
          </span>
          <span className={styles.text}>
            <span className={styles.platform}>{site.contact.github.platform}</span>
            <span className={styles.handle}>{site.contact.github.handle}</span>
          </span>
          <span className={styles.arrow}>&#8594;</span>
        </a>
        <a className={styles.row} href={links.discord} target="_blank" rel="noreferrer">
          <span className={styles.icon}>
            <DiscordIcon />
          </span>
          <span className={styles.text}>
            <span className={styles.platform}>{site.contact.discord.platform}</span>
            <span className={styles.handle}>{site.contact.discord.handle}</span>
          </span>
          <span className={styles.arrow}>&#8594;</span>
        </a>
        <a className={styles.row} href={links.signal} target="_blank" rel="noreferrer">
          <span className={styles.icon}>
            <SignalIcon />
          </span>
          <span className={styles.text}>
            <span className={styles.platform}>{site.contact.signal.platform}</span>
            <span className={styles.handle}>{site.contact.signal.handle}</span>
          </span>
          <span className={styles.arrow}>&#8594;</span>
        </a>
      </div>
    </div>
  );
}
