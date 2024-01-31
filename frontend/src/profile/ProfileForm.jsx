import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import './profile.css';

function ProfileForm() {
    const [profile, setProfile] = useState({
        nickname: '',
        bio: '',
        profilePic: ''
    });
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user.username) {
            fetchProfile();
        }
    }, [user.username]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/profile/${user.username}/`, {
                withCredentials: true
            });
            setProfile(response.data);
        } catch (error) {
            console.error('프로필 정보를 불러오는데 실패했습니다', error);
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


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            const csrfToken=getCookie('csrftoken');
            formData.append('nickname', profile.nickname);
            formData.append('bio', profile.bio);
            formData.append('username', user.username);
            // 파일이 있는 경우에만 추가
            if (profile.profilePic) {
                formData.append('profile_pic', profile.profilePic);
            }
            await axios.post(`http://localhost:8000/profile/${user.username}/update/`, formData, {
                headers: {
                    'X-CSRFToken': csrfToken
                },
                withCredentials: true
            });
            alert('프로필이 업데이트되었습니다.');
        } catch (error) {
            console.error('프로필 업데이트에 실패했습니다.', error);
        }
    };

    return (
        <div className='profile-page-container'>
            <form onSubmit={handleSubmit}>
                <div className='profile-header'>
                    <img src={profile.profile_pic} alt="프로필 사진" />
                    <input
                        type="text"
                        name="nickname"
                        value={profile.nickname}
                        onChange={handleInputChange}
                        placeholder="닉네임"
                    />
                    <input
                        type="file"
                        name="profilePic"
                        onChange={(e) => setProfile({ ...profile, profilePic: e.target.files[0] })}
                    />
                </div>
                <div className='profile-bio'>
                    <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        placeholder="자기소개"
                    />
                </div>
                <button type="submit">프로필 업데이트</button>
            </form>
        </div>
    );
}

export default ProfileForm;
