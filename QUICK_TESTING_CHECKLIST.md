# Quick Testing Checklist
## 5-Minute Verification for NeighborCoverage Tracking

**Meta Pixel ID:** 1884617578809782  
**Website:** https://www.neighborcoverage.com  
**Phone:** (866) 649-9062  

---

## ⚡ Quick Status Check (2 minutes)

### Test 1: Is Pixel Loading?
```
□ 1. Install Chrome extension: "Meta Pixel Helper"
□ 2. Visit: https://www.neighborcoverage.com
□ 3. Click extension icon
□ 4. Check: Green checkmark with "1884617578809782" ✓
```

**✅ PASS:** Pixel detected  
**❌ FAIL:** No pixel found → Check layout.tsx

---

### Test 2: Is Deduplication Working?
```
□ 1. Visit: https://business.facebook.com/events_manager2/
□ 2. Select: Pixel 1884617578809782
□ 3. Click: "Test Events" tab
□ 4. On website: Click any "CALL NOW" button
□ 5. Check Test Events for: "Lead" event with "deduplicated" badge ✓
```

**✅ PASS:** Shows "Browser and Server (deduplicated)"  
**❌ FAIL:** Shows 2 separate Lead events → Check event_id matching

---

### Test 3: Are Conversions Accurate?
```
□ 1. Open: Meta Ads Manager → Your campaign
□ 2. Note: # of "Lead" conversions today
□ 3. Open: Retreaver dashboard → Call log
□ 4. Count: # of qualified calls (≥30 sec) today
□ 5. Compare: Do numbers match?
```

**✅ PASS:** Numbers match (1:1 ratio)  
**❌ FAIL:** Meta shows MORE conversions → False positives present

---

## 🔍 Deep Dive Check (3 minutes)

### Test 4: Check Event Match Quality
```
□ 1. Meta Events Manager → Overview tab
□ 2. Find: "Event Match Quality" score
□ 3. Check: Should be 7.0+/10 ✓
```

**✅ PASS:** 7.0 or higher  
**⚠️ WARNING:** 5.0-6.9 → Needs improvement  
**❌ FAIL:** Below 5.0 → Missing customer data

---

### Test 5: Verify No Duplicate Events
```
□ 1. Visit website → Open browser console (F12)
□ 2. Click "CALL NOW" button
□ 3. Count in console:
    - Should see 1x "[Meta Pixel] Lead event tracked"
    - Should see 1x "[Conversion API] success"
□ 4. Check Test Events: Should show 1 event with dedup badge
```

**✅ PASS:** 1 deduplicated event  
**❌ FAIL:** 2+ separate events → Deduplication broken

---

### Test 6: Verify Browser Console Logs
```
□ 1. Visit: https://www.neighborcoverage.com
□ 2. Open console: F12 → Console tab
□ 3. Click: "CALL NOW" button
□ 4. Look for these EXACT logs:

[DEDUPLICATION] Client-side event tracking: {
  event_id: "1702857392847_abc123xyz",
  note: "SAME event_id sent to BOTH Pixel and Conversion API"
}
[Meta Pixel] Lead event tracked, eventID: 1702857392847_abc123xyz
[Conversion API] ✓ Conversion API sent with event_id: 1702857392847_abc123xyz
```

**✅ PASS:** All 3 logs present with SAME event_id  
**❌ FAIL:** Missing logs or mismatched event_ids

---

## 🚨 Red Flags to Watch For

### Critical Issues (Fix Immediately)

**Red Flag #1: Double Events**
```
Symptom: Test Events shows 2 "Lead" events from 1 click
Impact: 2x inflated conversion numbers
Fix: Check event_id is top-level, not in user_data
```

**Red Flag #2: Low Event Match Quality**
```
Symptom: Score below 6.0/10
Impact: Poor ad targeting, higher costs
Fix: Verify fbc, fbp, external_id are being sent
```

