import Head from "next/head";
import Image from "next/image";
import NavBar from "../components/NavBar";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Automated Lottery</title>
        <meta
          name="description"
          content="A smart contract lottery that automates and randomly chooses a winner in fairness"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NavBar />
      </main>
    </div>
  );
}
