# Retreaver → Meta Conversions API Integration Guide
## Track ONLY Qualified Calls as Conversions

**Project:** NeighborCoverage Auto Insurance  
**Purpose:** Send qualified call events from Retreaver to Meta Conversions API  
**Goal:** Eliminate 67% false positive rate by tracking real calls, not button clicks  

---

## 🎯 Problem Statement

**Current Issue:**
- Meta counts button CLICKS as conversions
- 3 Meta conversions recorded
- Only 1 actual qualified call happened
- **67% false positive rate**

**Root Cause:**
```javascript
<a href="tel:8666499062" onClick={trackEvent}>
  // Event fires on CLICK, not on actual call
</a>
```

**Solution:**
- Remove Meta tracking from onClick
- Let Retreaver detect actual calls
- Send webhook from Retreaver → Your server → Meta Conversions API
- Only qualified calls (≥30 seconds) trigger Meta conversions

---

## Architecture Overview

### Current Flow (WRONG)
```
┌─────────────┐
│ User clicks │
│   button    │
└──────┬──────┘
       │
       ├─────────────────► Meta Pixel "Lead" ✗
       │
       ├─────────────────► Meta Conversion API "Lead" ✗
       │
       └─────────────────► tel: link opens phone
                           │
                           └──► Call may not happen
                                (but Meta already counted it)
```

### New Flow (CORRECT)
```
┌─────────────┐
│ User clicks │
│   button    │
└──────┬──────┘
       │
       └─────────────────► tel: link opens phone
                           │
                           ▼
                    ┌──────────────┐
                    │  Phone dials │
                    │ Retreaver #  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Call connects│
                    │  Duration ≥  │
                    │  30 seconds  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │ Retreaver sends  │
                    │ webhook to YOUR  │
                    │     server       │
                    └──────┬───────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ YOUR server sends    │
                    │ "QualifiedCall" to   │
                    │ Meta Conversion API  │
                    └──────────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │ Meta counts REAL │
                    │   conversion ✓   │
                    └──────────────────┘
```

---

## Implementation Steps

### Step 1: Create Webhook Endpoint in Next.js

#### 1.1 Create API Route

**File:** `nextjs_space/app/api/retreaver-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Meta Conversions API Configuration
const PIXEL_ID = '1884617578809782'
const ACCESS_TOKEN = process.env.META_CONVERSION_API_TOKEN || ''
const API_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`

// Retreaver Webhook Secret (for security verification)
const RETREAVER_WEBHOOK_SECRET = process.env.RETREAVER_WEBHOOK_SECRET || ''

