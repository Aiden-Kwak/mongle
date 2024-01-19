import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {MainForm} from './main';
import { SignupForm, LoginForm } from './account';
import { ChatForm } from './chat';

function App() {
  return (
      <Router>
          <div className="App">
              <Routes>
                  <Route path="/" element={<MainForm />} />
                  <Route path="/signup" element={<SignupForm />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/chat" element={<ChatForm />} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;
