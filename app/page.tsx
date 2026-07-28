import Hero from "../components/Hero";
import NowSection from "../components/NowSection";
import SideProjects from "../components/SideProjects";
import ContactSection from "../components/ContactSection";
import SharePanel from "../components/SharePanel";
import Footer from "../components/Footer";
import { getActivity, getDownloads, getStack } from "../lib/data";
import styles from "./page.module.css";

export default async function Home() {
  const [downloads, activity, stack] = await Promise.all([
    getDownloads(),
    getActivity(),
    getStack(),
  ]);

  return (
    <div className={styles.page}>
      <Hero />
      <NowSection activity={activity} stack={stack} />
      <SideProjects downloads={downloads} />
      <ContactSection />
      <SharePanel />
      <Footer />
    </div>
  );
}
