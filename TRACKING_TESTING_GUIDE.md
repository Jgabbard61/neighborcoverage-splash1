# Meta Tracking Testing Guide
## Comprehensive Testing for NeighborCoverage Campaign

**Project:** NeighborCoverage Auto Insurance Splash Page  
**Meta Pixel ID:** 1884617578809782  
**Phone:** (866) 649-9062  
**Created:** December 18, 2024  

---

## 🎯 Purpose

This guide provides step-by-step instructions to test and verify your Meta tracking implementation, identify false conversions, and ensure accurate campaign measurement.

---

## Section A: Test Event Deduplication

### What is Deduplication?
Event deduplication ensures that when you send the same event from both Meta Pixel (browser) and Conversions API (server), Meta only counts it **once**. Without proper deduplication, you get inflated conversion numbers.

### Current Implementation Status
✅ **Deduplication is properly configured** in your code:
- Both client and server use the same `event_id`
- `event_id` is at top-level (not nested in `user_data`)
- Event names match exactly ("Lead")

### Step-by-Step Testing

#### Test 1: Verify event_id Matching

**1.1 Open Browser Console**
```
1. Visit https://www.neighborcoverage.com in Chrome
2. Right-click → Inspect → Console tab
3. Keep console open during testing
```

**1.2 Click Call Button**
```
Click any "CALL NOW" button on the page
```

**1.3 Check Browser Console Logs**
Look for these exact log entries:
```javascript
[DEDUPLICATION] Client-side event tracking:
{
  event_id: "1702857392847_abc123xyz",
  pixel_eventID: "1702857392847_abc123xyz",
  api_event_id: "1702857392847_abc123xyz",
  note: "SAME event_id sent to BOTH Pixel and Conversion API for deduplication"
}

[Meta Pixel] Lead event tracked, eventID: 1702857392847_abc123xyz
[Conversion API] ✓ Conversion API sent with event_id: 1702857392847_abc123xyz
```

✅ **SUCCESS**: Both logs show the SAME event_id  
❌ **FAILURE**: event_ids don't match → deduplication broken

#### Test 2: Check Meta Events Manager Deduplication Status

**2.1 Open Meta Events Manager**
```
1. Go to https://business.facebook.com/events_manager2/
2. Select Pixel 1884617578809782
3. Click "Test Events" in left sidebar
```

**2.2 Open Website in Test Mode**
```
1. In Test Events, enter your browser cookie ID (found in events)
2. Click "Open website" or manually visit your site
3. Click a call button
```

**2.3 Verify Deduplication Indicator**
Look for events with:
```
Event Name: Lead
Source: Both Browser and Server (deduplicated) ✓
Event ID: Shows matching ID
```

✅ **SUCCESS**: Shows "deduplicated" badge  
❌ **FAILURE**: Shows 2 separate Lead events → deduplication not working

#### Test 3: Verify in Vercel Logs

**3.1 Access Vercel Logs**
```
1. Go to https://vercel.com/dashboard
2. Select neighborcoverage project
3. Click "Logs" tab
4. Filter for "DEDUPLICATION"
```

**3.2 Check Server-Side Logs**
Look for:
```
║ [DEDUPLICATION] Server received event_id from client
║ event_id: 1702857392847_abc123xyz
║ This MUST match the Pixel eventID for deduplication to work
```

✅ **SUCCESS**: Server logs show event_id received  
❌ **FAILURE**: Warning "No event_id received from client"

### Common Deduplication Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| 2 Lead events in Meta | event_id not matching | Check browser console for matching IDs |
| No deduplication badge | event_id in wrong location | Verify event_id is top-level, not in user_data |
| Server warning | Client not sending event_id | Check client-side code for eventID parameter |

---

## Section B: Test Pixel Firing

### What to Test
1. Meta Pixel loads correctly
2. Events fire on button clicks
3. Event parameters are correct
4. No double-counting

### Step-by-Step Testing

#### Test 1: Verify Pixel Installation

**1.1 Use Meta Pixel Helper Extension**
```
1. Install: https://chrome.google.com/webstore (search "Meta Pixel Helper")
2. Visit https://www.neighborcoverage.com
3. Click extension icon in toolbar
```

**1.2 Check Pixel Status**
You should see:
```
✓ Pixel ID: 1884617578809782
✓ Status: Active
✓ PageView event detected
✓ No errors
```

❌ **Common Issues:**
- "No Pixel Found" → Pixel not loading
- "Multiple Pixels" → Duplicate pixel code
- "PageView fired twice" → Double initialization

