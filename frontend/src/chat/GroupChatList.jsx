import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { URLManagement } from '../snippets';
import { SEOMetaTag } from '../snippets';
import CreateGroupChat from './CreateGroupChat';

function GroupChatList() {
    const [rooms, setRooms] = useState([]);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = URLManagement('http'); // 백엔드 API URL
    const location = useLocation();
    const [isReloaded, setIsReloaded] = useState(false);

    useEffect(() => {
        const handlePopState = () => {
            if (sessionStorage.getItem("needReload") === "true") {
                sessionStorage.setItem("needReload", "false"); // 플래그 초기화
                window.location.reload(); // 페이지 새로고침
            }
        };
        handlePopState(); // 페이지 로드 시 한 번 실행
    }, []);

    useEffect(() => {
        sessionStorage.setItem("needReload", "false"); // 페이지 1을 처음 방문하면 초기화
    }, []);



    useEffect(() => {
        fetch(`${API_BASE_URL}/api/chat/group-rooms/`)
            .then(response => response.json())
            .then(data => setRooms(data.rooms))
            .catch(error => console.error('Error fetching rooms:', error));
    }, []);

    const enterRoom = (roomName, roomTitle) => {
        sessionStorage.setItem("needReload", "true");
        navigate(`/group-chat/${roomName}`, {state: {roomTitle}});
    };

    return (
        <div className="group-chat-list">
            <SEOMetaTag 
                title='몽글몽글 | 대학생 그룹채팅'
                description='대학생들과 함께하는 그룹채팅 서비스. 몽글몽글에서 다양한 주제로 여러 학교 친구들과 함께 대화하세요.'
                keywords='대학생 그룹채팅, 단체채팅, 몽글몽글, 학교인증 채팅, 대학생 채팅방'
                image='https://mongles.com/og_image.png'
                url='https://mongles.com/groupchat'
            />
            {isCreatingRoom ? (
                <CreateGroupChat onCancel={() => setIsCreatingRoom(false)} />
            ) : (
                <div
                    onClick={() => setIsCreatingRoom(true)} 
                    className="create-room-button"
                >
                    <span className="plus">+</span>
                    <span className="text">방 만들기</span>
                </div>
            )}
                {rooms.length === 0 ? (
                    <p className='room-list-item'>현재 생성된 채팅방이 없습니다.</p>
                ) : (
                    rooms.map((room, index) => (
                        <div key={index} onClick={() => enterRoom(room.room_name, room.room_title)} className='room-list-item'>
                            <p className='title'>{room.room_title} ({room.current_users === 0 ? 1 : room.current_users}/{room.max_users})</p>
                            <p className="room-creator">
                                <span>{room.creator_nickname}</span>
                                <span className='school'>{room.creator_school}</span>
                            </p>
                        </div>
                    ))
                )}
        </div>
    );
}

export default GroupChatList;
