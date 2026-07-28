"use client";

import { useEffect, useState } from "react";
import { site } from "../content/site";
import { qrCodeUrl } from "../lib/data";
import styles from "./SharePanel.module.css";

const smallQr = qrCodeUrl(140, { bg: "FFFFFF", fg: "16151C" });
const largeQr = qrCodeUrl(480, { bg: "FFFFFF", fg: "16151C" });

export default function SharePanel() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <>
      <div className={styles.panel}>
        <button
          type="button"
          className={styles.qrButton}
          onClick={() => setExpanded(true)}
          aria-label={site.share.expandHint}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={smallQr} alt="QR code to this site" />
        </button>
        <div className={styles.text}>
          <div className={styles.title}>{site.share.title}</div>
          <div className={styles.url}>{site.share.url}</div>
          <div className={styles.hint}>{site.share.expandHint}</div>
        </div>
      </div>

      {expanded && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={site.share.title}
          onClick={() => setExpanded(false)}
        >
          <div className={styles.overlayCard} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={largeQr} alt="QR code to this site, enlarged" />
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setExpanded(false)}
            >
              {site.share.closeHint}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
