import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './community.css';
import pencil from '../static/img/pen.png';
import view from '../static/img/view.png';
import comment from '../static/img/comment.png';

function CMainForm() {
    const [posts, setPosts] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    const formatDate = (dateStr) => {
        const postDate = new Date(dateStr);
        const now = new Date();
        const diffSeconds = Math.round((now - postDate) / 1000);
        const diffMinutes = Math.round(diffSeconds / 60);
        const diffHours = Math.round(diffMinutes / 60);
        const diffDays = Math.round(diffHours / 24);
        const diffMonths = Math.round(diffDays / 30);
        const diffYears = Math.round(diffMonths / 12);

        if (diffSeconds < 60) {
            return `${diffSeconds}초 전`;
        } else if (diffMinutes < 60) {
            return `${diffMinutes}분 전`;
        } else if (diffHours < 24) {
            return `${diffHours}시간 전`;
        } else if (diffDays < 30) {
            return `${diffDays}일 전`;
        } else if (diffMonths < 12) {
            return `${diffMonths}달 전`;
        } else {
            return `${diffYears}년 전`;
        }
    };

    useEffect(() => {
        // 선택된 type에 따라 URL을 조정하여 API 요청
        const url = `/api/community/posts/${selectedType ? `?type=${selectedType}` : ''}`;
        axios.get(url)
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => console.log(error));
    }, [selectedType]); // selectedType이 변경될 때마다 useEffect 실행

    return (
        <div className='commu-container'>
            <Link to="/community/create" className="commu-container__create-link">
                <img src={pencil} alt="Pencil"></img>
                <span> 글쓰기</span>
            </Link>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="type-select">
                <option value="">통합 게시판</option>
                <option value="0">랜덤채팅</option>
                <option value="1">썸/연애</option>
                <option value="2">주식/투자</option>
                <option value="3">재수/반수/편입</option>
                <option value="4">취업/창업</option>
                <option value="5">여행/먹방</option>
                <option value="6">게임</option>
                <option value="7">패션/뷰티</option>
                <option value="8">유머</option>
                <option value="9">군대</option>
                <option value="10">팀원모집/프로젝트</option>
            </select>
            <div className='total'>
                {posts.length > 0 ? (
                    <ul className="commu-container__post-list">
                        {posts.map((post) => (
                            <li key={post.id} className="commu-container__post-list-item">
                                <Link to={`/community/posts/${post.id}`} className="commu-container__post-link">
                                    <p className='commu-container__post-list-item-type'>{post.type_display}</p>
                                    <p className='commu-container__post-list-item-title'>{post.title}</p>
                                    <p className='commu-container__post-list-item-content'>{post.content}</p>
                                </Link>
                                <div className='commu-container__post-list-item-i'>
                                    <div className='commu-container__post-list-item-i-view'>
                                        <img src={view} alt="view" />
                                        <p>{post.view_count}</p>
                                    </div>
                                    <div className='commu-container__post-list-item-i-comment'>
                                        <img src={comment} alt="view" />
                                        <p>{post.comments_count}</p>
                                    </div>
                                </div>
                                <p className='commu-container__post-list-item-date'>{formatDate(post.created_at)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>등록된 게시물이 없습니다</p>
                )}
            </div>
        </div>
    );
}

export default CMainForm;