#### Test 2: Test Event Firing on Button Click

**2.1 Open Browser Console + Meta Pixel Helper**
```
1. Console: Right-click → Inspect → Console
2. Pixel Helper: Click extension icon
3. Keep both open
```

**2.2 Click "CALL NOW" Button**
```
Click any call button on the page
```

**2.3 Verify Event in Pixel Helper**
Should show:
```
Lead event detected ✓
Content Name: Phone Call Initiated
Value: 1.00
Currency: USD
Event ID: [unique ID]
```

**2.4 Verify Event in Console**
Should show:
```javascript
[Meta Pixel] Lead event tracked, eventID: 1702857392847_abc123xyz
```

#### Test 3: Check Event Parameters

**3.1 Open Meta Events Manager Test Events**
```
1. Events Manager → Test Events
2. Enter your browser cookie
3. Click call button on your site
```

**3.2 Verify Event Parameters**
Click on the Lead event to see:
```
Event Parameters:
- content_name: "Phone Call Initiated" ✓
- content_category: "auto_insurance" ✓
- value: 1.00 ✓
- currency: "USD" ✓

Customer Information:
- fbc: fb.1.1234567890.IwAR... ✓
- fbp: fb.1.1234567890.1234567890 ✓
- external_id: nc_1702857392847_abc123xyz ✓
- phone: [hashed] ✓
- country: [hashed] ✓
```

✅ **SUCCESS**: All parameters present  
❌ **FAILURE**: Missing parameters → lower Event Match Quality

#### Test 4: Verify No Duplicate Events

**4.1 Clear Console**
```
Click 🚫 icon in console to clear logs
```

**4.2 Click Button Once**
```
Click ONE call button
```

**4.3 Count Events**
Should see:
```
- 1x "[Meta Pixel] Lead event tracked"
- 1x "[Conversion API] success"
```

❌ **FAILURE**: If you see multiple events from ONE click → duplicate tracking bug

### Pixel Troubleshooting

| Symptom | Diagnosis | Solution |
|---------|-----------|----------|
| No Pixel Helper detection | Pixel not loading | Check <head> section for pixel code |
| Pixel loads but no events | onClick handler broken | Check browser console for JS errors |
| Events fire twice per click | Double initialization | Check layout.tsx for duplicate pixel code |
| Low Event Match Quality | Missing customer data | Add fbc, fbp, external_id to events |

---

## Section C: Test Call Tracking

### Current Problem Identified

⚠️ **CRITICAL ISSUE**: Your "Lead" event fires on button **CLICK**, not actual call connection!

**Current Flow (WRONG):**
```
User clicks button → Event fires immediately → Meta counts conversion
↓
User's phone opens dialer → User may or may not complete call
```

**Correct Flow:**
```
User clicks button → Phone opens dialer
↓
User makes call → Call connects to Retreaver
↓
Retreaver detects call duration ≥30 seconds → Webhook fires → Event sent to Meta
```

### Why This Causes False Conversions

**Day 1 Results:**
- 3 Meta "Lead" conversions
- 1 actual call in Retreaver
- **67% false positive rate**

**What happened:**
- 3 people clicked the button (all counted)
- 2 people's calls didn't connect or were too short
- Only 1 qualified call actually happened

### Step-by-Step Call Testing

#### Test 1: Verify tel: Link Works

**1.1 Open on Mobile Device**
```
1. Visit https://www.neighborcoverage.com on your phone
2. Scroll to call button
3. Click "CALL NOW"
```

**1.2 Check Phone Behavior**
Should happen:
```
✓ Phone dialer app opens
✓ Number (866) 649-9062 is pre-filled
✓ You can tap to dial
```

❌ **Issues:**
- Nothing happens → tel: link broken
- Wrong number shown → phone number incorrect in code

#### Test 2: Test Actual Phone Call

**2.1 Make Test Call**
```
1. Click call button on mobile
2. Complete the call (talk for at least 30 seconds)
3. Hang up
```

**2.2 Check Retreaver Dashboard**
```
1. Log into Retreaver dashboard
2. Go to "Calls" section
3. Find your test call
```

**2.3 Verify Call Data**
Should show:
```
✓ Phone Number: (866) 649-9062
✓ Duration: 30+ seconds
✓ Status: Completed
✓ Caller ID: Your phone number
```

#### Test 3: Verify Call Duration Tracking

**2.1 Make Short Call (< 30 seconds)**
```
1. Call the number
2. Hang up after 10 seconds
3. Check Retreaver: Should show duration ~10 seconds
```

