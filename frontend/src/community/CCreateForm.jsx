import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { URLManagement, getCookie } from '../snippets';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../snippets';

function CCreateForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('0'); // 기본적으로 '0'(랜덤채팅)을 타입으로 설정
    const API_BASE_URL = URLManagement('http');
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const typeOptions = [
        { value: '0', label: '랜덤채팅' },
        { value: '1', label: '썸/연애' },
        { value: '2', label: '주식/투자' },
        { value: '3', label: '재수/반수/편입' },
        { value: '4', label: '취업/창업' },
        { value: '5', label: '여행/먹방' },
        { value: '6', label: '게임' },
        { value: '7', label: '패션/뷰티' },
        { value: '8', label: '유머' },
        { value: '9', label: '군대' },
        { value: '10', label: '팀원모집/프로젝트' },
    ];

    useEffect(() => {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉트
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault(); // 폼 제출시 페이지 리로드 방지
        const csrfToken=getCookie('csrftoken');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            withCredentials: true
        };

        axios.post(`${API_BASE_URL}/api/community/posts/create/`, { title, content, type }, config)
            .then(response => {
                setTitle('');
                setContent('');
                setType('0');
                navigate('/community');
            })
            .catch(error => {
                console.log('게시글 생성 오류:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="commu-create-container__form">
            <BackButton />
            <h2 className="commu-create-container__title">게시글 작성</h2>
            <div className='commu-create-container__form__total'>
                <div className="commu-create-container__form-group title">
                    <input
                        id="title"
                        type="text"
                        value={title}
                        placeholder='제목을 입력하세요'
                        onChange={(e) => setTitle(e.target.value)}
                        className="commu-create-container__form-input"
                    />
                </div>
                <div className="commu-create-container__form-group type">
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder='게시글 타입을 선택하세요'
                        className="commu-create-container__form-select"
                    >
                        {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="commu-create-container__form-group content">
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="commu-create-container__form-textarea"
                    />
                </div>

            </div>
            
            <button type="submit" className="commu-create-container__form-submit">게시글 작성</button>
        </form>
    );
}

export default CCreateForm;
