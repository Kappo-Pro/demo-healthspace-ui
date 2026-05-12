# ContinueSessionButton Molecule Component

## Overview

The ContinueSessionButton is a call-to-action molecule component that allows users to resume their last incomplete rehabilitation session. It displays the program name and provides a visually prominent button for engagement.

## Features

- **Dynamic Label**: Displays program name in button text (e.g., "Continue Lower Back Program")
- **Icon**: PlayCircleOutlined icon for visual clarity
- **Accessibility**: Full keyboard support and ARIA labels
- **Responsive**: Full-width on mobile (≤768px)
- **Interactive**: Hover effects with shadow and transform
- **Text Truncation**: Automatically truncates long program names while preserving full name in ARIA label

## Installation

```typescript
import { ContinueSessionButton } from '@molecules/ContinueSessionButton';
// or
import { ContinueSessionButton } from 'src/components/molecules/ContinueSessionButton';
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `programName` | `string` | Yes | The name of the program to display in the button label |
| `programId` | `string` | Yes | Unique identifier for the program |
| `sessionId` | `string` | Yes | Unique identifier for the session to resume |
| `onClick` | `() => void` | No | Optional click handler for testing purposes |

## Usage Examples

### Basic Usage

```typescript
<ContinueSessionButton
  programName="Lower Back Program"
  programId="123"
  sessionId="456"
/>
```

### With Click Handler

```typescript
const handleContinue = () => {
  console.log('Continuing session...');
};

<ContinueSessionButton
  programName="Shoulder Mobility Program"
  programId="789"
  sessionId="101112"
  onClick={handleContinue}
/>
```

### Long Program Name (Auto-Truncated)

```typescript
<ContinueSessionButton
  programName="Comprehensive Lower Back Pain Relief and Rehabilitation Program"
  programId="456"
  sessionId="789"
/>
// Displays: "Continue Comprehensive Lower Back..."
// ARIA Label: "Continue Comprehensive Lower Back Pain Relief and Rehabilitation Program session"
```

## Styling

The component uses:
- Ant Design Button component (primary type, large size)
- CSS custom properties for shadows
- Responsive breakpoint at 768px

### CSS Classes

- `.continue-session-button`: Main button class with hover effects

### Customization

You can override styles using CSS:

```css
.continue-session-button {
  /* Custom styles */
}
```

## Accessibility

- **Keyboard Navigation**: Button is focusable and activatable with Enter/Space keys
- **Screen Readers**: Comprehensive `aria-label` with full program name
- **Focus Indicators**: Standard browser focus indicators
- **Semantic HTML**: Uses native button element via Ant Design

## Testing

### Unit Tests

Run unit tests with:

```bash
npm test -- ContinueSessionButton.test.tsx
```

### Example File

See `ContinueSessionButton.example.tsx` for interactive examples.

## Technical Details

### Dependencies

- `antd` (Button component)
- `@ant-design/icons` (PlayCircleOutlined)
- `react`

### File Structure

```
ContinueSessionButton/
├── ContinueSessionButton.tsx      # Main component
├── types.ts                       # TypeScript interfaces
├── ContinueSessionButton.css      # Component styles
├── index.tsx                      # Export barrel
├── ContinueSessionButton.test.tsx # Unit tests
├── ContinueSessionButton.example.tsx # Usage examples
└── README.md                      # This file
```

## Implementation Notes

- **Text Truncation**: Program names longer than 30 characters are automatically truncated with ellipsis
- **Navigation**: Uses React Router's `useNavigate` hook to navigate to `/:userId/program/start?programId=X&sessionId=Y`
- **Route Constant**: Uses `router.AIASSISTANT_PROGRAM_START` from `@routers/routers` (never hardcoded)
- **User Context**: Retrieves userId from Redux state via `useTypedSelector`
- **Query Parameters**: Passes `programId` and `sessionId` as URL query parameters for session resumption
- **Click Handler**: Calls optional `onClick` callback before navigation
- **Mobile Responsive**: Button becomes full-width on screens ≤768px
- **Hover Effects**: Subtle shadow increase and 2px upward transform

## Related Components

- **DashboardHero** (organism): Parent component that will use this button
- **AssessmentStatusCard** (molecule): Related dashboard component

## Epic Context

- **Epic ID**: EPIC-011
- **Story ID**: EPIC-011-S1
- **Priority**: P0
- **Phase**: Phase 2: Engagement

## Next Steps

- EPIC-011-S3: Integrate with DashboardHero organism

## Changelog

- **2025-10-21**: Added navigation logic with React Router (EPIC-011-S2)
- **2025-10-21**: Initial implementation (EPIC-011-S1)
