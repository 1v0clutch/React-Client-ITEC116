# ERP System Design System Guide

## Overview
This guide establishes the consistent design patterns used across all modules in the ERP system, based on the successful implementations in SalesCustomer, SupplyChain, and Report modules.

## Core Design Principles

### 1. **Background Pattern**
```css
className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6"
```

### 2. **Enhanced Header Pattern**
```jsx
<div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
  <div className="flex items-center gap-4 mb-4">
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
      {/* Icon SVG */}
    </div>
    <div>
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-white/80 text-sm">{subtitle}</p>
    </div>
  </div>
</div>
```

### 3. **Form Card Pattern**
```jsx
<div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
  <div className="flex items-center gap-3 mb-6">
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
      {/* Icon */}
    </div>
    <h3 className="text-xl font-bold text-gray-800">{formTitle}</h3>
  </div>
  {/* Form content */}
</div>
```

### 4. **Input Field Pattern**
```jsx
<div className="flex flex-col group">
  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
    {/* Icon */}
    {labelText}
  </label>
  <input
    className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
    placeholder={placeholder}
  />
</div>
```

### 5. **Button Pattern**
```jsx
<button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
  {/* Icon */}
  {buttonText}
</button>
```

### 6. **Table Container Pattern**
```jsx
<div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
    <div className="flex items-center gap-3">
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
        {/* Icon */}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{tableTitle}</h3>
        <p className="text-white/80 text-sm">{itemCount} items</p>
      </div>
    </div>
  </div>
  
  <div className="p-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            {/* Headers */}
          </tr>
        </thead>
        <tbody>
          {/* Rows */}
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### 7. **Empty State Pattern**
```jsx
<div className="text-center py-12">
  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* Icon path */}
  </svg>
  <p className="text-xl font-semibold text-gray-500">{emptyTitle}</p>
  <p className="text-gray-400 mt-2">{emptySubtitle}</p>
</div>
```

## Color Themes by Module

### Primary Gradients
- **Headers**: `from-indigo-600 via-purple-600 to-pink-600`
- **Form Icons**: `from-indigo-500 to-purple-600`
- **Table Headers**: `from-blue-500 to-cyan-600`
- **Buttons**: `from-indigo-600 to-purple-600`

### Module-Specific Accent Colors
- **HR**: Green accents (`green-500`, `green-600`)
- **Finance**: Blue accents (`blue-500`, `blue-600`)
- **Inventory**: Purple accents (`purple-500`, `purple-600`)
- **Procurement**: Orange accents (`orange-500`, `orange-600`)
- **ECommerce**: Pink accents (`pink-500`, `pink-600`)
- **Project Management**: Teal accents (`teal-500`, `teal-600`)

## Icon Guidelines

### Use Heroicons or Lucide React icons consistently
- **Users/Employees**: `UserIcon`, `UsersIcon`
- **Inventory**: `PackageIcon`, `BoxIcon`
- **Finance**: `CurrencyDollarIcon`, `ChartBarIcon`
- **Reports**: `DocumentTextIcon`, `ChartPieIcon`
- **Settings**: `CogIcon`, `AdjustmentsIcon`

## Responsive Design

### Grid Patterns
```css
/* Forms */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

/* Cards */
className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
```

### Breakpoints
- **Mobile**: Base styles (320px+)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large**: `xl:` prefix (1280px+)

## Animation Guidelines

### Transitions
```css
transition-all duration-300
transition-colors duration-200
```

### Hover Effects
```css
hover:shadow-xl
hover:scale-105
hover:border-indigo-300
```

### Focus States
```css
focus:ring-2 focus:ring-indigo-500
focus:border-indigo-500
focus:bg-white
```

## Implementation Checklist

For each module component:
- [ ] Apply gradient background
- [ ] Implement enhanced header with icon
- [ ] Update form cards with proper styling
- [ ] Add icon labels to form fields
- [ ] Apply consistent button styling
- [ ] Implement professional table design
- [ ] Add empty state handling
- [ ] Ensure responsive design
- [ ] Add hover and focus effects
- [ ] Test accessibility compliance

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All CSS features used (gradients, transforms, backdrop-blur) are supported in modern browsers.