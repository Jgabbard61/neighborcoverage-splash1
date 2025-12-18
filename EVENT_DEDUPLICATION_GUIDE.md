# Meta Event Deduplication Guide

## 🎯 What is Event Deduplication?

**Event Deduplication** prevents Meta from counting the same conversion event twice when you use both **Meta Pixel (browser-side)** and **Conversions API (server-side)** simultaneously.

### The Problem Without Deduplication
When a user clicks your CTA button:
1. ❌ Meta Pixel sends a "Lead" event to Meta (client-side)
2. ❌ Conversions API sends a "Lead" event to Meta (server-side)
3. ❌ **Meta counts 2 conversions** instead of 1
4. ❌ Your conversion numbers are inflated (2x the actual conversions)
5. ❌ Campaign reporting is incorrect
6. ❌ You're charged more for ads due to false success metrics

### The Solution With Deduplication
When a user clicks your CTA button:
1. ✅ Generate a unique `event_id` on the client
2. ✅ Send this `event_id` to BOTH Pixel and Conversions API
3. ✅ Meta sees the same `event_id` from both sources
4. ✅ **Meta counts only 1 conversion** (deduplicates automatically)
5. ✅ Accurate conversion tracking
6. ✅ Correct campaign reporting

---

## 🔄 Meta Pixel vs. Conversions API

### Meta Pixel (Browser-Side / Client-Side)
**What it is:**
- A JavaScript snippet that runs in the user's browser
- Tracks user behavior on your website in real-time
- Fires events when users interact with your site (page views, clicks, etc.)

**How it works:**
```javascript
// Loaded in layout.tsx <head>
fbq('init', '1884617578809782');  // Initialize with your Pixel ID
fbq('track', 'Lead', { /* data */ }, { eventID: '123abc' });  // Track event
```

**Advantages:**
- ✅ Easy to implement (just add script to website)
- ✅ Tracks user behavior in real-time
- ✅ Automatically sets cookies (_fbp, _fbc) for tracking
- ✅ Captures client-side data (browser info, page interactions)

**Limitations:**
- ❌ Blocked by ad blockers (15-30% of users)
- ❌ Affected by browser privacy features (iOS 14.5+, Firefox tracking protection)
- ❌ Cookie restrictions (GDPR, third-party cookie blocking)
- ❌ Can't track server-side conversions
- ❌ Data loss from JavaScript errors

---

### Conversions API (Server-Side)
**What it is:**
- A server-to-server API that sends events directly from your server to Meta
- Bypasses browser-based tracking limitations
- Sends enriched data that only your server knows

**How it works:**
```javascript
// Client sends request to your API endpoint
fetch('/api/meta-conversion', {
  method: 'POST',
  body: JSON.stringify({
    event_id: '123abc',  // SAME as Pixel eventID
    event_name: 'Lead',
    user_data: { /* hashed user data */ }
  })
});

// Your server sends to Meta
fetch('https://graph.facebook.com/v18.0/{pixel-id}/events', {
  method: 'POST',
  body: JSON.stringify({
    data: [{
      event_name: 'Lead',
      event_id: '123abc',  // SAME as Pixel eventID
      user_data: { /* hashed data */ }
    }]
  })
});
```

**Advantages:**
- ✅ Not blocked by ad blockers or browser privacy features
- ✅ More reliable data delivery (no client-side errors)
- ✅ Can send sensitive data (securely hashed on server)
- ✅ Captures server-side data (IP geolocation, backend user info)
- ✅ Better Event Match Quality (more data points)
- ✅ Works even if user has JavaScript disabled

**Limitations:**
- ❌ Requires server-side implementation
- ❌ Must hash sensitive data (PII) before sending
- ❌ Needs proper event_id coordination with Pixel

---

## 🔑 Why Use BOTH Pixel AND Conversions API?

Using both together gives you the best of both worlds:

