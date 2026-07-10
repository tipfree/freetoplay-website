/* ============================================================
   FreeToPlay — Account deletion (email + password)
   ------------------------------------------------------------
   HOW TO CONNECT THIS PAGE TO YOUR APP:

   1) This script assumes your app uses Firebase Authentication
      (email/password sign-in). Paste your Firebase web config
      below (Firebase Console → Project settings → Your apps →
      Web app → SDK setup and configuration).

   2) IMPORTANT — server-side data cleanup:
      `deleteUser()` only removes the Auth account. To also wipe
      the user's Firestore/Realtime Database data (coins, games,
      payouts...), install the official "Delete User Data"
      Firebase Extension, or add a Cloud Function triggered on
      auth user deletion (functions.auth.user().onDelete).

   3) Not using Firebase? Replace the code inside
      `deleteAccount()` with a fetch() call to your own backend
      endpoint that verifies the credentials and deletes the
      account.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ----- 1. PASTE YOUR FIREBASE CONFIG HERE ------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyAygj7jF5UMnyuTGhZJY64XcJvYHdggjwc",
  authDomain: "freetooplay-225cd.firebaseapp.com",
  projectId: "freetooplay-225cd",
  appId: "1:848187992712:web:61f2ddf6cbecbf60bf0d3d",
};
/* ------------------------------------------------------------ */

const isConfigured = !Object.values(firebaseConfig).some((v) =>
  String(v).startsWith("PASTE_")
);

let auth = null;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const form = document.getElementById("delete-form");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const confirmEl = document.getElementById("confirm");
const btn = document.getElementById("delete-btn");
const statusEl = document.getElementById("status");

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + (type || "");
}

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "We couldn't sign you in with that email and password. Please double-check your details and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/requires-recent-login":
      return "For security reasons, please try again — we need a fresh sign-in to delete the account.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact us at freeToPlay.business@gmail.com.";
    default:
      return "Something went wrong while deleting your account. Please try again, or email us at freeToPlay.business@gmail.com.";
  }
}

async function deleteAccount(email, password) {
  // Sign the user in with their credentials, then delete the
  // freshly authenticated user. The recent sign-in satisfies
  // Firebase's "recent login" requirement for deleteUser().
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await deleteUser(cred.user);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailEl.value.trim();
  const password = passEl.value;

  if (!email || !password) {
    setStatus("Please enter both your email address and your password.", "err");
    return;
  }
  if (!confirmEl.checked) {
    setStatus("Please confirm that you understand deletion is permanent.", "err");
    return;
  }
  if (!isConfigured) {
    setStatus(
      "The online deletion service isn't connected yet. Please delete your account in the app (Settings → Account → Delete Account) or email us at freeToPlay.business@gmail.com from your account email.",
      "err"
    );
    return;
  }

  btn.disabled = true;
  btn.textContent = "Deleting account…";
  setStatus("Verifying your credentials…", "info");

  try {
    await deleteAccount(email, password);
    form.reset();
    setStatus(
      "Your account has been permanently deleted. Any remaining personal data will be removed or anonymized as described in our Privacy Policy. We're sorry to see you go.",
      "ok"
    );
    btn.textContent = "Account deleted";
  } catch (err) {
    console.error(err);
    setStatus(friendlyError(err && err.code), "err");
    btn.disabled = false;
    btn.textContent = "Permanently delete my account";
  }
});
