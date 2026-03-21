# Storefront UX Recommendations

**Audience:** Primarily bulk buyers (boutiques, resellers, wholesalers) + retail customers  
**Stack:** Static Next.js storefront, WhatsApp/Call as conversion path  
**Core principle:** Every screen should have a clear, frictionless path to WhatsApp. The product is the saree; the sale happens over WhatsApp. The site's job is to get them to that conversation as fast as possible.

---

## Table of Contents

1. [Header](#1-header)
2. [Home Page](#2-home-page)
3. [Product Card](#3-product-card)
4. [Listing Page](#4-listing-page)
5. [Product Detail Page](#5-product-detail-page)
6. [Information Page](#6-information-page)
7. [Footer](#7-footer)
8. [Priority Summary](#8-priority-summary)

---

## 1. Header

### Current

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                                                                      │
│                         Saree Store                                  │
│                                                                      │
│              Home      Kanchipuram Silks      Information            │
│                                                                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Problems:
  ✗ Very tall (py-8 md:py-10) — wastes ~15% of viewport
  ✗ No active link state — user can't tell which page they're on
  ✗ No WhatsApp shortcut — primary conversion action is buried on product pages
  ✗ Will break when more categories are added (no mobile menu consideration)
```

### Recommended

```
┌──────────────────────────────────────────────────────────────────────┐
│  Saree Store         Home    Kanchipuram Silks    Info    [WA] Call  │
└──────────────────────────────────────────────────────────────────────┘
      │                  │             │               │        │
   logo left         active link   underlined       compact  green WA
   serif font        = colored     on hover         pill      icon btn

Mobile:
┌──────────────────────────────────────┐
│  Saree Store                [WA] [≡] │
└──────────────────────────────────────┘
                                  │  │
                             whatsapp  hamburger

Improvements:
  ✓ Single row — compact, saves viewport height
  ✓ Active nav link has visible state (underline + color)
  ✓ WhatsApp shortcut always visible top-right
  ✓ Mobile: hamburger + persistent WhatsApp icon
```

---

## 2. Home Page

### Current

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │                  [image rotates silently]                      │  │
│  │                                                                │  │
│  │                                                                │  │
│  │                      ● ○ ○ ○ ○                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Featured                                                            │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │      │  │      │  │      │  │      │                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  │      │  │      │  │      │  │      │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  Title     Title     Title     Title                                │
│  ₹12,000   ₹8,500    ₹15,000   ₹9,200                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Problems:
  ✗ Carousel has no text, no CTA — just a silent slideshow
  ✗ "Featured" is generic — no meaning for bulk or retail buyer
  ✗ No brand statement — first-time visitor has no idea what this store is or who it's for
  ✗ No bulk enquiry entry point anywhere on the page
  ✗ Stock status invisible from cards
```

### Recommended

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │                   [image rotates]                              │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────┐                      │  │
│  │  │ Premium Kanchipuram Silks            │ ← overlay card       │  │
│  │  │ Direct from weavers.                 │   bottom-left        │  │
│  │  │ Retail & wholesale welcome.          │   semi-transparent   │  │
│  │  │ [Browse Collection]  [WhatsApp Us]   │                      │  │
│  │  └──────────────────────────────────────┘                      │  │
│  │                          ● ○ ○ ○ ○                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  📦 Bulk / Wholesale Enquiries                                 │  │
│  │  Looking to order 10+ sarees? We offer trade pricing,         │  │
│  │  custom selection and fast dispatch.                           │  │
│  │                              [WhatsApp for bulk pricing →]    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ← warm stone/cream background strip, full width                     │
│                                                                      │
│  New Arrivals  ·  24 sarees                    [View all →]          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │      │  │      │  │      │  │      │                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  │      │  │      │  │      │  │      │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  Title     Title     Title     [LOW    ← amber badge on card        │
│  ₹12,000   ₹8,500    ₹15,000    STOCK]                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Improvements:
  ✓ Carousel overlay gives brand statement + two CTAs immediately
  ✓ Bulk enquiry strip — converts wholesale buyers on first view
  ✓ "New Arrivals" + count is specific and informative
  ✓ Low stock badge visible on cards
  ✓ "View all →" link drives traffic to listing page
```

---

## 3. Product Card

### Current

```
  ┌────────────────┐
  │                │
  │                │
  │   [image]      │    ← plain image, no overlays
  │                │
  │                │
  └────────────────┘
  Kanchipuram Pure Silk          ← title, may truncate
  ₹12,000 · AED 530              ← price inline

Problems:
  ✗ No stock status — bulk buyers must click every card to check
  ✗ No SKU — B2B buyers cross-reference by SKU
  ✗ Out of stock products look identical to in-stock ones
  ✗ No urgency signal for "low stock"
  ✗ 2-column mobile grid makes portrait images very narrow
```

### Recommended

```
  ┌────────────────┐
  │                │
  │                │ ← [LOW STOCK] amber pill, top-right corner
  │   [image]      │    OR
  │                │   [OUT OF STOCK] grey overlay on entire image
  │                │
  └────────────────┘
  KS-001                         ← SKU, muted small text above title
  Kanchipuram Pure Silk
  ₹12,000                        ← INR large/primary
  AED 530                        ← AED small/muted below

Stock badge detail:
  In stock     → no badge (clean)
  Low stock    → [LOW STOCK]  amber pill top-right
  Out of stock → full image grey overlay + "Out of stock" centered text

Improvements:
  ✓ Stock visible at a glance — bulk buyers scan without clicking
  ✓ SKU visible — B2B reference without opening product
  ✓ Clear price hierarchy — INR primary, AED secondary
  ✓ Out of stock greyed out — buyer skips instantly
```

---

## 4. Listing Page (`/kanchipuram-silks`)

### Current

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Kanchipuram Silks                                                   │
│  Browse our collection of Kanchipuram and silk sarees.               │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  Title     Title     Title     Title                                │
│  ₹price    ₹price    ₹price    ₹price                               │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  ...                                                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Problems:
  ✗ No product count — "how many are there?"
  ✗ No sort or filter controls
  ✗ Stock status invisible from grid
  ✗ No SKU on cards
  ✗ Description is one generic line — no value signal
```

### Recommended

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Home > Kanchipuram Silks           ← breadcrumb                    │
│                                                                      │
│  Kanchipuram Silks          24 sarees  ← count next to heading      │
│  Pure silk sarees, sourced directly from Kanchipuram weavers.       │
│                                                                      │
│  Sort by: [Price ↑↓] [Newest] [Availability]   ← sort controls      │
│                                                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │      │  │      │  │[LOW  │  │[OUT  │  ← stock badges on cards   │
│  │ img  │  │ img  │  │STOCK]│  │STOCK]│                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  KS-001    KS-002    KS-003    KS-004   ← SKU visible               │
│  Title     Title     Title     Title                                │
│  ₹12,000   ₹8,500    ₹15,000   ₹9,200                               │
│  AED 530   AED 378                                                   │
│                                                                      │
│  ┌──────┐  ...                                                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Improvements:
  ✓ Breadcrumb — user knows where they are
  ✓ Product count — sets expectation for how long browsing takes
  ✓ Sort controls — bulk buyers sort by price; retail by newest
  ✓ Stock badges on cards — eliminates need to click into every product
  ✓ SKU on card — B2B reference without opening product
  ✓ Richer description — signals quality and sourcing
```

---

## 5. Product Detail Page (`/saree/[slug]`)

### Current

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ← Back to Kanchipuram Silks                                         │
│                                                                      │
│  ┌───────────────────┐   ┌─────────────────────────────────────────┐ │
│  │                   │   │ Kanchipuram Pure Silk Saree             │ │
│  │                   │   │ KS-001 · Product code                   │ │
│  │   [main image]    │   │                                         │ │
│  │                   │   │ ₹12,000 · AED 530                       │ │
│  │                   │   │                                         │ │
│  │                   │   │ Stock: In stock                         │ │
│  └───────────────────┘   │                                         │ │
│  [t1][t2][t3]            │ Description                             │ │
│  thumbnails              │ Some text about the saree...            │ │
│                          │                                         │ │
│                          │ Specifications                          │ │
│                          │ Fabric     Pure Silk                    │ │
│                          │ Zari       Gold                         │ │
│                          │ Length     5.5m                         │ │
│                          │                                         │ │
│                          │ [WhatsApp]  [Call]                      │ │
│                          │  green sm    outline sm                 │ │
│                          └─────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Problems:
  ✗ Back link hardcoded to one category — breaks for future categories
  ✗ Price: "₹12,000 · AED 530" inline — no hierarchy between currencies
  ✗ "Stock: In stock" raw — no quantity context, no urgency for bulk buyers
  ✗ Specs list: label and value side-by-side, no visual separation, hard to scan
  ✗ WhatsApp + Call buttons are small, no icons, not prominent
  ✗ No bulk enquiry variant of WhatsApp message
  ✗ No breadcrumb
  ✗ No related products — dead end after viewing
  ✗ No share button
```

### Recommended

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Home > Kanchipuram Silks > Kanchipuram Pure Silk    ← breadcrumb   │
│                                                                      │
│  ┌───────────────────┐   ┌─────────────────────────────────────────┐ │
│  │                   │   │ Kanchipuram Pure Silk Saree             │ │
│  │                   │   │ SKU: KS-001                             │ │
│  │   [main image]    │   │                                         │ │
│  │                   │   │ ₹12,000          ← INR large, primary   │ │
│  │                   │   │ AED 530          ← AED small, muted     │ │
│  │                   │   │                                         │ │
│  └───────────────────┘   │ ● In stock  (Limited qty available)     │ │
│  [t1][t2][t3]  [share↗]  │  ← coloured dot + context              │ │
│                          │                                         │ │
│                          │ Description                             │ │
│                          │ ...                                     │ │
│                          │                                         │ │
│                          │ Specifications                          │ │
│                          │ ─────────────────────────────────────── │ │
│                          │ Fabric          Pure Silk               │ │
│                          │ ─────────────────────────────────────── │ │
│                          │ Zari            Real Gold Zari          │ │
│                          │ ─────────────────────────────────────── │ │
│                          │ Length          5.5m                    │ │
│                          │ ─────────────────────────────────────── │ │
│                          │                                         │ │
│                          │ ┌─────────────────────────────────────┐ │ │
│                          │ │  WhatsApp    ← full width, green    │ │ │
│                          │ │  📱 Enquire about this saree        │ │ │
│                          │ └─────────────────────────────────────┘ │ │
│                          │ ┌─────────────────────────────────────┐ │ │
│                          │ │  WhatsApp (Bulk)  ← second variant  │ │ │
│                          │ │  📦 Request bulk / wholesale quote  │ │ │
│                          │ └─────────────────────────────────────┘ │ │
│                          │ ┌─────────────────────────────────────┐ │ │
│                          │ │  📞 Call us   ← outline, secondary  │ │ │
│                          │ └─────────────────────────────────────┘ │ │
│                          └─────────────────────────────────────────┘ │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  More Kanchipuram Silks                               [View all →]   │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                            │
│  │ img  │  │ img  │  │ img  │  │ img  │                            │
│  └──────┘  └──────┘  └──────┘  └──────┘                            │
│  Title     Title     Title     Title                                │
│  ₹price    ₹price    ₹price    ₹price                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Improvements:
  ✓ Breadcrumb — user knows full path
  ✓ Price hierarchy: INR large + primary, AED small + muted
  ✓ Stock dot + context: "Limited qty available" creates urgency for bulk buyers
  ✓ Specs: alternating row dividers, two-column aligned — scannable at a glance
  ✓ WhatsApp full-width, green, prominent with icon — primary CTA
  ✓ Bulk WhatsApp variant — separate pre-filled message for wholesale buyers
  ✓ Call as clear secondary CTA
  ✓ Share button on gallery — buyer sends link to colleague/partner
  ✓ Related products — keeps buyer browsing, not a dead end
```

---

## 6. Information Page

### Current

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Information                                                         │
│                                                                      │
│  About                                                               │
│  We curate a small selection of Kanchipuram and silk sarees for      │
│  those who value quality and tradition.                              │
│                                                                      │
│  Authenticity & Quality                                              │
│  We source directly from weavers and verified suppliers...           │
│                                                                      │
│  Care Instructions                                                   │
│  Store in a cool, dry place...                                       │
│                                                                      │
│  Contact                                                             │
│  For enquiries about a specific saree, custom orders or bulk         │
│  requests, please reach out via the contact details we provide.      │
│  ← provides no actual contact details                                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Problems:
  ✗ "Contact" section provides zero actual contact information — dead end
  ✗ No WhatsApp link or phone number anywhere on the page
  ✗ No bulk/wholesale specific section
  ✗ No FAQ — buyers with common questions have to enquire for basics
  ✗ Content is placeholder-thin throughout
```

### Recommended

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Information                                                         │
│                                                                      │
│  About                                                               │
│  [Real brand story — sourcing, weavers, heritage, years in           │
│  business, what makes these sarees special]                          │
│                                                                      │
│  Authenticity & Quality                                              │
│  [Specific quality markers, certification, how to verify,           │
│  direct weaver sourcing detail]                                      │
│                                                                      │
│  Care Instructions                                                   │
│  [Dry cleaning, folding with soft cloth, storage tips...]            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  📦 For Wholesale & Bulk Buyers                                │  │
│  │                                                                │  │
│  │  Minimum order:   10 pieces                                    │  │
│  │  Lead time:       3–7 business days                            │  │
│  │  Samples:         Available on request                         │  │
│  │  Payment:         Bank transfer, UPI, international wire       │  │
│  │  Delivery:        India & UAE (DHL/FedEx)                      │  │
│  │                                                                │  │
│  │  [WhatsApp for wholesale pricing →]                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Frequently Asked Questions                                          │
│  ▸ Do you ship internationally?                                      │
│  ▸ What is the minimum order for bulk?                               │
│  ▸ Can I get a sample before placing a large order?                  │
│  ▸ What is the return/exchange policy?                               │
│  ▸ How do I verify authenticity of a Kanchipuram saree?              │
│                                                                      │
│  Contact                                                             │
│  ┌──────────────────────────────────────┐                            │
│  │  📱 WhatsApp    +91 XXXXX XXXXX      │  ← from site_settings     │
│  │  📞 Phone       +91 XXXXX XXXXX      │                            │
│  │  ✉  Email       hello@yourstore.com  │                            │
│  │  🕐 Hours       Mon–Sat, 10am–7pm    │                            │
│  │                                      │                            │
│  │  [Open WhatsApp →]                   │                            │
│  └──────────────────────────────────────┘                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Improvements:
  ✓ Real contact details from site_settings (you already have them)
  ✓ Wholesale/bulk section — dedicated entry point for B2B buyers
  ✓ FAQ — deflects common questions, builds confidence pre-enquiry
  ✓ WhatsApp CTA on this page — buyer can act immediately
  ✓ Hours — sets response time expectations (important for B2B)
```

---

## 7. Footer

### Current

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Saree Store                 Home   Kanchipuram Silks   Information  │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│               © 2025 Saree Store. All rights reserved.               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Problems:
  ✗ No contact info — buyers expect phone/WhatsApp in footer
  ✗ No social media links (Instagram critical for saree buyers)
  ✗ No wholesale/bulk call to action
  ✗ No tagline — zero brand identity
```

### Recommended

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Saree Store                                                         │
│  Premium Kanchipuram silks, direct from weavers.   ← tagline        │
│  Retail & wholesale welcome.                                         │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Collections          Quick Links          Contact                   │
│  ─────────────        ───────────          ───────                   │
│  Kanchipuram Silks    Home                 📱 +91 XXXXX XXXXX        │
│  [future cat 2]       Information          📲 WhatsApp us            │
│  [future cat 3]       Bulk Enquiries       📸 Instagram              │
│                                                                      │
│  ──────────────────────────────────────────────────────────────────  │
│               © 2025 Saree Store. All rights reserved.               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Mobile footer (stacked):
┌──────────────────────────────────────┐
│  Saree Store                         │
│  Premium Kanchipuram silks...        │
│                                      │
│  📱 +91 XXXXX XXXXX                  │
│  📲 WhatsApp us                      │
│  📸 Instagram                        │
│                                      │
│  Home  |  Kanchipuram Silks  |  Info │
│  © 2025 Saree Store                  │
└──────────────────────────────────────┘

Improvements:
  ✓ Tagline — instant brand identity, signals B2B+retail welcome
  ✓ 3-column layout: Collections / Quick Links / Contact
  ✓ Contact column: phone, WhatsApp, Instagram — all from site_settings
  ✓ Scales with future categories in "Collections" column
  ✓ Mobile: gracefully stacked
```

---

## 8. Priority Summary

| # | Change | Screen | Impact | Why first |
|---|--------|--------|--------|-----------|
| 🔴 1 | Add WhatsApp + brand statement overlay on carousel | Home | 🔴 High | Bulk buyers have zero CTA on landing |
| 🔴 2 | Add bulk enquiry strip on homepage | Home | 🔴 High | B2B buyers need explicit invitation |
| 🔴 3 | Real contact details on Information page | Info | 🔴 High | Contact section is currently a dead end |
| 🔴 4 | Stock badge on product cards | Card / Listing | 🔴 High | Bulk buyers scan stock before clicking |
| 🟡 5 | Full-width WhatsApp (retail + bulk) with icons on detail page | Detail | 🟡 Medium | Primary conversion is under-played |
| 🟡 6 | SKU visible on product cards | Card / Listing | 🟡 Medium | B2B buyers reference by SKU |
| 🟡 7 | Compact header (single row + persistent WhatsApp icon) | Header | 🟡 Medium | Saves viewport, always-visible conversion |
| 🟡 8 | Price hierarchy: INR primary, AED muted secondary | Detail / Card | 🟡 Medium | Clarity for dual-currency audience |
| 🟡 9 | Breadcrumb on listing + detail pages | Listing / Detail | 🟡 Medium | Navigation clarity |
| 🟡 10 | Wholesale section + FAQ on Information page | Info | 🟡 Medium | Deflects common questions, builds trust |
| 🟢 11 | Related products strip on detail page | Detail | 🟢 Low | Keeps buyers browsing |
| 🟢 12 | Sort controls on listing page | Listing | 🟢 Low | Convenience for larger catalogues |
| 🟢 13 | Share button on product gallery | Detail | 🟢 Low | Buyer shares with colleague before ordering |
| 🟢 14 | Instagram + contact in footer | Footer | 🟢 Low | Completeness, social proof |
| 🟢 15 | Product count ("24 sarees") on listing page | Listing | 🟢 Low | Sets expectations for browsing effort |

---

## Data already available (no backend changes needed)

Most recommendations can be implemented using data you already store:

| Recommendation | Existing field |
|----------------|---------------|
| WhatsApp button/link | `store_settings.whatsapp_number` |
| Call button | `store_settings.call_number` |
| WhatsApp message | `store_settings.whatsapp_message_template` |
| Contact phone in footer/info | `site_settings.contact_phone` |
| Contact WhatsApp | `site_settings.contact_whatsapp` |
| Contact email | `site_settings.contact_email` |
| Business hours | `site_settings.support_hours` |
| Instagram link | `site_settings.instagram_url` |
| Business name | `site_settings.business_name` |
| Stock badge colour | `product.stock_status` (in_stock / low_stock / out_of_stock) |
| SKU on cards | `product.sku` |

The only net-new content needed is: bulk/wholesale policy text (MOQ, lead times, payment, samples) and FAQ answers — these can be added as static text in the Information page or stored as `site_settings` fields.
