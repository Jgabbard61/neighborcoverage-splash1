# Tracking Flow Diagrams
## Visual Guide to NeighborCoverage Conversion Tracking

**Project:** NeighborCoverage Auto Insurance  
**Purpose:** Visualize tracking flows to identify false conversions and understand the fix  

---

## 🔴 Current Implementation (WRONG)

### Flow 1: What Happens When User Clicks Button

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "CALL NOW"                        │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  onClick={trackCallInitiated()}
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│              trackCallInitiated() FIRES IMMEDIATELY              │
│                                                                  │
│  1. GA4 event: "call_initiated" ✓                               │
│  2. Meta Pixel: fbq('track', 'Lead') ❌ TOO EARLY!             │
│  3. Conversion API: POST /api/meta-conversion ❌ TOO EARLY!     │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  Both events sent to Meta
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                 META COUNTS THIS AS CONVERSION                   │
│                    (conversion #1 recorded)                      │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  ~200ms later
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│              <a href="tel:8666499062"> EXECUTES                  │
│                  Phone dialer opens                              │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  ~5 seconds later (maybe)
               │
               ▼
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ┌─────────┐   ┌──────────┐
   │  USER   │   │  USER    │
   │  CALLS  │   │ CANCELS  │
   └────┬────┘   └──────────┘
        │             │
        │             └──► No call made
        │                  Meta still counted conversion ❌
        │
        ▼
┌──────────────────────┐
│   Call connects to   │
│      Retreaver       │
└──────┬───────────────┘
       │
       │  Call duration varies
       │
       ▼
  ┌────┴─────┐
  │          │
  ▼          ▼
┌────────┐ ┌──────────┐
│ ≥30sec │ │  <30sec  │
│  GOOD  │ │   BAD    │
└────┬───┘ └──────────┘
     │          │
     │          └──► Unqualified call
     │               Meta already counted it ❌
     │
     ▼
┌──────────────────────┐
│  QUALIFIED CALL      │
│  (what you want!)    │
│                      │
│  But Meta counted:   │
│  - This qualified    │
│  - The unqualified   │
│  - The cancelled     │
│                      │
│  Result: 3 Meta      │
│  conversions,        │
│  1 real call         │
│  = 67% false rate ❌ │
└──────────────────────┘
```

### The Problem in Numbers

```
Day 1 Campaign Results:

User 1: Click → Meta ✓ → Cancel dial → No call
User 2: Click → Meta ✓ → Call 10 sec → Unqualified  
User 3: Click → Meta ✓ → Call 45 sec → QUALIFIED ✓

Meta Dashboard:        Retreaver Dashboard:
─────────────────      ─────────────────────
3 conversions          1 qualified call
                       
False positive rate: (3-1)/3 = 67% ❌
```

---

## ✅ Fixed Implementation (CORRECT)

### Flow 2: How It SHOULD Work with Retreaver Webhook

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "CALL NOW"                        │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  onClick - NO META TRACKING
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│              trackCallInitiated() - GA4 ONLY                     │
│                                                                  │
│  1. GA4 event: "call_initiated" ✓ (internal tracking)          │
│  2. NO Meta Pixel ✓                                            │
│  3. NO Conversion API ✓                                         │
│                                                                  │
│  console.log("Waiting for Retreaver to confirm qualified")     │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  Immediately
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│              <a href="tel:8666499062"> EXECUTES                  │
│                  Phone dialer opens                              │
└──────────────┬───────────────────────────────────────────────────┘
               │
               │  ~5 seconds later
               │
               ▼
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ┌─────────┐   ┌──────────┐
   │  USER   │   │  USER    │
   │  CALLS  │   │ CANCELS  │
   └────┬────┘   └──────────┘
        │             │
        │             └──► No call made
        │                  Meta NOT notified ✓
        ▼                  No false conversion ✓
┌──────────────────────┐
│   Call connects to   │
│      Retreaver       │
└──────┬───────────────┘
       │
       │  Retreaver monitors call
       │
       ▼
  ┌────┴─────┐
  │          │
  ▼          ▼
┌────────┐ ┌──────────┐
│ ≥30sec │ │  <30sec  │
│  GOOD  │ │   BAD    │
└────┬───┘ └────┬─────┘
     │          │
     │          └──► Unqualified call
     │               Meta NOT notified ✓
     │               No false conversion ✓
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RETREAVER DETECTS QUALIFIED CALL               │
│                                                                 │
│  Duration: 45 seconds ✓                                        │
│  Status: Completed ✓                                           │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │  Webhook trigger
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│       RETREAVER SENDS WEBHOOK TO YOUR SERVER                    │
│                                                                 │
│  POST https://www.neighborcoverage.com/api/retreaver-webhook   │
│                                                                 │
│  {                                                              │
│    "call": {                                                    │
│      "id": "12345",                                             │
│      "duration": 45,                                            │
│      "status": "completed",                                     │
│      "caller_number": "+1234567890"                             │
│    }                                                            │
│  }                                                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │  Webhook received
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│            YOUR SERVER PROCESSES WEBHOOK                        │
│                                                                 │
│  1. Verify webhook signature ✓                                 │
│  2. Check qualification criteria:                              │
│     - Status = "completed" ✓                                   │
│     - Duration ≥ 30 seconds ✓                                  │
│  3. Call is QUALIFIED ✓                                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │  Generate event_id
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│         YOUR SERVER SENDS TO META CONVERSIONS API               │
│                                                                 │
│  POST https://graph.facebook.com/v18.0/1884617578809782/events │
│                                                                 │
│  {                                                              │
│    "event_name": "QualifiedCall",                              │
│    "event_time": 1702857392,                                   │
│    "event_id": "retreaver_12345_1702857392847",                │
│    "action_source": "phone_call",                              │
│    "user_data": {                                              │
│      "ph": ["[hashed]"],                                       │
│      "country": ["[hashed]"]                                   │
│    },                                                           │
│    "custom_data": {                                            │
│      "call_duration": 45,                                      │
│      "value": 1.00                                             │
│    }                                                            │
│  }                                                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │  Meta processes event
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│              META COUNTS QUALIFIED CALL CONVERSION              │
│                                                                 │
│              ✅ ONLY REAL CALLS COUNTED                         │
└─────────────────────────────────────────────────────────────────┘
```

### The Fix in Numbers

```
Same Day 1 Campaign with Retreaver Webhook:

User 1: Click → Cancel dial → No webhook → Meta: 0
User 2: Click → Call 10 sec → No webhook → Meta: 0
User 3: Click → Call 45 sec → Webhook fires → Meta: 1 ✓

Meta Dashboard:        Retreaver Dashboard:
─────────────────      ─────────────────────
1 conversion           1 qualified call

False positive rate: (1-1)/1 = 0% ✅
Accuracy: 100% ✅
```

---

## 🔄 Deduplication Flow

### Flow 3: How Pixel + Conversion API Deduplicate (Current Implementation)

```
┌──────────────────────────────────────────────────────────────────┐
│                 USER CLICKS "CALL NOW"                           │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│            generateEventId() creates unique ID                  │
│                                                                 │
│            event_id = "1702857392847_abc123xyz"                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ├───────────────────┬─────────────────────────────┐
               │                   │                             │
               ▼                   ▼                             ▼
     ┌─────────────────┐  ┌────────────────────┐   ┌────────────────────┐
     │  BROWSER PATH   │  │   SERVER PATH      │   │  sessionStorage    │
     │  (Meta Pixel)   │  │ (Conversion API)   │   │  (for reference)   │
     └────────┬────────┘  └─────────┬──────────┘   └────────────────────┘
              │                     │
              │                     │
              ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────────────────┐
│  Meta Pixel fires    │  │  POST /api/meta-conversion           │
│                      │  │                                      │
│  fbq('track',        │  │  Body: {                             │
│    'Lead',           │  │    event_id: "1702857392847_...",   │
│    { /* data */ },   │  │    event_name: "Lead",              │
│    {                 │  │    user_data: { ... }               │
│      eventID:        │  │  }                                  │
│      "1702857...xyz" │  │                                      │
│    }                 │  │                                      │
│  )                   │  │                                      │
└──────────┬───────────┘  └─────────┬────────────────────────────┘
           │                        │
           │  SAME event_id         │  SAME event_id
           │  "1702857392847_..."   │  "1702857392847_..."
           │                        │
           ▼                        ▼
  ┌─────────────────┐     ┌──────────────────────┐
  │   Meta Servers  │     │   Meta Servers       │
  │   (Browser)     │     │   (Server)           │
  └────────┬────────┘     └─────────┬────────────┘
           │                        │
           │                        │
           │         Meta's Deduplication Logic
           │                        │
           │      ┌─────────────────┴──────────────┐
           │      │                                │
           └──────┼───► Compare event_ids          │
                  │     Are they the same?         │
                  │                                │
                  │     "1702857392847_abc123xyz"  │
                  │              ==                │
                  │     "1702857392847_abc123xyz"  │
                  │                                │
                  │     YES! ✓                     │
                  └────────────┬───────────────────┘
                               │
                               ▼
                ┌──────────────────────────────────┐
                │  META COUNTS AS 1 CONVERSION     │
                │                                  │
                │  Status: "deduplicated"          │
                │  Source: Browser and Server      │
                └──────────────────────────────────┘
```

### What Happens If event_id Doesn't Match

```
SCENARIO: event_id mismatch (WRONG implementation)

Browser:                           Server:
─────────                          ────────
event_id: "1702857392847_abc123"   event_id: "1702857392999_xyz789"
                                                     ↑
                                              Different ID!

           Meta Comparison:
           ────────────────
           "1702857392847_abc123" ≠ "1702857392999_xyz789"
           
           Result: NOT EQUAL ❌
           
           ▼
┌──────────────────────────────────────────┐
│  META COUNTS AS 2 CONVERSIONS            │
│                                          │
│  Conversion #1: Browser event            │
│  Conversion #2: Server event             │
│                                          │
│  Status: No deduplication badge          │
│  Impact: 2x inflated numbers ❌          │
└──────────────────────────────────────────┘
```

---

## 📊 Comparison Flowchart

### Flow 4: Side-by-Side Comparison

```
╔════════════════════════════════════════════════════════════════════╗
║                          BUTTON CLICK                              ║
╚════════════════════════════════════════════════════════════════════╝
                              │
                              │
              ┌───────────────┴────────────────┐
              │                                │
              ▼                                ▼
┌─────────────────────────────┐  ┌────────────────────────────────┐
│    CURRENT (WRONG) ❌        │  │      FIXED (RIGHT) ✅          │
├─────────────────────────────┤  ├────────────────────────────────┤
│                             │  │                                │
│ 1. Meta events fire         │  │ 1. NO Meta events              │
│    immediately              │  │                                │
│                             │  │ 2. Phone dialer opens          │
│ 2. Phone dialer opens       │  │                                │
│                             │  │ 3. Call connects               │
│ 3. Meta already counted     │  │                                │
│                             │  │ 4. Retreaver monitors          │
│ 4. Call may not happen      │  │                                │
│                             │  │ 5. IF qualified:               │
│ 5. False conversion ❌       │  │    - Webhook fires             │
│                             │  │    - Server sends to Meta      │
│                             │  │    - Meta counts conversion    │
│                             │  │                                │
│                             │  │ 6. IF not qualified:           │
│                             │  │    - No webhook                │
│                             │  │    - Meta not notified         │
│                             │  │    - No false conversion ✅     │
└─────────────────────────────┘  └────────────────────────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────────┐  ┌────────────────────────────────┐
│  RESULT                     │  │  RESULT                        │
├─────────────────────────────┤  ├────────────────────────────────┤
│ • 3 button clicks           │  │ • 3 button clicks              │
│ • 3 Meta conversions        │  │ • 1 qualified call             │
│ • 1 qualified call          │  │ • 1 Meta conversion            │
│                             │  │                                │
│ • 67% false positive ❌      │  │ • 0% false positive ✅          │
│ • Wrong optimization        │  │ • Correct optimization         │
│ • Wasted ad spend           │  │ • Efficient ad spend           │
└─────────────────────────────┘  └────────────────────────────────┘
```

---

## 🧭 User Journey Map

### Flow 5: User Intent vs Conversion Tracking

```
USER INTENT SPECTRUM:
Low Intent ◄────────────────────────────────────────────────► High Intent


┌─────────────────┐   ┌──────────────┐   ┌─────────────┐   ┌─────────────┐
│   Accidental    │   │   Curious    │   │  Interested │   │   Ready to  │
│     Click       │   │    Click     │   │   but not   │   │     Buy     │
│                 │   │              │   │    ready    │   │             │
│ • Misclick      │   │ • Wants info │   │ • Calls but │   │ • Calls AND │
│ • Closes dialer │   │ • Opens dial │   │   hangs up  │   │   talks 30+ │
│ • No call made  │   │ • Doesn't    │   │   quickly   │   │   seconds   │
│                 │   │   call       │   │ • <30 sec   │   │             │
└────────┬────────┘   └──────┬───────┘   └──────┬──────┘   └──────┬──────┘
         │                   │                  │                 │
         │                   │                  │                 │
    ┌────┴────┐         ┌────┴────┐       ┌────┴────┐       ┌────┴────┐
    │         │         │         │       │         │       │         │
    ▼         ▼         ▼         ▼       ▼         ▼       ▼         ▼

CURRENT TRACKING (WRONG):
════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────┐
│             ALL CLICKS COUNTED AS CONVERSIONS ❌                     │
│                                                                     │
│  Accidental: Meta ✓ | Curious: Meta ✓ | Short: Meta ✓ | Good: Meta ✓ │
│                                                                     │
│  Result: 4 conversions, 1 qualified = 75% waste                    │
└─────────────────────────────────────────────────────────────────────┘


FIXED TRACKING (RIGHT):
════════════════════════════════════════════════════════════════════════
┌─────────────────────────────────────────────────────────────────────┐
│         ONLY QUALIFIED CALLS COUNTED AS CONVERSIONS ✅               │
│                                                                     │
│  Accidental: ✗     | Curious: ✗      | Short: ✗       | Good: Meta ✓ │
│                                                                     │
│  Result: 1 conversion, 1 qualified = 0% waste ✅                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Campaign Optimization Impact

### Flow 6: How Meta Learns (Wrong vs Right)

```
CURRENT SETUP (WRONG): Meta optimizes for BUTTON CLICKS
═══════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────┐
│                    META'S LEARNING PROCESS                     │
│                                                                │
│  Meta observes:                                                │
│  • User A clicked button → Conversion ✓                        │
│  • User B clicked button → Conversion ✓                        │
│  • User C clicked button → Conversion ✓                        │
│                                                                │
│  Meta learns:                                                  │
│  "Find users who will CLICK the button"                        │
│                                                                │
│  Meta targets:                                                 │
│  • Clickers (not necessarily callers)                          │
│  • Curious browsers                                            │
│  • Accidental clicks                                           │
│                                                                │
│  Result:                                                       │
│  ❌ Low-quality traffic                                         │
│  ❌ High cost per ACTUAL call                                   │
│  ❌ Wasted ad spend on non-converters                           │
└────────────────────────────────────────────────────────────────┘


FIXED SETUP (RIGHT): Meta optimizes for QUALIFIED CALLS
═══════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────┐
│                    META'S LEARNING PROCESS                     │
│                                                                │
│  Meta observes:                                                │
│  • User A clicked → No conversion (didn't call)                │
│  • User B clicked → No conversion (short call)                 │
│  • User C clicked → Conversion ✓ (qualified call)              │
│                                                                │
│  Meta learns:                                                  │
│  "Find users who will COMPLETE A QUALIFIED CALL"               │
│                                                                │
│  Meta targets:                                                 │
│  • High-intent users ready to buy                              │
│  • Users likely to complete calls                              │
│  • Serious shoppers, not browsers                              │
│                                                                │
│  Result:                                                       │
│  ✅ High-quality traffic                                        │
│  ✅ Lower cost per ACTUAL call                                  │
│  ✅ Efficient ad spend on real converters                       │
└────────────────────────────────────────────────────────────────┘


PERFORMANCE COMPARISON OVER TIME:
──────────────────────────────────

Week 1:
Current: 100 clicks → 100 "conversions" → 30 qualified calls
         Cost per "conversion": $10
         REAL cost per call: $33.33 (but you think it's $10!)

Fixed:   100 clicks → 30 conversions → 30 qualified calls
         Cost per conversion: $33.33
         REAL cost per call: $33.33 (accurate tracking!)

Week 4 (after Meta learns):
Current: Still optimizing for clicks → 100 clicks → 30 calls
         No improvement (wrong signal)

Fixed:   Meta learned to find callers → 80 clicks → 40 calls!
         Cost per call drops to $25 (50% fewer wasted clicks!)
         Better targeting, lower cost ✅
```

---

## 🔁 Event Match Quality Flow

### Flow 7: How Customer Data Improves Tracking

```
EVENT SENT TO META WITH MINIMAL DATA (Poor Match Quality):
══════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────┐
│  Event: Lead                                             │
│  event_id: "123abc"                                      │
│  user_data: {                                            │
│    // Empty - no customer data                           │
│  }                                                       │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Meta tries to │
        │  match to user │
        │  profile...    │
        └────────┬───────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│  POOR MATCH (1-2 signals matched)                         │
│                                                            │
│  Event Match Quality: 2.0/10 ❌                            │
│                                                            │
│  Impact:                                                   │
│  • Conversion attributed to wrong user                     │
│  • Poor audience insights                                  │
│  • Inefficient optimization                                │
└────────────────────────────────────────────────────────────┘


EVENT SENT WITH RICH CUSTOMER DATA (Good Match Quality):
══════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────┐
│  Event: QualifiedCall                                    │
│  event_id: "retreaver_12345_1702857392847"               │
│  user_data: {                                            │
│    ph: ["[hashed phone]"],          ✓ Signal #1         │
│    country: ["[hashed]"],            ✓ Signal #2         │
│    fbc: "fb.1.123...",               ✓ Signal #3         │
│    fbp: "fb.1.456...",               ✓ Signal #4         │
│    external_id: "nc_123...",         ✓ Signal #5         │
│    ct: ["[hashed city]"],            ✓ Signal #6         │
│    st: ["[hashed state]"],           ✓ Signal #7         │
│    zp: ["[hashed zip]"]              ✓ Signal #8         │
│  }                                                       │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Meta matches  │
        │  8 signals to  │
        │  user profile  │
        └────────┬───────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│  STRONG MATCH (8+ signals matched)                        │
│                                                            │
│  Event Match Quality: 8.5/10 ✅                            │
│                                                            │
│  Impact:                                                   │
│  ✅ Conversion attributed to correct user                  │
│  ✅ Accurate audience insights                             │
│  ✅ Efficient optimization                                 │
│  ✅ Better lookalike audiences                             │
└────────────────────────────────────────────────────────────┘
```

---

## 📈 Timeline: Before vs After Fix

### Flow 8: 30-Day Campaign Comparison

```
CAMPAIGN A: CURRENT IMPLEMENTATION (Button Click Tracking)
═══════════════════════════════════════════════════════════════

Day 1-7:     Day 8-14:    Day 15-21:   Day 22-30:
───────────  ───────────  ───────────  ───────────
100 clicks   120 clicks   140 clicks   150 clicks
100 "conv"   120 "conv"   140 "conv"   150 "conv"
 30 calls     35 calls     40 calls     42 calls

Cost/conv:   Cost/conv:   Cost/conv:   Cost/conv:
  $10 ✗        $10 ✗        $10 ✗        $10 ✗
              (but actually $34)

│ Meta learning: "Find people who click buttons"
│ Problem: Optimizing for wrong behavior ❌
│ Result: Lots of clicks, few qualified calls
│ True cost per call: $35.71 (but you think it's $10!)


CAMPAIGN B: FIXED IMPLEMENTATION (Retreaver Webhook)
═══════════════════════════════════════════════════════════════

Day 1-7:     Day 8-14:    Day 15-21:   Day 22-30:
───────────  ───────────  ───────────  ───────────
100 clicks   95 clicks    85 clicks    75 clicks  ← Fewer clicks
 30 conv      33 conv      38 conv      45 conv   ← More calls!
 30 calls     33 calls     38 calls     45 calls  ← Same as conv ✓

Cost/conv:   Cost/conv:   Cost/conv:   Cost/conv:
 $33.33      $30.30       $26.32       $22.22 ✓  ← Decreasing!

│ Meta learning: "Find people who complete qualified calls"
│ Solution: Optimizing for right behavior ✅
│ Result: Fewer clicks, MORE qualified calls
│ True cost per call: $22.22 (and improving!)
│ Improvement over Campaign A: 38% lower cost per call!


SIDE-BY-SIDE RESULTS:
─────────────────────

Metric                  │ Campaign A │ Campaign B │ Winner
────────────────────────┼────────────┼────────────┼────────
Total clicks            │    510     │    355     │   A
"Conversions" reported  │    510     │    146     │   A
ACTUAL qualified calls  │    147     │    146     │   Tie
Cost per reported conv  │    $10     │   $27.40   │   A
Cost per ACTUAL call    │   $34.69   │   $27.40   │   B ✅
Quality of conversions  │    29%     │    100%    │   B ✅
Wasted ad spend         │    71%     │     0%     │   B ✅
Meta optimization       │   Wrong    │   Right    │   B ✅
True ROAS              │  Hidden    │  Accurate  │   B ✅
────────────────────────┴────────────┴────────────┴────────

Campaign B wins where it matters:
• Lower cost per ACTUAL call
• 100% conversion quality (no false positives)
• Better optimization over time
• Accurate reporting for decision-making
```

---

## 🎨 Legend & Symbols

```
✅ = Correct implementation
❌ = Wrong implementation
⚠️ = Warning / needs attention
✓ = Success / verification passed
✗ = Failure / verification failed

→ = Causes / leads to
▼ = Next step in flow
├─ = Branch in logic
└─ = End of branch

┌─┐ = Process box
│ │ = Container
└─┘ = End container

═══ = Important section header
─── = Divider
```

---

## 🔄 Quick Reference

### Key Differences Summary

| Aspect | Current (WRONG) | Fixed (RIGHT) |
|--------|----------------|---------------|
| **When event fires** | On button click | After qualified call |
| **What triggers** | onClick handler | Retreaver webhook |
| **False positives** | 67% | 0% |
| **Tracking accuracy** | Low | High |
| **Meta optimization** | Clicks | Qualified calls |
| **Cost per call** | Hidden (inflated) | Accurate |

### Critical Timing Comparison

```
CURRENT:
Button click (T+0ms) → Meta event fires → tel: link opens → Call may happen

FIXED:
Button click (T+0ms) → tel: link opens → Call connects → Duration check → 
Webhook fires (T+45s) → Meta event fires
```

---

## 🎯 Next Steps

After understanding these flows:

1. **Immediate:** Review QUICK_TESTING_CHECKLIST.md to verify current implementation
2. **This Week:** Follow RETREAVER_INTEGRATION_GUIDE.md to implement fix
3. **Ongoing:** Monitor conversion accuracy using TRACKING_TESTING_GUIDE.md

---

**Document Version:** 1.0  
**Last Updated:** December 18, 2024  
**Next Review:** After Retreaver integration complete