**2.2 Make Qualified Call (≥ 30 seconds)**
```
1. Call the number
2. Stay on line for 40+ seconds
3. Check Retreaver: Should show duration ~40 seconds
```

**Purpose:** Verify Retreaver accurately tracks call duration for filtering qualified calls.

#### Test 4: Check Current Meta Event Timing

**4.1 Open Browser Console**
```
Visit site → Open console → Click call button
```

**4.2 Observe Event Firing**
```
[Meta Pixel] Lead event tracked ← Fires IMMEDIATELY on click
[Conversion API] success ← Fires IMMEDIATELY on click
```

⚠️ **PROBLEM**: Events fire **before** you even dial the phone!

**4.3 Check Timestamp**
```
Event fires at: 2:30:00 PM
Phone rings at: 2:30:02 PM (2 seconds later)
Call connects at: 2:30:08 PM (8 seconds later)
```

**Conclusion:** Meta counts conversion 8 seconds before call even connects.

---

## Section D: Identify False Conversions

### Understanding the False Positive Problem

#### Current Implementation Analysis

**Where the "Lead" event fires:**

**File:** `nextjs_space/components/sticky-call-button.tsx`
```typescript
<a
  href={phoneLink}
  onClick={trackStickyButtonClick}  ← Event fires HERE (on click)
>
  CALL NOW
</a>
```

**What happens:**
1. User clicks button
2. `trackStickyButtonClick()` fires **immediately**
3. Meta Pixel sends "Lead" event
4. Conversions API sends "Lead" event
5. **THEN** phone dialer opens
6. User may or may not complete call

### How to Calculate False Positive Rate

#### Method 1: Compare Meta vs Retreaver

**Step 1: Get Meta Conversion Count**
```
1. Open Meta Ads Manager
2. Select your campaign
3. Go to "Columns" → "Customize columns"
4. Add "All Call Initiated" (or "Lead" conversions)
5. Note the number
```

**Step 2: Get Actual Call Count**
```
1. Open Retreaver dashboard
2. Filter calls by:
   - Date range: Match campaign dates
   - Duration: ≥30 seconds (qualified calls)
   - Number: (866) 649-9062
3. Count qualified calls
```

**Step 3: Calculate Rate**
```
Meta Conversions: 3
Actual Calls: 1
False Positives: 3 - 1 = 2

False Positive Rate: (2 / 3) × 100 = 67%
```

**Interpretation:**
- 67% of your "conversions" never actually called
- You're optimizing for button clicks, not real calls
- Meta's algorithm is learning the wrong behavior

#### Method 2: Time-Based Correlation

**Export Data:**
```
1. Meta: Export conversion timestamps (Ads Manager → Export)
2. Retreaver: Export call log with timestamps
```

**Match Events:**
```csv
Meta Conversions          | Retreaver Calls
2024-12-17 14:23:45      | 2024-12-17 14:24:02 ✓ (matched)
2024-12-17 15:10:22      | (no call) ✗
2024-12-17 16:45:18      | (no call) ✗
```

**Findings:**
- If Meta time + Retreaver time match (within ~30 seconds) → Real call
- If Meta event has no corresponding Retreaver call → False positive

### Why "call_initiated" Fires Too Early

#### Code Analysis

**Current code in page.tsx (line 77-105):**
```typescript
const trackCallInitiated = (location: string) => {
  // This fires IMMEDIATELY when onClick is triggered
  
  // GA4 Event
  gtag('event', 'call_initiated', { /* ... */ })
  
  // Meta Pixel
  fbq('track', 'Lead', { /* ... */ })
  
  // Conversion API
  fetch('/api/meta-conversion', { /* ... */ })
}
```

**The problem:**
```
onClick → trackCallInitiated() → Events fire
  ↓
tel:8666499062 → Phone dialer opens (happens AFTER events)
```

**Time gap:**
- Event fires: T+0ms
- Phone opens: T+200ms
- Call connects: T+5000ms (5 seconds)
- User hangs up early: Call never qualified

### How to Distinguish Real Calls from Clicks

#### Current Status: Cannot Distinguish

**Browser limitation:**
```javascript
<a href="tel:8666499062" onClick={trackEvent}>
  // Browser can't detect if call actually connected
  // onClick fires regardless of call outcome
</a>
```

**Why this is a problem:**
- User clicks → Event fires
- User changes mind → Closes dialer → No call made
- Meta still counted it as conversion

#### Solution: Server-Side Call Verification

