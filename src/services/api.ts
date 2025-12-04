import axios from 'axios';
import { MOCK_APPOINTMENTS } from './mockData';

const api = axios.create({
    baseURL: '/api',
});

// Toggle this to switch between Real API and Mock Data
const USE_MOCK_DATA = true;

// Stateful mock data
const STORAGE_KEY = 'smart_entry_mock_data';

const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [...MOCK_APPOINTMENTS];
};

const saveToStorage = (data: any[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

let currentMockAppointments = loadFromStorage();

export const getTodayAppointments = async () => {
    if (USE_MOCK_DATA) {
        // Refresh from storage to ensure sync across tabs/components if needed
        currentMockAppointments = loadFromStorage();
        return Promise.resolve(currentMockAppointments);
    }
    const response = await api.get('/visits/today');
    return response.data;
};

export const checkIn = async (id: number, visitorSignature: string, guardSignature?: string) => {
    if (USE_MOCK_DATA) {
        console.log(`[Mock] Checked in visit ${id}`);
        const index = currentMockAppointments.findIndex((a: any) => a.id === id);
        if (index !== -1) {
            currentMockAppointments[index] = {
                ...currentMockAppointments[index],
                actualEnterTime: new Date().toISOString(),
                status: { name: '抵達' },
                signatures: {
                    ...currentMockAppointments[index].signatures,
                    visitorCheckIn: visitorSignature,
                    guardCheckIn: guardSignature
                }
            };
            saveToStorage(currentMockAppointments);
            return Promise.resolve(currentMockAppointments[index]);
        }
        return Promise.reject('Visit not found');
    }
    const response = await api.patch(`/visits/${id}/checkin`, { visitorSignature, guardSignature });
    return response.data;
};

export const checkOut = async (id: number, visitorSignature: string, guardSignature?: string) => {
    if (USE_MOCK_DATA) {
        console.log(`[Mock] Checked out visit ${id}`);
        const index = currentMockAppointments.findIndex((a: any) => a.id === id);
        if (index !== -1) {
            currentMockAppointments[index] = {
                ...currentMockAppointments[index],
                actualEndTime: new Date().toISOString(),
                status: { name: '完成' },
                signatures: {
                    ...currentMockAppointments[index].signatures,
                    visitorCheckOut: visitorSignature,
                    guardCheckOut: guardSignature
                }
            };
            saveToStorage(currentMockAppointments);
            return Promise.resolve(currentMockAppointments[index]);
        }
        return Promise.reject('Visit not found');
    }
    const response = await api.patch(`/visits/${id}/checkout`, { visitorSignature, guardSignature });
    return response.data;
};

export const walkIn = async (data: any) => {
    if (USE_MOCK_DATA) {
        console.log(`[Mock] Walk-in registration:`, data);
        const newVisit = {
            id: Math.floor(Math.random() * 10000) + 1000, // Ensure unique ID
            visitor: {
                vendorName: data.vendorName,
                contactName: data.visitorName,
            },
            user: {
                employeeName: 'Host #' + data.hostId,
            },
            scheduleStartTime: new Date().toISOString(),
            actualEnterTime: new Date().toISOString(),
            actualEndTime: null,
            status: {
                name: '抵達',
            },
            signatures: {}
        };
        currentMockAppointments.push(newVisit);
        saveToStorage(currentMockAppointments);
        return Promise.resolve(newVisit);
    }
    const response = await api.post('/visits/walkin', data);
    return response.data;
};

export default api;
