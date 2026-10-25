import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheService {
  private dbName = 'hacienda-cache';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('responses')) {
          db.createObjectStore('responses', { keyPath: 'url' });
        }
      };
      req.onsuccess = () => { this.db = req.result; resolve(); };
      req.onerror = () => reject(req.error);
    });
  }

  async get(url: string): Promise<any | null> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('responses', 'readonly');
      const store = tx.objectStore('responses');
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result?.data ?? null);
      req.onerror = () => resolve(null);
    });
  }

  async set(url: string, data: any): Promise<void> {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db!.transaction('responses', 'readwrite');
      const store = tx.objectStore('responses');
      store.put({ url, data, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }
}
