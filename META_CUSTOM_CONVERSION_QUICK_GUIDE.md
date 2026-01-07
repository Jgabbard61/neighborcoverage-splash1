# Meta Custom Conversion - Quick Completion Guide
**Based on your screenshot - You're 90% done!**

---

## 🎯 What You Have So Far (From Screenshot):

✅ **Name:** QualifiedCall  
✅ **Data Source:** NeighborCoverage Auto Insurance  
✅ **Action Source:** Website  
✅ **Event:** Lead  
✅ **Conversion Value:** $30.00  

---

## ⚠️ What You Need to Complete: **Rules Section**

**UPDATE:** Since you're using "Call conversion location" (not splash page), button clicks DON'T fire "Lead" events. **ALL "Lead" events = from webhook.**

**This means: Leave rules BLANK (simplest approach).**

---

### **Option 1: No Rules (SIMPLEST - Recommended)**

**What to do:**
1. **Leave "Event Parameters" dropdown blank**
2. **Leave "Parameter values" field empty**
3. **Just click "Create" button**

**Why this works:**
- Your webhook will send "Lead" events with specific parameters
- Meta will track ALL "Lead" events (including webhook ones)
- You'll set your campaign to optimize for "QualifiedCall" custom conversion
- Meta learns: "Lead events from /api/retreaver-webhook = qualified calls"

**This is the easiest and works perfectly for your use case.**

---

### **Option 2: Filter by URL (More Specific)**

**If you want to ONLY count webhook calls:**

1. **Click "Event Parameters" dropdown**
2. **Select:** "URL" (or "Event Source URL")
3. **Condition:** "contains"
4. **Parameter values:** Type: `/api/retreaver-webhook`
5. **Click the "+" button** to add rule
6. **Click "Create"**

**Result:**
- ONLY "Lead" events from webhook will count as "QualifiedCall"
- Button clicks on splash page will NOT count
- More accurate, but requires webhook to be working first

---

### **Option 3: Filter by Value (Alternative)**

**If you want to track by conversion value:**

1. **Click "Event Parameters" dropdown**
2. **Select:** "Value"
3. **Condition:** "greater than or equal to"
4. **Parameter values:** Type: `160`
5. **Click the "+" button** to add rule
6. **Click "Create"**

**Why 160?**
- Your webhook sends call_duration = 180, 200, etc.
- This filters for calls ≥160 seconds
- Matches your buyer payment threshold

---

## 🎯 My Recommendation:

**Use Option 1 (No Rules) for now.**

**Why:**
- Fastest to set up (just click "Create")
- You can always add rules later
- Your webhook logic already filters for 160+s calls
- Less chance of configuration error

**Then:**
1. Test webhook with a real call
2. If you see NON-qualified calls showing up as "QualifiedCall" in Meta
3. Come back and add Option 2 rule (URL filter)

---

## 🛠️ Step-by-Step to Complete (Right Now):

### **Based on your screenshot:**

1. **Scroll down in the "Rules" section**
   - You should see "Event Parameters" dropdown (you already have it open)
   - And "Parameter values" text field

2. **Decision time:**
   - **Easy route:** Leave both blank, skip to step 3
   - **Advanced route:** Follow Option 2 or 3 above

3. **Scroll down to "Enter a conversion value"**
   - You already have: `$30.00` ✅
   - This is good (your estimated profit per qualified call)

4. **Click the blue "Create" button** (bottom right)

5. **Done!** You'll see "QualifiedCall" in your custom conversions list

---

## ✅ After Creating Custom Conversion:

### **In Your Campaign Settings:**

1. Go to: **Meta Ads Manager** → Your Auto Insurance Campaign

2. Click: **Campaign Settings** (not ad set)

3. Find: **"Conversion Event"** or **"Optimization Goal"**

4. Change from:
   - ❌ "Lead" (standard event)
   - ✅ "QualifiedCall" (your new custom conversion)

5. **Save Changes**

6. **Let it run for 3-5 days** (learning phase resets)

---

## 📊 What Happens Next:

### **Learning Phase (Days 1-5):**
- Meta resets algorithm (treats as new campaign)
- CPL may spike to $15-25 initially
- Volume drops (Meta is conservative)
- **Don't panic!** This is normal

### **Optimization Phase (Days 6-14):**
- Meta learns which users call AND stay on line 160+s
- CPL stabilizes at $10-15
- Volume increases
- **Key metric:** 80-90% of conversions = 160+s calls

### **Scaled Phase (Week 3+):**
- CPL drops to $8-12 for qualified calls
- False positive rate <10%
- You can confidently scale budget
- **ROI improves** (every conversion = payment)

---

## 🚀 Quick Start Checklist:

**Right Now (5 minutes):**
- [ ] In your Meta screenshot window
- [ ] Leave "Rules" blank (Option 1)
- [ ] Verify "$30.00" conversion value
- [ ] Click "Create" button
- [ ] Custom conversion "QualifiedCall" is created ✅

**After Webhook is Live (30 minutes):**
- [ ] Make test call >160 seconds
- [ ] Check Retreaver: Call shows as "Completed" with duration ≥160s
- [ ] Check Meta Events Manager: "Lead" or "QualifiedCall" event appears
- [ ] Check Vercel logs: Webhook processed successfully

**After Testing (Same Day):**
- [ ] Update campaign conversion goal to "QualifiedCall"
- [ ] Let run for 3-5 days without changes
- [ ] Monitor: % of conversions that are 160+s calls

**Friday Check-in (3-5 days later):**
- [ ] Compare: Cost per qualified call vs previous CPL
- [ ] Review: What % of "QualifiedCall" events are actually 160+s?
- [ ] Decide: Scale Tier 1 if 80%+ qualified OR pause Tier 3 if <50%

---

## 📝 Your Next 3 Actions:

1. **Click "Create" in Meta** (screenshot window) - ➡️ **Do this RIGHT NOW**

2. **Follow "RETREAVER_WEBHOOK_SETUP_GUIDE.md"** to get webhook secret and configure Retreaver

3. **Test with a real 3+ minute call** to verify everything works

---

**You're almost done! Just click "Create" and move to Retreaver setup.** 🚀
