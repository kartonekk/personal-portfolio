import { site } from "../content/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <p className={styles.footer}>
      {site.name} &middot; {year}
    </p>
  );
}
