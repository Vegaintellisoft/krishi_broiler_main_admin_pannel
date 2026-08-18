# Krishi Broiler - Admin Panel Dashboard

A comprehensive web administration dashboard for the **Krishi Broiler Management System**, built to manage poultry operations, farmer networks, chick placements, feed indents, weighbridge & delivery challans (DC), and master configurations.

---

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) & [Material UI (@mui/material)](https://mui.com/)
- **Icons & UI Utilities**: `react-icons`, `@emotion/react`, `@emotion/styled`, `sweetalert2`, `react-modal`, `react-select`
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Data Visualization & Export**: [Recharts](https://recharts.org/), [SheetJS (xlsx)](https://sheetjs.com/), `file-saver`
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Security & Tokens**: `crypto-js`, `jwt-decode`

---

## 📁 Project Structure

```
krishi_broiler_main_admin_pannel/
├── public/                 # Static assets and icons
├── src/
│   ├── assets/             # Images, logos, branding assets
│   ├── auth/               # Authentication contexts, login state & token handlers
│   ├── components/         # Reusable UI components (Tables, Modals, Filters, Navbars)
│   ├── layouts/            # Main application layout containers & sidebar navigations
│   ├── pages/
│   │   ├── Admin/          # System administration & user access control
│   │   ├── Breeder/        # Breeder farm operations & masters
│   │   ├── Broiler/        # Broiler operations, dashboards, feeds, data entries & masters
│   │   ├── DashBoard.jsx   # Main operations analytics & summary dashboard
│   │   ├── DC.jsx          # Delivery Challan (DC) tracking & dispatch management
│   │   ├── Login.jsx       # Secure user login portal
│   │   ├── PoMaster.jsx    # Purchase Order (PO) management
│   │   ├── Report.jsx      # Exportable operational & performance reports
│   │   └── ...             # Unit, Supplier, Material & Source Master pages
│   ├── utils/              # Axios instance, encryption helpers, formatting utils
│   ├── App.jsx             # Top-level routes & auth switchers
│   ├── index.css           # Global Tailwind and base styles
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables (API base URL, secret keys)
├── package.json            # Dependencies and npm scripts
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite build & plugin configurations
```

---

## 🛠️ Features & Modules

- **Authentication & Role-Based Access**: Multi-tier user authorization for Admins, Supervisors, Line Managers, and Operators.
- **Broiler & Breeder Dashboards**: Real-time visual metrics, mortality rates, FCR, feed distribution, and lifting KPIs using Recharts.
- **Master Management**:
  - Farmer & Line Masters (KYC, geolocation, shed capacities).
  - Material, Supplier, Unit, Source, and PO Masters.
- **Feed & Resource Management**: Feed indents, approvals, transfers between farms, and return workflows.
- **Delivery Challan (DC) & Logistics**: Weight logs, vehicle numbers, driver details, gross/tare weights, and dispatch tracking.
- **Data Export & Reporting**: Dynamic filtering and one-click exports to Excel (`.xlsx`) and PDF formats.

---

## ⚙️ Environment Configuration

Create or update the `.env` file in the root of `krishi_broiler_main_admin_pannel`:

```env
VITE_SERVER_URL=http://localhost:4010/api
VITE_ACCESS_KEY='Krishi@@Access123'
VITE_SECRET_KEY='Krishi@@124'
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5180`.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Lint Code
```bash
npm run lint
```
