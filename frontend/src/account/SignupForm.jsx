import React, { useState, useEffect } from 'react';
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
    const [tempMessage, setTempMessage] = useState('');
    const [schoolItem, setSchoolItem] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await axios.get('http://localhost:8000/get-schools/');
                setSchoolItem(response.data);
            } catch (error) {
                console.error("학교 목록을 불러오는 데 실패했습니다.", error);
            }
        };
        fetchSchools();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value); // 검색어 상태 업데이트
    };

    const filteredSchools = searchTerm.length > 0
        ? schoolItem.filter(school =>
            school.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];
    
    const handleSchoolSelect = (school) => {
        setFormData({ ...formData, school: school.id }); // 선택한 학교의 ID를 formData에 설정
        setSearchTerm(school.name); // 검색창에 학교 이름 표시
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const csrfToken=getCookie('csrftoken');
        try {
            setTempMessage("인증메일을 전송중입니다. 잠시만 기다려주세요");
            const response = await axios.post('http://localhost:8000/signup/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                }
            });
            setTempMessage("인증메일이 전송되었습니다. 도착하지 않은 경우 스팸메일함을 확인해주세요"); // 메시지 설정
            console.log(tempMessage);
            setTimeout(() => {
                setTempMessage(''); // 2초 후 메시지 제거
            }, 10000);
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

    const showTempMessage = (error) => {
        setTempMessage(error); // 메시지 설정
        setTimeout(() => {
            setTempMessage(''); // 2초 후 메시지 제거
        }, 1500);
    };

    useEffect(() => {
        if (error) {
            showTempMessage(error);
        }
    }, [error]);

    return (
        <div className="signup-container">
            <div className='logo-img'>
                <img src={logo} alt="Logo" />
                <div className='logo-span'>
                    <span style={{fontSize:".9rem", marginLeft:".2rem"}}>대학생 랜덤채팅</span>
                    <span style={{fontSize:"2rem", fontFamily:"TTHakgyoansimMonggeulmonggeulR", color:"black"}}>
                        몽글몽글
                    </span>
                </div>
            </div>
            {tempMessage && <div className='error'>{tempMessage}</div>}
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
                <input
                    className="signup-input"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="학교 검색"
                />
                {searchTerm.length > 0 && filteredSchools.length > 0 ? (
                    <ul className="search-results">
                        {filteredSchools.map(school => (
                            <li
                                key={school.id}
                                onClick={() => handleSchoolSelect(school)}
                                style={{cursor: 'pointer'}}
                                className='search-item'
                            >
                                {school.name}
                            </li>
                        ))}
                    </ul>
                ): searchTerm.length > 0 && filteredSchools.length === 0 ? (
                    <ul className="search-results">
                        <li>학교 검색 결과가 없습니다.</li>
                    </ul>
                ) : null}

                <button className="signup-button" type="submit">회원가입</button>
            </form>
        </div>
    );
  
}
export default SignupForm;