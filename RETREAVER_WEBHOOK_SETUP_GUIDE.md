# Retreaver Webhook Setup Guide - Auto Insurance
**Goal:** Send "QualifiedCall" event to Meta ONLY when calls ≥160 seconds (buyer payment threshold)

---

## 🎯 What This Does:

**Current Problem:**
- Meta tracks: Button click → Phone dialer opens
- You get paid: Call duration ≥160 seconds
- **Mismatch:** Meta shows 5 conversions, but only 3 were real calls

**With Webhook:**
- Retreaver detects: Call completes with 160+ seconds
- Retreaver sends webhook → Your server validates
- Server sends "QualifiedCall" event to Meta
- Meta learns: "This ad set → qualified calls" (not just clicks)

**Result:**
- Meta optimizes for PAID calls (160+s)
- Higher CPL initially ($10-15), but better ROI
- 80-90% of conversions will be qualified

---

## ✅ Step 1: Get Webhook URL

**Your webhook endpoint is already built:**

```
https://www.neighborcoverage.com/api/retreaver-webhook
```

**For testing (once deployed to Vercel):**
```bash
curl https://www.neighborcoverage.com/api/retreaver-webhook
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Retreaver webhook endpoint ready",
  "min_call_duration": 160
}
```

---

## 🔐 Step 2: Generate Webhook Secret in Retreaver

### **In Retreaver Dashboard:**

