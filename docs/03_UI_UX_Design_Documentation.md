# Factory ERP System - UI/UX Design Documentation

## 🎨 Design System & Color Palette

### Primary Color Palette
```css
:root {
  /* Primary Colors */
  --primary-blue: #2563eb;      /* Main brand color */
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1d4ed8;
  
  /* Secondary Colors */
  --secondary-green: #059669;   /* Success states */
  --secondary-orange: #ea580c;  /* Warning states */
  --secondary-red: #dc2626;     /* Error states */
  
  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
}
```

### Status Colors
```css
/* Order Status Colors */
--status-pending: #f59e0b;
--status-confirmed: #3b82f6;
--status-in-production: #8b5cf6;
--status-ready: #10b981;
--status-dispatched: #06b6d4;
--status-delivered: #059669;
--status-cancelled: #ef4444;

/* Production Status Colors */
--production-pending: #f59e0b;
--production-in-progress: #3b82f6;
--production-completed: #10b981;
--production-on-hold: #ef4444;

/* Inventory Status Colors */
--stock-high: #10b981;
--stock-medium: #f59e0b;
--stock-low: #ef4444;
--stock-out: #dc2626;
```

## 📱 Layout Structure

### 1. Main Navigation Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Company Selector | User Menu | Notifications│
├─────────────────────────────────────────────────────────┤
│ Sidebar Navigation                │ Main Content Area     │
│ ├─ Dashboard                     │                       │
│ ├─ Inventory                     │                       │
│ ├─ Production                    │                       │
│ ├─ Orders                        │                       │
│ ├─ Sales & Purchase              │                       │
│ ├─ Financial                     │                       │
│ ├─ Security                      │                       │
│ ├─ Reports                       │                       │
│ └─ Settings                      │                       │
└─────────────────────────────────────────────────────────┘
```

### 2. Responsive Breakpoints
```css
/* Mobile First Approach */
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--large-desktop: 1440px;
--extra-large: 1920px;
```

## 🏠 Dashboard Design

### Main Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Quick Stats Cards Row                                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ Orders  │ │ Prod.   │ │ Stock   │ │ Revenue │        │
│ │ Today   │ │ Status  │ │ Alerts  │ │ Today   │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Charts & Analytics Section                              │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Production Chart    │ │ Sales Trend Chart   │        │
│ │                     │ │                     │        │
│ └─────────────────────┘ └─────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│ Recent Activities & Alerts                              │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Recent Orders       │ │ Stock Alerts        │        │
│ │ Recent Production   │ │ Payment Reminders   │        │
│ └─────────────────────┘ └─────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Dashboard Components

#### Quick Stats Card
```html
<div class="stats-card">
  <div class="stats-icon">
    <i class="icon-orders"></i>
  </div>
  <div class="stats-content">
    <h3 class="stats-number">24</h3>
    <p class="stats-label">Orders Today</p>
    <span class="stats-change positive">+12%</span>
  </div>
</div>
```

#### Alert Component
```html
<div class="alert alert-warning">
  <i class="icon-warning"></i>
  <div class="alert-content">
    <h4>Low Stock Alert</h4>
    <p>5 products are below minimum stock level</p>
  </div>
  <button class="alert-action">View Details</button>
</div>
```

## 📦 Inventory Management UI

### Inventory List View
```
┌─────────────────────────────────────────────────────────┐
│ Filters & Search Bar                                    │
│ [Search] [Category▼] [Warehouse▼] [Status▼] [Export]   │
├─────────────────────────────────────────────────────────┤
│ Product Table                                           │
│ ┌─────┬─────────┬─────────┬─────────┬─────────┬────────┐│
│ │ SKU │ Product │ Category│ Stock   │ Status  │ Actions││
│ │     │ Name    │         │ Level   │         │        ││
│ ├─────┼─────────┼─────────┼─────────┼─────────┼────────┤│
│ │ P001│ Cotton  │ Raw Mat │ 150 kg  │ 🟢 Good │ [Edit] ││
│ │ P002│ Saree   │ Finished│ 25 pcs  │ 🟡 Low  │ [Edit] ││
│ │ P003│ Chemical│ Chemical│ 5 ltr   │ 🔴 Critical│[Edit]││
│ └─────┴─────────┴─────────┴─────────┴─────────┴────────┘│
├─────────────────────────────────────────────────────────┤
│ Pagination: [<] 1 2 3 4 5 [>]                         │
└─────────────────────────────────────────────────────────┘
```

### Stock Level Indicators
```css
.stock-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.stock-high { background: var(--stock-high); color: white; }
.stock-medium { background: var(--stock-medium); color: white; }
.stock-low { background: var(--stock-low); color: white; }
.stock-out { background: var(--stock-out); color: white; }
```

## 🏭 Production Management UI

### Production Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Production Overview Cards                               │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ Active  │ │ Pending │ │ Today's │ │ Machine │        │
│ │ Orders  │ │ Queue   │ │ Output  │ │ Status  │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Production Timeline                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Machine 1: [████████░░] Printing - 80% Complete    │ │
│ │ Machine 2: [██████░░░░] Washing - 60% Complete     │ │
│ │ Machine 3: [██████████] Finishing - 100% Complete  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Active Production Orders                                │
│ [Table with Order#, Product, Quantity, Status, ETA]    │
└─────────────────────────────────────────────────────────┘
```

