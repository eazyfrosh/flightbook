"use client";

import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

function localKey(name: string) {
  return `skybook_${name}`;
}

function readLocal<T>(name: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localKey(name));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(name: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localKey(name), JSON.stringify(items));
}

export async function getAll<T extends { id: string }>(collectionName: string): Promise<T[]> {
  if (isFirebaseConfigured && db) {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  }
  return readLocal<T>(collectionName);
}

export async function getOne<T extends { id: string }>(
  collectionName: string,
  id: string
): Promise<T | null> {
  if (isFirebaseConfigured && db) {
    const snap = await getDoc(doc(db, collectionName, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
  }
  const items = readLocal<T>(collectionName);
  return items.find((i) => i.id === id) ?? null;
}

export async function upsert<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, collectionName, item.id), item as Record<string, unknown>, {
      merge: true,
    });
    return;
  }
  const items = readLocal<T>(collectionName);
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  writeLocal(collectionName, items);
}

export async function remove(collectionName: string, id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, collectionName, id));
    return;
  }
  const items = readLocal<{ id: string }>(collectionName).filter((i) => i.id !== id);
  writeLocal(collectionName, items);
}

export async function queryByField<T extends { id: string }>(
  collectionName: string,
  field: string,
  value: string
): Promise<T[]> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, collectionName), where(field, "==", value));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  }
  const items = readLocal<Record<string, unknown> & { id: string }>(collectionName);
  return items.filter((i) => i[field] === value) as unknown as T[];
}
