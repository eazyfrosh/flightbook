"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { getOne, upsert } from "@/lib/services/store";
import type { PassengerInfo, UserProfile } from "@/types";

interface DemoUserRecord {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  emailVerified: boolean;
}

const DEMO_USERS_KEY = "skybook_demo_users";
const DEMO_SESSION_KEY = "skybook_demo_session";
const DEMO_ADMIN_EMAIL = "admin@skybook.demo";
const DEMO_ADMIN_PASSWORD = "admin123";
const USERS_COLLECTION = "users";

function readDemoUsers(): DemoUserRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DEMO_USERS_KEY);
  return raw ? (JSON.parse(raw) as DemoUserRecord[]) : [];
}

function writeDemoUsers(users: DemoUserRecord[]) {
  window.localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

async function ensureDemoAdminSeed() {
  const users = readDemoUsers();
  if (users.some((u) => u.email === DEMO_ADMIN_EMAIL)) return;
  const uid = "demo-admin-uid";
  users.push({
    uid,
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    displayName: "SkyBook Admin",
    emailVerified: true,
  });
  writeDemoUsers(users);
  await upsert<UserProfile>(USERS_COLLECTION, {
    id: uid,
    uid,
    email: DEMO_ADMIN_EMAIL,
    displayName: "SkyBook Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
    savedPassengers: [],
    favoriteDestinations: [],
  });
}

interface AuthContextValue {
  user: { uid: string; email: string; displayName: string; emailVerified: boolean } | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  markEmailVerifiedDemo: () => void;
  updateUserProfile: (partial: Partial<UserProfile>) => Promise<void>;
  addSavedPassenger: (passenger: PassengerInfo) => Promise<void>;
  removeSavedPassenger: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeProfile(uid: string, email: string, displayName: string): UserProfile {
  return {
    id: uid,
    uid,
    email,
    displayName: displayName || email.split("@")[0],
    role: "user",
    createdAt: new Date().toISOString(),
    savedPassengers: [],
    favoriteDestinations: [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isFirebaseConfigured;

  const loadOrCreateProfile = useCallback(async (uid: string, email: string, displayName: string) => {
    const existing = await getOne<UserProfile>(USERS_COLLECTION, uid);
    if (existing) {
      setProfile(existing);
      return existing;
    }
    const created = makeProfile(uid, email, displayName);
    await upsert(USERS_COLLECTION, created);
    setProfile(created);
    return created;
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      ensureDemoAdminSeed().then(() => {
        const sessionUid = window.localStorage.getItem(DEMO_SESSION_KEY);
        if (sessionUid) {
          const found = readDemoUsers().find((u) => u.uid === sessionUid);
          if (found) {
            setUser({
              uid: found.uid,
              email: found.email,
              displayName: found.displayName,
              emailVerified: found.emailVerified,
            });
            getOne<UserProfile>(USERS_COLLECTION, found.uid).then((p) => setProfile(p));
          }
        }
        setLoading(false);
      });
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          emailVerified: firebaseUser.emailVerified,
        });
        await loadOrCreateProfile(firebaseUser.uid, firebaseUser.email ?? "", firebaseUser.displayName ?? "");
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isDemoMode, loadOrCreateProfile]);

  const signUp = useCallback(
    async (rawEmail: string, password: string, displayName: string) => {
      const email = rawEmail.trim().toLowerCase();
      if (isDemoMode) {
        const users = readDemoUsers();
        if (users.some((u) => u.email === email)) {
          throw new Error("An account with this email already exists.");
        }
        const uid = `demo-${Date.now()}`;
        users.push({ uid, email, password, displayName, emailVerified: false });
        writeDemoUsers(users);
        const newProfile = makeProfile(uid, email, displayName);
        await upsert(USERS_COLLECTION, newProfile);
        window.localStorage.setItem(DEMO_SESSION_KEY, uid);
        setUser({ uid, email, displayName, emailVerified: false });
        setProfile(newProfile);
        return;
      }
      if (!auth) throw new Error("Firebase is not configured.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateFirebaseProfile(cred.user, { displayName });
      await sendEmailVerification(cred.user);
      await loadOrCreateProfile(cred.user.uid, email, displayName);
    },
    [isDemoMode, loadOrCreateProfile]
  );

  const logIn = useCallback(
    async (rawEmail: string, password: string) => {
      const email = rawEmail.trim().toLowerCase();
      if (isDemoMode) {
        const found = readDemoUsers().find((u) => u.email === email && u.password === password);
        if (!found) throw new Error("Invalid email or password.");
        window.localStorage.setItem(DEMO_SESSION_KEY, found.uid);
        setUser({
          uid: found.uid,
          email: found.email,
          displayName: found.displayName,
          emailVerified: found.emailVerified,
        });
        setProfile(await getOne<UserProfile>(USERS_COLLECTION, found.uid));
        return;
      }
      if (!auth) throw new Error("Firebase is not configured.");
      await signInWithEmailAndPassword(auth, email, password);
    },
    [isDemoMode]
  );

  const logOut = useCallback(async () => {
    if (isDemoMode) {
      window.localStorage.removeItem(DEMO_SESSION_KEY);
      setUser(null);
      setProfile(null);
      return;
    }
    if (auth) await signOut(auth);
  }, [isDemoMode]);

  const resetPassword = useCallback(
    async (rawEmail: string) => {
      const email = rawEmail.trim().toLowerCase();
      if (isDemoMode) {
        if (!readDemoUsers().some((u) => u.email === email)) {
          throw new Error("No account found with this email.");
        }
        return;
      }
      if (!auth) throw new Error("Firebase is not configured.");
      await sendPasswordResetEmail(auth, email);
    },
    [isDemoMode]
  );

  const sendVerification = useCallback(async () => {
    if (isDemoMode) return;
    if (auth?.currentUser) await sendEmailVerification(auth.currentUser);
  }, [isDemoMode]);

  const markEmailVerifiedDemo = useCallback(() => {
    if (!isDemoMode || !user) return;
    const users = readDemoUsers();
    const idx = users.findIndex((u) => u.uid === user.uid);
    if (idx >= 0) {
      users[idx].emailVerified = true;
      writeDemoUsers(users);
      setUser({ ...user, emailVerified: true });
    }
  }, [isDemoMode, user]);

  const persistProfile = useCallback(async (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    await upsert(USERS_COLLECTION, nextProfile);
  }, []);

  const updateUserProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      if (!profile) return;
      await persistProfile({ ...profile, ...partial });
    },
    [profile, persistProfile]
  );

  const addSavedPassenger = useCallback(
    async (passenger: PassengerInfo) => {
      if (!profile) return;
      await persistProfile({ ...profile, savedPassengers: [...profile.savedPassengers, passenger] });
    },
    [profile, persistProfile]
  );

  const removeSavedPassenger = useCallback(
    async (id: string) => {
      if (!profile) return;
      await persistProfile({
        ...profile,
        savedPassengers: profile.savedPassengers.filter((p) => p.id !== id),
      });
    },
    [profile, persistProfile]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isDemoMode,
      signUp,
      logIn,
      logOut,
      resetPassword,
      sendVerification,
      markEmailVerifiedDemo,
      updateUserProfile,
      addSavedPassenger,
      removeSavedPassenger,
    }),
    [
      user,
      profile,
      loading,
      isDemoMode,
      signUp,
      logIn,
      logOut,
      resetPassword,
      sendVerification,
      markEmailVerifiedDemo,
      updateUserProfile,
      addSavedPassenger,
      removeSavedPassenger,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD };
