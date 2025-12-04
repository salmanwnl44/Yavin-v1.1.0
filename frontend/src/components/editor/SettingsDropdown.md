# Settings Dropdown Implementation

## Overview
A reusable `SettingsMenu` component has been implemented to provide a consistent settings dropdown experience across the application. This menu is accessible from both the header and the sidebar.

## Components

### `SettingsMenu`
A functional component that renders the dropdown menu.
- **Props:**
  - `positionClass`: CSS classes to position the menu relative to its trigger.
  - `onClose`: Callback function to close the menu when clicking outside.
- **Features:**
  - Backdrop to handle "click outside" behavior.
  - Styled with Tailwind CSS to match the application's dark theme.
  - Contains options for Editor Settings, User Settings, Extensions, Keyboard Shortcuts, Snippets, and Tasks.

### `ActivityIcon` Modification
The `ActivityIcon` component was updated to support an `onClick` prop, allowing it to trigger actions (like opening the menu) instead of just switching tabs.

## Integration

### Header
- Added a Settings button to the header's right-side controls.
- Toggles the menu with `showSettingsMenu === 'header'`.
- Positioned with `top-10 right-0`.

### Sidebar
- Updated the "Manage" (Settings) icon in the sidebar.
- Toggles the menu with `showSettingsMenu === 'sidebar'`.
- Positioned with `bottom-2 left-12`.

## State Management
- `showSettingsMenu`: State variable in `EditorLayout` to track which menu is open (`'header'`, `'sidebar'`, or `null`).

## Usage
Clicking the Settings icon in either location toggles the menu. Clicking anywhere outside the menu closes it.
