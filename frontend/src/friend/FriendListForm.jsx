import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import './friend.css';
function FriendListForm() {
    const [friends, setFriends] = useState([]);
    const { user } = useContext(UserContext);
    const { setFriendUsername} = useContext(UserContext);
    const { setFriendID } = useContext(UserContext);

    const navigate = useNavigate();

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

    const initiateDM = (friendUsername, friendID) => {
        setFriendUsername(friendUsername);
        setFriendID(friendID);
        navigate(`/dm/${friendID}`);
    };

    useEffect(() => {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉트
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get('http://localhost:8000/friend/list', {
                    withCredentials: true
                });
                console.log(response.data);
                setFriends(response.data);
            } catch (error) {
                console.error("친구 목록을 불러오는 데 실패했습니다.", error);
            }
        };
        if (user) {
            fetchFriends();
        }
    }, [user]);

    return (
        <div className="friendListForm-container">
            <ul className="friendList">
                {friends.map((friend, index) => (
                    <li key={index} className="friendItem" onClick={()=>initiateDM(friend.username, friend.id)}>
                        <img src={`http://localhost:8000${friend.profile_pic}`} alt="Profile" className="friendProfilePic" />
                        <div className="friendInfo">
                            <span className="friendNickname">{friend.nickname}</span>
                            <span className="friendBio">{friend.bio}</span>
                        </div>   
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FriendListForm;
