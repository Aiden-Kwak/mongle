// FindPWForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function FindPWForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/pwreset-request/', { email });
            setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.');
        } catch (error) {
            setMessage('서버로부터 응답을 받지 못했습니다.');
        }
    };

    return (
        <div className='findaccount-container'>
            <div>
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
                    onChange={handleEmailChange}
                    required
                />
                <button type="submit">비밀번호 재설정 링크 전송</button>
            </form>
            {message && <div>{message}</div>}
        </div>
    );
};

export default FindPWForm;
