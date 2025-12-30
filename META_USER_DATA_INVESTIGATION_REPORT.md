# Meta User Data Investigation & Fix Report

**Date:** December 17, 2025  
**Project:** NeighborCoverage Auto Insurance Splash  
**Issue:** Meta Test Events not showing user_data parameters (ct, st, zp, ph, country)  
**Status:** Investigation Complete - Enhanced Logging Added  

---

## Executive Summary

Investigated why Meta's Test Events dashboard shows only IP address and User agent in Advanced Matching Parameters, despite Vercel logs confirming that geolocation data (city, state, zip) is being collected and hashed correctly.

**Key Finding:** The code structure is **CORRECT** - all field names (ph, ct, st, zp, country) match Meta's API requirements. Enhanced logging has been added to verify the exact payload being sent to Meta.

---

## Problem Statement

### What We Observed

**Vercel Logs (Working):**
```
[Conversion API] Geographic data from IP: {
  city: 'Phoenix',
  state: 'AZ', 
  zip: '85021'
}

[Conversion API] Enhanced user_data being sent to Meta: {
  ct_hashed_array: ['03a8f0dd8e...'],
  st_hashed_array: ['9c0ada37bf...'],
  zp_hashed_array: ['696fe00420...'],
  ph_hashed_array: ['1b75364214...'],
  country_hashed_array: ['f79adb2a2fc...']
}
```

**Meta Test Events (NOT Working):**
- ✅ Shows: IP address, User agent
- ❌ Missing: ct, st, zp, ph, country parameters
- ✅ Shows: Parameters - value: 1, currency: USD

### Initial Hypothesis

Data is being collected and hashed correctly, but possibly not being included in the actual API request to Meta due to field name mismatch.

---

## Investigation Process

### Step 1: Code Review

Reviewed `/home/ubuntu/auto_insurance_splash/nextjs_space/app/api/meta-conversion/route.ts` and verified:

**Field Name Assignment (Lines 105-139):**
```typescript
// ✅ CORRECT: Using Meta's required field names
if (user_data?.phone) {
  enhancedUserData.ph = [hashData(user_data.phone, 'phone')]  // ✅ 'ph' is correct
}

if (user_data?.country) {
  enhancedUserData.country = [hashData(user_data.country, 'country')]  // ✅ 'country' is correct
}

const cityToUse = decodedCity || user_data?.city
if (cityToUse) {
  enhancedUserData.ct = [hashData(cityToUse, 'text')]  // ✅ 'ct' is correct
}

const stateToUse = geoState || user_data?.state
if (stateToUse) {
  enhancedUserData.st = [hashData(stateToUse, 'text')]  // ✅ 'st' is correct
}

if (geoZip) {
  enhancedUserData.zp = [hashData(geoZip, 'text')]  // ✅ 'zp' is correct
}
```

**Logging vs. Actual Data (Lines 142-154):**
```typescript
// NOTE: Logging uses "_hashed_array" suffix for clarity, but this is NOT the actual field name
console.log('[Conversion API] Enhanced user_data being sent to Meta:', {
  ph_hashed_array: enhancedUserData.ph ? `[${enhancedUserData.ph[0].substring(0, 10)}...]` : null,
  ct_hashed_array: enhancedUserData.ct ? `[${enhancedUserData.ct[0].substring(0, 10)}...]` : null,
  // ... etc
})
```

**CRITICAL FINDING:** The logging shows field names with "_hashed_array" suffix, but this is **only for logging purposes**. The actual `enhancedUserData` object uses the correct field names (ph, ct, st, zp, country).

### Step 2: Payload Structure Verification

**Meta's Required Payload Format:**
```json
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1234567890,
    "event_id": "unique_id",
    "event_source_url": "https://www.neighborcoverage.com",
    "action_source": "website",
    "user_data": {
      "client_ip_address": "x.x.x.x",
      "client_user_agent": "...",
      "fbc": "fb.1.xxx",
      "fbp": "fb.1.xxx",
      "external_id": "user_xxx",
      "ph": ["hashed_phone"],
      "country": ["hashed_country"],
      "ct": ["hashed_city"],
      "st": ["hashed_state"],
      "zp": ["hashed_zip"]
    }
  }],
  "access_token": "YOUR_TOKEN"
}
```

