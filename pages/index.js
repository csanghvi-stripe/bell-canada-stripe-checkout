// pages/index.js
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Bell Canada</title>
        <meta name="description" content="Bell Canada homepage" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">Bell</Link>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div style={{textAlign: 'center', margin: '100px auto'}}>
          <h1>Welcome to Bell Canada</h1>
          <p>Browse our products and services</p>
          <Link href="/cart" className="btn">View Cart</Link>
        </div>
      </div>
    </div>
  );
}
