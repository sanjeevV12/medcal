# Project Memory

## Core
- Stack: Supabase (Auth, Edge Functions, `drivers` table), Leaflet/OSM maps.
- Base: Bhopal, India (Lat 23.2599, Lon 77.4126). 12-min guarantee.
- Brand: Red theme (primary hsl 4 80% 52%), logo at /logo.jpeg. First aid from ₹199.
- UX: Low-noise emergency UI. Automated Rapido-style booking. Remove manual inputs in emergency flows.
- Pricing philosophy: "Money should not be a barrier." EMI/Insurance/Pay after ride options.
- Admin: All admin alerts route to Telegram bot (ID: 1805816148) via Edge Functions.
- Prime membership: ₹249/person/month in footer section.

## Memories
- [Hospital treatment pricing](mem://pricing/hospital-emergency-treatment) — Baseline cost ₹3,897 for serious accident cases
- [Minor accident routing](mem://features/minor-accident-routing) — Route to medical shops (under ₹199) for minor cases
- [Driver confirmation](mem://features/driver-confirmation-requirement) — Ambulance driver must confirm availability before dispatch
- [Health insurance](mem://pricing/health-insurance-plan) — ₹1,989/month alternative payment plan
- [Value services](mem://features/additional-value-services) — Free doctor consultancy, medicine delivery, medical assistance
- [EMI structure](mem://pricing/emi-structure-and-accessibility) — 6% first month, 12% subsequent months
- [Proximity tracking](mem://features/real-time-hospital-proximity-tracking) — 2-phase: dispatch to user, transport to hospital with simulated route
- [Hospital network](mem://features/hospital-partner-network) — 18+ Bhopal partners with coordinates and specialization tags
- [Mapping infrastructure](mem://architecture/mapping-infrastructure) — Leaflet, H+ markers, Haversine formula distance, green dashed polylines
- [Payment gateway](mem://features/payment-gateway-infrastructure) — Simulated gateway, pay after ride, UPI/Card/NetBanking
- [Notifications](mem://communication/notification-system-demo) — Simulated SMS/WhatsApp alerts via toast messages
- [Emergency UX](mem://ux/emergency-interface-minimalism) — No manual simulation controls, visual cues (shimmer, moving icons)
- [AI support](mem://features/ai-powered-support-system) — Supabase Edge Functions with markdown chat
- [Fleet tracking](mem://architecture/real-time-fleet-tracking) — `drivers` table postgres_changes subscription, live badging
- [Fare model](mem://pricing/dynamic-fare-model) — Tiered ₹50/km+ base, hide per-km rate, show total
- [Vehicle tiers](mem://features/emergency-vehicle-tiers) — Medi-Bike to Air Amb, speed profiles for ETA
- [AI doctor](mem://features/ai-doctor-consultation) — Chat interface for symptom-based prescriptions
- [Live tracking overlay](mem://features/post-booking-live-tracking) — Real-time progress with driver coords, dynamic ETA
- [Brand identity](mem://brand/identity-and-mission) — Mission, contact (+91-7479898265, help@massi.in)
- [Telegram admin channel](mem://communication/telegram-administration-channel) — Bot ID 1805816148 for centralized admin monitoring
- [Booking confirmation UX](mem://features/booking-confirmation-ux) — Fare summary details, per-km rates hidden
- [Driver registration](mem://features/driver-registration-flow) — Drive with Us form, triggers Telegram admin verification
- [Automated location booking](mem://features/automated-location-booking) — Geolocation + nearest hospital, manual input removed
- [Booking strategy](mem://ux/navigation-and-booking-strategy) — QuickActionBar, Request Ambulance CTA, Rapido-style flow
- [Animated vehicle map](mem://ux/animated-vehicle-selection-map) — Orbital drift effect markers 🏍️🛺🚐🚑🚁 for vehicle selection