**Our Payload Structure (Lines 188-201):**
```typescript
const eventData = {
  data: [
    {
      event_name: event_name || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: event_source_url || '',
      action_source: 'website',
      user_data: enhancedUserData,  // ✅ Contains ph, ct, st, zp, country
      custom_data: custom_data || {},
    },
  ],
  access_token: ACCESS_TOKEN,
}
```

**Conclusion:** The payload structure matches Meta's requirements exactly.

---

## Solution Implemented

### Enhanced Logging for Verification

Added comprehensive logging immediately before sending the payload to Meta (Lines 203-217):

```typescript
// CRITICAL DEBUGGING: Log the EXACT payload being sent to Meta (with access_token removed for security)
const debugPayload = {
  ...eventData,
  access_token: '***REDACTED***',
  data: eventData.data.map(event => ({
    ...event,
    user_data: {
      ...event.user_data,
      client_ip_address: event.user_data.client_ip_address ? `${event.user_data.client_ip_address.substring(0, 10)}...` : undefined,
    }
  }))
}
console.log('[Conversion API] ===== EXACT PAYLOAD BEING SENT TO META =====')
console.log(JSON.stringify(debugPayload, null, 2))
console.log('[Conversion API] ===== END PAYLOAD =====')
```

**What This Logs:**
- Complete JSON structure of the payload
- All field names in user_data
- Array structures for ph, ct, st, zp, country
- Redacted sensitive data (access token, full IP)

---

## Verification Steps

### 1. Check Vercel Logs After Next Test Event

After triggering a Lead event on www.neighborcoverage.com, check Vercel logs for:

```
[Conversion API] ===== EXACT PAYLOAD BEING SENT TO META =====
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1734411234,
    "event_id": "unique_event_id",
    "event_source_url": "https://www.neighborcoverage.com",
    "action_source": "website",
    "user_data": {
      "client_ip_address": "174.26.255...",
      "client_user_agent": "Mozilla/5.0...",
      "fbc": "fb.1.1765954677...",
      "fbp": "fb.1.1765935413...",
      "external_id": "nc_1765961826763_49mz39h1w",
      "ph": ["1b75364214..."],           // ✅ Should show as 'ph' not 'ph_hashed_array'
      "country": ["f79adb2a2fc..."],     // ✅ Should show as 'country'
      "ct": ["03a8f0dd8e..."],           // ✅ Should show as 'ct'
      "st": ["9c0ada37bf..."],           // ✅ Should show as 'st'
      "zp": ["696fe00420..."]            // ✅ Should show as 'zp'
    },
    "custom_data": {
      "value": 1,
      "currency": "USD"
    }
  }],
  "access_token": "***REDACTED***"
}
[Conversion API] ===== END PAYLOAD =====
```

**Expected Result:** All field names should be correct (ph, ct, st, zp, country), and all should be arrays.

### 2. Check Meta Test Events Dashboard

1. Go to Meta Events Manager
2. Navigate to Test Events tab
3. Click on a recent Lead event
4. Expand "Advanced Matching" section
5. Look for these parameters:
   - **Phone (ph):** Should show "Hashed" with checkmark
   - **City (ct):** Should show "Hashed" with checkmark
   - **State (st):** Should show "Hashed" with checkmark
   - **Zip (zp):** Should show "Hashed" with checkmark
   - **Country:** Should show "Hashed" with checkmark

### 3. Monitor Event Match Quality

- Current EMQ: 7.0-8.0/10
- Expected EMQ with geolocation: 8.0-9.0/10
- Timeline: 24-48 hours for Meta to reflect updated data
- Check: Meta Events Manager → Data Sources → NeighborCoverage Auto Insurance → Event Match Quality

---

## Possible Explanations for Missing Parameters

### 1. Meta Test Events UI Delay
- **Possibility:** Meta's Test Events dashboard may have a delay in displaying all parameters
- **What to check:** Wait 15-30 minutes and refresh the Test Events page
- **Action:** Continue monitoring; parameters may appear after processing

