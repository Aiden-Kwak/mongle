import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './account.css';

function ResetPWForm() {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    const resetPassword = async () => {
        if (password !== confirmPassword) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            // 비밀번호 재설정 처리 API로 요청을 보냅니다.
            const response = await axios.post(`http://localhost:8000/pwreset/${uidb64}/${token}/`, {
                new_password: password, // 필드 이름을 'password'에서 'new_password'로 변경
            });
            setMessage('비밀번호가 성공적으로 재설정되었습니다.');
        } catch (error) {
            setMessage('비밀번호 재설정 요청 처리 중 오류가 발생했습니다.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        resetPassword();
    };

    return (
        <div className='pwreset-container'>
            <form onSubmit={handleSubmit}>
                <div className='newpw'>
                    <label htmlFor="password">비밀번호 변경</label>
                    <p>새로운 비밀번호를 입력하세요</p>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                <div className='pwconfirm'>
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <p>새로운 비밀번호를 다시 입력하세요</p>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                </div>
                <button type="submit" className='pwreset-btn'>비밀번호 재설정</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPWForm;
