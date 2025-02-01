import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URLManagement, getCookie } from "../snippets";
import "./group.css";

function CreateGroupChat() {
    const [roomTitle, setRoomTitle] = useState("");
    const [maxUsers, setMaxUsers] = useState(5);
    const navigate = useNavigate();
    const API_BASE_URL = URLManagement("http");  // 올바른 HTTP URL 사용

    const handleCreateRoom = async () => {
        if (!roomTitle.trim()) {
            alert("방 제목을 입력하세요.");
            return;
        }

        if (roomTitle.length > 25) {
            alert("방 제목은 25자 이내로 입력해주세요.");
            return;
        }

        if (maxUsers < 2 || maxUsers > 15) {
            alert("참여 인원은 최소 2명, 최대 15명까지 가능합니다.");
            return;
        }

        const csrfToken = getCookie("csrftoken"); // CSRF 토큰 가져오기

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/chat/group-chat/create/`,
                {
                    room_title: roomTitle,
                    max_users: maxUsers
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    withCredentials: true  // 쿠키 인증 포함
                }
            );

            navigate(`/group-chat/${response.data.room_name}`);  //생성된 방으로 이동
        } catch (error) {
            console.error("방 생성 오류:", error);
            if (error.response) {
                alert(error.response.data.error || "방 생성 실패");
            } else {
                alert("서버와의 통신 오류");
            }
        }
    };

    return (
        <div className="create-group-chat">
            <input
                type="text"
                placeholder="방 제목 입력 (최대 25자)"
                value={roomTitle}
                onChange={(e) => {
                    if (e.target.value.length <= 25) {
                        setRoomTitle(e.target.value);
                    }
                }}
            />
            <input
                type="number"
                min="2"
                max="15"
                value={maxUsers}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 2 && value <= 15) {
                        setMaxUsers(value);
                    }
                }}
            />
            <button onClick={handleCreateRoom}>방 만들기</button>
        </div>
    );
}

export default CreateGroupChat;
