import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [friendUsername, setFriendUsername] = useState('');
    const [friendID, setFriendID] = useState('');

    return (
        <UserContext.Provider value={{ 
            user, setUser,
            friendUsername, setFriendUsername,
            friendID, setFriendID
        }}>
            {children}
        </UserContext.Provider>
    );
};
