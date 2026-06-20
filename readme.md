# [STORE_NAME] — Complete Project Plan
> Version 1.0 | Confidential Client Document

---
 
## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [User Flow](#3-user-flow)
4. [Pages List](#4-pages-list)
5. [Feature Details](#5-feature-details)
6. [Admin Panel](#6-admin-panel)
7. [Database Schema](#7-database-schema)
8. [Data Optimization Strategy](#8-data-optimization-strategy)
9. [Image Storage — Cloudinary](#9-image-storage--cloudinary)
10. [API Routes](#10-api-routes)
11. [Development Phases](#11-development-phases)
12. [Folder Structure](#12-folder-structure)
13. [Future Features](#13-future-features)

---

## 1. Project Overview

Yeh ek full-stack online store hai jo client ke liye banaya ja raha hai. Users products browse kar sakte hain, cart mein add kar sakte hain, aur WhatsApp ke through order place kar sakte hain. Koi payment gateway nahi hai — client khud UPI se payment leta hai WhatsApp par order receive karne ke baad.

**Key Points:**
- No payment gateway — WhatsApp + UPI manually
- Users ko sign up nahi karna — IP-based onboarding
- Admin ek hi hoga — PIN se login
- Light + Dark theme — device preference ke according auto switch
- PWA support — mobile pe install kiya ja sakta hai bina Play Store ke

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React + Tailwind CSS | Fast, modern, responsive UI |
| **Backend** | Node.js + Express | Lightweight, JavaScript throughout |
| **Database** | MongoDB Atlas (Free) | Flexible schema, cloud hosted |
| **Image Storage** | Cloudinary (Free) | Multiple images per product, fast CDN |
| **Notifications** | Browser Push API | No app needed, works on mobile + desktop |
| **PWA** | Vite PWA Plugin | Install as app without Play Store |
| **Language** | English | Site ki language |
| **Hosting** | TBD | Baad mein decide hoga |

---

## 3. User Flow

### 3.1 Onboarding (Pehli Visit)

```
User site pe aaya
        ↓
IP check → MongoDB mein hai?
        ↓
  NAI HAI → Onboarding Screen dikhao
  ┌─────────────────────────────────┐
  │  Full Name*                     │
  │  Aapko store kahan se pata chala* │
  │  Delivery Address (optional)    │
  │  ☐ I agree to Terms of Service  │
  └─────────────────────────────────┘
        ↓
  Submit → Data MongoDB mein save
  (name, IP, source, address, timestamp)
        ↓
  HAI → Onboarding skip, seedha Home
        ↓
      HOME PAGE
```

### 3.2 Homepage Flow

```
Home Page
├── Search Bar (top, prominent)
├── Banner / Offers Slider (admin managed)
├── Category Sections (admin configurable)
│     └── Fruits, Dairy, Snacks... (dynamic)
└── Featured / Best Seller Products
```

### 3.3 Order Flow (WhatsApp Based)

```
Cart Page → "Place Order" button click
        ↓
Address Modal Popup
┌────────────────────────────────┐
│  Full Name*                    │
│  Phone Number*                 │
│  Full Address*                 │
│  Landmark                      │
│  Pincode*                      │
└────────────────────────────────┘
(Pehli baar → fill karo → save)
(Wapis aaye → auto-fill, edit ka option)
        ↓
"Confirm Order" click
        ↓
WhatsApp open hoga — pre-filled message:

🛒 New Order!

👤 Name: [User Name]
📞 Phone: [Phone Number]
📍 Address: [Full Address], [Landmark], [Pincode]

🧾 Order Details:
• [Product 1] x[Qty] — ₹[Price]
• [Product 2] x[Qty] — ₹[Price]

💰 Total: ₹[Amount]
        ↓
Client UPI se payment leta hai
        ↓
Admin Panel mein status update karta hai
        ↓
User ko Browser Push Notification milti hai
        ↓
Delivered hone ke baad → Review prompt
```

### 3.4 Order Status Flow

```
Pending → Confirmed → Out for Delivery → Delivered
                                    ↘ Cancelled (kabhi bhi)
```

Har status change pe user ko automatically browser push notification milegi.

---

## 4. Pages List

| Page | Route | Description |
|---|---|---|
| Onboarding | `/onboarding` | Pehli baar ka form — name, source, address, TOS |
| Home | `/` | Main page — search, banners, categories, featured |
| Product Detail | `/product/:id` | Product images, description, related products, reviews |
| Cart | `/cart` | Cart items, quantities, total, place order |
| Wishlist | `/wishlist` | Saved products |
| Order Success | `/order-success` | WhatsApp redirect ke baad confirmation page |
| Order History | `/orders` | Past orders with live status |
| About Us | `/about` | Store story, contact, timings, map, social links |
| Privacy Policy | `/privacy-policy` | Legal privacy page |
| Terms of Service | `/terms-of-service` | Legal terms page |
| Admin Login | `/admin/login` | PIN-based secure login |
| Admin Dashboard | `/admin/dashboard` | Analytics overview |
| Admin Products | `/admin/products` | Products add/edit/delete |
| Admin Orders | `/admin/orders` | Orders manage + status update |
| Admin Users | `/admin/users` | Registered users list |
| Admin Reviews | `/admin/reviews` | Reviews moderate/delete |
| Admin Banners | `/admin/banners` | Homepage banners + offers manage |
| Admin Config | `/admin/config` | WhatsApp number, delivery charges, categories, timings, social links |

---

## 5. Feature Details

### 5.1 Product Card

Har product card pe yeh cheezein hongi:

- Product image
- Product name + price
- **Discount % badge** — jaise "20% OFF" (admin se on/off)
- **Out of Stock badge** — stock khatam hone pe add to cart button disable ho jaayega
- **Delivery time estimate** — jaise "Delivers in 2 hrs" (admin configurable per product)
- **Free Delivery badge** — admin se set kar sakte hain per product
- Wishlist ❤️ icon
- Quantity +/- directly card pe
- Quick Add to Cart button

### 5.2 Product Detail Page

- Multiple images slider (Cloudinary se)
- Full description
- Price + discount
- Stock status
- Add to Cart + Wishlist button
- Delivery time + free delivery info
- **Related Products** section (same category ke products)
- **Reviews & Ratings** section (sirf delivered users review de sakte hain)

### 5.3 Search & Filters

- Search by product name
- Filter by category
- Filter by price range (min–max)
- Sort options:
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - Top Rated

### 5.4 Cart

- Dedicated `/cart` page
- Quantity change per item
- Item remove karo
- Total price + delivery charges display
- Free delivery threshold message (jaise "₹50 aur add karo free delivery ke liye!")
- **Place Order** → Address modal → WhatsApp redirect

### 5.5 Wishlist

- Heart icon click karo → product wishlist mein save
- `/wishlist` page pe sab saved products
- Wishlist se directly cart mein add kar sako

### 5.6 Reviews & Ratings

- Sirf woh users review de sakte hain jinke order ka status **Delivered** hai
- 1 to 5 star rating
- Text comment
- User ka naam automatically onboarding data se aayega
- Admin panel se reviews moderate/delete kar sakte hain

### 5.7 Browser Push Notifications

Notification kab aayegi:
- Order **Confirmed** hua
- Order **Out for Delivery** hua
- Order **Delivered** hua
- Order **Cancelled** hua
- Delivery ke baad → **Review likhne ka prompt**

Koi app install nahi karna — browser se hi kaam karega.

### 5.8 PWA (Progressive Web App)

- Mobile pe "Add to Home Screen" prompt automatically aayega
- Custom app icon + splash screen
- Basic offline support (cached pages)
- Bilkul app jaisi feel — bina Play Store ke

### 5.9 Light / Dark Theme

- Device ki preference ke according auto switch (system default)
- User manually bhi switch kar sakta hai
- Sab components properly themed honge

### 5.10 About Us Page (`/about`)

- Store ki story/description
- Contact info (phone, email, address)
- Store timings (opening/closing hours)
- Social media links (Instagram, Facebook)
- Google Maps embed (store location)

---

## 6. Admin Panel

### 6.1 Login

- **PIN-based login** — simple aur secure
- **Forgot PIN flow:**
  ```
  "Forgot PIN?" click
          ↓
  Recovery email pe OTP/link
          ↓
  New PIN set karo
  ```
- Single admin account

### 6.2 Dashboard

Admin dashboard pe yeh analytics dikhenge:

| Metric | Description |
|---|---|
| Total Sales | Aaj tak ka total revenue |
| Total Orders | Total orders count |
| New Users Today | Aaj kitne new users aaye |
| New Users This Week | Is hafte ke new users |
| Low Stock Alerts | Jin products ka stock kam hai |
| Top Selling Products | Sabse zyada bikne wale products |

### 6.3 Products Management

- Product add karo (naam, price, description, category, stock)
- Multiple images upload karo (Cloudinary — drag & drop)
- Discount % set karo
- Delivery time estimate set karo
- Free Delivery badge toggle karo
- Out of Stock mark karo
- Product edit/delete karo

### 6.4 Orders Management

| Status | Matlab |
|---|---|
| Pending | WhatsApp pe order aaya, confirm nahi hua |
| Confirmed | Admin ne confirm kar diya |
| Out for Delivery | Order raaste mein hai |
| Delivered | Customer tak pahuch gaya |
| Cancelled | Order cancel kar diya |

- Har status update pe user ko automatic push notification
- **Orders Export** — Excel (.xlsx) mein export karo
- Date aur status ke hisaab se filter karke export

### 6.5 Users Section

- Sabregistered users ki list
- User ka naam, IP, source, address, join date dekho
- (No delete — sirf view)

### 6.6 Reviews Moderation

- Sabhi reviews dekho
- Inappropriate reviews delete karo

### 6.7 Banners & Offers

- Homepage banner images upload karo
- Offer text + link set karo
- Banner order arrange karo (drag & drop)
- Active/inactive toggle

### 6.8 Config Section

Yahan sab kuch configure hoga:

- **WhatsApp Number** — jis number pe orders aayenge
- **Delivery Charges** — fixed amount
- **Free Delivery Above** — X amount ke upar free delivery
- **Product Categories** — add, rename, delete, reorder
- **Store Timings** — opening aur closing hours
- **Social Links** — Instagram, Facebook URLs
- **About Us Content** — store description, contact info

---

## 7. Database Schema

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "ip": "192.168.1.1",
  "source": "Instagram",
  "address": "12, Gandhi Nagar, Vadodara",
  "phone": "98765XXXXX",
  "createdAt": "ISODate"
}
```

### `products` Collection
```json
{
  "_id": "ObjectId",
  "name": "Fresh Tomatoes",
  "price": 40,
  "discountPercent": 10,
  "category": "Vegetables",
  "images": ["cloudinary_url_1", "cloudinary_url_2"],
  "stock": 50,
  "deliveryTime": "2 hours",
  "freeDelivery": false,
  "description": "Farm fresh tomatoes...",
  "featured": true,
  "createdAt": "ISODate"
}
```

### `orders` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "items": [
    { "productId": "ObjectId", "name": "Tomatoes", "qty": 2, "price": 40 }
  ],
  "totalAmount": 135,
  "deliveryCharge": 20,
  "address": {
    "name": "Rahul Sharma",
    "phone": "98765XXXXX",
    "fullAddress": "12, Gandhi Nagar",
    "landmark": "Near Temple",
    "pincode": "390015"
  },
  "status": "Pending",
  "statusHistory": [
    { "status": "Pending", "timestamp": "ISODate" }
  ],
  "createdAt": "ISODate"
}
```

### `reviews` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "productId": "ObjectId",
  "orderId": "ObjectId",
  "rating": 4,
  "comment": "Bahut fresh tha!",
  "createdAt": "ISODate"
}
```

### `carts` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "items": [
    { "productId": "ObjectId", "qty": 2 }
  ],
  "updatedAt": "ISODate"
}
```

### `wishlists` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "productIds": ["ObjectId", "ObjectId"]
}
```

### `banners` Collection
```json
{
  "_id": "ObjectId",
  "imageUrl": "cloudinary_url",
  "title": "Weekend Offer!",
  "link": "/category/fruits",
  "order": 1,
  "active": true
}
```

### `categories` Collection
```json
{
  "_id": "ObjectId",
  "name": "Vegetables",
  "icon": "🥦",
  "order": 1,
  "active": true
}
```

### `config` Collection
```json
{
  "_id": "ObjectId",
  "whatsappNumber": "919876543210",
  "deliveryCharge": 20,
  "freeDeliveryAbove": 500,
  "storeTiming": {
    "open": "08:00 AM",
    "close": "09:00 PM",
    "days": "Monday - Saturday"
  },
  "socialLinks": {
    "instagram": "https://instagram.com/storename",
    "facebook": "https://facebook.com/storename"
  },
  "aboutUs": "Store ki story yahan...",
  "contactInfo": {
    "phone": "98765XXXXX",
    "email": "store@email.com",
    "address": "Store ka address"
  }
}
```

### `admins` Collection
```json
{
  "_id": "ObjectId",
  "pin": "hashed_pin",
  "recoveryEmail": "admin@email.com"
}
```

---

## 8. Data Optimization Strategy

MongoDB Atlas free plan mein **512MB** milta hai — hamare project ke liye kaafi hai agar hum smartly data store karein.

### 8.1 Cart — localStorage mein rakho (DB mein nahi!)

```
User product add kare
        ↓
Browser ki localStorage mein save ho
(Koi DB call nahi — bilkul fast!)
        ↓
Sirf Order place karte waqt
DB mein order create ho
```

**Faayda:** DB pe zero load, instant response, free!

> ⚠️ Exception: Agar user dusre device pe jaaye to cart clear hoga — lekin grocery store ke liye yeh acceptable hai.

### 8.2 Orders mein sirf IDs store karo

**❌ Galat — poori product detail save karna:**
```json
{
  "items": [
    {
      "productId": "abc123",
      "productName": "Tomatoes",
      "productPrice": 40,
      "productImage": "url...",
      "productCategory": "Vegetables"
    }
  ]
}
```

**✅ Sahi — sirf zaroori snapshot:**
```json
{
  "items": [
    {
      "productId": "abc123",
      "name": "Tomatoes",
      "qty": 2,
      "price": 40
    }
  ]
}
```

> Note: Order mein `name` aur `price` snapshot lena zaroori hai kyunki baad mein product ka price change ho sakta hai — par image/category zaroorat nahi, woh product ID se fetch ho sakti hai.

### 8.3 MongoDB Indexes — Queries Fast Karo

Jo fields pe search/filter hoti hai unpe index lagao:

```javascript
// User IP check — sabse zyada use hota hai
User.createIndex({ ip: 1 }, { unique: true })

// Product search by name
Product.createIndex({ name: "text" })

// Product filter by category
Product.createIndex({ category: 1 })

// Orders by user
Order.createIndex({ userId: 1 })

// Reviews by product
Review.createIndex({ productId: 1 })
```

**Bina index:** MongoDB poora collection scan karta hai 🐢
**Index ke saath:** Direct jump karta hai result pe 🚀

### 8.4 Pagination — Ek baar mein sab mat lao

```
❌ Galat:
GET /api/products → 500 products ek saath (heavy!)

✅ Sahi:
GET /api/products?page=1&limit=12 → sirf 12 products
GET /api/products?page=2&limit=12 → agle 12 (infinite scroll)
```

### 8.5 Storage Estimate (512MB Free Plan)

| Collection | Per Document Size | 1000 Documents |
|---|---|---|
| users | ~200 bytes | ~0.2 MB |
| products | ~500 bytes | ~0.5 MB |
| orders | ~800 bytes | ~0.8 MB |
| reviews | ~300 bytes | ~0.3 MB |
| carts | ~0 (localStorage) | ~0 MB |
| banners/config | ~1 KB total | ~0.001 MB |
| **Total (1000 users)** | | **~2 MB** |

**Conclusion:** 512MB mein aaram se **100,000+ orders** store ho sakte hain. Koi tension nahi! ✅

---

## 9. Image Storage — Cloudinary

### 9.1 Kaise Kaam Karta Hai

```
Admin product image select kare (multiple)
        ↓
Frontend → image Cloudinary API pe bheje
        ↓
Cloudinary image store kare + URL return kare:
"https://res.cloudinary.com/[store]/image/upload/v123/tomato.jpg"
        ↓
Sirf WOH URL → MongoDB mein save ho
        ↓
Frontend pe URL se image load ho
```

### 9.2 Optimized Image URLs

Cloudinary ka sabse bada fayda — URL mein hi transformation options:

```
Original (badi file ~500KB):
https://res.cloudinary.com/store/image/upload/tomato.jpg

Product Card ke liye (choti ~20KB):
https://res.cloudinary.com/store/image/upload/w_400,h_400,c_fill,q_auto,f_auto/tomato.jpg

Product Detail ke liye (medium ~80KB):
https://res.cloudinary.com/store/image/upload/w_800,q_auto,f_auto/tomato.jpg

Thumbnail ke liye (~5KB):
https://res.cloudinary.com/store/image/upload/w_100,h_100,c_fill,q_auto,f_auto/tomato.jpg
```

| Option | Matlab |
|---|---|
| `w_400` | Width 400px |
| `h_400` | Height 400px |
| `c_fill` | Crop to fill (square) |
| `q_auto` | Quality auto — Cloudinary decide karega |
| `f_auto` | Format auto — WebP dega agar browser support kare |

**Result: 60-80% choti image, same visual quality!** 🎉

### 9.3 MongoDB mein Kya Save Hoga

Sirf **base URL** save karo — transformations URL mein add karo frontend pe:

```json
{
  "name": "Fresh Tomatoes",
  "images": [
    "https://res.cloudinary.com/store/image/upload/tomato1.jpg",
    "https://res.cloudinary.com/store/image/upload/tomato2.jpg"
  ]
}
```

Frontend pe use karte waqt:
```javascript
// Card ke liye automatically optimize
const cardImage = imageUrl.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');

// Detail page ke liye
const detailImage = imageUrl.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
```

### 9.4 Cloudinary Free Plan Limits

| Limit | Free Plan | Hamare Use ke Liye |
|---|---|---|
| Storage | 25 GB | ✅ Kaafi hai (1000 images ~2-3 GB) |
| Bandwidth | 25 GB/month | ✅ Optimized URLs se kaafi |
| Transformations | 25,000/month | ✅ Kaafi hai |
| Max file size | 10 MB | ✅ Product images usually <2MB |

**Conclusion:** Cloudinary free plan hamare project ke liye perfect hai. Paid plan ki zaroorat nahi padegi jab tak traffic bahut zyada na ho. ✅

---

## 10. API Routes

### Users
| Method | Route | Description |
|---|---|---|
| POST | `/api/users/check-ip` | IP check — naya user hai ya purana |
| POST | `/api/users/onboard` | Naya user create |
| GET | `/api/users` | All users (admin only) |

### Products
| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | Sab products (filter, search, sort) |
| GET | `/api/products/:id` | Single product detail |
| GET | `/api/products/featured` | Featured products |
| POST | `/api/products` | Product add (admin) |
| PUT | `/api/products/:id` | Product edit (admin) |
| DELETE | `/api/products/:id` | Product delete (admin) |

### Orders
| Method | Route | Description |
|---|---|---|
| POST | `/api/orders` | New order create |
| GET | `/api/orders/user/:userId` | User ke orders |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Status update (admin) |

### Cart
| Method | Route | Description |
|---|---|---|
| GET | `/api/cart/:userId` | User ka cart |
| POST | `/api/cart/add` | Item add |
| PUT | `/api/cart/update` | Quantity update |
| DELETE | `/api/cart/remove` | Item remove |

### Wishlist
| Method | Route | Description |
|---|---|---|
| GET | `/api/wishlist/:userId` | User ki wishlist |
| POST | `/api/wishlist/add` | Product add |
| DELETE | `/api/wishlist/remove` | Product remove |

### Reviews
| Method | Route | Description |
|---|---|---|
| GET | `/api/reviews/:productId` | Product ke reviews |
| POST | `/api/reviews` | Review likhna |
| DELETE | `/api/reviews/:id` | Review delete (admin) |

### Admin
| Method | Route | Description |
|---|---|---|
| POST | `/api/admin/login` | PIN login |
| POST | `/api/admin/forgot-pin` | PIN reset |
| GET | `/api/admin/dashboard` | Analytics data |
| GET | `/api/admin/export/orders` | Excel export |

### Config
| Method | Route | Description |
|---|---|---|
| GET | `/api/config` | Sab config fetch |
| PUT | `/api/config` | Config update (admin) |

### Banners & Categories
| Method | Route | Description |
|---|---|---|
| GET | `/api/banners` | Active banners |
| POST | `/api/banners` | Banner add (admin) |
| PUT | `/api/banners/:id` | Banner edit (admin) |
| DELETE | `/api/banners/:id` | Banner delete (admin) |
| GET | `/api/categories` | All categories |
| POST | `/api/categories` | Category add (admin) |
| PUT | `/api/categories/:id` | Category edit (admin) |
| DELETE | `/api/categories/:id` | Category delete (admin) |

---

## 9. Development Phases

| Phase | Kya Banega | Estimated Time |
|---|---|---|
| **Phase 1** | Backend setup — Express + MongoDB Atlas connect + base folder structure + env config | 1-2 din |
| **Phase 2** | Database models + basic API routes (users, products, orders, cart, wishlist, reviews, config) | 2 din |
| **Phase 3** | User onboarding — IP detection, form UI, MongoDB save, TOS checkbox | 1 din |
| **Phase 4** | Homepage — search bar, banner slider, category sections, featured products | 2 din |
| **Phase 5** | Product card component (discount badge, out of stock, delivery time, wishlist, qty) | 1 din |
| **Phase 6** | Product detail page — image slider, related products, reviews section | 1-2 din |
| **Phase 7** | Cart page + Wishlist page | 1-2 din |
| **Phase 8** | Address modal + WhatsApp redirect + Order Success page | 1 din |
| **Phase 9** | Order History page + real-time status display | 1 din |
| **Phase 10** | Admin Panel — PIN login, forgot PIN, dashboard analytics | 1-2 din |
| **Phase 11** | Admin — Products management + Cloudinary image upload | 2 din |
| **Phase 12** | Admin — Orders management + status update + Excel export | 1-2 din |
| **Phase 13** | Admin — Users, Reviews, Banners, Config sections | 2 din |
| **Phase 14** | Browser Push Notifications integration | 1 din |
| **Phase 15** | Light/Dark theme system | 1 din |
| **Phase 16** | PWA setup (manifest, service worker, install prompt) | 1 din |
| **Phase 17** | Legal pages — Privacy Policy + Terms of Service | 0.5 din |
| **Phase 18** | About Us page | 0.5 din |
| **Phase 19** | Search + Filter + Sort functionality complete | 1 din |
| **Phase 20** | Testing, bug fixes, mobile responsiveness polish | 2-3 din |
| **Phase 21** | Deployment (hosting decide hone ke baad) | 1 din |

---

## 10. Folder Structure

```
[STORE_NAME]/
│
├── client/                          # React Frontend
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   └── icons/                   # App icons
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── About.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── admin/
│   │   │       ├── Login.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── Orders.jsx
│   │   │       ├── Users.jsx
│   │   │       ├── Reviews.jsx
│   │   │       ├── Banners.jsx
│   │   │       └── Config.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Desktop top nav
│   │   │   ├── BottomNav.jsx        # Mobile bottom nav
│   │   │   ├── ProductCard.jsx
│   │   │   ├── BannerSlider.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── AddressModal.jsx
│   │   │   ├── ReviewCard.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── PWAInstallPrompt.jsx
│   │   ├── context/
│   │   │   ├── CartContext.jsx
│   │   │   ├── UserContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useCart.js
│   │   │   ├── useWishlist.js
│   │   │   └── usePushNotification.js
│   │   ├── utils/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── whatsapp.js          # WhatsApp message generator
│   │   │   └── ip.js                # IP detection helper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js               # PWA plugin config
│
├── server/                          # Node.js Backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   ├── Banner.js
│   │   ├── Category.js
│   │   ├── Config.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── wishlist.js
│   │   ├── reviews.js
│   │   ├── admin.js
│   │   ├── banners.js
│   │   ├── categories.js
│   │   └── config.js
│   ├── middleware/
│   │   ├── adminAuth.js             # PIN verify middleware
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── cloudinary.js            # Image upload helper
│   │   ├── pushNotification.js      # Web push helper
│   │   └── excelExport.js           # Orders Excel export
│   ├── .env                         # Environment variables
│   ├── .env.example
│   └── index.js                     # Entry point
│
└── README.md
```

---

## 11. Future Features

Yeh features abhi nahi banenge — client ka request aane pe baad mein add honge:

- **Coupon / Discount Codes** — promo codes system
- **Multiple Saved Addresses** — ghar, office alag alag
- **SMS Notifications** — WhatsApp ya SMS service se
- **Sub-admin Roles** — agar client ko team management chahiye
- **Product Variants** — size, weight options (jaise 500g / 1kg)
- **Inventory Alerts** — stock X se kam hone pe admin ko email
- **Analytics Dashboard Upgrade** — graphs, charts, date-wise reports

---

> 📄 **Document prepared for:** [CLIENT_NAME]
> 🗓️ **Date:** June 2025
> 👨‍💻 **Prepared by:** [YOUR_NAME]