**Red Flag #3: False Conversions**
```
Symptom: Meta shows 3 conversions, Retreaver shows 1 call
Impact: 67% wasted ad spend, wrong optimization
Fix: Implement Retreaver webhook (see RETREAVER_INTEGRATION_GUIDE.md)
```

---

## 📊 Key Numbers to Know

### Current Status (Day 1)
```
Meta "Lead" Conversions:     3
Retreaver Qualified Calls:   1
False Positive Rate:         67%
Event Match Quality:         7.0+/10 ✓
Deduplication:               Working ✓
```

### Target Goals
```
False Positive Rate:         0% (after Retreaver webhook)
Event Match Quality:         7.5+/10
Deduplication:               100% of events
Qualified Call Rate:         30-50% of button clicks
```

---

## ✅ Daily Checklist (5 minutes/day)

### Morning Check
```
□ Check Meta Ads Manager for yesterday's conversions
□ Check Retreaver for yesterday's qualified calls
□ Compare: Do numbers match?
□ Note any discrepancies
```

### If Numbers DON'T Match
```
□ Check Meta Events Manager for duplicate events
□ Check Vercel logs for errors
□ Check Retreaver webhook status
□ Review browser console logs for errors
```

---

## 🎯 Quick Decision Tree

### "How many conversions should I see?"

**BEFORE Retreaver integration:**
```
Button clicks → Meta conversions
Expected: 3 clicks = 3 conversions (even if only 1 call)
Problem: Inflated numbers ❌
```

**AFTER Retreaver integration:**
```
Qualified calls → Meta conversions
Expected: 3 clicks, 1 qualified call = 1 conversion
Solution: Accurate tracking ✅
```

### "Is my tracking working correctly?"

**Ask these questions:**

1. **Does Meta Pixel Helper show green checkmark?**
   - Yes → Pixel is loading ✓
   - No → Check layout.tsx

2. **Does Test Events show "deduplicated" badge?**
   - Yes → Deduplication working ✓
   - No → Check event_id matching

3. **Do Meta conversions = Retreaver calls?**
   - Yes → Tracking is accurate ✓
   - No → False positives present (need Retreaver webhook)

4. **Is Event Match Quality ≥ 7.0?**
   - Yes → Good data quality ✓
   - No → Add more customer data

---

## 🔧 Quick Fixes

### Fix #1: Pixel Not Loading
```
1. Check: nextjs_space/app/layout.tsx
2. Verify: NEXT_PUBLIC_META_PIXEL_ID in .env.local
3. Redeploy: git push origin main
```

### Fix #2: Deduplication Broken
```
1. Check browser console for event_id
2. Check Vercel logs for matching event_id
3. Verify: event_id is TOP-LEVEL in API request (not in user_data)
```

### Fix #3: Low Event Match Quality
```
1. Check console logs show fbc, fbp, external_id
2. Verify: All values are being hashed server-side
3. Add: More customer data (email if available)
```

### Fix #4: False Conversions
```
1. Read: RETREAVER_INTEGRATION_GUIDE.md
2. Create: /api/retreaver-webhook endpoint
3. Configure: Retreaver to send webhooks
4. Remove: Meta tracking from button onClick
```

---

## 📞 Test Call Protocol

### Make a Test Call Right Now

**Steps:**
```
1. Open https://www.neighborcoverage.com on your phone
2. Click "CALL NOW"
3. Call (866) 649-9062
4. Stay on line for 40+ seconds
5. Hang up
```

**What to check:**

**Browser (if testing on desktop):**
```
□ Console shows "[Meta Pixel] Lead event tracked"
□ Console shows "[Conversion API] success"
□ Both show SAME event_id
```

**Meta Events Manager:**
```
□ Test Events shows 1 "Lead" event
□ Shows "deduplicated" badge
□ Shows event parameters (content_name, value, etc.)
```

**Retreaver Dashboard:**
```
□ Call appears in call log
□ Duration shows ~40 seconds
□ Status: Completed
```

