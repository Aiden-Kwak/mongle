import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [friendUsername, setFriendUsername] = useState('');
    const [friendID, setFriendID] = useState('');

    const EXPIRY_TIME = 14 * 24 * 60 * 60 * 1000;

    useEffect(() => {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            try {
                const { user: storedUser, expiry } = JSON.parse(storedData);
                if (new Date().getTime() < expiry) {
                    setUser(storedUser);
                } else {
                    localStorage.removeItem('userData');
                }
            } catch (error) {
                alert('로그인 정보를 불러오는 중 오류가 발생했습니다.');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
        const expiryTime = new Date().getTime() + EXPIRY_TIME;
        localStorage.setItem('userData', JSON.stringify({
            user: userData,
            expiry: expiryTime
        }));
    };

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
    };


    return (
        <UserContext.Provider value={{ 
            user, 
            updateUser,
            clearUser,
            friendUsername, setFriendUsername,
            friendID, setFriendID
        }}>
            {children}
        </UserContext.Provider>
    );
};