# Simple Campaign Setup Guide - NeighborCoverage

## 🎯 Campaign Overview

This is a **SIMPLE** nationwide auto insurance lead generation campaign. We're tracking button clicks as a proxy for call intent, using Meta's "Lead" event.

**IMPORTANT:** This setup prioritizes speed and simplicity. Button clicks won't perfectly match actual calls, but it's a reasonable proxy for launch.

---

## 📊 Campaign Structure

### Campaign: **NeighborCoverage - Nationwide Auto Insurance**

**Objective:** Conversions  
**Conversion Event:** Lead (button clicks)  
**Budget Type:** Daily  
**Total Daily Budget:** $150-300 (start conservative, scale up)

---

## 🎯 Ad Set Configuration

### **Ad Set 1: All 50 States - Peak Hours**

#### **Targeting:**
- **Location:** United States (all 50 states)
- **Age:** 25-65+
- **Audience:** Broad targeting (let Meta optimize)
  - Interest: Auto insurance, Car insurance, Insurance quotes
  - Behavior: Likely to engage with insurance offers
  
#### **Schedule:**
- **Days:** Monday - Sunday (7 days/week)
- **Hours:** 7:00 AM - 11:00 PM EST (5:00 AM - 9:00 PM MST Arizona Time)
  - Covers peak call times across all US time zones
  - Advisors available during these hours

#### **Placements:**
- **Automatic Placements** (recommended for launch)
  - Facebook Feed
  - Instagram Feed
  - Audience Network
  - Messenger
  
#### **Optimization:**
- **Optimization Goal:** Conversions
- **Conversion Event:** Lead
- **Bid Strategy:** Lowest cost (let Meta optimize)
- **Daily Budget:** $75-150 per ad set

---

## 📱 Ad Creative Strategy

### **3 Ad Variations (Test to Find Winner)**

#### **Ad 1: Direct & Simple**
- **Headline:** "Get Auto Insurance Quotes in Minutes"
- **Primary Text:** "Call now to compare rates from top carriers. Licensed advisors standing by. No obligation, free quotes."
- **CTA Button:** "Call Now"
- **Image:** Happy family with car (provided)

#### **Ad 2: Value-Focused**
- **Headline:** "Compare Auto Insurance & Save"
- **Primary Text:** "Speak with a licensed advisor and find the best rate for your needs. Fast, easy, and personalized service."
- **CTA Button:** "Learn More" (leads to landing page with call button)
- **Image:** Car on sunny road

#### **Ad 3: Trust & Credibility**
- **Headline:** "Trusted by Thousands of Drivers"
- **Primary Text:** "Licensed in all 50 states. Get expert advice and neighborly service. Call today for your free quote."
- **CTA Button:** "Call Now"
- **Image:** Professional advisor with 5-star rating

---

## 🔧 Tracking Setup (Already Configured)

✅ **Meta Pixel ID:** 1884617578809782  
✅ **Conversion Event:** Lead (tracks button clicks)  
✅ **Deduplication:** Enabled (Pixel + Conversion API = 1 event)  
✅ **Event Match Quality:** 7.0+/10 (optimized)

### What Gets Tracked:
- ✅ Button clicks on main CTA buttons
- ✅ Button clicks on sticky mobile button
- ✅ GA4 internal analytics
- ✅ Geographic data (city, state, zip) via IP

### What Does NOT Get Tracked (Yet):
- ❌ Actual phone call completion
- ❌ Call duration
- ❌ Qualified leads (30+ seconds)

**Note:** For qualified call tracking, consider Retreaver webhook integration later (see `/RETREAVER_INTEGRATION_GUIDE.md`).

---

## 💰 Budget Recommendations

### **Phase 1: Testing (Days 1-7)**
- **Daily Budget:** $150/day ($75 per ad set)
- **Goal:** Test ad creative, gather data
- **Expected Results:** 
  - 30-60 button clicks/day
  - 15-30 actual calls/day (50% conversion from clicks)
  - Cost per click: $2-5
  - Cost per actual call: $5-15

### **Phase 2: Scaling (Days 8-30)**
- **Daily Budget:** $300/day ($150 per ad set)
- **Goal:** Scale winning ad creative
- **Expected Results:**
  - 60-120 button clicks/day
  - 30-60 actual calls/day
  - Improved cost per call as campaign learns

### **Phase 3: Optimization (Month 2+)**
- **Daily Budget:** $500-1000/day (based on profitability)
- **Goal:** Maximize qualified calls
- **Strategy:** Consider adding Retreaver for qualified call tracking

---

## 📈 Success Metrics

### **Primary KPIs:**
1. **Button Clicks (Lead Events)** - What Meta sees
2. **Actual Calls** - What you receive (track manually)
3. **Cost Per Lead** - Button click cost
4. **Cost Per Actual Call** - True acquisition cost

### **What to Monitor Daily:**
- Meta "Lead" events count
- Actual phone calls received
- Discrepancy between button clicks and calls (30-50% expected)
- Event Match Quality (should stay 7.0+/10)
- Cost per lead trends

### **Success Benchmarks:**
- ✅ **Good:** 40-60% of button clicks result in actual calls
- ✅ **Great:** Cost per actual call under $20
- ✅ **Excellent:** 50+ qualified calls/day at scale