**Expected Time Gaps:**
```
T+0s:   Click button → Meta events fire immediately
T+2s:   Phone dialer opens
T+5s:   Call connects to Retreaver
T+45s:  Call ends
T+46s:  Retreaver logs call
```

---

## 🚀 Next Actions

### TODAY (Right Now)
```
□ Run all 6 tests above (5 minutes total)
□ Note any failures
□ Calculate current false positive rate
```

### THIS WEEK
```
□ Read: TRACKING_TESTING_GUIDE.md (full detail)
□ Read: RETREAVER_INTEGRATION_GUIDE.md (solution)
□ Set up: Retreaver webhook endpoint
□ Test: End-to-end qualified call tracking
```

### NEXT WEEK
```
□ Remove: Meta tracking from button clicks
□ Create: New campaign optimized for QualifiedCall
□ Monitor: Learning phase and performance
```

---

## 📊 Quick Reference Table

| Check | Tool | Expected Result | Time |
|-------|------|----------------|------|
| Pixel loads | Meta Pixel Helper | Green checkmark | 10s |
| Events fire | Browser console | 1x Lead event | 20s |
| Deduplication | Meta Test Events | "deduplicated" badge | 30s |
| Event quality | Events Manager | 7.0+/10 score | 20s |
| Accuracy | Meta vs Retreaver | 1:1 match | 2m |
| **TOTAL** | | | **~5min** |

---

## 💡 Pro Tips

### Tip #1: Use Test Events Mode
```
Always test changes in Meta Test Events before going live.
This prevents polluting your real data during testing.
```

### Tip #2: Keep Console Open
```
Always have browser console open when testing.
Look for [DEDUPLICATION] and [Meta Pixel] logs.
```

### Tip #3: Compare Daily
```
Check Meta vs Retreaver numbers every morning.
Catch discrepancies early before they affect optimization.
```

### Tip #4: Document Issues
```
Take screenshots of any errors.
Save console logs for troubleshooting.
Note timestamps when issues occur.
```

### Tip #5: Test Before Campaign Changes
```
Before increasing budget or changing targeting:
1. Verify tracking is working
2. Check false positive rate
3. Ensure data quality is high
```

---

## ❓ Quick FAQ

**Q: Why do I see more Meta conversions than Retreaver calls?**  
A: Button click tracking fires before actual calls. See "Fix #4" above.

**Q: Is 67% false positive rate normal?**  
A: No. After Retreaver integration, it should be 0%.

**Q: What's the fastest way to check if tracking is working?**  
A: Click a button, check browser console for deduplication logs.

**Q: How often should I run these tests?**  
A: Daily during first week, then weekly once stable.

**Q: What if Meta Pixel Helper shows multiple pixels?**  
A: Check for duplicate pixel code in layout.tsx. Should only initialize once.

---

## 🎯 Success Criteria

Your tracking is healthy when:

```
✅ Meta Pixel Helper shows green checkmark
✅ Test Events shows "deduplicated" badge
✅ Event Match Quality ≥ 7.0/10
✅ Meta conversions = Retreaver qualified calls (1:1)
✅ No errors in browser console
✅ No errors in Vercel logs
✅ No errors in Meta Events Manager
```

---

## 📞 Need Help?

If tests fail:

1. **Check documentation:**
   - TRACKING_TESTING_GUIDE.md (detailed testing)
   - RETREAVER_INTEGRATION_GUIDE.md (solution)
   - EVENT_DEDUPLICATION_GUIDE.md (deduplication)

2. **Check logs:**
   - Browser console (F12)
   - Vercel logs (vercel.com/dashboard)
   - Meta Events Manager (Test Events tab)

3. **Compare screenshots:**
   - Take screenshot of failing test
   - Compare to expected results in guides

---

**Quick Start:** Run Test 1-3 right now (takes 2 minutes) to get instant health check!

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Next Review:** Daily for first week
