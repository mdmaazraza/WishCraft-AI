# 📱 Automated SMS & Voice Calling for Indian Numbers: Feasibility, Regulations & Provider Architecture

> **Project**: Wish Yours (formerly WishCraft AI)  
> **Target Region**: India (+91) & Global International  
> **Date**: March 2026  
> **Status**: Production Reference & Architecture Blueprint

---

## Executive Summary

1. **Email Delivery via Resend**: Fully functional, 100% free (up to 3,000 emails/month), requires zero telecom compliance, and delivers rich HTML greeting cards with direct interactive links.
2. **Automated SMS in India**: Heavily regulated under TRAI's DLT framework. Genuine "free forever" automated SMS does not exist. Fast2SMS and Twilio offer trial credits (₹50 to $15), but production traffic requires business registration, DLT approval, and paid per-message credits.
3. **Automated Voice Calling in India**: **Strictly cannot be done for free in production.** Indian telecom operators charge mandatory termination and interconnect fees per call minute. Twilio Voice and Exotel support programmable TTS calls, but require funded account credits and KYC.
4. **Wish Yours Solution**: A multi-tiered provider abstraction architecture (`api/providers/sms_provider.js` & `api/providers/voice_provider.js`) that operates in **safe simulated mode** by default without exposing users to charges, while enabling one-click plug-and-play activation once API keys are provided.

---

## 1. Indian Telecom Regulatory Framework (TRAI & DLT)

In India, commercial and automated application-to-person (A2P) messaging and calling are governed by the **Telecom Regulatory Authority of India (TRAI)** under the **Telecom Commercial Communications Customer Preference Regulations (TCCCPR, 2018)**.

### The DLT Mandate (Distributed Ledger Technology)
To combat spam and fraud, all Indian telecom operators (Reliance Jio, Bharti Airtel, Vodafone Idea, BSNL) operate a unified blockchain ledger called **DLT**. 

Any automated system dispatching SMS or calls to Indian mobile numbers must undergo a mandatory 3-step compliance process:

| Compliance Step | Description | Cost / Requirements |
| :--- | :--- | :--- |
| **1. Principal Entity (PE) Registration** | Registering the business/organization on an operator DLT portal (e.g., Vilpower, Jio DLT, Airtel DLT). | One-time registration fee (~₹5,900 incl. GST); requires business PAN, GST, certificate of incorporation. |
| **2. Header (Sender ID) Registration** | Reserving a unique 6-character alphabetic sender ID (e.g., `WSHYRS`). | Included in DLT registration; must match registered entity name/brand. |
| **3. Content Template Registration** | Registering the exact wording of automated SMS with dynamic variables (e.g., `Hi {#var#}, {#var#} sent you a greeting: {#var#}`). | Each template must be pre-approved. Any SMS not matching an approved template is automatically dropped by telecom firewalls. |

---

## 2. Comprehensive Provider Evaluation

