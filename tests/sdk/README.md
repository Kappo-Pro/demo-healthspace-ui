# SDK Test Harness - postMessage Testing

This directory contains test harnesses for manual testing of the VitalFlow SDK embedding scenarios.

## postMessage Test Harness

**File:** `postmessage-test.html`

**Purpose:** Simulates a native app embedding the SDK in a WebView to test postMessage delivery of assessment results.

### How to Use

1. **Start the development server:**

   ```bash
   npm start
   ```

   This will start the React app at `http://localhost:3000`

2. **Open the test harness:**

   ```bash
   open tests/sdk/postmessage-test.html
   ```

   Or navigate to the file in your browser.

3. **Complete an assessment:**

   - Click "Start Assessment" in the embedded SDK
   - Grant camera permissions
   - Follow the calibration and assessment steps
   - Complete all 4 views (front, back, left, right)

4. **Observe the results:**
   - When the assessment completes, postMessage will be sent
   - The test harness will display the received message
   - Check the "Received Messages" panel for the full JSON payload
   - Browser notification will appear (if permissions granted)

### What to Verify

✅ **postMessage sent successfully**

- Message appears in "Received Messages" panel
- Console shows: `[postMessage] Sent to parent window: VITALFLOW_ASSESSMENT_COMPLETE`

✅ **Complete payload structure**

- `type: "VITALFLOW_ASSESSMENT_COMPLETE"`
- `version: "1.0"`
- `timestamp` (ISO 8601 format)
- `token_id` (matches the demo token)
- `assessment_type: "posture"`
- `results` object with all fields

✅ **Results data**

- `session_id` (unique identifier)
- `overall_score` (0-100)
- `risk_level` (low/medium/high)
- `posture_angles` (front, back, left, right views)
- `screenshots` (base64 encoded images)
- `completed_at` (ISO 8601 timestamp)
- `raw_data` (complete PostureResults object)

✅ **UI feedback**

- Status badge changes to "Assessment complete!"
- Message count increments
- Last received time updates
- Stats update correctly

### Test Scenarios

#### Scenario 1: iframe Embedding (Primary Use Case)

The test harness embeds the SDK in an `<iframe>`, which simulates how mobile apps embed web content in WebView components.

**Expected:** postMessage sent to parent window via `window.parent.postMessage()`

#### Scenario 2: Standalone Mode (Fallback)

If you open `/sdk?token=ast_demo_123` directly in a new tab, there's no parent window.

**Expected:** Warning logged to console: "No parent or opener window available"

#### Scenario 3: Custom Token

Edit the test harness HTML to use a different token:

```javascript
const DEFAULT_TOKEN = 'ast_live_custom_456';
```

**Expected:** Token ID in postMessage payload matches the custom token

### Troubleshooting

**Problem:** No postMessage received

- **Check:** Console for errors
- **Check:** Assessment actually completed (all 4 views)
- **Check:** Camera permissions granted
- **Fix:** Reload both SDK iframe and test harness

**Problem:** Payload missing fields

- **Check:** `results` object structure in console
- **Check:** TypeScript errors in browser console
- **Fix:** Verify PostureResults type matches PostMessagePayload expectations

**Problem:** Screenshots not included

- **Check:** Screenshot capture working in Assessment component
- **Check:** Base64 encoding valid
- **Fix:** Verify screenshot utility returning valid data URLs

### Development Workflow

When making changes to postMessage integration:

1. Edit `src/components/pages/SDK/utils/postMessageDelivery.ts`
2. Save and let React hot reload
3. Reload test harness (or just the iframe)
4. Complete assessment
5. Verify changes in received message

### Browser Compatibility

Tested on:

- ✅ Chrome 118+ (recommended)
- ✅ Safari 17+
- ✅ Firefox 119+
- ✅ Edge 118+

**Note:** Mobile Safari and mobile Chrome require different handling for WebView embedding. Test on actual devices when possible.

### Integration with E2E Tests

The E2E test suite (`e2e/sdk/postmessage.spec.ts`) automates testing of this functionality. Run with:

```bash
npm run test:e2e -- e2e/sdk/postmessage.spec.ts
```

### Future Enhancements

- [ ] Mock pose detection for faster testing
- [ ] Add token generator for testing JWT parsing
- [ ] Add webhook delivery testing (SDK-011/SDK-012)
- [ ] Add error scenario testing (network failures, etc.)

---

**Epic 3 - Results Delivery**
**Story: SDK-010** - postMessage Integration
**Date Created:** 2025-10-22
