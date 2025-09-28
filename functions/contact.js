// functions/contact.js
export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Handle CORS for form submissions
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the JSON body
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a formatted message
    const timestamp = new Date().toISOString();
    const formattedMessage = `
New Contact Form Submission
========================
Time: ${timestamp}
Name: ${data.name}
Email: ${data.email}
Interest: ${data.interest || 'Not specified'}

Message:
${data.message}
========================
    `;

    console.log('Contact form submission:', formattedMessage);

    // Option 1: Send email using Cloudflare's Email Workers (requires setup)
    // Uncomment and configure if you have Email Workers set up
    /*
    if (env.EMAIL_WORKER_ENDPOINT) {
      const emailResponse = await fetch(env.EMAIL_WORKER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'your-email@example.com',
          subject: `New Contact Form: ${data.interest || 'General Inquiry'}`,
          text: formattedMessage,
          replyTo: data.email
        })
      });
    }
    */

    // Option 2: Store in KV storage for later retrieval
    // Uncomment and configure if you want to store messages
    /*
    if (env.CONTACT_MESSAGES) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await env.CONTACT_MESSAGES.put(messageId, JSON.stringify({
        ...data,
        timestamp,
        id: messageId
      }));
    }
    */

    // Option 3: Send to external service (webhook, API, etc.)
    // Example: Send to Zapier, Make.com, or your own API
    /*
    if (env.WEBHOOK_URL) {
      await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, timestamp })
      });
    }
    */

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: 'Thank you for your message! I\'ll get back to you within 24 hours.',
        success: true 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Sorry, there was an error processing your message. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
