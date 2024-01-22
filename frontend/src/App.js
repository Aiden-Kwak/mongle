import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {MainForm, NavForm} from './main';
import { SignupForm, LoginForm } from './account';
import { ChatForm } from './chat';

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
                    <Route path="/chat" element={<ChatForm />} />
                </Routes>
            </div>
        </Router>
    </UserProvider>
  );
}

export default App;