// Hash function for customer data
function hashData(data: string, type: 'email' | 'phone' | 'text' | 'country' = 'text'): string {
  let normalized = data.trim()
  
  if (type === 'phone') {
    // Remove all non-digits, keep country code
    normalized = normalized.replace(/[^\d]/g, '')
  } else {
    normalized = normalized.toLowerCase()
  }
  
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

// Verify Retreaver webhook signature (security)
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!RETREAVER_WEBHOOK_SECRET) {
    console.warn('⚠️  RETREAVER_WEBHOOK_SECRET not configured')
    return true // Allow during testing, remove in production
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', RETREAVER_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)
    
    // Verify webhook signature (security)
    const signature = request.headers.get('x-retreaver-signature') || ''
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    console.log('📞 [Retreaver Webhook] Received call data:', {
      call_id: body.call?.id,
      caller: body.call?.caller_number,
      duration: body.call?.duration,
      status: body.call?.status
    })
    
    // Extract call data
    const call = body.call || {}
    const duration = parseInt(call.duration) || 0
    const status = call.status || ''
    const callerNumber = call.caller_number || ''
    
    // QUALIFICATION CRITERIA
    const isQualified = 
      status === 'completed' &&  // Call completed successfully
      duration >= 30              // At least 30 seconds
    
    if (!isQualified) {
      console.log('⏭️  [Retreaver] Call not qualified - skipping Meta event', {
        status,
        duration,
        reason: duration < 30 ? 'Duration too short' : 'Call not completed'
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Call received but not qualified',
        qualified: false
      })
    }
    
    console.log('✅ [Retreaver] QUALIFIED CALL - sending to Meta', {
      duration,
      status
    })
    
    // Generate unique event_id for this call
    const eventId = `retreaver_${call.id}_${Date.now()}`
    
    // Get call timestamp (or use current time)
    const callTimestamp = call.completed_at 
      ? Math.floor(new Date(call.completed_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000)
    
    // Build user_data with caller information
    const userData: any = {}
    
    // Add hashed phone number if available
    if (callerNumber) {
      // Normalize to E.164 format (add +1 for US numbers)
      const normalizedPhone = callerNumber.startsWith('+') 
        ? callerNumber.replace(/[^\d]/g, '')
        : '1' + callerNumber.replace(/[^\d]/g, '')
      
      userData.ph = [hashData(normalizedPhone, 'phone')]
      console.log('📱 [Retreaver] Caller phone:', callerNumber, '→ normalized and hashed')
    }
    
    // Add country (US)
    userData.country = [hashData('us', 'country')]
    
    // Build Meta Conversion API payload
    const conversionPayload = {
      data: [
        {
          event_name: 'QualifiedCall',  // NEW event name
          event_time: callTimestamp,
          event_id: eventId,
          event_source_url: 'https://www.neighborcoverage.com',
          action_source: 'phone_call',  // Important: tells Meta this is a phone conversion
          user_data: userData,
          custom_data: {
            content_name: 'Qualified Phone Call',
            content_category: 'auto_insurance',
            call_duration: duration,
            call_id: call.id,
            phone_number: '(866) 649-9062',
            value: 1.00,
            currency: 'USD'
          }
        }
      ],
      access_token: ACCESS_TOKEN
    }
    
    console.log('🚀 [Retreaver → Meta] Sending QualifiedCall event:', {
      event_id: eventId,
      event_time: new Date(callTimestamp * 1000).toISOString(),
      call_duration: duration,
      action_source: 'phone_call'
    })
    
    // Send to Meta Conversions API
    const metaResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversionPayload)
    })
    
    const metaData = await metaResponse.json()
    
    if (metaData.error) {
      console.error('❌ [Meta API] Error:', metaData.error)
      return NextResponse.json({ 
        success: false, 
        error: metaData.error 
      }, { status: 500 })
    }
    
    console.log('✅ [Meta API] QualifiedCall event sent successfully:', {
      events_received: metaData.events_received,
      fbtrace_id: metaData.fbtrace_id
    })
    
    return NextResponse.json({ 
      success: true,
      qualified: true,
      event_id: eventId,
      meta_response: metaData
    })
    
  } catch (error) {
    console.error('❌ [Retreaver Webhook] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'retreaver-webhook',
    timestamp: new Date().toISOString()
  })
}
```

#### 1.2 Add Environment Variables

**File:** `nextjs_space/.env.local`

Add this line:
```bash
RETREAVER_WEBHOOK_SECRET=your_retreaver_webhook_secret_here
```

**How to get the secret:**
1. Log into Retreaver dashboard
2. Go to Settings → Webhooks
3. Copy the webhook secret key
4. Paste it in `.env.local`

#### 1.3 Deploy to Vercel

```bash
# Commit changes
cd /home/ubuntu/auto_insurance_splash
git add nextjs_space/app/api/retreaver-webhook/route.ts
git add nextjs_space/.env.local
git commit -m "Add Retreaver webhook endpoint for qualified call tracking"
git push origin main

# Verify deployment
# Check Vercel dashboard for successful build
```

**Your webhook URL will be:**
```
https://www.neighborcoverage.com/api/retreaver-webhook
```

---

### Step 2: Configure Retreaver Webhook

#### 2.1 Log into Retreaver Dashboard

```
1. Go to https://app.retreaver.com
2. Log in with your credentials
3. Navigate to your NeighborCoverage campaign
```

#### 2.2 Create Webhook

**Path:** Settings → Webhooks → Add Webhook

**Configuration:**
```
Webhook Name: Meta Qualified Calls
URL: https://www.neighborcoverage.com/api/retreaver-webhook
Method: POST
Content-Type: application/json
```

**Trigger Conditions:**
```
✓ Call completed
✓ Call duration ≥ 30 seconds
```

**Events to send:**
- [x] Call Completed
- [ ] Call Started (not needed)
- [ ] Call Failed (not needed)

#### 2.3 Test Webhook

**In Retreaver:**
```
1. Click "Test Webhook" button
2. Enter sample call data:
   - Duration: 45 seconds
   - Status: completed
