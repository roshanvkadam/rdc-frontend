const SESSION_KEY = "my_session_secret";
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

async function generateSessionKey() {
  const secret = crypto.randomUUID();
  const expiryTime = Date.now() + SESSION_DURATION;
  const payload = JSON.stringify({ secret, expiry: expiryTime });
  const encrypted = await encrypt(payload);
  sessionStorage.setItem(SESSION_KEY, encrypted);
  return encrypted;
}

async function encrypt(plainText) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const keyData = await crypto.subtle.exportKey("raw", key);
  sessionStorage.setItem(`${SESSION_KEY}_key`, arrayBufferToBase64(keyData));
  sessionStorage.setItem(`${SESSION_KEY}_iv`, arrayBufferToBase64(iv));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plainText)
  );
  return arrayBufferToBase64(ciphertext);
}

async function validateEncryptedKey(encryptedBase64) {
  const encrypted = sessionStorage.getItem(SESSION_KEY);
  if (!encrypted) return false;

  const keyDataBase64 = sessionStorage.getItem(`${SESSION_KEY}_key`);
  const ivBase64 = sessionStorage.getItem(`${SESSION_KEY}_iv`);

  if (!keyDataBase64 || !ivBase64) return false;

  const keyData = base64ToArrayBuffer(keyDataBase64);
  const iv = base64ToArrayBuffer(ivBase64);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      base64ToArrayBuffer(encrypted)
    );

    const decoded = new TextDecoder().decode(decrypted);
    const { secret, expiry } = JSON.parse(decoded);

    if (Date.now() > expiry) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(`${SESSION_KEY}_key`);
      sessionStorage.removeItem(`${SESSION_KEY}_iv`);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function getSessionExpiryTime() {
  const encrypted = sessionStorage.getItem(SESSION_KEY);
  const keyBase64 = sessionStorage.getItem(`${SESSION_KEY}_key`);
  const ivBase64 = sessionStorage.getItem(`${SESSION_KEY}_iv`);

  if (!encrypted || !keyBase64 || !ivBase64) return null;

  try {
    const keyData = base64ToArrayBuffer(keyBase64);
    const iv = base64ToArrayBuffer(ivBase64);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      base64ToArrayBuffer(encrypted)
    );

    const decoded = new TextDecoder().decode(decrypted);
    const { expiry } = JSON.parse(decoded);

    return expiry; // This is a timestamp (e.g. 1716571248373)
  } catch (err) {
    console.error("Failed to extract expiry time:", err);
    return null;
  }
}

async function checkSessionExpiry() {
  try {
    const expiryTime = await getSessionExpiryTime();

    if (expiryTime) {
      const now = Date.now();
      const expiryTimestamp = new Date(expiryTime).getTime();
      const timeRemaining = expiryTimestamp - now;

      if (timeRemaining > 0) {
        console.log("Session expires at:", new Date(expiryTime).toLocaleString());
        console.log("Time remaining (ms):", timeRemaining);
        return false;
      } else {
        console.log("Session already expired.");
        return true;
      }
    } else {
      console.log("No valid session found or decryption failed.");
      return true;
    }

  } catch (error) {
    console.log("Error checking session expiry:", error);
    return true;
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export {
  generateSessionKey,
  checkSessionExpiry,
  validateEncryptedKey
};