1. **Redundancy**: If Pixel is blocked, Conversions API still tracks
2. **Better Event Match Quality**: More data points = better ad targeting
3. **Deduplication**: With proper `event_id`, Meta counts events once
4. **Comprehensive Tracking**: Capture both client-side and server-side data

**Meta's Recommendation:**
> "Use both Pixel and Conversions API together with event deduplication for the most reliable and accurate conversion tracking."

---

## 🛠️ How Event Deduplication Works in This Implementation

### 1. Event Flow Diagram
```
User Clicks CTA Button
        ↓
Generate unique event_id (client-side)
   event_id = "1703123456789_abc123"
        ↓
        ├──────────────────────┬──────────────────────┐
        ↓                      ↓                      ↓
   Meta Pixel            Conversions API      Server Logs
   (Browser)             (Your Server)        (Vercel Logs)
        ↓                      ↓                      ↓
fbq('track', 'Lead',    POST /api/meta-     console.log()
  { /* data */ },         conversion          with event_id
  {                       {                   for verification
    eventID: eventId       event_id: eventId,
  }                        /* data */
)                        }
        ↓                      ↓
        └──────────────┬───────┘
                       ↓
           Both send to Meta with
           SAME event_id
                       ↓
           Meta deduplicates
           (counts as 1 event)
```

### 2. Code Implementation

#### **Client-Side: Generate event_id**
```typescript
// In page.tsx and sticky-call-button.tsx
const generateEventId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// When user clicks CTA
const eventId = generateEventId()
// Example: "1703123456789_abc123def45"
```

#### **Client-Side: Send to Meta Pixel**
```typescript
// Send to Meta Pixel (browser)
fbq('track', 'Lead', {
  content_name: 'Phone Call Initiated',
  value: 1.00,
  currency: 'USD'
}, {
  eventID: eventId  // ← CRITICAL: event_id for deduplication
})

console.log('[DEDUPLICATION] Pixel eventID:', eventId)
```

#### **Client-Side: Send to Conversions API**
```typescript
// Send to your server API endpoint
fetch('/api/meta-conversion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_id: eventId,  // ← TOP-LEVEL field (NOT in user_data)
    event_name: 'Lead',
    event_source_url: window.location.href,
    user_data: {
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
      external_id: 'user123',
      phone: '+18666499062',
      country: 'us'
    },
    custom_data: {
      content_name: 'Phone Call Initiated',
      value: 1.00,
      currency: 'USD'
    }
  })
})

console.log('[DEDUPLICATION] API event_id:', eventId)
```

#### **Server-Side: Receive and Forward to Meta**
```typescript
// In /app/api/meta-conversion/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { event_id, event_name, user_data, custom_data } = body
  
  // Use event_id from client (CRITICAL for deduplication)
  const eventId = event_id || generateEventId()
  
  // Log for verification
  console.log('[DEDUPLICATION] Server received event_id:', eventId)
  
  // Send to Meta Conversions API
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,  // ← SAME event_id as Pixel
          action_source: 'website',
          event_source_url: request.url,
          user_data: {
            // ... hashed user data
          },
          custom_data: custom_data
        }],
        access_token: process.env.META_CONVERSION_API_TOKEN
      })
    }
  )
  
  console.log('[DEDUPLICATION] Sent to Meta with event_id:', eventId)
}
```

### 3. Event ID Format Requirements

**Meta's Requirements:**
- Must be a string
- Can be alphanumeric with underscores, hyphens, or dots
- Max length: 64 characters
- Should be unique per event
- **MUST be identical** between Pixel and Conversions API

**Our Format:**
```
{timestamp}_{random_string}
Example: "1703123456789_abc123def45"
```

**Why This Format:**
- `Date.now()` ensures uniqueness
- `Math.random().toString(36)` adds randomness
- Simple and reliable
- Easy to debug (timestamp is human-readable)

---

## ✅ How to Verify Deduplication is Working