**Use Retreaver Webhook:**
```
User clicks → Phone opens → Call connects
↓
Retreaver detects call
↓
Retreaver sends webhook to your server
↓
YOUR server sends event to Meta Conversion API
↓
Only REAL calls counted
```

**Benefits:**
1. ✅ Only qualified calls (≥30 seconds) tracked
2. ✅ No false positives from abandoned dials
3. ✅ Accurate conversion data
4. ✅ Better Meta optimization

### How to Improve Tracking Accuracy

#### Immediate Actions (Today)

**1. Stop relying on current "Lead" metric**
```
Current metric: "All Call Initiated" (67% false positive rate)
Better approach: Wait for Retreaver integration
```

**2. Create new conversion event: "Qualified Call"**
```
Event name: QualifiedCall
Fires when: Retreaver webhook confirms call ≥30 seconds
Purpose: Track REAL conversions, not clicks
```

**3. Monitor both metrics during transition**
```
- Keep "Lead" (call initiated) for comparison
- Add "QualifiedCall" (actual calls)
- Compare rates to validate improvement
```

#### Long-Term Solution

**Implement Retreaver → Meta Integration** (see RETREAVER_INTEGRATION_GUIDE.md)

**Expected improvements:**
- False positive rate: 67% → 0%
- Event Match Quality: 7.0/10 → 8.5/10 (more accurate data)
- Meta optimization: Optimizes for real calls, not clicks
- Cost per qualified call: More accurate tracking

---

## Testing Checklist Summary

### Daily Monitoring (5 minutes)

```
□ Check Meta Events Manager for new Lead events
□ Check Retreaver for new calls
□ Compare counts: Do they match?
□ Note any discrepancies
```

### Weekly Deep Dive (30 minutes)

```
□ Test deduplication in Meta Test Events
□ Verify Event Match Quality score (should be 7.0+)
□ Calculate false positive rate (Meta conversions vs Retreaver calls)
□ Check for duplicate events in Events Manager
□ Review Vercel logs for errors
```

### Monthly Audit

```
□ Export Meta conversion data
□ Export Retreaver call data
□ Correlate timestamps to identify false positives
□ Calculate true cost per qualified call
□ Adjust campaign optimization strategy
```

---

## Key Metrics to Track

### Deduplication Health
- **Target:** 100% of events show "deduplicated" badge
- **Current:** Check Meta Events Manager
- **Red flag:** Seeing 2x Lead events for single clicks

### Event Match Quality
- **Target:** 7.0+/10
- **Current:** Check Meta Events Manager → Overview → Event Match Quality
- **Red flag:** Score below 6.0 → missing customer data

### Conversion Accuracy
- **Target:** 0% false positive rate (after Retreaver integration)
- **Current:** 67% false positive rate
- **Calculation:** (Meta conversions - Retreaver calls) / Meta conversions

### Call Completion Rate
- **Formula:** Retreaver qualified calls / Total dialer opens
- **Expected:** 30-50% (industry average)
- **Current:** 33% (1 call out of 3 clicks)

---

## Next Steps

1. **Immediate** (Today):
   - Test deduplication using Section A
   - Verify pixel firing using Section B
   - Calculate false positive rate using Section D

2. **This Week**:
   - Read RETREAVER_INTEGRATION_GUIDE.md
   - Set up Retreaver webhook endpoint
   - Create "QualifiedCall" conversion event

3. **Ongoing**:
   - Monitor both "Lead" and "QualifiedCall" events
   - Optimize campaigns for qualified calls
   - Review call quality and duration trends

---

## Troubleshooting Resources

### Meta Support
- Events Manager: https://business.facebook.com/events_manager2/
- Conversion API docs: https://developers.facebook.com/docs/marketing-api/conversions-api
- Event deduplication: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events

### Retreaver Support
- Dashboard: https://app.retreaver.com
- Webhook docs: https://docs.retreaver.com/webhooks
- Call tracking best practices: https://docs.retreaver.com/best-practices

### Vercel Logs
- Dashboard: https://vercel.com/dashboard
- Real-time logs: Vercel Dashboard → Your Project → Logs
- Filter by: "DEDUPLICATION", "Conversion API", "Meta"

---

## Questions or Issues?

If you encounter problems:

1. **Check browser console** for error messages
2. **Check Vercel logs** for server-side errors
3. **Check Meta Events Manager** for event delivery
4. **Check Retreaver dashboard** for call data

Common issues are documented in this guide. If you find a new issue, document it and add to your tracking playbook.

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Next Review:** After Retreaver integration
