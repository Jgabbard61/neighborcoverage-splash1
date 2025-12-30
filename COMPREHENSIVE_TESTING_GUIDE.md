# Comprehensive Testing Guide
## Qualified Call Tracking System

**Date**: December 30, 2025  
**Project**: NeighborCoverage Auto Insurance  
**Purpose**: Validate tracking accuracy before campaign relaunch

---

## 🎯 Testing Objectives

This guide ensures:
1. ✅ **Button clicks NO LONGER fire Meta "Lead" events** (old behavior removed)
2. ✅ **Retreaver webhook successfully sends "QualifiedCall" events to Meta**
3. ✅ **100% tracking accuracy**: Meta conversions = Retreaver calls (≥30 seconds)
4. ✅ **Short calls (<30 seconds) are NOT counted** as conversions
5. ✅ **End-to-end workflow functions correctly**

---

## 📋 Pre-Testing Checklist

Before starting tests, verify:

- [ ] Code changes deployed to production (`www.neighborcoverage.com`)
- [ ] `RETREAVER_WEBHOOK_SECRET` added to Vercel environment variables
- [ ] Vercel application redeployed after environment variable changes
- [ ] QualifiedCall custom conversion created in Meta Events Manager
- [ ] Retreaver webhook URL configured: `https://www.neighborcoverage.com/api/retreaver-webhook`
- [ ] Meta Pixel ID: 1884617578809782 (confirm in browser console)

---

## 🧪 Test Suite

### Test 1: Verify Button Clicks No Longer Fire Meta Events

**Objective:** Confirm "Lead" events are NOT sent to Meta on button clicks.

**Steps:**

1. **Open website in browser:**
   ```
   https://www.neighborcoverage.com/
   ```

2. **Open browser DevTools:**
   - Right-click → Inspect
   - Go to **Console** tab
   - Clear console (trash icon)

3. **Click a Call Now button** (any button on page)

4. **Check console logs:**

   **Expected logs (✅ CORRECT):**
   ```
   [GA4] cta_click event tracked: hero_section
   [GA4] call_initiated event tracked: hero_section
   [Meta Tracking] Button click events no longer tracked - using Retreaver webhook for qualified calls only
   ```

   **Unexpected logs (❌ WRONG - if you see these, tracking not fixed):**
   ```
   [Meta Pixel] Lead event tracked: hero_section
   [Conversion API] Sending enhanced user_data...
   [DEDUPLICATION] Client-side event tracking...
   ```