---

## 🚀 Launch Checklist

### **Pre-Launch (Complete Before Ads Go Live):**
- [x] Meta Pixel installed and verified (ID: 1884617578809782)
- [x] Conversion API configured and tested
- [x] Landing page live at www.neighborcoverage.com
- [x] Phone number working: (866) 649-9062
- [x] Advisors trained and ready (7am-11pm EST)
- [x] Deduplication verified (Pixel + API = 1 event)
- [ ] Ad creative uploaded to Meta Ads Manager
- [ ] Campaign budget approved
- [ ] Team ready to handle call volume

### **Launch Day:**
1. ✅ Verify tracking is working (check Meta Events Manager)
2. ✅ Make 1 test call yourself
3. ✅ Confirm "Lead" event fires in Meta
4. ✅ Turn on ads at 7:00 AM EST
5. ✅ Monitor hourly for first 24 hours

### **Post-Launch (First 24 Hours):**
- ✅ Check button clicks vs actual calls ratio
- ✅ Verify Event Match Quality stays above 7.0
- ✅ Monitor cost per lead
- ✅ Ensure advisors can handle volume
- ✅ Document any issues

---

## 📞 Expected Campaign Performance

### **Realistic Expectations:**

#### **Week 1: Learning Phase**
- Meta algorithm is learning your audience
- Cost per lead may be higher ($5-10)
- Expect 10-20 actual calls/day
- Allow 3-7 days for optimization

#### **Week 2-4: Optimization Phase**
- Cost per lead should decrease ($3-7)
- Call volume increases (20-40/day)
- Better quality traffic
- Identify winning ad creative

#### **Month 2+: Scaling Phase**
- Stable cost per lead ($2-5)
- Higher call volume (40-80/day)
- Consider geographic targeting refinements
- Evaluate Retreaver integration for qualified call tracking

---

## 🔄 Optimization Strategies

### **After 7 Days:**
1. **Identify Winning Ad Creative**
   - Pause underperforming ads
   - Double budget on winning ads

2. **Analyze Geographic Performance**
   - Check Meta Ads Manager for state-level data
   - Consider separate ad sets for high-performing states

3. **Adjust Schedule if Needed**
   - Analyze hourly performance
   - Shift budget to peak hours if clear patterns emerge

### **After 30 Days:**
1. **Consider Audience Segmentation**
   - Create separate campaigns for different age groups
   - Test lookalike audiences from your best leads

2. **Evaluate Call Quality**
   - Track which ads drive highest quality calls
   - Consider Retreaver webhook for qualified call tracking

3. **Scale Winning Elements**
   - Increase budget on best-performing ad sets
   - Expand to additional placements if needed

---

## 🚨 Troubleshooting

### **Problem: Too Many Button Clicks, Few Actual Calls**
**Solution:**
- This is normal (30-50% discrepancy expected)
- If ratio is worse than 70% discrepancy:
  - Review ad copy for clarity
  - Ensure phone number is prominently displayed
  - Check mobile experience

### **Problem: High Cost Per Lead**
**Solution:**
- Let campaign run 7 days minimum (learning phase)
- Check Event Match Quality (should be 7.0+/10)
- Review targeting (too narrow can increase costs)
- Test new ad creative

### **Problem: Low Event Match Quality**
**Solution:**
- Already optimized in code (should be 7.0+/10)
- Check browser console for tracking errors
- Verify Pixel and Conversion API both firing

### **Problem: Low Call Volume**
**Solution:**
- Increase daily budget
- Expand targeting (add related interests)
- Test different ad creative
- Verify advisors are available during scheduled hours

---

## 📝 Next Steps After Launch

### **Immediate (Within 7 Days):**
1. ✅ Monitor daily metrics
2. ✅ Pause underperforming ads
3. ✅ Document call quality patterns
4. ✅ Optimize budget allocation

### **Short-Term (Within 30 Days):**
1. 🔄 Scale winning ad creative
2. 🔄 Consider geographic segmentation
3. 🔄 Evaluate need for Retreaver integration
4. 🔄 Test new ad variations

### **Long-Term (Month 2+):**
1. 🚀 Implement Retreaver webhook for qualified call tracking
2. 🚀 Create lookalike audiences from best leads
3. 🚀 Expand to other insurance products (home, bundle)
4. 🚀 Optimize for cost per qualified call, not just clicks

---

## 📞 Support & Resources

- **Landing Page:** https://www.neighborcoverage.com
- **Phone Number:** (866) 649-9062
- **Meta Pixel ID:** 1884617578809782
- **Tracking Documentation:** `/TRACKING_EXPECTATIONS.md`
- **Advanced Tracking:** `/RETREAVER_INTEGRATION_GUIDE.md`

---

## ✅ Final Reminders

1. **Keep it Simple:** This is a simple setup. Don't overcomplicate.
2. **Be Realistic:** Button clicks ≠ actual calls. Expect 30-50% discrepancy.
3. **Monitor Daily:** Check metrics daily for first 2 weeks.
4. **Give it Time:** Allow 7 days for Meta to learn and optimize.
5. **Scale Gradually:** Don't jump budget too quickly.
6. **Document Everything:** Track patterns for optimization.

**Ready to launch? Let's get some calls! 🚀**