3. Click "Send Test"
```

**Expected Response:**
```json
{
  "success": true,
  "qualified": true,
  "event_id": "retreaver_12345_1702857392847",
  "meta_response": {
    "events_received": 1,
    "fbtrace_id": "ABC123..."
  }
}
```

✅ **SUCCESS:** Test webhook returns success  
❌ **FAILURE:** Check Vercel logs for errors

#### 2.4 Enable Webhook

```
1. Toggle webhook to "Enabled"
2. Save changes
3. Monitor initial calls
```

---

### Step 3: Create "QualifiedCall" Conversion Event in Meta

#### 3.1 Open Meta Events Manager

```
1. Go to https://business.facebook.com/events_manager2/
2. Select Pixel 1884617578809782
3. Click "Settings" in left sidebar
```

#### 3.2 Add Custom Conversion

**Path:** Events Manager → Custom Conversions → Create Custom Conversion

**Configuration:**
```
Name: Qualified Call
Description: Phone call that lasted ≥30 seconds
Category: Lead
Event: QualifiedCall (custom event from Retreaver webhook)
```

**Value:**
```
Static value: $1.00
Currency: USD
```

#### 3.3 Verify Event in Test Mode

**Make a real test call:**
```
1. Open https://www.neighborcoverage.com on your phone
2. Click "CALL NOW"
3. Call (866) 649-9062
4. Stay on line for 40+ seconds
5. Hang up
```

**Check Meta Events Manager:**
```
1. Go to Test Events
2. Wait 1-2 minutes for webhook to process
3. Look for "QualifiedCall" event
4. Verify action_source = "phone_call"
```

---

### Step 4: Update Campaign Optimization

#### 4.1 Create New Campaign (Recommended)

**Why?** 
- Existing campaign optimized for "Lead" (button clicks)
- New campaign will optimize for "QualifiedCall" (real calls)

**Campaign Setup:**
```
Campaign Objective: Conversions
Conversion Event: QualifiedCall (custom conversion)
Budget: Start with same as current campaign
Audience: Same targeting
Creative: Same ads
```

**Learning Phase:**
- Meta needs ~50 "QualifiedCall" conversions to optimize
- Keep running for 1-2 weeks to gather data
- Compare performance to old campaign

#### 4.2 Run Both Campaigns Simultaneously (A/B Test)

**Campaign A (Old):**
- Optimization: Lead (button clicks)
- Budget: 50% of total
- Track: Cost per Lead

**Campaign B (New):**
- Optimization: QualifiedCall (real calls)
- Budget: 50% of total
- Track: Cost per QualifiedCall

**Comparison Metrics:**
```
│ Metric                  │ Campaign A (Lead) │ Campaign B (QualifiedCall) │
├─────────────────────────┼───────────────────┼────────────────────────────┤
│ Conversions             │ Higher (includes  │ Lower (only real calls)    │
│                         │ button clicks)    │                            │
│ Cost per conversion     │ Lower (inflated)  │ Higher (accurate)          │
│ Conversion quality      │ 33% qualify       │ 100% qualify               │
│ True cost per call      │ 3x reported cost  │ Accurate reporting         │
│ ROAS                    │ Inflated          │ Accurate                   │
```

**Expected Outcome:** Campaign B delivers fewer but higher quality conversions

---

### Step 5: Remove Meta Tracking from Button Clicks

⚠️ **IMPORTANT:** Only do this AFTER Retreaver webhook is working!

#### 5.1 Update page.tsx

**File:** `nextjs_space/app/page.tsx`

**BEFORE:**
```typescript
const trackCallInitiated = (location: string) => {
  // ... GA4 tracking ...
  
  // Meta Pixel - REMOVE THIS
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', { /* ... */ })
  }
  
  // Conversion API - REMOVE THIS
  fetch('/api/meta-conversion', { /* ... */ })
}
```

**AFTER:**
```typescript
const trackCallInitiated = (location: string) => {
  // ONLY track GA4 for internal analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'call_initiated', {
      event_category: 'conversion',
      event_label: location,
      offer_type: 'auto_insurance',
      phone_number: PHONE_NUMBER,
      value: 1,
    })
    console.log('[GA4] call_initiated event tracked (internal only):', location)
  }
  
  // NO META TRACKING HERE
  // Meta will receive event from Retreaver webhook after call completes
  console.log('[Tracking] Call initiated - waiting for Retreaver to confirm qualified call')
}
```

#### 5.2 Update sticky-call-button.tsx

**File:** `nextjs_space/components/sticky-call-button.tsx`

**BEFORE:**
```typescript
const trackStickyButtonClick = () => {
  // ... GA4 tracking ...
  
  // Meta Pixel - REMOVE THIS
  (window as any).fbq('track', 'Lead', { /* ... */ })
  
  // Conversion API - REMOVE THIS
  fetch('/api/meta-conversion', { /* ... */ })
}
```

**AFTER:**
```typescript
const trackStickyButtonClick = () => {
  // ONLY track GA4 for internal analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'cta_click', {
      event_category: 'engagement',
      event_label: 'sticky_mobile_button',
      offer_type: 'auto_insurance',
      phone_number: phoneNumber,
    })
    (window as any).gtag('event', 'call_initiated', {
      event_category: 'conversion',
      event_label: 'sticky_mobile_button',
      offer_type: 'auto_insurance',
      phone_number: phoneNumber,
      value: 1,
    })
    console.log('[GA4] events tracked (internal only): cta_click, call_initiated')
  }
  
  // NO META TRACKING HERE
  console.log('[Tracking] Call initiated - Retreaver will handle Meta conversion')
}
```

#### 5.3 Deploy Changes

```bash
cd /home/ubuntu/auto_insurance_splash
git add nextjs_space/app/page.tsx
git add nextjs_space/components/sticky-call-button.tsx
git commit -m "Remove Meta tracking from button clicks - use Retreaver webhook only"
git push origin main
```

---

## Testing & Verification

### Test 1: End-to-End Qualified Call

**Steps:**
```
1. Open https://www.neighborcoverage.com on your phone
2. Click "CALL NOW" button
3. Observe: NO Meta Pixel "Lead" event fires
4. Call (866) 649-9062
5. Stay on line for 40+ seconds (speak with agent or music)
6. Hang up
7. Wait 1-2 minutes
```

**Expected Results:**

**Retreaver Dashboard:**
```
✓ Call appears in call log
✓ Duration: 40+ seconds
✓ Status: Completed
✓ Webhook: Sent successfully
```

**Vercel Logs:**
```
📞 [Retreaver Webhook] Received call data: { call_id: 12345, duration: 42 }
✅ [Retreaver] QUALIFIED CALL - sending to Meta
🚀 [Retreaver → Meta] Sending QualifiedCall event
✅ [Meta API] QualifiedCall event sent successfully
```

**Meta Events Manager:**
```
Event: QualifiedCall
Action Source: phone_call
Custom Data: { call_duration: 42, call_id: 12345 }
Status: Received
```

### Test 2: Unqualified Call (Too Short)

**Steps:**
```
1. Call (866) 649-9062
2. Hang up after 10 seconds
3. Wait 1-2 minutes
```

**Expected Results:**

**Retreaver Dashboard:**
```
✓ Call appears in call log
✓ Duration: 10 seconds
✓ Status: Completed
✓ Webhook: Sent successfully
```

**Vercel Logs:**
```
📞 [Retreaver Webhook] Received call data: { call_id: 12346, duration: 10 }
⏭️  [Retreaver] Call not qualified - skipping Meta event
   Reason: Duration too short
