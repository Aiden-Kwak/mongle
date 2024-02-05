import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';

function FriendListForm() {
    const [friends, setFriends] = useState([]);
    const { user } = useContext(UserContext);

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
        console.log("친구 목록을 불러옵니다0.");
        const fetchFriends = async () => {
            console.log("친구 목록을 불러옵니다.!!!!!!");
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
        <div>
            <h2>My Friends</h2>
            <ul>
                {friends.map((friend, index) => (
                    <li key={index}>
                        {friend.nickname}
                        <img src={`http://localhost:8000${friend.profile_pic}`} alt="Profile" style={{ width: 50, height: 50 }} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FriendListForm;
