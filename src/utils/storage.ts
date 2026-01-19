import type { AIResponse } from './ai';

export interface PrayerRecord {
    id: string;
    prayer: string;
    response: AIResponse;
    date: string;
}

const STORAGE_KEY = 'amenlog_history';

export const saveRecord = (record: PrayerRecord) => {
    const history = getHistory();
    const newHistory = [record, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    return record;
};

export const getHistory = (): PrayerRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse history", e);
        return [];
    }
};

export const deleteRecord = (id: string) => {
    const history = getHistory();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
};
