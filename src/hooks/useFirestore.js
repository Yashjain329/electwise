import { useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDocument = async (path, id) => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, path, id);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setDocument = async (path, id, data) => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, path, id);
      await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (path, id, data) => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, path, id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (path, data) => {
    setLoading(true);
    setError(null);
    try {
      const ref = collection(db, path);
      const docRef = await addDoc(ref, { ...data, createdAt: serverTimestamp() });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getDocument, setDocument, updateDocument, addDocument, loading, error };
}
