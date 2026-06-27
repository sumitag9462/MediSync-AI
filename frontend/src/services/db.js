import { openDB } from 'idb';

const DB_NAME = 'MediSyncDB';
const DB_VERSION = 1;

export const initDB = async () => {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('schedules')) {
                db.createObjectStore('schedules', { keyPath: '_id' });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
    return db;
};

export const saveSchedulesLocally = async (schedules) => {
    const db = await initDB();
    const tx = db.transaction('schedules', 'readwrite');
    await tx.objectStore('schedules').clear();
    for (const schedule of schedules) {
        await tx.objectStore('schedules').put(schedule);
    }
    await tx.done;
};

export const getLocalSchedules = async () => {
    const db = await initDB();
    return await db.getAll('schedules');
};

export const addToSyncQueue = async (operation, data) => {
    const db = await initDB();
    await db.add('syncQueue', { operation, data, timestamp: Date.now() });
};

export const getSyncQueue = async () => {
    const db = await initDB();
    return await db.getAll('syncQueue');
};

export const clearSyncQueueItem = async (id) => {
    const db = await initDB();
    await db.delete('syncQueue', id);
};
