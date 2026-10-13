# WooCommerce CRM System Integration

A modern, high-performance Customer Relationship Management (CRM) dashboard web application built with **React (Vite)**, **Node.js (Express)**, **SQLite**, and **WooCommerce REST API v3**.

![WooCommerce CRM](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 📊 1. Executive Dashboard
- **Real-Time KPIs**: Total Customers, Total Orders, Lifetime Sales Revenue, and Action-Required (Pending/On-Hold) orders.
- **Order Status Distribution**: Visual progress breakdown across all order states with revenue totals and percentages.
- **Recent Orders Table**: Live order activity with status tags and instant item inspection.
- **Top VIP Customers**: Ranked by lifetime spend to identify high-value buyers immediately.
- **Quick CRM Tasks**: Actionable follow-up checklist with priority flags and quick checkbox completion.

### 👥 2. Customer 360 Management
- **Directory**: Comprehensive table showing customer avatars, names, contact numbers, email addresses, geographical locations, total orders, lifetime value, and registration dates.
- **Instant Search & Multi-Sort**: Search by name, email, or phone; sort by lifetime spend, order count, or registration date.
- **Customer 360 Modal**:
  - Detailed billing and shipping address inspector.
  - Complete customer order history with totals and item counts.
  - **Internal CRM Notes Manager**: Add, timestamp, and delete staff notes for customer preferences or VIP handling.
  - **Interaction History**: View past logged calls, emails, and meetings.
  - **Email Customer Shortcut**: Direct transfer to the email composer.

### 📦 3. Order Tracking & Lifecycle Management
- **Status Filter Tabs**: Filter across **All**, **Pending Payment**, **Processing**, **On Hold**, **Completed**, **Cancelled**, and **Refunded** orders.
- **Search**: Search by Order ID (`#wc-9001`), customer name, or email.
- **Order Detail Modal**:
  - Full line items table showing product titles, quantities, unit prices, and line totals.
  - Order grand total and currency.
  - Billing & Shipping destination breakdown.
  - One-click navigation to the customer's 360 profile.

### 💬 4. Communication & Task Management
- **Interaction Timeline Feed**: Chronological log of calls, emails, meetings, and notes with channel markers (Outlook, Zoom, Phone, Direct).
- **Follow-up Reminders & Tasks**:
  - Assign follow-up reminders to specific customers or general CRM tasks.
  - Set due dates and priority levels (**High**, **Medium**, **Low**).
  - Check off completed tasks.
- **Safe Customer Email Composer**:
  - Pre-built executive templates: *Thank You & Setup Guide*, *Shipping Update*, *Payment Follow-up*, and *Exclusive VIP Note*.
  - Live email preview.
  - Open in default email application (`mailto:`) and copy draft to clipboard.
  - **Zero Auto-Send Risk**: In adherence with security guidelines, emails are prepared as structured drafts and require explicit user action.

### ⚡ 5. WooCommerce REST API v3 Synchronization
- **Direct Store Integration**: Connects securely to `/wp-json/wc/v3/customers` and `/wp-json/wc/v3/orders`.
- **Sync from WooCommerce Button**: Interactive one-click synchronization with animated status feedback.
- **Pagination Engine**: Retrieves all store customers and orders across multiple pages automatically.
- **Deduplication / Upsert**: Database schema uses unique WooCommerce IDs to prevent duplicates during repeated synchronizations.
- **Connection Diagnostics**: Test API connection button validating credentials before syncing.
- **Realistic Demo Fallback**: Automatically loads realistic demo data when store credentials are not configured, clearly badged with a "Demo Data" banner and a "Reset Demo Data" option.

---

## 🔒 Security Architecture
- **Credential Protection**: WooCommerce Consumer Key and Consumer Secret are handled solely in the backend (`backend/.env` / local SQLite settings).
- **Zero Frontend Leakage**: API secrets are never exposed in client bundles or network responses (keys are masked with `••••`).
- **Git Shield**: `.gitignore` excludes `.env`, `*.sqlite`, and dependencies.
- **Sanitized Errors**: Backend safely handles network timeouts, SSL checks, and invalid credentials without crashing.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Lucide Icons, Modern Responsive CSS with Glassmorphism and dark mode palette.
- **Backend**: Node.js v24 LTS, Express.js, Axios, CORS, Dotenv.
- **Database**: Native `node:sqlite` (SQLite 3.53 built into Node 24 runtime with zero native build dependencies).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or v24 LTS recommended)
- npm (v10 or v11)

### 1. Installation
Clone or navigate to the repository folder:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Starting the Application
You can run the backend and frontend in separate terminals:

**Terminal 1 (Backend API - Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client - Port 5173):**
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔌 Connecting to Your WooCommerce Store

### Step 1: Generate WooCommerce REST API Keys
1. Log in to your WordPress Admin dashboard (`https://yourstore.com/wp-admin`).
2. Go to **WooCommerce** &gt; **Settings** &gt; **Advanced** tab &gt; **REST API**.
3. Click the **Add Key** button.
4. Fill in the fields:
   - **Description**: `WooCommerce CRM System`
   - **User**: Select an Administrator account.
   - **Permissions**: Choose **Read/Write**.
5. Click **Generate API Key**.
6. Keep the page open to copy your **Consumer Key** (`ck_...`) and **Consumer Secret** (`cs_...`).

### Step 2: Ensure Pretty Permalinks Are Enabled
- In WordPress Admin, navigate to **Settings** &gt; **Permalinks**.
- Ensure **Post name** is selected (WooCommerce REST API requires Pretty Permalinks to resolve `/wp-json/wc/v3`).

### Step 3: Enter Credentials in CRM
1. In the CRM web application, click the **WooCommerce Config** tab on the sidebar.
2. Enter your **Store URL** (e.g. `https://my-store.com`).
3. Enter your **Consumer Key** and **Consumer Secret**.
4. Click **Test Connection** to verify connectivity.
5. Click **Save Settings**, then click **Sync from WooCommerce** in the top bar to fetch your live store data!