5. **Verify in Meta Events Manager:**
   - Go to [Meta Events Manager](https://business.facebook.com/events_manager2/)
   - Select Pixel: 1884617578809782
   - Go to **"Test Events"** tab
   - Click your button again
   - **Wait 2-3 minutes**
   - **Expected:** NO "Lead" events appear (only PageView)
   - **Unexpected:** "Lead" events still appearing (tracking not fixed)

**Pass Criteria:**
- ✅ Console shows: "Button click events no longer tracked"
- ✅ NO Meta "Lead" events in console logs
- ✅ NO "Lead" events in Meta Test Events tab
- ✅ GA4 events still fire (internal analytics maintained)

---

### Test 2: Webhook Endpoint Health Check

**Objective:** Verify webhook endpoint is accessible and configured correctly.

**Steps:**

1. **Test GET endpoint** (health check):
   ```bash
   curl https://www.neighborcoverage.com/api/retreaver-webhook
   ```

   **Expected Response:**
   ```json
   {
     "status": "ok",
     "endpoint": "Retreaver Webhook for Qualified Call Tracking",
     "min_call_duration": 30,
     "webhook_secret_configured": true,
     "meta_token_configured": true
   }
   ```

2. **Verify configuration:**
   - `webhook_secret_configured: true` ✅
   - `meta_token_configured: true` ✅
   - If either is `false`, check Vercel environment variables

**Pass Criteria:**
- ✅ Endpoint returns 200 OK status
- ✅ Both secrets configured (true)
- ✅ `min_call_duration` = 30 seconds

---

### Test 3: Simulated Qualified Call (Manual Webhook Test)

**Objective:** Test webhook receives data and sends to Meta correctly.

**Steps:**

1. **Prepare test payload:**
   ```json
   {
     "call_id": "test-call-123",
     "call_duration": 45,
     "call_status": "completed",
     "caller_number": "+15551234567",
     "caller_city": "Phoenix",
     "caller_state": "AZ",
     "caller_zip": "85001",
     "caller_country": "US",
     "call_timestamp": "2025-12-30T15:30:00Z",
     "campaign_id": "test-campaign",
     "campaign_name": "NeighborCoverage Test"
   }
   ```

2. **Send POST request** (use curl, Postman, or Retreaver's test feature):
   ```bash
   curl -X POST https://www.neighborcoverage.com/api/retreaver-webhook \
     -H "Content-Type: application/json" \
     -H "X-Retreaver-Signature: your-webhook-secret-here" \
     -d '{
       "call_id": "test-call-123",
       "call_duration": 45,
       "call_status": "completed",
       "caller_number": "+15551234567",
       "caller_city": "Phoenix",
       "caller_state": "AZ",
       "caller_zip": "85001",
       "caller_country": "US"
     }'
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Qualified call tracked in Meta",
     "call_id": "test-call-123",
     "event_id": "abc123...",
     "duration": 45,
     "qualified": true,
     "meta_response": {
       "events_received": 1,
       "fbtrace_id": "..."
     }
   }
   ```

4. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Functions → Logs
   - Look for:
     ```
     ✅ QUALIFIED CALL
     Call ID: test-call-123
     Duration: 45 seconds (≥ 30 required)
     Sending QualifiedCall event to Meta...
     ✅ SUCCESS - Meta API Response
     Events Received: 1
     ```

5. **Verify in Meta Events Manager:**
   - Go to [Meta Events Manager](https://business.facebook.com/events_manager2/)
   - Test Events tab
   - **Wait 2-5 minutes** (API delay)
   - Look for **"QualifiedCall"** event
   - Check event parameters:
     - Event name: `QualifiedCall`
     - Action source: `phone_call`
     - Custom data: `call_duration: 45`

**Pass Criteria:**
- ✅ Webhook returns success response
- ✅ Vercel logs show "QUALIFIED CALL" confirmation
- ✅ Meta receives "QualifiedCall" event (visible in Test Events)
- ✅ Event includes correct call_duration in custom_data

---

### Test 4: Simulated Unqualified Call (Duration Too Short)

**Objective:** Verify calls <30 seconds are NOT sent to Meta.

**Steps:**

1. **Send webhook with short duration:**
   ```bash
   curl -X POST https://www.neighborcoverage.com/api/retreaver-webhook \
     -H "Content-Type: application/json" \
     -d '{
       "call_id": "test-call-short",
       "call_duration": 15,
       "call_status": "completed"
     }'
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Call received but did not qualify",
     "call_id": "test-call-short",
     "duration": 15,
     "qualified": false
   }
   ```

3. **Check Vercel Logs:**
   ```
   [Retreaver Webhook] Call does not qualify:
   call_id: test-call-short
   duration: 15
   min_required: 30
   reason: Duration too short
   ```

4. **Verify in Meta Events Manager:**
   - **Wait 5 minutes**
   - **Expected:** NO "QualifiedCall" event for this call
   - **Unexpected:** Event appears (webhook incorrectly qualifying short calls)

**Pass Criteria:**
- ✅ Webhook returns `qualified: false`
- ✅ Vercel logs show "Call does not qualify"
- ✅ NO event sent to Meta (confirmed in Test Events)

---

### Test 5: Real Call Test (End-to-End)

**Objective:** Validate complete workflow with an actual phone call.

**Prerequisites:**
- Retreaver webhook configured in Retreaver dashboard
- Access to Retreaver call reports

**Steps:**

1. **Make a real test call:**
   - Use Meta ad (if campaign running) OR
   - Visit `www.neighborcoverage.com` directly
   - Click "Call Now" button
   - Actually make the call: **(866) 649-9062**
   - **Stay on call for 45+ seconds** (to exceed 30-second threshold)
   - Hang up

2. **Monitor Retreaver Dashboard:**
   - Log in to [Retreaver Dashboard](https://app.retreaver.com/)
   - Go to **"Call Log"** or **"Recent Calls"**
   - Find your call
   - Note:
     - Call ID
     - Call Duration
     - Call Status

3. **Check webhook was sent:**
   - In Retreaver, check **"Webhook Log"** or **"Integrations"**
   - Verify webhook was triggered
   - Status should be **200 OK** (success)

4. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Functions → Logs
   - Filter by function: `retreaver-webhook`
   - Look for your call:
     ```
     [Retreaver Webhook] Received call data
     Call ID: [your-call-id]
     Duration: [your-duration] seconds
     Status: completed
     
     ✅ QUALIFIED CALL
     Sending QualifiedCall event to Meta...
     
     ✅ SUCCESS - Meta API Response
     Events Received: 1
     ```

5. **Verify in Meta Events Manager:**
   - Go to [Meta Events Manager](https://business.facebook.com/events_manager2/)
   - Navigate to **"Events"** tab (not Test Events - this is real)
   - Filter:
     - Date: Today
     - Event: QualifiedCall
   - **Wait 5-10 minutes** (real events take longer than test events)
   - Find your conversion
   - Click to view details:
     - Action source: `phone_call`
     - Call duration in custom_data
     - Geographic data (city, state, zip)

6. **Calculate Accuracy:**
   ```
   Retreaver Calls (≥30 sec): [Your count]
   Meta QualifiedCall Events:  [Your count]
   
   Accuracy = (Meta Events / Retreaver Calls) × 100%
   Target: 100%
   ```

**Pass Criteria:**
- ✅ Call appears in Retreaver with correct duration
- ✅ Webhook triggered successfully (200 OK)
- ✅ Vercel logs show qualified call processing
- ✅ Meta receives QualifiedCall event within 10 minutes
- ✅ Event data matches call data (duration, location)
- ✅ **100% accuracy** (1 Retreaver call = 1 Meta event)

---

### Test 6: Multiple Calls Test (Volume Validation)

**Objective:** Ensure system handles multiple calls correctly.

**Steps:**

1. **Generate 5-10 test calls** over 24 hours:
   - Mix of qualified (≥30 sec) and unqualified (<30 sec)
   - Example distribution:
     - 7 calls ≥30 seconds (should convert)
     - 3 calls <30 seconds (should NOT convert)

2. **Record data:**
   
   | Call # | Duration | Retreaver Call ID | Should Qualify? |
   |--------|----------|-------------------|-----------------|
   | 1      | 45 sec   | call-001          | ✅ Yes          |
   | 2      | 25 sec   | call-002          | ❌ No           |
   | 3      | 65 sec   | call-003          | ✅ Yes          |
   | ...    | ...      | ...               | ...             |

3. **Wait 24 hours** for all events to process

4. **Generate reports:**

   **Retreaver Report:**
   - Total Calls: 10
   - Calls ≥30 sec: 7
   - Calls <30 sec: 3

   **Meta Report:**
   - Total QualifiedCall events: ?
   - **Expected: 7**

5. **Calculate metrics:**
   ```
   Accuracy = (Meta QualifiedCall / Retreaver Qualified) × 100%
   Expected: 100% (7 Meta events / 7 Retreaver calls)
   
   False Positive Rate = (Unexpected Meta events / Total Meta events) × 100%
   Expected: 0% (no events for <30 sec calls)
   ```

**Pass Criteria:**
- ✅ All qualified calls (≥30 sec) generated Meta events
- ✅ NO unqualified calls (<30 sec) generated Meta events
- ✅ 100% accuracy maintained
- ✅ 0% false positive rate

---

## 🔍 Troubleshooting

### Issue: Webhook returns "Invalid signature"

**Cause:** Webhook secret mismatch

**Solution:**
1. Verify `RETREAVER_WEBHOOK_SECRET` in Vercel matches Retreaver configuration
2. Regenerate secret if needed:
   ```bash
   openssl rand -hex 32
   ```
3. Update in both Vercel AND Retreaver
4. Redeploy Vercel application

---

### Issue: Meta events not appearing

**Possible Causes:**

1. **Meta API token invalid**
   - Check: `META_CONVERSION_API_TOKEN` in `.env.local`
   - Regenerate in Meta Events Manager if expired

2. **Webhook not configured in Retreaver**
   - Verify webhook URL in Retreaver dashboard
   - Check webhook trigger (should be "Call Completed")

3. **Call duration below threshold**
   - Minimum: 30 seconds
   - Check Retreaver logs for actual duration

4. **Delay in Meta processing**
   - Normal: 2-5 minutes for test events
   - Normal: 5-10 minutes for real events
   - Wait up to 1 hour before investigating further

**Debug Steps:**
```bash
# 1. Check webhook health
curl https://www.neighborcoverage.com/api/retreaver-webhook

# 2. Check Vercel logs for errors
# Go to Vercel Dashboard → Functions → Logs

# 3. Send manual test webhook
curl -X POST https://www.neighborcoverage.com/api/retreaver-webhook \
  -H "Content-Type: application/json" \
  -d '{"call_id": "debug-test", "call_duration": 45}'

# 4. Check Meta Events Manager
# Look in "Test Events" tab for your event
```

---

### Issue: "Lead" events still appearing

**Cause:** Old code not deployed or cached

**Solution:**
1. Verify code changes deployed:
   ```bash
   # Check Vercel deployment logs
   # Confirm latest commit is deployed
   ```

2. Clear browser cache:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or use incognito/private window

3. Check console logs:
   - Should see: "Button click events no longer tracked"
   - Should NOT see: "Meta Pixel Lead event tracked"

4. If still appearing, verify file changes:
   - `page.tsx` - `trackCallInitiated()` should NOT have `fbq('track', 'Lead', ...)`
   - `sticky-call-button.tsx` - `trackStickyButtonClick()` should NOT have Meta code

---

### Issue: Webhook receives calls but doesn't send to Meta

**Cause:** Meta API configuration issue

**Solution:**

1. **Check Meta API token:**
   ```bash
   # Verify token in Vercel environment variables
   # Go to Vercel → Settings → Environment Variables
   # Ensure META_CONVERSION_API_TOKEN is set
   ```

2. **Test Meta API directly:**
   ```bash
   curl -X POST "https://graph.facebook.com/v18.0/1884617578809782/events" \
     -H "Content-Type: application/json" \
     -d '{
       "data": [{
         "event_name": "QualifiedCall",
         "event_time": '$(date +%s)',
         "action_source": "phone_call"
       }],
       "access_token": "YOUR_ACCESS_TOKEN"
     }'
   ```

3. **Check Vercel logs for Meta API errors:**
   ```
   [Retreaver Webhook] Meta API ERROR:
   ```

4. **Regenerate access token if needed:**
   - Go to Meta Events Manager
   - Settings → Conversions API
   - Generate new access token
   - Update in Vercel environment variables
   - Redeploy

---

## 📊 Testing Summary Report

After completing all tests, fill out this report:

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| **Test 1: Button Clicks No Meta Events** | ✅ / ❌ | |
| **Test 2: Webhook Endpoint Health** | ✅ / ❌ | |
| **Test 3: Qualified Call (45 sec)** | ✅ / ❌ | |
| **Test 4: Unqualified Call (15 sec)** | ✅ / ❌ | |
| **Test 5: Real End-to-End Call** | ✅ / ❌ | |
| **Test 6: Multiple Calls Volume** | ✅ / ❌ | |

### Tracking Accuracy

```
Total Retreaver Calls (≥30 sec): ___
Total Meta QualifiedCall Events: ___
Accuracy: ___% (Target: 100%)

Total Retreaver Calls (<30 sec): ___
Unexpected Meta Events: ___
False Positive Rate: ___% (Target: 0%)
```

### Sign-Off

- [ ] All tests passed (6/6)
- [ ] 100% tracking accuracy achieved
- [ ] 0% false positive rate
- [ ] System ready for campaign launch

**Tested By:** _______________  
**Date:** _______________  
**Approved for Launch:** ✅ / ❌

---

## 🚀 Next Steps

Once all tests pass:

1. ✅ **Review**: `RELAUNCH_CHECKLIST.md` for final pre-launch steps
2. ✅ **Configure**: Meta campaign with QualifiedCall conversion
3. ✅ **Launch**: Start with $150/day testing budget
4. ✅ **Monitor**: Daily for first week to ensure continued accuracy

---

## 📞 Support Resources

- **Vercel Dashboard**: https://vercel.com/
- **Meta Events Manager**: https://business.facebook.com/events_manager2/
- **Retreaver Dashboard**: https://app.retreaver.com/
- **Webhook Endpoint**: https://www.neighborcoverage.com/api/retreaver-webhook

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2025  
**Author**: DeepAgent - Abacus.AI