```

**Meta Events Manager:**
```
NO QualifiedCall event (correctly filtered out)
```

### Test 3: Button Click Without Call

**Steps:**
```
1. Open https://www.neighborcoverage.com
2. Click "CALL NOW" button
3. Close phone dialer immediately (don't call)
4. Wait 1-2 minutes
```

**Expected Results:**

**Browser Console:**
```
[GA4] call_initiated event tracked (internal only)
[Tracking] Call initiated - Retreaver will handle Meta conversion
```

**Meta Events Manager:**
```
NO Lead event
NO QualifiedCall event
(Button click is NOT tracked as conversion ✓)
```

**Retreaver Dashboard:**
```
NO call record (user didn't dial)
```

**Result:** ✅ False positive eliminated!

---

## Monitoring & Optimization

### Daily Checks (Week 1-2)

```
□ Check Retreaver webhook success rate (should be 100%)
□ Verify Vercel logs show no errors
□ Compare Retreaver calls to Meta QualifiedCall events (should match 1:1)
□ Monitor campaign learning phase progress
```

### Weekly Analysis

```
□ Calculate cost per QualifiedCall
□ Compare to old cost per Lead (will be higher but more accurate)
□ Calculate return on ad spend (ROAS) using REAL conversions
□ Adjust bids based on qualified call volume
```

### Key Metrics to Track

| Metric | Formula | Target |
|--------|---------|--------|
| Qualified Call Rate | Retreaver qualified / Retreaver total | 30-50% |
| Webhook Success Rate | Successful webhooks / Total calls | 100% |
| Meta Match Rate | Meta QualifiedCall / Retreaver qualified | 100% |
| False Positive Rate | (Meta Lead - Retreaver calls) / Meta Lead | 0% |

---

## Troubleshooting

### Issue: Webhook Not Firing

**Symptoms:**
- Retreaver shows call completed
- No event in Vercel logs
- No event in Meta

**Solutions:**
1. Check Retreaver webhook status (Enabled?)
2. Verify webhook URL is correct
3. Test webhook manually in Retreaver dashboard
4. Check Retreaver webhook logs for errors

### Issue: Webhook Fires But Meta Doesn't Receive

**Symptoms:**
- Vercel logs show "QualifiedCall event sent"
- No event in Meta Events Manager

**Solutions:**
1. Check ACCESS_TOKEN is correct in `.env.local`
2. Verify Pixel ID (1884617578809782) is correct
3. Check Meta API response in Vercel logs for errors
4. Ensure custom conversion "QualifiedCall" is created in Meta

### Issue: All Calls Sending, Not Just Qualified

**Symptoms:**
- Short calls (<30 seconds) appearing in Meta
- No "Call not qualified" logs in Vercel

**Solutions:**
1. Check duration filtering logic in webhook endpoint
2. Verify Retreaver is sending duration field correctly
3. Add more detailed logging to webhook endpoint

---

## Campaign Optimization Strategy

### Phase 1: Baseline (Week 1)

**Goal:** Establish accurate conversion tracking

```
- Run Retreaver webhook alongside old Lead tracking
- Don't change campaigns yet
- Collect data on qualified call rate
- Calculate true cost per qualified call
```

### Phase 2: Transition (Week 2-3)

**Goal:** Shift optimization to qualified calls

```
- Create new campaign optimized for QualifiedCall
- Split budget 50/50 between old and new
- Monitor learning phase
- Compare performance
```

### Phase 3: Full Optimization (Week 4+)

**Goal:** Maximize qualified calls

```
- Allocate budget based on performance
- Pause old Lead campaign if new performs better
- Optimize targeting for high-intent users
- Test creative variations that drive calls
```

### Expected Outcomes

**Short Term (Week 1-2):**
- Reported conversions will DROP (because false positives removed)
- Cost per conversion will INCREASE (more accurate)
- This is GOOD - you're seeing true numbers now

**Medium Term (Week 3-4):**
- Meta learns to optimize for qualified calls
- Targeting improves to reach call-likely users
- Cost per qualified call stabilizes

**Long Term (Month 2+):**
- Better ROAS due to accurate conversion data
- Higher quality leads from qualified calls
- Lower wasted spend on non-callers

---

## Code Examples

### Example: Custom Qualification Logic

Want to qualify calls based on different criteria? Update the webhook:

```typescript
// EXAMPLE: Qualify only calls from specific area codes
const isQualified = 
  status === 'completed' &&
  duration >= 30 &&
  ['602', '480', '623'].includes(callerNumber.substring(0, 3)) // Phoenix area codes

// EXAMPLE: Qualify based on call outcome tags (from Retreaver)
const isQualified = 
  status === 'completed' &&
  duration >= 30 &&
  (call.tags || []).includes('hot_lead') // Tag set by agent during call

// EXAMPLE: Time-of-day filtering
const callHour = new Date(call.completed_at).getHours()
const isBusinessHours = callHour >= 8 && callHour < 18
const isQualified = 
  status === 'completed' &&
  duration >= 30 &&
  isBusinessHours
```

### Example: Multiple Conversion Events

Send different events based on call quality:

```typescript
// Determine event name based on duration
let eventName = 'QualifiedCall' // Default

if (duration >= 120) {
  eventName = 'HighQualityCall' // 2+ minutes
} else if (duration >= 60) {
  eventName = 'MediumQualityCall' // 1-2 minutes
} else if (duration >= 30) {
  eventName = 'BasicQualifiedCall' // 30-60 seconds
}

// Send to Meta with appropriate event name
const conversionPayload = {
  data: [{
    event_name: eventName, // Dynamic based on call quality
    // ... rest of payload
  }]
}
```

Then create separate campaigns optimizing for each event type!

---

## Security Best Practices

### 1. Verify Webhook Signatures

Always verify Retreaver webhook signatures:

```typescript
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', RETREAVER_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

### 2. Whitelist Retreaver IPs (Optional)

In Vercel, add IP whitelist:

```typescript
// At top of webhook handler
const RETREAVER_IPS = ['1.2.3.4', '5.6.7.8'] // Get from Retreaver docs
const clientIp = request.headers.get('x-forwarded-for') || ''

if (!RETREAVER_IPS.includes(clientIp)) {
  return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 })
}
```

### 3. Rate Limiting

Prevent abuse:

```typescript
// Simple rate limiting (production should use Redis)
const callTimestamps: number[] = []
const now = Date.now()

// Remove old timestamps (older than 1 minute)
while (callTimestamps.length && callTimestamps[0] < now - 60000) {
  callTimestamps.shift()
}

// Check rate
if (callTimestamps.length > 100) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}

callTimestamps.push(now)
```

---

## Next Steps

1. **Today:**
   - [ ] Create webhook endpoint (`/api/retreaver-webhook/route.ts`)
   - [ ] Add `RETREAVER_WEBHOOK_SECRET` to `.env.local`
   - [ ] Deploy to Vercel
   - [ ] Test webhook with GET request to verify it's live

2. **This Week:**
   - [ ] Configure Retreaver webhook settings
   - [ ] Test with real calls (make 2-3 test calls)
   - [ ] Verify events appearing in Meta Events Manager
   - [ ] Create "QualifiedCall" custom conversion in Meta

3. **Next Week:**
   - [ ] Create new campaign optimized for QualifiedCall
   - [ ] Run A/B test (Lead vs QualifiedCall)
   - [ ] Remove Meta tracking from button clicks (Phase 5.1, 5.2)
   - [ ] Monitor learning phase

4. **Ongoing:**
   - [ ] Monitor webhook success rate daily
   - [ ] Adjust qualification criteria as needed
   - [ ] Optimize campaign targeting
   - [ ] Calculate true ROAS

---

## Support Resources

### Retreaver
- Webhook docs: https://docs.retreaver.com/webhooks
- API reference: https://docs.retreaver.com/api
- Support: support@retreaver.com

### Meta
- Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api
- Events Manager: https://business.facebook.com/events_manager2/
- Custom conversions: https://www.facebook.com/business/help/408355162668521

### Next.js
- API routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Environment variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Next Review:** After first 50 qualified calls
