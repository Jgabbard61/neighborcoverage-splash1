# Meta Custom Conversion Setup Guide
## Creating "QualifiedCall" Custom Conversion

**Date**: December 30, 2025  
**Project**: NeighborCoverage Auto Insurance  
**Pixel ID**: 1884617578809782

---

## 🎯 Overview

This guide explains how to create a **QualifiedCall** custom conversion in Meta Ads Manager. This conversion will track ONLY actual qualified phone calls (30+ seconds duration) instead of button clicks, eliminating the 76% false positive rate.

---

## 📋 Prerequisites

Before starting:
- ✅ Retreaver webhook endpoint deployed: `https://neighborcoverage.com/api/retreaver-webhook`
- ✅ Meta Conversions API token configured in `.env.local`
- ✅ Button click tracking removed from website code
- ✅ Retreaver configured to send webhooks (see setup instructions below)

---

## 🔧 Step 1: Create Custom Conversion in Meta

### 1.1 Navigate to Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2/)
2. Select your **Pixel ID: 1884617578809782**
3. Click on **"Data Sources"** in left sidebar
4. Click on your Pixel name: **"NeighborCoverage Pixel"**

### 1.2 Create Custom Conversion

1. Click **"Create Custom Conversion"** button (top right)
2. Or go to **"Custom Conversions"** tab → **"Create Custom Conversion"**

### 1.3 Configure Custom Conversion Settings

Fill in the following details:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `QualifiedCall` | Use exact name (case-sensitive) |
| **Description** | "Qualified phone call with 30+ seconds duration" | Optional but recommended |
| **Data Source** | Select your Pixel (1884617578809782) | Required |
| **Conversion Event** | Select **"Custom"** | Not a standard event |
| **Rules** | Event Name = `QualifiedCall` | Exact match |
| **Value** | $45.00 | Average value per qualified call |
| **Category** | Other | Or "Lead" if available |

#### Detailed Configuration:

**Rule Setup:**
```
Event Name [equals] QualifiedCall
```

**Advanced Settings (Optional):**
- **Aggregation**: Event Count
- **Attribution Window**: 7-day click, 1-day view (standard for calls)

### 1.4 Save Custom Conversion

1. Click **"Create"** button
2. Verify it appears in your Custom Conversions list
3. Note: It may take a few minutes to become active

---

## 🔗 Step 2: Configure Retreaver Webhook

### 2.1 Access Retreaver Dashboard

