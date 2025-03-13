// pages/cart.js
import Head from 'next/head';
import Link from 'next/link';

export default function Cart() {
  return (
    <div>
      <Head>
        <title>Shopping Cart | Bell Canada</title>
        <meta name="description" content="Bell Canada shopping cart" />
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
        <div style={{maxWidth: '800px', margin: '50px auto'}}>
          <h1>Your Cart</h1>
          
          <div style={{background: 'white', padding: '25px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee'}}>
              <div>
                <h3 style={{margin: 0}}>Google Pixel 9</h3>
                <p style={{margin: '5px 0 0', color: '#666'}}>128GB, Black</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={{margin: 0, fontWeight: 'bold'}}>$22.41/mo.</p>
                <p style={{margin: '5px 0 0', color: '#666'}}>for 24 months</p>
              </div>
            </div>
            
            {/* ...other cart items... */}
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '20px'}}>Total Due Monthly</h3>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={{margin: 0, fontWeight: 'bold', fontSize: '20px'}}>$95.21/mo.</p>
                <p style={{margin: '5px 0 0', color: '#666'}}>after taxes</p>
              </div>
            </div>
          </div>
          
          <div style={{textAlign: 'center'}}>
            <Link href="/checkout" className="btn">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
