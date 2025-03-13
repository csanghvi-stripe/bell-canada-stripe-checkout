// pages/success.js
import Head from 'next/head';
import Link from 'next/link';

export default function Success() {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 5);
  
  return (
    <div>
      <Head>
        <title>Order Confirmation | Bell Canada</title>
        <meta name="description" content="Bell Canada order confirmation" />
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
        <div style={{maxWidth: '800px', margin: '50px auto', textAlign: 'center'}}>
          <div style={{fontSize: '60px', color: 'var(--bell-blue)', marginBottom: '20px'}}>✓</div>
          <h1>Thank you for your order!</h1>
          <p style={{fontSize: '18px', marginBottom: '30px'}}>Your order has been placed successfully.</p>
          
          <div style={{background: 'white', padding: '25px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', textAlign: 'left'}}>
            <h2 style={{marginTop: 0}}>Order details</h2>
            

            <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee'}}>
              <div>
                <strong>Order number:</strong>
              </div>
              <div>
                BJ3L98ST
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee'}}>
              <div>
                <strong>Order date:</strong>
              </div>
              <div>
                {today.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee'}}>
              <div>
                <strong>Total monthly:</strong>
              </div>
              <div>
                $95.21
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', marginBottom: '15px', borderBottom: '1px solid #eee'}}>
              <div>
                <strong>Shipping address:</strong>
              </div>
              <div>
                220-885 Georgia St, Vancouver, BC, V6C 3E8
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <div>
                <strong>Estimated delivery:</strong>
              </div>
              <div>
                {deliveryDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
          
          <p>We've sent a confirmation email to <strong>jason.bourne@example.com</strong></p>
          
          <div style={{marginTop: '30px'}}>
            <Link href="/" className="btn">Return to Home</Link>
          </div>
        </div>
      </div>
      
      <footer style={{backgroundColor: '#f4f4f4', padding: '30px 0', marginTop: '50px'}}>
        <div className="container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
            <div style={{marginBottom: '20px'}}>
              <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap'}}>
                <li style={{marginRight: '20px', marginBottom: '10px'}}><a href="#" style={{color: 'var(--bell-blue)', textDecoration: 'none'}}>Privacy</a></li>
                <li style={{marginRight: '20px', marginBottom: '10px'}}><a href="#" style={{color: 'var(--bell-blue)', textDecoration: 'none'}}>Security</a></li>
                <li style={{marginRight: '20px', marginBottom: '10px'}}><a href="#" style={{color: 'var(--bell-blue)', textDecoration: 'none'}}>Legal & regulatory</a></li>
              </ul>
              <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>© Bell Canada, 2023. All rights reserved.</p>
            </div>
            <div>
              <img src="https://www.bell.ca/styles/solutionBuilder/img/entrust.png" alt="Secured by Entrust SSL" style={{maxWidth: '120px'}} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
