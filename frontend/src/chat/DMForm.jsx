import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './chat.css';
import { UserContext } from '../UserContext';

function DMForm() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmingEndChat, setIsConfirmingEndChat] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // 상대방의 타이핑 상태를 추적하는 상태 변수

    const { user } = useContext(UserContext);
    const { friendUsername} = useContext(UserContext);
    const { friendID } = useContext(UserContext);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉트
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        connectWebsocket();
        axios.get(`http://localhost:8000/chat/dm/${friendUsername}`, {
            withCredentials: true
        })
        .then(response => {
            console.log(response.data);
            setChat(response.data);
        })
        .catch(error => {
            console.error('채팅 내용을 불러오는데 실패했습니다.', error);
        })
    },[user]);

    //useEffect(() => {
    //    if (messagesEndRef.current) {
    //        const { scrollHeight, clientHeight, scrollTop } = messagesEndRef.current;
    //        const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
    //        if (isNearBottom) {
    //            messagesEndRef.current.scrollTop = scrollHeight;
    //        }
    //    }
    //}, [isTyping, chat]);

    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        };
    
        // 채팅 데이터 로드 이후 스크롤을 맨 아래로 내림
        scrollToBottom();
    
        // isTyping 상태 변화에 따라 스크롤 조정 로직을 유지
        const handleScroll = () => {
            if (messagesEndRef.current) {
                const { scrollHeight, clientHeight, scrollTop } = messagesEndRef.current;
                const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
                if (isNearBottom) {
                    scrollToBottom();
                }
            }
        };
    
        // 타이핑 상태가 변경될 때마다 스크롤 조정
        handleScroll();
    
    }, [chat, isTyping]); // chat 또는 isTyping 상태가 변경될 때마다 이 useEffect가 실행됩니다.
    

    
    useEffect(() => {
        if (!user) return; 
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('이미 WebSocket 연결이 열려 있습니다.');
            return;
        }
    
        const newWs = new WebSocket('ws://localhost:8000/ws/chat/dm/');
        
        newWs.onopen = () => {
            console.log('채팅 서버에 연결되었습니다.');
            setIsConnected(true);
        };
    
        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
            setIsConnected(false);
        };
    
        setWs(newWs);
        return () => newWs.close(); // 컴포넌트 언마운트 시 연결 종료
    }, [user]); // `user` 상태에 따라 연결을 다시 시도합니다.

    useEffect(() => {
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [ws]);

    
    

    const connectWebsocket = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }

        const newWs = new WebSocket('ws://localhost:8000/ws/chat/dm/');
        newWs.onopen = () => {
            console.log('채팅 서버에 연결되었습니다.');
            setIsConnected(true);
            newWs.send(JSON.stringify({ type: 'start_dm', friend_username: friendUsername }));
        };

        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'dm_message':
                    console.log('1. data check:', data);
                    setChat((prevChat) => [...prevChat, { message: data.message, sender: data.sender }]);
                    break;
                case 'typing_start':
                    if (data.sender !== user.username) setIsTyping(true);
                    break;
                case 'typing_end':
                    if (data.sender !== user.username) setIsTyping(false);
                    break;
                default:
                    console.log("Unknown message type:", data.type);
            }
        };

        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
            setIsConnected(false);
        };

        setWs(newWs);
    };

    const sendMessage = () => {
        if (ws && message) {
            const messageData = { type: 'dm_message', message: message };
            ws.send(JSON.stringify(messageData));
            setMessage('');
        }
    };

    const handleTyping = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: 'typing_start', sender: user.username }));
            clearTimeout(typingTimeoutRef.current); // 이전 타이머 취소
            typingTimeoutRef.current = setTimeout(() => { // 새 타이머 설정
                ws.send(JSON.stringify({ type: 'typing_end', sender: user.username }));
            }, 500); // .5초 동안 추가 입력이 없으면 타이핑 종료로 간주
        }
    };
    

    const handleKeyDown = (e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter' && message.trim() !== '') {
            e.preventDefault();
            console.log('Enter key pressed, sending message...');
            sendMessage();
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages" ref={messagesEndRef}>
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-bubble ${msg.sender === user.username ? 'my-message' : 'their-message'}`}
                    >
                        {msg.message}
                    </div>
                ))}
                {isTyping && (
                    <div className="message-bubble their-message">...</div> // "..." 말풍선 표시
                )}
            </div>
            <div className="chat-input">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요"
                />
                <button onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
}

export default DMForm;
