import api from './api';

const login = async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (response.data.access_token && typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

const logout = async () => {
    try {
        await api.post('/logout');
    } catch (error) {
        console.error("Logout failed on backend", error);
    } finally {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    }
};

const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('user'));
    }
    return null;
};

const authService = {
    login,
    logout,
    getCurrentUser,
};

export default authService;
