import React, { useState } from 'react';
import axios from 'axios';
import './account.css';
import logo from '../static/img/logo.png';

function SignupForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        school: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const schools = [
        { id: '0', name: '성균관대학교' },
        { id: '1', name: '광주과학기술원' },
        { id: '2', name: '서강대학교' },
        { id: '3', name: '울산과학기술원' },
        { id: '4', name: '중앙대학교' },
        { id: '5', name: '한국과학기술원' },
        { id: '6', name: '한양대학교' },
        { id: '7', name: '서울대학교' },
        { id: '8', name: '연세대학교' },
        { id: '9', name: '고려대학교' },
        { id: '10', name: '경희대학교' },
        { id: '11', name: '한국외국어대학교' },
        { id: '12', name: '서울시립대학교' },
        { id: '13', name: '가톨릭대학교' },
        { id: '14', name: '건국대학교' },
        { id: '15', name: '광운대학교' },
        { id: '16', name: '국민대학교' },
        { id: '17', name: '동국대학교' },
        { id: '18', name: '서울과학기술대학교' },
        { id: '19', name: '세종대학교' },
        { id: '20', name: '숭실대학교' },
        { id: '21', name: '홍익대학교' },
        { id: '22', name: '가천대학교' },
        { id: '23', name: '인하대학교' },
        { id: '24', name: '아주대학교' },
        { id: '25', name: '한국항공대학교' },
        { id: '26', name: '이화여자대학교' },
        { id: '27', name: '성신여자대학교' },
        { id: '28', name: '서울여자대학교' },
        { id: '29', name: '숙명여자대학교' },
        { id: '30', name: '동덕여자대학교' },
        { id: '31', name: '덕성여자대학교' },
        { id: '32', name: '한국예술종합학교' },
        { id: '33', name: '대구경북과학기술원' },
        { id: '34', name: '포항공과대학교' },
        { id: '35', name: '전남대학교' },
        { id: '36', name: '한동대학교' },
        { id: '37', name: '충남대학교' },
        { id: '38', name: '부산대학교' },
        { id: '39', name: '한국교통대학교'},

    ];


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const csrfToken=getCookie('csrftoken');
        try {
            const response = await axios.post('http://localhost:8000/signup/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });
            console.log(response.data);
            // 회원가입 성공 처리 로직
            console.log('회원가입 성공');
        } catch (error) {
            if (error.response && error.response.data) {
                // 서버로부터의 응답에 따라 오류 메시지 설정
                console.log(error.response.data);
                let error_msg = error.response.data;
                if (error_msg.username) {
                    setError(error_msg.username);
                } else if (error_msg.email) {
                    setError(error_msg.email);
                } else if (error_msg.password) {
                    setError(error_msg.password);
                } else if (error_msg.school) {
                    setError(error_msg.school);
                } else {
                    setError('회원가입 실패. 다시 시도해주세요.');
                }
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
        <div className="signup-container">
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
                    className="signup-input"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="아이디"
                />
                <input
                    className="signup-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="학교 이메일"
                />
                <input
                    className="signup-input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호"
                />
                <select
                    className="signup-select"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                >
                    <option value="">학교 선택</option>
                    {
                        [...schools]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))
                    }
                </select>

                <button className="signup-button" type="submit">회원가입</button>
            </form>
            <p style={{fontSize:".8rem"}}>본인의 학교가 선택창에 없는 경우, 연락을 주시면 빠른시일내에 업데이트하도록 하겠습니다!</p>
        </div>
    );
  
}
export default SignupForm;