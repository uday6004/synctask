import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Assume Firebase is initialized
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const SyncTaskApp = () => {
  const [task, setTask] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const taskDoc = doc(db, "users", "shared-session");

  // 1. Real-time Parity: Listen for remote changes
  useEffect(() => {
    const unsub = onSnapshot(taskDoc, (doc) => {
      if (doc.exists()) setTask(doc.data().content);
    });
    return () => unsub();
  }, []);

  // 2. Data Reconciliation: Optimistic local update + Remote sync
  const handleChange = async (e) => {
    const newVal = e.target.value;
    setTask(newVal); // Instant UI update (Frictionless)
    setIsSyncing(true);

    try {
      await setDoc(taskDoc, { content: newVal }, { merge: true });
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>Sync-Task</h1>
        <span className={isSyncing ? "status syncing" : "status"}>
          {isSyncing ? "● Syncing..." : "● Cloud Ready"}
        </span>
      </nav>
      
      <main className="content">
        <textarea
          value={task}
          onChange={handleChange}
          placeholder="Start typing on one device, watch it appear on the other..."
        />
      </main>
    </div>
  );
};
