// backend/src/controllers/paymentController.js
const stripe = require('../services/stripe');
const supabase = require('../services/supabase');

// Product prices
const PRODUCTS = {
  course: {
    name: 'Complete Course',
    price: 9900, // $99.00 in cents
  },
  ebook: {
    name: 'E-book',
    price: 1900, // $19.00 in cents
  },
};

// Create Stripe checkout session
const createCheckoutSession = async (req, res) => {
  try {
    const { productType } = req.body;
    const userId = req.user.id;
    
    // Prevent duplicate course purchases
    if (productType === 'course' && req.user.hasPurchasedCourse) {
      return res.status(400).json({ error: 'Course already purchased' });
    }
    
    const product = PRODUCTS[productType];
    if (!product) {
      return res.status(400).json({ error: 'Invalid product type' });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: `Purchase ${product.name} from Nathan Soufer`,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      customer_email: req.user.email,
      metadata: {
        userId,
        productType,
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle Stripe webhook
const handleStripeWebhook = async (req, res) => {
  console.log('=== Webhook received! ===');
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook verified successfully:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, productType } = session.metadata;
    
    console.log('📦 Processing purchase:', { 
      userId, 
      productType, 
      sessionId: session.id,
      amount: session.amount_total / 100,
      customerEmail: session.customer_email
    });
    
    try {
      // Record the purchase
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          product_type: productType,
          stripe_session_id: session.id,
          amount: session.amount_total / 100, // Convert from cents
          status: 'completed',
          purchased_at: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        console.error('❌ Error recording purchase in Supabase:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Purchase recorded successfully in Supabase:', data);
      }
      
      // If it's an ebook purchase, increment download count
      if (productType === 'ebook') {
        const { error: ebookError } = await supabase.rpc('increment_ebook_downloads');
        if (ebookError) {
          console.error('❌ Error incrementing ebook downloads:', ebookError);
        }
      }
      
      console.log(`✅ Purchase completed: ${productType} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error processing purchase:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
    }
  } else {
    console.log('ℹ️ Received webhook event:', event.type);
  }
  
  res.json({ received: true });
};

// Verify payment (for payment success page)
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('🔍 Verifying payment for session:', sessionId);
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      console.log('❌ Payment not completed yet');
      return res.json({ success: false, paid: false });
    }
    
    // Check if purchase is recorded
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('status', 'completed')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking purchase:', error);
    }
    
    console.log('📦 Purchase found in database:', !!purchase);
    
    res.json({ 
      success: true, 
      paid: true,
      purchase: !!purchase 
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  verifyPayment
};