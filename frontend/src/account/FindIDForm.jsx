// FindIDForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function FindIDForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/recover-username/', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('서버로부터 응답을 받지 못했습니다.');
        }
    };

    return (
        <div className='findaccount-container'>
            <div className='link-box'>
                <Link to="/find-id" className='forgot-link'>
                    <p>아이디 찾기</p>
                </Link>
                <Link to="/find-pw" className='forgot-link active-link'>
                    <p>비밀번호 찾기</p>
                </Link>
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={handleChange}
                    required
                />
                <button type="submit">아이디 찾기</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default FindIDForm;
