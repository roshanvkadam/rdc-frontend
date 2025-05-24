
# Lab Dashboard Frontend Documentation

## Overview

This `Home` component is a central part of a modern lab dashboard built using **React** (with **Next.js**) and **Material UI (MUI)**. It manages user authentication, session validation, system theme preferences, and allows remote control of lab computers such as shutdown and device removal. SweetAlert is used for confirmation dialogs and feedback.

---

## 📦 Features

- ✅ **User Authentication & Session Management**
- 🔄 **Auto-Fetching Computer Status Every 30s**
- 🌓 **System + Manual Dark Mode Toggle**
- ⚙️ **Remote Shutdown / Remove for Individual or All Computers**
- 🔐 **Password Protected Admin Actions**
- 🧠 **Session Expiry Auto-Logout**
- 🔔 **User Notifications via SweetAlert2**

---

## 🔧 Environment Variables Required

| Variable | Description |
|---------|-------------|
| `NEXT_PUBLIC_ADMIN_USERNAME` | Admin login username |
| `NEXT_PUBLIC_ADMIN_ACCESS` | Admin login password |
| `NEXT_PUBLIC_ACCESS_FUNCTION` | Password required to perform shutdown/remove actions |

---

## ⚙️ Core States

| State | Description |
|-------|-------------|
| `authenticated` | Whether the user is logged in |
| `computers` | Fetched list of lab computers |
| `isCheckingAuth` | Initial auth validation flag |
| `themeMode` | Theme preference (`light`, `dark`, or `system`) |
| `darkMode` | Applied boolean dark mode flag |
| `fetchError`, `isBackendDown` | Flags for backend connectivity issues |
| `showPasswordModal`, `passwordInput`, `pendingShutdownComputer`, `passwordError` | Control modal logic for shutdown actions |
| `openConfirm`, `deviceToRemove` | Confirm modal for device removal |

---

## 🛠️ Key Functions

### Authentication & Session

- `handleLogin()` – Validates login credentials against env vars and stores session token.
- `sessionLogout()` – Logs out on session expiry.
- `checkSession()` – Validates session expiration.

### Computer Management

- `getComputers()` – API call to fetch all computers.
- `handleShutdownClick(computer)` – Open modal to confirm shutdown.
- `confirmShutdown()` – Perform shutdown after password input.
- `handleShutdownAll()` / `confirmShutdownAll()` – Perform shutdown on all devices.
- `handleRemoveClick()` / `handleConfirmRemove()` – Remove individual device.

### UI & Theme

- `handleThemeChange(mode)` – Change and persist theme mode.
- `mediaQuery` – Reacts to system theme changes.
- `ThemeProvider` – Applies MUI theme dynamically.

---

## 💬 Alerts (via SweetAlert2)

| Action | Alert |
|--------|-------|
| Login/Logout | Success/Failure alerts |
| Session Expired | Auto logout alert |
| Shutdown/Remove | Loading + Confirmation |
| Backend Down | Retry prompt |

---

## 🧩 UI States

### When Not Authenticated

- Shows login screen (`username`, `password`, error if failed).

### When Authenticated

- Main dashboard showing computer list, controls (Shutdown, Remove), and theme toggle.

### While Checking Auth

- Spinner centered via `CircularProgress`.