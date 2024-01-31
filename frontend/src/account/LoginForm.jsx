import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { UserContext } from '../UserContext';
import { Link } from 'react-router-dom';

import logo from '../static/img/logo.png';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    useEffect(() => {
        // 로컬 스토리지에서 사용자 정보를 로드
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [setUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const csrfToken=getCookie('csrftoken');
        try {
            const response = await axios.post('http://localhost:8000/login/', {
                username,
                password
            }, {
                headers: {
                    'X-CSRFToken': csrfToken
                },
                withCredentials: true
            });
            localStorage.setItem('user', JSON.stringify({ username: username }));
            setUser({ username: username });
            navigate('/chat');
        } catch (error) {
            if (error.response && error.response.data) {
                // 서버로부터의 응답에 따라 오류 메시지 설정
                console.log(error.response.data);
                setError(error.response.data.error || '로그인 실패. 다시 시도해주세요.');
            } else {
                setError('서버 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    return (
        <div className='login-container'>
            <div className='logo-img'>
                <img src={logo} alt="Logo" />
                <div className='logo-span'>
                    <span style={{fontSize:".9rem", marginLeft:".2rem"}}>대학생 랜덤채팅</span>
                    <span style={{fontSize:"2rem", fontFamily:"ugro-bold", color:"black"}}>
                        몽글몽글
                    </span>
                </div>
            </div>
            {error && <div className='error' style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="아이디"
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                />
                <button type="submit">로그인</button>
            </form>
            <Link to="/signup" className='signup-link'>
                <p>몽글몽글에 처음이신가요? <span style={{color:"#F07489", marginLeft:"1rem"}}>회원가입</span></p>
            </Link>
        </div>
        
        
        
    );
}

export default LoginForm;
