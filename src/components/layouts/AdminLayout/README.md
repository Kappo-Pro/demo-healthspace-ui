# AdminLayout with Ant Design Sider Menu

This layout provides a modern sidebar navigation for admin patient management pages using Ant Design's Sider component.

## Features

- ✅ Collapsible sidebar with smooth transitions
- ✅ Dark mode support
- ✅ Active menu item highlighting
- ✅ Sticky header with user info
- ✅ Responsive layout

## Usage

The AdminLayout is automatically applied to the following routes:
- `/unassigned-patients` - Unassigned Patients
- `/registered-patients` - Registered Patients
- `/consent-form-patients` - Consent Form Patients

## File Structure

```
src/components/layouts/AdminLayout/
├── index.tsx           # Main layout component
├── menuItems.tsx       # Menu configuration
├── style.css          # Layout styles
└── README.md          # This file
```

## Menu Configuration

Menu items are configured in `menuItems.tsx` using the `useAdminMenuItems` hook:

```tsx
const { menuItems } = useAdminMenuItems();
```

## Adding New Menu Items

To add a new menu item, edit `menuItems.tsx`:

```tsx
getItem(
  'New Page',           // Label
  'new-page',          // Key
  <IconComponent />,   // Icon
  undefined,           // Children (for submenus)
  () => navigate('/new-page')  // onClick handler
)
```

## Dark Mode

The layout fully supports dark mode using CSS variables:
- `--sidebar-bg` - Sidebar background
- `--sidebar-item-hover-bg` - Hover state
- `--sidebar-item-active-bg` - Active item background
- `--sidebar-item-active-text` - Active item text color

## Components Used

- **ASiderMenu** (`@atoms/ASiderMenu`) - Reusable Sider component
- **Layout** (`antd`) - Ant Design Layout
- **Menu** (`antd`) - Ant Design Menu

## Integration

The layout is integrated in `/src/routers/Admin.tsx`:

```tsx
<Route element={<AdminLayout />}>
  <Route path={router.UNASSIGNEDPATIENTS} element={<UnAssignedPatients />} />
  <Route path={router.REGISTEREDPATIENTS} element={<RegisteredPatients />} />
  <Route path={router.CONSENTFORMPATIENTS} element={<ConsentFormPatients />} />
</Route>
```

## Customization

### Change Sider Width

Edit `ASiderMenu/index.tsx`:
```tsx
<Sider
  width={250}  // Default: 200
  collapsedWidth={100}  // Default: 80
  ...
/>
```

### Customize Header

Edit `AdminLayout/index.tsx` Header section to modify the header content.

### Add More Menu Features

You can add:
- Nested submenus by providing `children` array
- Icons from `@ant-design/icons` or custom icons
- Custom onClick handlers for each menu item
- Menu item badges or counts