### 1. Check Browser Console Logs
When you click a CTA button, you should see:
```
[DEDUPLICATION] Client-side event tracking:
  event_id: "1703123456789_abc123"
  pixel_eventID: "1703123456789_abc123"
  api_event_id: "1703123456789_abc123"
  note: "SAME event_id sent to BOTH Pixel and Conversion API"

[Meta Pixel] Lead event tracked: hero_section eventID: 1703123456789_abc123
[Conversion API] Sending enhanced user_data:
  event_id: "1703123456789_abc123"
  ...

[DEDUPLICATION] ✓ Conversion API sent with event_id: 1703123456789_abc123
```

**✅ SUCCESS INDICATORS:**
- All three event_id values are IDENTICAL
- No warnings about missing event_id
- Both Pixel and API logs show the same event_id

**❌ ERROR INDICATORS:**
- Different event_id values
- "No event_id received from client" warning
- event_id is null or undefined

### 2. Check Vercel Server Logs
Go to Vercel → Your Project → Deployments → Function Logs

You should see:
```
╔════════════════════════════════════════════════════════════
║ [DEDUPLICATION] Server received event_id from client
║ event_id: 1703123456789_abc123
║ This MUST match the Pixel eventID for deduplication to work
╚════════════════════════════════════════════════════════════

[Conversion API] Meta API SUCCESS:
  event_id: 1703123456789_abc123
  events_received: 1
  fbtrace_id: ABC123...
```

**✅ SUCCESS INDICATORS:**
- Box with "Server received event_id from client"
- event_id matches browser console logs
- "Meta API SUCCESS" with events_received: 1