### Process Flow Visualization
```html
<div class="process-flow">
  <div class="process-step completed">
    <div class="step-icon">✓</div>
    <div class="step-label">Printing</div>
  </div>
  <div class="process-connector completed"></div>
  <div class="process-step active">
    <div class="step-icon">⚡</div>
    <div class="step-label">Washing</div>
  </div>
  <div class="process-connector"></div>
  <div class="process-step pending">
    <div class="step-icon">○</div>
    <div class="step-label">Finishing</div>
  </div>
</div>
```

## 📋 Order Management UI

### Order List View
```
┌─────────────────────────────────────────────────────────┐
│ Order Filters & Actions                                 │
│ [New Order] [Search] [Status▼] [Date Range] [Export]   │
├─────────────────────────────────────────────────────────┤
│ Orders Table                                            │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬────┐│
│ │ Order # │ Customer│ Date    │ Amount  │ Status  │ Act││
│ ├─────────┼─────────┼─────────┼─────────┼─────────┼────┤│
│ │ ORD001  │ ABC Ltd │ 15/01   │ ₹50,000 │🟡Pending│[▶] ││
│ │ ORD002  │ XYZ Co  │ 14/01   │ ₹75,000 │🔵Prod.  │[▶] ││
│ │ ORD003  │ PQR Inc │ 13/01   │ ₹25,000 │🟢Ready  │[▶] ││
│ └─────────┴─────────┴─────────┴─────────┴─────────┴────┘│
└─────────────────────────────────────────────────────────┘
```

### Order Detail View
```
┌─────────────────────────────────────────────────────────┐
│ Order Header                                            │
│ Order #ORD001 | Customer: ABC Ltd | Status: In Progress │
│ [Edit] [Print] [Send Email] [Mark Complete]             │
├─────────────────────────────────────────────────────────┤
│ Order Items                                             │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐     │
│ │ Product │ Qty     │ Price   │ Total   │ Status  │     │
│ ├─────────┼─────────┼─────────┼─────────┼─────────┤     │
│ │ Saree A │ 100 pcs │ ₹500    │ ₹50,000 │ Printing│     │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘     │
├─────────────────────────────────────────────────────────┤
│ Production Timeline & Notes                             │
│ [Timeline visualization and notes section]              │
└─────────────────────────────────────────────────────────┘
```

## 💰 Financial Dashboard UI

### Financial Overview
```
┌─────────────────────────────────────────────────────────┐
│ Financial Summary Cards                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ Total   │ │ Pending │ │ Today's │ │ Bank    │        │
│ │ Revenue │ │ Payments│ │ Expenses│ │ Balance │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Cash Flow Chart                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Monthly cash flow visualization]                   │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Recent Transactions & Pending Payments                 │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ Recent Transactions │ │ Payment Reminders   │        │
│ └─────────────────────┘ └─────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Security Management UI

### Security Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Security Overview                                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ Guards  │ │ Visitors│ │ Vehicles│ │ Alerts  │        │
│ │ On Duty │ │ Today   │ │ In/Out  │ │ Active  │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Live Activity Feed                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 10:30 AM - Vehicle Entry: GJ01AB1234                │ │
│ │ 10:25 AM - Visitor Check-in: John Doe               │ │
│ │ 10:20 AM - Guard Shift Change: Day → Night          │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Quick Actions                                           │
│ [New Visitor] [Vehicle Entry] [Gate Pass] [Emergency]  │
└─────────────────────────────────────────────────────────┘
```

## 📱 Mobile App Design

### Mobile Navigation
```
┌─────────────────────┐
│ Header with Menu    │
├─────────────────────┤
│ Quick Action Cards  │
│ ┌─────┐ ┌─────┐     │
│ │Order│ │Stock│     │
│ └─────┘ └─────┘     │
│ ┌─────┐ ┌─────┐     │
│ │Prod.│ │Money│     │
│ └─────┘ └─────┘     │
├─────────────────────┤
│ Recent Activities   │
│ • Order #123 ready  │
│ • Low stock alert   │
│ • Payment received  │
├─────────────────────┤
│ Bottom Navigation   │
│ [🏠][📦][🏭][💰][👤]│
└─────────────────────┘
```

## 🎯 Component Library

### Button Styles
```css
.btn-primary { background: var(--primary-blue); color: white; }
.btn-secondary { background: var(--gray-200); color: var(--gray-700); }
.btn-success { background: var(--secondary-green); color: white; }
.btn-warning { background: var(--secondary-orange); color: white; }
.btn-danger { background: var(--secondary-red); color: white; }
```

### Form Elements
```css
.form-input {
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.form-input:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

This UI/UX design documentation provides a comprehensive foundation for building a modern, user-friendly Factory ERP system with consistent design patterns and responsive layouts.