1. Log in to [Retreaver Dashboard](https://app.retreaver.com/)
2. Navigate to your campaign: **"NeighborCoverage - Auto Insurance"**
3. Go to **"Webhooks"** or **"Integrations"** section

### 2.2 Create Webhook

**Webhook Configuration:**

| Field | Value |
|-------|-------|
| **Name** | Meta Conversion Tracking |
| **URL** | `https://www.neighborcoverage.com/api/retreaver-webhook` |
| **Method** | POST |
| **Trigger** | Call Completed |
| **Format** | JSON |

**Headers to Add:**
```
Content-Type: application/json
X-Retreaver-Signature: [Your webhook secret]
```

**Webhook Secret:**
1. Generate a secure secret: Run `openssl rand -hex 32` in terminal
2. Copy the generated secret
3. Add to Vercel Environment Variables:
   - Go to [Vercel Dashboard](https://vercel.com/) → Project Settings → Environment Variables
   - Add: `RETREAVER_WEBHOOK_SECRET` = `[your generated secret]`
4. Redeploy your application

### 2.3 Configure Webhook Payload

Retreaver should send the following data:

```json
{
  "call_id": "unique-call-identifier",
  "call_duration": 65,
  "call_status": "completed",
  "caller_number": "+15551234567",
  "caller_city": "Phoenix",
  "caller_state": "AZ",
  "caller_zip": "85001",
  "caller_country": "US",
  "call_timestamp": "2025-12-30T10:30:00Z",
  "campaign_id": "12345",
  "campaign_name": "NeighborCoverage Auto"
}
```

**Required Fields:**
- `call_id` - Unique identifier
- `call_duration` - Duration in seconds (must be ≥30)
- `call_status` - "completed", "answered", etc.

**Optional but Recommended:**
- `caller_number` - For better Event Match Quality
- `caller_city`, `caller_state`, `caller_zip` - For geographic targeting
- `call_timestamp` - For accurate event timing

### 2.4 Test Webhook

1. Use Retreaver's **"Test Webhook"** feature
2. Send a test payload with `call_duration: 45` (above 30-second threshold)
3. Check Vercel logs for confirmation:
   ```
   ✅ QUALIFIED CALL
   Sending QualifiedCall event to Meta...
   ```
4. Verify in Meta Events Manager:
   - Go to **"Test Events"** tab
   - Should see `QualifiedCall` event appear within 2-5 minutes

---

## 📊 Step 3: Update Campaign to Use Custom Conversion

### 3.1 Edit Existing Campaign

1. Go to [Meta Ads Manager](https://business.facebook.com/adsmanager/)
2. Select your campaign: **"NeighborCoverage - Auto Insurance"**
3. Edit **Ad Set** level

### 3.2 Change Optimization Goal

**Current Setup (OLD):**
- Conversion Event: `Lead`
- Tracking: Button clicks (false positives)

**New Setup (CORRECTED):**
- Conversion Event: `QualifiedCall` (custom conversion)
- Tracking: Retreaver webhooks (actual qualified calls)

**Steps:**
1. Ad Set → **"Optimization & Delivery"** section
2. **Conversion Event**: Change from `Lead` to `QualifiedCall`
3. **Cost Per Result Goal**: Set to $45 (or leave blank for initial learning)
4. **Attribution Window**: 7-day click, 1-day view (standard for calls)

### 3.3 Save and Restart Learning Phase

⚠️ **Important**: Changing the conversion event will reset the campaign's learning phase.

**Best Practices:**
- Keep budget consistent during learning phase (don't reduce)
- Allow 7-14 days for re-learning
- Monitor daily to ensure tracking works correctly
- Don't make other major changes during learning phase

---

## ✅ Step 4: Verification Checklist

Use this checklist to verify everything is working:

### Pre-Launch Verification

- [ ] Custom Conversion "QualifiedCall" created in Meta Events Manager
- [ ] Retreaver webhook configured with correct URL
- [ ] Webhook secret added to Vercel environment variables
- [ ] Application redeployed after environment variable changes
- [ ] Test webhook sent from Retreaver (successful)
- [ ] QualifiedCall event visible in Meta Test Events
- [ ] Campaign updated to optimize for QualifiedCall
- [ ] Old "Lead" tracking removed from website code (verified in browser console)

### Post-Launch Monitoring (First 24 Hours)

- [ ] Retreaver calls = Meta QualifiedCall conversions (100% match)
- [ ] No "Lead" events appearing in Meta (button clicks eliminated)
- [ ] Event Match Quality ≥ 7.0 (check in Events Manager)
- [ ] Campaign learning phase progressing normally
- [ ] Cost per conversion aligns with expectations ($45 target)

---

## 🐛 Troubleshooting

### Issue: QualifiedCall events not appearing in Meta

**Possible Causes:**
1. Webhook URL incorrect → Verify: `https://www.neighborcoverage.com/api/retreaver-webhook`
2. Webhook not triggering → Check Retreaver logs for webhook deliveries
3. Call duration below threshold → Verify calls are ≥30 seconds
4. Environment variable not set → Check `RETREAVER_WEBHOOK_SECRET` in Vercel
5. Access token invalid → Verify `META_CONVERSION_API_TOKEN` in `.env.local`

**Debug Steps:**
```bash
# 1. Check webhook endpoint health
curl https://www.neighborcoverage.com/api/retreaver-webhook

# Expected response:
{
  "status": "ok",
  "endpoint": "Retreaver Webhook for Qualified Call Tracking",
  "min_call_duration": 30,
  "webhook_secret_configured": true,
  "meta_token_configured": true
}

# 2. Check Vercel function logs
# Go to Vercel Dashboard → Project → Functions → Logs
# Look for "[Retreaver Webhook]" entries
```

### Issue: Events appearing with delay

**Solution:** Meta Conversions API typically processes events within 2-5 minutes. If delay exceeds 30 minutes, check:
1. Meta API status: [Meta Status Dashboard](https://status.facebook.com/)
2. Vercel function logs for API errors
3. Event Match Quality score (should be ≥5.0)

### Issue: Campaign not optimizing correctly

**Solution:**
1. Ensure minimum 50 conversions per week for stable optimization
2. Check that attribution window matches campaign settings
3. Verify conversion value ($45) is set correctly
4. Allow 7-14 days for learning phase completion

---

## 📈 Expected Results

### Before Fix (Old Tracking)
- **Meta Events**: 220 "Lead" (button clicks)
- **Actual Calls**: 53 (Retreaver)
- **False Positive Rate**: 76% (167 phantom conversions)
- **Campaign Optimization**: Optimizing for button clicks (wrong signal)

### After Fix (New Tracking)
- **Meta Events**: 53 "QualifiedCall" (qualified calls)
- **Actual Calls**: 53 (Retreaver)
- **Accuracy**: 100% match (0 false positives)
- **Campaign Optimization**: Optimizing for actual qualified calls (correct signal)

---

## 🎓 Additional Notes

### Why "QualifiedCall" Instead of "Lead"?

1. **Clarity**: Distinguishes between button clicks (old "Lead" event) and actual calls
2. **Accuracy**: Only fires for calls ≥30 seconds (qualified)
3. **Optimization**: Teaches Meta to find users who complete calls, not just click buttons
4. **Reporting**: Clean slate - no contamination from old false data

### Conversion Value: $45

This value is used by Meta for:
- **ROAS (Return on Ad Spend) calculations**
- **Bid optimization** (if using Value or ROAS bidding)
- **Reporting** (total conversion value)

Adjust based on your actual lead value:
- If average policy = $1,200/year
- If close rate = 30%
- If commission = 12.5%
- Expected value = $1,200 × 30% × 12.5% = **$45 per qualified call**

---

## 📞 Support Resources

- **Meta Events Manager**: https://business.facebook.com/events_manager2/
- **Meta Conversions API Docs**: https://developers.facebook.com/docs/marketing-api/conversions-api/
- **Retreaver Dashboard**: https://app.retreaver.com/
- **Vercel Dashboard**: https://vercel.com/

---

## ✅ Summary

This guide ensures:
1. ✅ **Accurate tracking**: Only qualified calls counted (no button clicks)
2. ✅ **Better optimization**: Meta learns to find high-intent users
3. ✅ **Clean reporting**: 100% match between Meta and Retreaver
4. ✅ **Scalable solution**: Ready for nationwide campaign launch

**Next Steps:**
1. Complete this setup
2. Test with a small budget ($50/day for 3 days)
3. Verify 100% tracking accuracy
4. Scale to full nationwide budget

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2025  
**Author**: DeepAgent - Abacus.AI