### A. Fast2SMS (India-Specialized)
- **Website**: [fast2sms.com](https://www.fast2sms.com)
- **Routes Available**:
  - *Quick SMS Route*: Bypasses DLT for low-volume testing; sender ID is randomly assigned numeric code (e.g., `512345`). Often blocked by DND (Do Not Disturb) numbers.
  - *DLT SMS Route*: Enterprise route requiring registered PE ID and Template ID.
- **Trial / Free Tier**:
  - Gives **₹50 free wallet balance** upon registration with mobile OTP verification.
- **Production Pricing**:
  - Approximately **₹0.20 to ₹0.25 per SMS** (~$0.0028 USD).
- **Pros**: Very simple REST API, low Indian pricing, fast wallet top-up via UPI.
- **Cons**: Quick SMS route is unreliable for production greetings; DLT approval required for 100% delivery.

### B. MSG91 (Enterprise Aggregator)
- **Website**: [msg91.com](https://msg91.com)
- **Services**: Transactional SMS, OTP, WhatsApp Business API, Voice calls ("Hello").
- **Trial / Free Tier**:
  - Provides ~₹100 ($1.20) trial credit with business email verification.
- **Production Pricing**:
  - Approximately **₹0.18 to ₹0.22 per SMS** in bulk packages.
- **Requirements**: Strict KYC verification, company domain email, and DLT PE ID before transactional routes are unlocked.
- **Cons**: Not accessible to hobbyists or developers without registered business documentation.

### C. Twilio (Global Industry Standard)
- **Website**: [twilio.com](https://www.twilio.com)
- **Services**: Programmable SMS, Programmable Voice, TwiML, WhatsApp Business.
- **Trial / Free Tier**:
  - Provides **~$15.50 trial credit** with credit card / phone verification.
  - Trial limitations: Can only dispatch to verified developer phone numbers; messages prepend `Sent from your Twilio trial account`.
- **Production Pricing to India (+91)**:
  - **SMS**: ~$0.042 - $0.055 (~₹3.50 - ₹4.50) per SMS. Very expensive compared to local aggregators due to international carrier interconnect fees.
  - **Voice (Outbound Call)**: ~$0.025 - $0.035 (~₹2.10 - ₹2.90) per minute to Indian mobiles.
  - **Phone Number Rental**: ~$1.15/month for US number; Indian local DIDs require regulatory paperwork.
- **Pros**: Best documentation, highest uptime globally, zero server maintenance, unified API for SMS and Voice.

### D. Exotel (Indian Cloud Telephony Leader)
- **Website**: [exotel.com](https://exotel.com)
- **Services**: Programmable Voice, IVR, Call Bridging, Outbound Call Campaigns, SMS.
- **Trial / Free Tier**:
  - 15-day trial with ₹1,000 credit, but requires an active Indian business entity.
- **Production Pricing**:
  - Voice calls: ~₹0.45 to ₹0.60 per minute.
  - Virtual number rental: ~₹1,000 to ₹1,500/month.
- **Cons**: Strictly B2B; does not support individual non-business developers.

---

## 3. Feasibility of Free Automated Outbound Voice Calls

### Can automated phone calls to Indian numbers be done completely free?
**Answer: NO.** Genuinely free outbound telephone calling is a physical and economic impossibility in telecommunications.

### Why Free Telecom Calling Does Not Exist:
1. **Interconnect Usage Charges (IUC)**: When a server places a phone call to a recipient's phone number, the call travels through local telecom infrastructure (Airtel, Jio, Vi). Under telecom regulations, the calling carrier must pay termination fees per call minute to the receiving carrier.
2. **Spectrum & Hardware Maintenance**: Cellular towers, base stations, and PSTN switches require continuous capital expenditure; telecom operators never terminate outbound calls for zero revenue.
3. **Regulatory Anti-Spam Measures**: Free outbound calling would instantly lead to unchecked robocall spam, which TRAI enforces severe financial penalties against.
4. **Caller ID Spoofing Prohibition**: Under the Indian Telegraph Act, displaying a fake or unverified caller ID on outbound cellular calls is a criminal offense. Outbound calls must use registered virtual numbers (DIDs) or verified CLI.

---

## 4. Wish Yours Recommended Production Architecture

To provide an optimal user experience that is completely free right now while remaining enterprise-ready for the future, Wish Yours implements a **3-Tier Delivery Matrix**:

```
                                  [ User Schedules Wish ]
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
               【 Email Delivery 】    【 SMS Delivery 】     【 Voice Call 】
                 (100% Free)           (Tiered Options)       (Preview / Pro)
                       │                     │                     │
                       ▼                     │                     │
            Resend API (3k/mo Free)          │                     │
            - Full HTML Greeting             │                     │
            - Zero telecom compliance        │                     │
            - Interactive Web Link           │                     │
                                             ▼                     ▼
                                  ┌──────────────────────┐ ┌───────────────┐
                                  │ Has API Keys? (Twilio│ │ Has Twilio /  │
                                  │   or Fast2SMS)       │ │ Exotel Voice? │
                                  └──────────┬───────────┘ └───────┬───────┘
                                       YES   │   NO            YES │   NO
                              ┌──────────────┴──────────┐   ┌──────┴───────┐
                              ▼                         ▼   ▼              ▼
                       Automated SMS           Native Fallback  Spoken  Simulated
                       Carrier Dispatch         (sms: / wa.me)  Call     Preview Log
```

### Tier 1: Email via Resend (Primary Free Automated Channel)
- **Status**: Live, active, and fully automated.
- **Cost**: 100% Free up to 3,000 emails/month (100 emails/day).
- **Advantages**:
  - Zero telecom DLT hurdles.
  - Can include beautiful typography, recipient name, sender note, and a direct button to unwrap the celebration page.
  - Reliable background delivery even with the browser closed.

### Tier 2: Native Manual Fallbacks (Zero Cost Instant Dispatch)
- For users wanting instant WhatsApp or SMS delivery without paying for SMS gateways:
  - `https://wa.me/?text=...` opens WhatsApp directly with pre-filled greeting and link.
  - `sms:?body=...` opens recipient's native messaging app on mobile.

### Tier 3: Pluggable Gateway Abstraction (`api/providers/`)
- Located in:
  - `api/providers/sms_provider.js`
  - `api/providers/voice_provider.js`
- **Behavior**:
  - If `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are configured, dispatches automated SMS or initiates automated TwiML Text-to-Speech voice call.
  - If `FAST2SMS_API_KEY` is configured, routes via Fast2SMS Indian gateway.
  - If no gateway keys are configured, executes in **Simulator Mode**: logs dispatch details safely (with phone numbers masked: `+91 9876****210`) so testing and demos work flawlessly without failure or billing surprises.

---

## 5. Summary Table for Production Deployment

| Feature | Provider | Free Tier Available? | Indian DLT Required? | Production Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Email Delivery** | Resend | ✅ Yes (3,000/mo) | ❌ No | **Active Default (Primary)** |
| **SMS (Indian)** | Fast2SMS | ⚠️ ₹50 trial only | ⚠️ Optional on Quick, Yes on DLT | Configure when SMS credits purchased |
| **SMS (Global)** | Twilio | ⚠️ $15.50 trial only | ⚠️ Required for India sender ID | Best for international recipients |
| **Voice Calls** | Twilio Voice / Exotel | ⚠️ Trial credits only | ✅ Regulatory KYC required | Mark as "Preview / Add-On" |
| **Instant Sharing** | WhatsApp / Web Share | ✅ 100% Free | ❌ No | Active on all greeting pages |