**❌ ERROR INDICATORS:**
- "⚠️ [DEDUPLICATION WARNING] No event_id received from client!"
- "Generated new event_id" (means client didn't send one)
- "This will NOT deduplicate with Pixel event"

### 3. Check Meta Events Manager
1. Go to: https://business.facebook.com/events_manager2/
2. Select your Pixel (ID: 1884617578809782)
3. Click on "Event Deduplication" tab

**✅ SUCCESS INDICATORS:**
- ✅ Green checkmark: "Deduplication is working correctly"
- ✅ "Event ID coverage: High"
- ✅ No warnings about missing deduplication keys

**❌ ERROR INDICATORS:**
- ⚠️ Warning: "Improve event ID coverage by fixing deduplication key issues"
- ⚠️ "Deduplication has not been set up for this event"
- ⚠️ "Event ID coverage: Low"

### 4. Check Meta Test Events
1. Go to: https://business.facebook.com/events_manager2/
2. Click "Test Events" tab
3. Generate a test conversion on your site
4. Check if the event appears with event_id

**✅ SUCCESS INDICATORS:**
- Event appears in Test Events
- `event_id` field is populated
- Both Pixel and Server events show the SAME event_id

**❌ ERROR INDICATORS:**
- `event_id` field is missing or empty
- Pixel and Server events have DIFFERENT event_ids
- Warning about duplicate events

---

## 🐛 Troubleshooting Guide

### Issue 1: "Deduplication has not been set up for this event"

**Possible Causes:**
1. event_id not being sent from client
2. event_id format is incorrect
3. event_id is different between Pixel and Conversions API
4. event_id is in the wrong location (e.g., inside user_data)

**Solutions:**
1. Check browser console for "[DEDUPLICATION]" logs
2. Verify event_id is the same in all logs
3. Confirm event_id is at TOP-LEVEL in API request (not in user_data)
4. Ensure event_id is passed as `eventID` to fbq('track')

### Issue 2: "Event ID coverage: Low"

**Possible Causes:**
1. Some events are not sending event_id
2. event_id generation is failing in some cases
3. Different CTA buttons are using different implementations

**Solutions:**
1. Check ALL CTA buttons (page.tsx AND sticky-call-button.tsx)
2. Ensure generateEventId() is called consistently
3. Add error handling for event_id generation
4. Verify all fetch() calls include event_id

### Issue 3: event_id is Different Between Pixel and API

**Possible Causes:**
1. event_id is being regenerated on the server
2. Timing issue (API call happens before Pixel event)
3. Multiple generateEventId() calls for same event

**Solutions:**
1. Generate event_id ONCE at the beginning
2. Pass the SAME event_id to both Pixel and API
3. Add console.log() to verify event_id at each step
4. Check server logs to ensure event_id matches client

### Issue 4: _missing_event in Meta Events Manager

**What it is:**
- A placeholder event name when Meta can't identify the event type
- Usually means event data is malformed or incomplete

**Possible Causes:**
1. Event sent without event_name
2. Invalid event_name value
3. Missing required parameters
4. API error during event submission

**Solutions:**
1. Always include event_name: 'Lead' in API request
2. Check Meta API response for errors
3. Verify event_name is a standard Meta event (Lead, Purchase, etc.)
4. Review Vercel logs for API errors

### Issue 5: Events Not Appearing in Meta

**Possible Causes:**
1. Production domain check is blocking events
2. ACCESS_TOKEN is missing or invalid
3. Network error during API call
4. Meta API is rejecting events

**Solutions:**
1. Verify hostname === 'www.neighborcoverage.com'
2. Check META_CONVERSION_API_TOKEN in .env.local
3. Check Vercel logs for "Meta API ERROR"
4. Test with Meta's Test Events tool

---

## 📊 Expected Timeline for Meta to Recognize Deduplication

After implementing deduplication correctly:

| Timeframe | What to Expect |
|-----------|----------------|
| **Immediately** | Browser console logs show matching event_id |
| **Within 5 minutes** | Server logs confirm event_id received |
| **Within 1 hour** | Meta Test Events show event_id |
| **Within 24 hours** | Event Deduplication tab shows "Working" status |
| **Within 48 hours** | Event ID Coverage increases to "High" |
| **Within 7 days** | Deduplication metrics stabilize |

**Note:** Meta's dashboard updates are NOT real-time. It can take 24-48 hours for deduplication status to update in Events Manager.

---

## 🔍 What is _missing_event?

### Definition
`_missing_event` is a placeholder event name that Meta creates when it receives an event but cannot determine what type of event it is.

### Common Causes
1. **Missing event_name parameter**: API request doesn't include `event_name: 'Lead'`
2. **Invalid event_name**: Using a custom event name that Meta doesn't recognize
3. **Malformed request**: JSON is invalid or missing required fields
4. **API error**: Meta API returned an error, but Pixel still tracked

### How to Investigate
1. Check Vercel server logs for the timestamp of _missing_event
2. Look for errors in Meta API response
3. Verify event_name is included in ALL API requests
4. Check if custom_data or user_data is malformed

### Example Investigation
```
// If _missing_event appears at "3 hours ago"
// Check Vercel logs for that timestamp

// Look for:
[Conversion API] Meta API ERROR: {
  "error": {
    "message": "Invalid parameter",
    "type": "OAuthException"
  }
}

// Or:
[Conversion API] Sending request without event_name
```

---

## 🎓 Best Practices

### 1. Generate event_id Once Per Event
```typescript
// ✅ GOOD
const eventId = generateEventId()
fbq('track', 'Lead', {}, { eventID: eventId })
sendToAPI({ event_id: eventId })

// ❌ BAD
fbq('track', 'Lead', {}, { eventID: generateEventId() })
sendToAPI({ event_id: generateEventId() })  // Different ID!
```

### 2. Always Include event_id at Top Level
```typescript
// ✅ GOOD
fetch('/api/meta-conversion', {
  body: JSON.stringify({
    event_id: eventId,  // ← Top level
    user_data: { /* ... */ }
  })
})

// ❌ BAD
fetch('/api/meta-conversion', {
  body: JSON.stringify({
    user_data: {
      event_id: eventId,  // ← Inside user_data (WRONG!)
    }
  })
})
```

### 3. Log event_id at Every Step
```typescript
// Client
console.log('[DEDUPLICATION] Generated event_id:', eventId)
console.log('[DEDUPLICATION] Sent to Pixel with eventID:', eventId)
console.log('[DEDUPLICATION] Sent to API with event_id:', eventId)

// Server
console.log('[DEDUPLICATION] Received event_id:', eventId)
console.log('[DEDUPLICATION] Sending to Meta with event_id:', eventId)
```

### 4. Handle Errors Gracefully
```typescript
try {
  const eventId = generateEventId()
  if (!eventId) throw new Error('Failed to generate event_id')
  
  fbq('track', 'Lead', {}, { eventID: eventId })
  await sendToAPI({ event_id: eventId })
} catch (error) {
  console.error('[DEDUPLICATION ERROR]', error)
  // Event still tracks, but without deduplication
}
```

### 5. Test on Localhost Before Production
```typescript
// Add debugging for localhost
if (window.location.hostname === 'localhost') {
  console.log('🧪 [TEST MODE] Event would be sent with:', {
    event_id: eventId,
    pixel_eventID: eventId,
    api_event_id: eventId
  })
}
```

---

## 📚 Additional Resources

### Meta Documentation
- [Conversions API Overview](https://developers.facebook.com/docs/marketing-api/conversions-api/)
- [Event Deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)
- [Meta Pixel Best Practices](https://developers.facebook.com/docs/meta-pixel/best-practices/)

### Our Implementation Files
- **Client-side tracking**: `/nextjs_space/app/page.tsx`
- **Sticky button**: `/nextjs_space/components/sticky-call-button.tsx`
- **Server API**: `/nextjs_space/app/api/meta-conversion/route.ts`
- **Pixel initialization**: `/nextjs_space/app/layout.tsx`

### Meta Events Manager
- [Events Manager Dashboard](https://business.facebook.com/events_manager2/)
- [Test Events Tool](https://business.facebook.com/events_manager2/test_events)
- Pixel ID: **1884617578809782**

---

## 🚀 Next Steps

1. **Deploy to Production**
   ```bash
   cd /home/ubuntu/auto_insurance_splash
   git add .
   git commit -m "Fix: Implement proper Meta event deduplication"
   git push origin main
   ```

2. **Test on Production Site**
   - Visit www.neighborcoverage.com
   - Open browser console
   - Click a CTA button
   - Verify "[DEDUPLICATION]" logs show matching event_id

3. **Monitor Vercel Logs**
   - Go to Vercel dashboard
   - Check Function Logs for deduplication messages
   - Verify no "⚠️ DEDUPLICATION WARNING" messages

4. **Check Meta Events Manager (24 hours later)**
   - Visit Events Manager
   - Check "Event Deduplication" tab
   - Verify "Deduplication is working correctly"

5. **Monitor for 7 Days**
   - Check Event ID Coverage daily
   - Should increase to 80-100% (High coverage)
   - Conversion counts should stabilize (no longer 2x inflated)

---

## ✅ Summary

**What We Fixed:**
- ✅ event_id is now generated ONCE on the client
- ✅ SAME event_id is sent to BOTH Pixel and Conversions API
- ✅ event_id is at TOP-LEVEL in API request (not in user_data)
- ✅ Comprehensive logging for verification
- ✅ Server reads event_id from correct location

**Expected Results:**
- ✅ Meta will deduplicate events automatically
- ✅ Conversion counts will be accurate (not inflated)
- ✅ Event Match Quality will remain high (7.0+/10)
- ✅ Campaign reporting will be reliable

**Verification:**
- ✅ Browser console shows matching event_id in all logs
- ✅ Vercel logs show "Server received event_id from client"
- ✅ Meta Events Manager shows "Deduplication is working"
- ✅ No more "Improve event ID coverage" warnings

---

*Last Updated: December 18, 2024*
*Implementation: NeighborCoverage Auto Insurance*
*Pixel ID: 1884617578809782*