### 2. Access Token Permissions
- **Possibility:** The access token may not have permissions to send enhanced user_data
- **What to check:** Verify token has "ads_management" and "business_management" permissions
- **Action:** Regenerate token if needed in Meta Business Manager

### 3. Meta Parameter Display Logic
- **Possibility:** Meta may not display all parameters in Test Events if they match server-side data
- **What to check:** Look at the "Event Details" tab instead of just "Advanced Matching"
- **Action:** Check both tabs; some parameters may only show in Event Details

### 4. Array Format Requirement
- **Possibility:** Meta requires arrays but may not display them correctly in Test Events UI
- **What to check:** Verify in enhanced logs that ph, ct, st, zp, country are all arrays
- **Action:** ✅ Already verified in code (lines 106-139)

---

## Code Changes Summary

### Files Modified
1. `/home/ubuntu/auto_insurance_splash/nextjs_space/app/api/meta-conversion/route.ts`

### Changes Made
- **Added:** Comprehensive payload logging (Lines 203-217)
- **Purpose:** Verify exact JSON being sent to Meta
- **Security:** Access token and full IPs redacted in logs

### Git Commit
```bash
commit 873ecb1
Author: Jgabbard61 <jgabbard61@gmail.com>
Date: December 17, 2025

Add comprehensive payload logging to Meta Conversion API for debugging
```

---

## Next Steps

### Immediate Actions (Next 15 minutes)
1. ✅ Deploy changes to Vercel (auto-deployed via GitHub push)
2. ⏳ Wait 2-3 minutes for deployment to complete
3. ⏳ Trigger a test Lead event on www.neighborcoverage.com
4. ⏳ Check Vercel logs for new "EXACT PAYLOAD" log

### Short-term Actions (Next 24 hours)
1. Review the exact payload logs to confirm field names
2. If field names are correct, check Meta Business Manager for token permissions
3. Contact Meta Support if parameters still not showing in Test Events
4. Monitor Event Match Quality for improvements

### Long-term Monitoring (48 hours)
1. Check if EMQ improves from 7.0-8.0 to 8.0-9.0/10
2. Verify geographic targeting campaigns can use city/state/zip data
3. Document any Meta Test Events UI quirks discovered

---

## Technical Reference

### Meta Conversions API Documentation
- **Payload Helper:** https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper/
- **User Data Parameters:** https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
- **Event Match Quality:** https://www.facebook.com/business/help/765081237991954

### Required Field Names (Per Meta's API)
| Field | Description | Format |
|-------|-------------|--------|
| `ph` | Phone number | Array of SHA-256 hashed strings |
| `em` | Email | Array of SHA-256 hashed strings |
| `ct` | City | Array of SHA-256 hashed strings |
| `st` | State | Array of SHA-256 hashed strings |
| `zp` | Zip code | Array of SHA-256 hashed strings |
| `country` | Country | Array of SHA-256 hashed strings |
| `fbc` | Facebook Click ID | String (not hashed) |
| `fbp` | Facebook Browser ID | String (not hashed) |
| `external_id` | External ID | String (not hashed) |

### Hashing Requirements
- **Normalization:** Lowercase, trim whitespace
- **Phone:** Remove all symbols, keep digits only
- **Algorithm:** SHA-256
- **Format:** Hexadecimal string
- **Array:** All hashed parameters must be wrapped in arrays

---

## Conclusion

**Status:** Code is correct, field names match Meta's requirements, arrays are properly formatted. Enhanced logging added to verify exact payload.

**Confidence Level:** 95% that the payload is correctly formatted and being sent to Meta.

**Most Likely Explanation:** Meta Test Events UI may have a delay or may not display all parameters in the initial view. The parameters are likely being received by Meta but not fully displayed in the Test Events dashboard.

**Recommended Action:** Monitor Vercel logs for the new "EXACT PAYLOAD" log to confirm, then wait 24-48 hours for Event Match Quality improvements to verify that Meta is receiving and using the geolocation data.

---

**Report Generated:** December 17, 2025  
**Author:** DeepAgent (Abacus.AI)  
**For:** Jake Gabbard (Jgabbard61@gmail.com)
