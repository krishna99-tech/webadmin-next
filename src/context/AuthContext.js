'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const syncAuthState = useCallback(() => {
        if (typeof window === 'undefined') return;
        const user = authService.getCurrentUser();
        const accessToken = localStorage.getItem('access_token');
        setCurrentUser(user || null);
        setToken(accessToken || null);
    }, []);

    useEffect(() => {
        syncAuthState();
        setLoading(false);
    }, [syncAuthState]);

    const login = async (username, password) => {
        const data = await authService.login(username, password);
        setCurrentUser(data.user);
        setToken(data.access_token);
        return data;
    };

    const logout = async () => {
        await authService.logout();
        setCurrentUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, token, login, logout, loading, syncAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};
