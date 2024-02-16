import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../snippets';
import './friend.css';
import deleteIcon from '../static/img/delete.png';
import chatIcon from '../static/img/chat.png';

function FriendListForm() {
    const [friends, setFriends] = useState([]);
    //const [ dmFriendNickname, setDMFriendNickname] = useState('');
    //const [ dmFriendSchool, setDMFriendSchool] = useState('');
    //const [ dmFriendBio, setDMFriendBio] = useState('');
    //const [ dmFriendProfilePic, setDMFriendProfilePic] = useState('');
    //const [ dmFriendRecentMessage, setDMFriendRecentMessage] = useState('');
    //const [ dmFriendUnreadCount, setDMFriendUnreadCount] = useState(0);
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

    const deleteFriend = async (friendUsername, friendNickname) => {
        // 사용자에게 삭제 확인 요청
        const isConfirmed = window.confirm(`정말로 "${friendNickname}"을(를) 친구 목록에서 삭제하시겠습니까? 삭제후엔 되돌릴 수 없습니다.`);
        if (isConfirmed) {
            try {
                const csrfToken = getCookie('csrftoken');
                await axios.delete(`http://localhost:8000/friend/remove/${friendUsername}/`, {
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    withCredentials: true
                });
                // 성공적으로 삭제되면 친구 목록에서 해당 친구 제거
                setFriends(friends.filter(friend => friend.username !== friendUsername));
            } catch (error) {
                console.error("친구 삭제에 실패했습니다.", error);
            }
        }
    };

    const deleteNotification = async (friendUsername) => {
        try {
            const csrfToken = getCookie('csrftoken');
            await axios.post(`http://localhost:8000/notification/delete/dm/${friendUsername}/`, {}, { // 두 번째 인자로 빈 객체를 전달
                headers: {
                    'X-CSRFToken': csrfToken
                },
                withCredentials: true
            });
        } catch (error) {
            console.error("알림 삭제에 실패했습니다.", error);
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
            <p className='back-btn'><BackButton /></p>
            {friends.length > 0 ? (
                <ul className="friendList">
                    {friends.map((friend, index) => (
                        <li key={index} className="friendItem">
                            <img src={`http://localhost:8000${friend.profile_pic}`} alt="Profile" className="friendProfilePic" />
                            <div className="friendInfo">
                                <span className="friendNickname">{friend.nickname}
                                    {friend.unread_count > 0 && <span className="unreadDot">{friend.unread_count}</span>}
                                </span>
                                <span className="friendSchool">{friend.school}</span>
                                <span className="friendBio">{friend.bio}</span>
                                {friend.recent_message && <div className='last-message'>{friend.recent_message}...</div>}
                            </div>
                            <div className='friendManage'>
                                <img src={chatIcon} className='icon chatIcon' onClick={()=>{initiateDM(friend.username, friend.id); deleteNotification(friend.username);}} alt="DM"></img>
                                <img src={deleteIcon} className='icon deleteIcon' onClick={() => deleteFriend(friend.username, friend.nickname)} alt="Delete"></img>
                            </div>
                            <div className='friendManage-fold'>
                                <img src={chatIcon} className='icon chatIcon' onClick={()=>{initiateDM(friend.username, friend.id); deleteNotification(friend.username);}} alt="DM"></img>
                                <img src={deleteIcon} className='icon deleteIcon' onClick={() => deleteFriend(friend.username, friend.nickname)} alt="Delete"></img>
                            </div>
                        </li> 
                    ))}
                </ul>
            ) : (
                <div className="no-friends-message">
                    <p>아직 추가된 친구가 없어요</p>
                </div>
            )}
        </div>
    );    
}

export default FriendListForm;
