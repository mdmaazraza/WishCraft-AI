const http = require('http');
const { requestHandler } = require('../server');

function makeRequest(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = urlPath;
    req.headers = {
      'host': 'localhost:3000',
      'content-type': 'application/json'
    };
    req.socket = { remoteAddress: '127.0.0.1' };

    let resData = '';
    const res = {
      writeHead(status, headers) {
        this.statusCode = status;
        this.headers = headers;
      },
      write(chunk) {
        resData += chunk;
      },
      end(chunk) {
        if (chunk) resData += chunk;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: resData
        });
      }
    };

    // If body, simulate stream
    if (body) {
      const payload = JSON.stringify(body);
      process.nextTick(() => {
        req.emit('data', Buffer.from(payload));
        req.emit('end');
      });
    } else {
      process.nextTick(() => {
        req.emit('end');
      });
    }

    requestHandler(req, res).catch(reject);
  });
}

async function runTrace() {
  console.log('🔍 TRACING COMPLETE DATA FLOW FROM CREATION TO DISPLAY:\n');

  // Step 1: User enters details in Step 3
  const step3Details = {
    occasion: 'Birthday',
    relationship: 'Best Friend',
    recipient_name: 'Sarah',
    sender_name: 'Maaz',
    recipient_gender: 'female',
    age: '25',
    memories: 'Remember our beach trip last summer!',
    style: 'Heart-touching',
    font_family: 'Dancing Script',
    theme: 'birthday_celebration'
  };
  console.log('1. User input in Step 3:', step3Details);

  // Step 2: In Step 6, AI generates messages
  console.log('\n2. Calling /api/generate-message...');
  const genRes = await makeRequest('POST', '/api/generate-message', {
    occasion: step3Details.occasion,
    relationship: step3Details.relationship,
    recipientName: step3Details.recipient_name,
    senderName: step3Details.sender_name,
    style: step3Details.style,
    memories: step3Details.memories,
    language: 'en',
    length: 'medium'
  });
  console.log('   Status:', genRes.statusCode);
  const genJson = JSON.parse(genRes.body);
  console.log('   Variations count:', genJson.variations?.length);
  const selectedMessage = genJson.variations[0]?.text;
  console.log('   Selected message excerpt:', selectedMessage?.slice(0, 60));

  // Step 3: User publishes greeting
  console.log('\n3. Publishing greeting to /api/wishes...');
  const wishPayload = {
    ...step3Details,
    message: selectedMessage,
    is_public: true
  };
  const pubRes = await makeRequest('POST', '/api/wishes', wishPayload);
  console.log('   Status:', pubRes.statusCode);
  const pubJson = JSON.parse(pubRes.body);
  console.log('   Created wish slug:', pubJson.wish?.slug);
  const slug = pubJson.wish?.slug;

  // Step 4: Loading /wish/:slug page
  console.log(`\n4. Requesting page GET /wish/${slug}...`);
  const pageRes = await makeRequest('GET', `/wish/${slug}`);
  console.log('   Status:', pageRes.statusCode);
  console.log('   Content-Type:', pageRes.headers?.['Content-Type']);
  console.log('   Contains recipient name in OG tag?', pageRes.body.includes('Sarah'));

  // Step 5: In browser, greeting.js fetches /api/wishes/:slug
  console.log(`\n5. Client-side fetch GET /api/wishes/${slug}...`);
  const apiWishRes = await makeRequest('GET', `/api/wishes/${slug}`);
  console.log('   Status:', apiWishRes.statusCode);
  const apiWishJson = JSON.parse(apiWishRes.body);
  console.log('   Fetched wish recipient_name:', apiWishJson.wish?.recipient_name);
  console.log('   Fetched wish sender_name:', apiWishJson.wish?.sender_name);
  console.log('   Fetched wish message:', apiWishJson.wish?.message?.slice(0, 50));
  console.log('   Fetched wish font_family:', apiWishJson.wish?.font_family);

  console.log('\n✅ Backend data flow succeeded. Now let us check client-side rendering edge cases!');
}

runTrace().catch(console.error);