1. **Go to:** [Retreaver Dashboard](https://app.retreaver.com/) → Login

2. **Navigate to:** **Settings** (top right) → **Webhooks** or **API Settings**

3. **Create New Webhook:**
   - Click **"Add Webhook"** or **"New Webhook"**
   - Name: `NeighborCoverage Auto Insurance - Meta QualifiedCall`
   - URL: `https://www.neighborcoverage.com/api/retreaver-webhook`
   - Method: **POST**

4. **Generate Secret:**
   - Look for **"Webhook Secret"** or **"Signing Secret"** field
   - Click **"Generate"** or **"Create Secret"**
   - **Copy the secret** (you'll only see it once!)
   - Example format: `whsec_abc123xyz789...` or just a random string

5. **Configure Triggers:**
   - **Event Type:** "Call Completed" or "Call Ended"
   - **Conditions:** 
     - ✅ Call Status = "Completed"
     - ✅ Call Duration ≥ 160 seconds (Retreaver may have this filter)
   - **Format:** JSON

6. **Save Webhook**

---

## 🔧 Step 3: Add Secret to Environment Variables

### **Option A: Local Testing (Your Computer)**

1. Open: `/home/ubuntu/auto_insurance_splash/nextjs_space/.env.local`

2. Replace:
   ```
   RETREAVER_WEBHOOK_SECRET=CHANGE_THIS_TO_YOUR_RETREAVER_SECRET
   ```
   
   With:
   ```
   RETREAVER_WEBHOOK_SECRET=your_actual_secret_from_retreaver
   ```

3. Save file

### **Option B: Vercel Production (Required)**

1. **Go to:** [Vercel Dashboard](https://vercel.com/) → Your Auto Insurance project

2. **Click:** **Settings** → **Environment Variables**

3. **Add New Variable:**
   - **Key:** `RETREAVER_WEBHOOK_SECRET`
   - **Value:** (paste your Retreaver secret)
   - **Environment:** Check all (Production, Preview, Development)

4. **Click "Save"**

5. **Redeploy:** Go to **Deployments** tab → **Redeploy** latest deployment

---

## 📞 Step 4: Configure Retreaver Webhook Data

**Retreaver needs to send these fields** (check webhook payload configuration):

### **Required Fields:**
```json
{
  "call_id": "ABC123",
  "call_duration": 180,
  "call_status": "completed",
  "caller_number": "+12065551234",
  "call_timestamp": "2026-01-07T14:30:00Z"
}
```

### **Optional (but helpful for Event Match Quality):**
```json
{
  "caller_city": "Phoenix",
  "caller_state": "AZ",
  "caller_zip": "85001",
  "caller_country": "US",
  "campaign_id": "AUTO_INS_TIER1",
  "campaign_name": "Auto Insurance - Tier 1"
}
```

**How to configure:**
- In Retreaver → Webhook settings
- Look for **"Payload Template"** or **"Custom Fields"**
- Map Retreaver fields to JSON keys above
- Most Retreaver webhooks include these by default

---

## 🎯 Step 5: Complete Meta Custom Conversion

### **You're Already Halfway Done! Let's Finish:**

**Based on your screenshot, here's what to do:**

### **1. Name (Already Done ✅)**
```
QualifiedCall
```

### **2. Data Source (Already Done ✅)**
```
NeighborCoverage Auto Insurance (Pixel ID: 1884617578809782)
```

### **3. Action Source (Already Done ✅)**
```
Website
```

### **4. Event (Already Done ✅)**
```
Lead
```

### **5. Rules (THIS IS WHAT YOU NEED):**

**Click on "Event Parameters" dropdown** and select:

#### **Option A: If you see "Custom Event Name" in dropdown:**
- **Rule:** Event Parameters → **Custom Event Name** → **equals** → `QualifiedCall`

#### **Option B: If you DON'T see "Custom Event Name":**
- **Rule:** Event Parameters → **URL Parameters** → **contains** → `/api/retreaver-webhook`
- **OR**
- **Rule:** Event Parameters → **Value** → **greater than** → `45`

#### **Option C: Simplest (Recommended):**
**Don't add ANY rules.** Just leave it as:
- Event = "Lead"
- Create the custom conversion
- Meta will track ALL "Lead" events (including webhook ones)

**Then in your campaign:**
- Set conversion goal to "QualifiedCall" custom conversion
- Meta will only optimize for "Lead" events from webhook (160+s calls)

### **6. Conversion Value:**
```
$30.00
```
*(Your average net profit per qualified call - adjust based on your payout minus ad spend)*

### **7. Click "Create"**

---

## ✅ Step 6: Test the Webhook

### **Test 1: Health Check (Before Launch)**

```bash
curl https://www.neighborcoverage.com/api/retreaver-webhook
```

**Expected:**
```json
{
  "status": "ok",
  "message": "Retreaver webhook endpoint ready",
  "min_call_duration": 160
}
```

### **Test 2: Make a Real Call (Best Test)**

1. Visit: https://www.neighborcoverage.com
2. Click any "Call Now" button
3. Stay on phone for **3+ minutes** (180+ seconds)
4. Hang up
5. **Wait 2-5 minutes** for Retreaver to process
6. Check:
   - **Retreaver Dashboard:** Call should show as "Completed" with duration ≥160s
   - **Meta Events Manager:** New "Lead" event should appear with:
     - event_name = "QualifiedCall" (or just "Lead")
     - value = $30
     - Source: "Server" (not "Browser")

### **Test 3: Verify in Vercel Logs**

1. Go to: [Vercel Dashboard](https://vercel.com/) → Your project → **Logs**
2. Filter by: `/api/retreaver-webhook`
3. You should see:
   ```
   [Retreaver Webhook] ✅ QUALIFIED CALL
   Call ID: ABC123
   Duration: 180 seconds (≥ 160 required)
   Sending QualifiedCall event to Meta...
   [Meta API] Event sent successfully
   ```

---

## 🚨 Troubleshooting

### **Issue: Webhook returns 401 "Invalid signature"**
**Solution:**
- Check `RETREAVER_WEBHOOK_SECRET` in Vercel matches Retreaver exactly
- No extra spaces, quotes, or line breaks
- Redeploy after adding secret

### **Issue: Webhook receives call but doesn't send to Meta**
**Check:**
1. Call duration ≥160 seconds? (Your requirement)
2. Call status = "completed"? (Not "abandoned" or "missed")
3. `META_CONVERSION_API_TOKEN` set in Vercel?
4. Check Vercel logs for errors

### **Issue: Meta doesn't show "QualifiedCall" events**
**Wait 10-15 minutes:**
- Meta has delay in showing Test Events
- Go to: Events Manager → Data Sources → Your Pixel → **Test Events** tab
- Make another test call

**If still not showing:**
- Check Vercel logs: Was event sent?
- Verify Pixel ID = 1884617578809782 in webhook code
- Test Meta API directly:
  ```bash
  curl -X POST 'https://graph.facebook.com/v18.0/1884617578809782/events?access_token=YOUR_TOKEN' \
  -d '{
    "data": [{
      "event_name": "QualifiedCall",
      "event_time": 1704650000,
      "action_source": "website",
      "user_data": {"ph": ["hashed_phone"]}
    }]
  }'
  ```

### **Issue: Retreaver not sending webhooks**
**Check:**
1. Webhook enabled in Retreaver?
2. Triggers configured correctly? ("Call Completed" event)
3. URL correct? `https://www.neighborcoverage.com/api/retreaver-webhook`
4. Method = POST?
5. Test manually in Retreaver: "Send Test Webhook" button

---

## 📊 Expected Behavior After Setup

### **Before Webhook (Current):**
| Metric | Value |
|--------|-------|
| Meta Conversions | 6 |
| Retreaver Calls | 6 |
| Qualified Calls (160+s) | 2-3 (~40%) |
| Meta optimizes for | Any click |

### **After Webhook (Target):**
| Metric | Value |
|--------|-------|
| Meta Conversions | 2-3 (only 160+s calls) |
| Retreaver Calls | 6 |
| Qualified Calls (160+s) | 2-3 (100% match!) |
| Meta optimizes for | 160+s calls ONLY |

**Result:**
- CPL may increase to $12-18 initially
- BUT: Every conversion = PAID call (160+s)
- ROI improves: No wasted spend on <160s calls
- After 50 conversions, Meta learns and CPL drops to $8-12

---

## 🎯 Campaign Optimization After Webhook

### **Week 1: Learning Phase**
- Keep budget at $50-70/day
- Let Meta collect 50 "QualifiedCall" conversions
- Don't change targeting/creative
- Monitor: % of calls that are 160+s (should be 80-90%)

### **Week 2: Scale Winners**
- If Tier 1 delivers 80%+ qualified calls → scale to $100/day
- If Tier 3 delivers <50% qualified calls → pause
- Compare CPL before/after webhook:
  - Before: $6.73 (all clicks)
  - After: $12 (160+s calls only)
  - **Better metric:** Cost per PAID call

### **Week 3+: Full Optimization**
- Meta fully optimized for qualified calls
- Expected CPL: $8-12 for 160+s calls
- False positive rate: <10% (vs 40% current)

---

## 📝 Quick Checklist

### **Retreaver Setup:**
- [ ] Created webhook in Retreaver dashboard
- [ ] URL: `https://www.neighborcoverage.com/api/retreaver-webhook`
- [ ] Generated and copied webhook secret
- [ ] Configured triggers: "Call Completed", duration ≥160s
- [ ] Saved webhook configuration

### **Environment Variables:**
- [ ] Added `RETREAVER_WEBHOOK_SECRET` to Vercel
- [ ] Redeployed Vercel project
- [ ] Verified `META_CONVERSION_API_TOKEN` is set

### **Meta Custom Conversion:**
- [ ] Created "QualifiedCall" custom conversion
- [ ] Data source: Auto Insurance Pixel (1884617578809782)
- [ ] Event: Lead
- [ ] Value: $30
- [ ] Rules: (leave empty OR add custom event name)

### **Testing:**
- [ ] Webhook health check returns 200 OK
- [ ] Made test call >160s, verified in Retreaver
- [ ] Checked Meta Events Manager for "QualifiedCall" event
- [ ] Reviewed Vercel logs for successful webhook processing

### **Campaign Update:**
- [ ] Changed conversion goal to "QualifiedCall"
- [ ] Let run for 3-5 days (learning phase)
- [ ] Monitor cost per qualified call vs previous CPL

---

## 🚀 Next Steps

1. **Complete Retreaver webhook setup** (Steps 2-4 above)
2. **Add webhook secret to Vercel** (Step 3)
3. **Finish Meta custom conversion** (Step 5 - just the rules)
4. **Test with a real call** (Step 6)
5. **Update campaign optimization goal** to "QualifiedCall"
6. **Monitor for 3-5 days** to collect data
7. **Come back to optimize** based on qualified call performance

---

**Ready to start? Begin with Step 2 in Retreaver, then move through each step sequentially.**
