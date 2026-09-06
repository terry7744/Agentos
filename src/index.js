import Stripe from 'stripe';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    if (url.pathname === '/') return new Response(getHomepage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

    if (url.pathname === '/create-checkout-session' && request.method === 'POST') {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price_data: { currency: env.STRIPE_CURRENCY, product_data: { name: env.SERVICE_NAME, images: ['https://via.placeholder.com/300x200?text=Serveur'] }, unit_amount: env.PRICE_AMOUNT }, quantity: 1 }],
          mode: 'payment',
          success_url: `${url.origin}/success`,
          cancel_url: `${url.origin}/cancel`,
        });
        return new Response(JSON.stringify({ sessionId: session.id }), { headers: { 'Content-Type': 'application/json' } });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/success') return new Response(getSuccessPage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    if (url.pathname === '/cancel') return new Response(getCancelPage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    
    return new Response('Not Found', { status: 404 });
  },
};

function getHomepage() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Le Serveur</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI';background:linear-gradient(135deg,#1e3a8a 0%, #3b82f6 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.container{background:white;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:500px;width:100%;padding:40px;text-align:center}h1{color:#333;font-size:32px;margin-bottom:10px}.price{font-size:48px;color:#3b82f6;font-weight:bold;margin:30px 0}button{background:linear-gradient(135deg,#1e3a8a 0%, #3b82f6 100%);color:white;border:none;padding:14px 40px;font-size:16px;border-radius:8px;cursor:pointer;width:100%;margin-top:20px}</style></head><body><div class="container"><h1>🖥️ Le Serveur</h1><p>Event Service</p><div class="price">9,99€</div><button onclick="startPayment()">Pay Now</button></div><script>async function startPayment(){const r=await fetch('/create-checkout-session',{method:'POST'}),e=await r.json();e.sessionId?window.location.href=\`https://checkout.stripe.com/pay/\${e.sessionId}\`:alert('Error: '+e.error)}</script></body></html>`;
}

function getSuccessPage() {
  return `<!DOCTYPE html><html><head><title>Success</title></head><body style="background:linear-gradient(135deg,#1e3a8a 0%, #3b82f6 100%);display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="background:white;padding:40px;border-radius:16px;text-align:center"><h1 style="color:#27ae60">✓ Success!</h1></div></body></html>`;
}

function getCancelPage() {
  return `<!DOCTYPE html><html><head><title>Cancelled</title></head><body style="background:linear-gradient(135deg,#1e3a8a 0%, #3b82f6 100%);display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="background:white;padding:40px;border-radius:16px;text-align:center"><h1 style="color:#e74c3c">✕ Cancelled</h1></div></body></html>`;
}
