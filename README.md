# NeighborCoverage Splash Page

High-converting auto insurance splash page with Meta Pixel tracking and TrackDrive webhook integration.

## Quick Start

1. Copy `.env.example` to `.env` and fill in your values
2. Run `yarn install`
3. Run `yarn dev`

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_META_PIXEL_ID` | Your Meta (Facebook) Pixel ID | Yes |
| `META_CONVERSION_API_TOKEN` | Meta Conversions API access token | Yes |
| `TRACKDRIVE_WEBHOOK_SECRET` | Secret for verifying TrackDrive webhook requests | Recommended |
| `QUALIFIED_CALL_DURATION_THRESHOLD` | Minimum call duration in seconds to fire QualifiedCall (default: 120) | No |
| `NEXT_PUBLIC_PHONE_NUMBER` | Display phone number for CTAs (default: 000-000-0000) | Yes |

## Meta Pixel Setup

### 1. Get Your Pixel ID
- Go to [Meta Events Manager](https://business.facebook.com/events_manager)
- Select your pixel or create a new one
- Copy the Pixel ID and set it as `NEXT_PUBLIC_META_PIXEL_ID`

### 2. Get Conversions API Token
- In Events Manager, go to Settings for your pixel
- Under "Conversions API", generate an access token
- Set it as `META_CONVERSION_API_TOKEN`

### 3. Events Tracked
- **PageView** — Fired automatically on page load (client-side)
- **InitiateCall** — Custom event fired when any CTA is clicked (client + server for deduplication)
- **QualifiedCall** — Custom conversion fired via Conversions API when TrackDrive confirms call duration exceeds threshold

### 4. Event Deduplication
All events use a unique `event_id` that is sent to both the client-side pixel and server-side Conversions API. Duplicate events are also checked against the database.

## TrackDrive Webhook Setup

### 1. Configure Webhook URL
In your TrackDrive account, set the webhook URL to:
```
https://your-domain.com/api/trackdrive-webhook
```

### 2. Supported Events
- `New Call` — Logged when a new call comes in
- `Call Ringing` — Logged when the call is ringing
- `Call Forwarded` — Logged when the call is forwarded
- `Call Ended` — Evaluated for qualified conversion
- `Lead Converted` — Evaluated for qualified conversion

### 3. Qualified Call Logic
When a `Call Ended` or `Lead Converted` event is received with a call duration >= `QUALIFIED_CALL_DURATION_THRESHOLD` seconds (default: 120), a **QualifiedCall** conversion event is fired to Meta via the Conversions API.

### 4. Webhook Security
Set `TRACKDRIVE_WEBHOOK_SECRET` to match the secret configured in TrackDrive. The endpoint checks the `x-trackdrive-signature` header against this value.

### 5. Health Check
GET `/api/trackdrive-webhook` returns `{ status: 'ok' }` to verify the endpoint is active.

## CTA Placements

| # | Location | ID | Type |
|---|---|---|---|
| 1 | Header (top-right) | `header_top_right` | Sticky |
| 2 | Hero section | `hero_section` | Above fold |
| 3 | Middle impact band | `middle_cta_section` | Orange gradient |
| 4 | Bottom section | `bottom_cta_section` | Navy gradient |
| 5 | Mobile sticky footer | `sticky_mobile_button` | Fixed bottom (mobile) |

## Deployment

Deploy via Vercel or your preferred hosting platform. Ensure all environment variables are configured in the deployment settings.

## Phone Number

The phone number displayed on CTAs is controlled by `NEXT_PUBLIC_PHONE_NUMBER`. Replace `000-000-0000` with your TrackDrive phone number when ready.
