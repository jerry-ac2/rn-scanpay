# rn-scanpay

A lightweight React Native library for scanning and parsing closed-loop payment QR codes, built on top of Expo Camera.

[![npm version](https://img.shields.io/npm/v/rn-scanpay.svg)](https://www.npmjs.com/package/rn-scanpay)
[![license](https://img.shields.io/npm/l/rn-scanpay.svg)](https://github.com/jerry-ac2/rn-scanpay/blob/main/LICENSE)
[![CI](https://github.com/jerry-ac2/rn-scanpay/actions/workflows/ci.yml/badge.svg)](https://github.com/jerry-ac2/rn-scanpay/actions/workflows/ci.yml)

---

## Overview

`rn-scanpay` handles the full QR payment scan flow — camera permission, scanning, payload validation, and state management — so you can wire up a payment screen in minutes instead of building it from scratch.

**What it does:**

- Opens the camera and scans QR codes
- Parses and validates the custom payment payload
- Manages scan state (idle → scanning → validating → success/error)
- Exposes a ready-to-use component and a headless hook for custom UIs

**What it does not do:**

- Process payments (you handle the transfer API call)
- Work with NQR or EMVCo standards — this is for closed-loop systems only

---

## Requirements

- React Native `>= 0.70`
- Expo SDK `>= 50`
- `expo-camera` `>= 14`

---

## Installation

```bash
npm install rn-scanpay
```

Install the peer dependency if you haven't already:

```bash
npm install expo-camera
```

Then add camera permissions to your app config.

**`app.json` / `app.config.js`:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera to scan payment QR codes."
        }
      ]
    ]
  }
}
```

---

## Quick Start

The fastest way to get scanning — drop in the `QRLoopScanner` component and handle the result:

<!--
```tsx
import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { QRLoopScanner } from 'rn-scanpay'
import type { Payload } from 'rn-scanpay'

export function ScanScreen({ navigation }) {
  const handleSuccess = (payload: Payload) => {
    // payload is fully typed and validated at this point
    navigation.navigate('ConfirmPayment', {
      recipientId:   payload.recipientId,
      recipientName: payload.recipientName,
      accountNumber: payload.accountNumber,
      bankName:      payload.bankName,
    })
  }

  return (
    <View style={styles.container}>
      <QRLoopScanner
        onSuccess={handleSuccess}
        onError={(err) => console.warn('Scan failed:', err)}
        style={styles.scanner}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanner:   { flex: 1 },
})
``` -->

---

## Parsing Payloads Manually

If you're not using the camera components at all and just need to validate a payload string (e.g. from a deep link or clipboard), use the utility directly:

```ts
import { parsePayload, isPayload } from 'rn-scanpay';

// Check without throwing
if (isPayload(rawString)) {
  const payload = parsePayload(rawString);
  console.log(payload.recipientName); // "Alice Smith"
}

// Or parse and catch errors
try {
  const payload = parsePayload(rawString);
} catch (err) {
  console.error(err.message); // "QR code is not a payment code"
}
```

---

## API Reference

### `<QRLoopScanner />`

Drop-in camera component that handles permissions, scanning, and validation internally.

| Prop        | Type                         | Required | Description                               |
| ----------- | ---------------------------- | -------- | ----------------------------------------- |
| `onSuccess` | `(payload: Payload) => void` | Yes      | Called when a valid payload is scanned    |
| `onError`   | `(error: string) => void`    | No       | Called when an invalid QR code is scanned |
| `style`     | `StyleProp<ViewStyle>`       | No       | Style applied to the camera view          |

---

### `useQRLoop()`

Headless hook for building custom scanner UIs.

**Returns:**

| Field        | Type                     | Description                           |
| ------------ | ------------------------ | ------------------------------------- |
| `status`     | `ScanStatus`             | Current scan state                    |
| `payload`    | `Payload \| null`        | Parsed payload on success             |
| `rawData`    | `string \| null`         | The raw scanned string                |
| `error`      | `string \| null`         | Error message if validation failed    |
| `handleScan` | `(data: string) => void` | Call this with the raw scanned string |
| `reset`      | `() => void`             | Resets state back to idle             |

---

### `parsePayload(raw: string): Payload`

Parses and validates a raw QR string. Throws with a descriptive message if invalid.

### `isPayload(raw: string): boolean`

Returns `true` if the string is a valid payload. Never throws.

---

### Types

```ts
interface Payload {
  type: '_INTERNAL_PAYMENT';
  recipientId: string;
  recipientName: string;
  username: string;
  accountNumber: string;
  bankName: string;
}

type ScanStatus =
  | 'idle' // camera open, waiting for a code
  | 'scanning' // actively reading
  | 'validating' // parsed, checking validity
  | 'success' // valid payload confirmed
  | 'error'; // scanned something invalid
```

---

## The Payload Format

Your backend's `GET /mobile/user/qr-payload` returns:

```json
{
  "payload": "{\"type\":\"_INTERNAL_PAYMENT\",\"recipientId\":\"uuid...\",\"recipientName\":\"Alice Smith\",\"username\":\"alicesmith99\",\"accountNumber\":\"1002345678\",\"bankName\":\"Maplerad\"}"
}
```

Feed the `payload` string directly into your QR code renderer on the sender's screen. On the receiver's end, `rn-scanpay` extracts and validates it automatically.

---

## Complete Payment Flow

```
Alice (receiver)                          Bob (sender)
─────────────────                         ──────────────────────────────
GET /mobile/user/qr-payload
        │
        ▼
Render QR code on screen    ──scan──►   <QRLoopScanner onSuccess={...} />
                                                  │
                                                  ▼
                                        payload.recipientId
                                        payload.recipientName
                                                  │
                                                  ▼
                                        Show "Pay Alice Smith"
                                        prompt for amount
                                                  │
                                                  ▼
                                        POST /internal/transfer
                                        { recipientId, amount }
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```bash
# Clone and install
git clone https://github.com/jerry-ac2/rn-scanpay.git
cd rn-scanpay
npm install --legacy-peer-deps

# Run the example app
cd example
npm install --legacy-peer-deps
npx expo start

# Build the library
cd ..
npm run prepare
```

---

## License

MIT © [jerryislive](https://www.npmjs.com/~jerryislive)
