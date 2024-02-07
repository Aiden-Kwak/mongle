import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {MainForm, NavForm} from './main';
import { SignupForm, LoginForm, LogoutForm } from './account';
import { ProfileForm } from './profile';
import { ChatForm, DMForm } from './chat';
import { FriendListForm } from './friend';

import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
        <Router>
            <div className="App">
                <NavForm />
                <Routes>
                    <Route path="/" element={<MainForm />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/logout" element={<LogoutForm />} />
                    <Route path="/chat" element={<ChatForm />} />
                    <Route path="/profile" element={<ProfileForm />} />
                    <Route path="/friend" element={<FriendListForm />} />
                    <Route path="/dm/:id" element={<DMForm />} />
                </Routes>
            </div>
        </Router>
    </UserProvider>
  );
}

export default App;
