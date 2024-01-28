import React, { useState, useContext, useRef, useEffect } from 'react';
import './chat.css';
import { UserContext } from '../UserContext';

function ChatForm() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMatched, setIsMatched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmingEndChat, setIsConfirmingEndChat] = useState(false);
    const [isTyping, setIsTyping] = useState(false); // 상대방의 타이핑 상태를 추적하는 상태 변수


    const { user } = useContext(UserContext);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = messagesEndRef.current;
            
            // 스크롤이 바닥에 거의 도달했는지 확인 (여유분을 두어 완전히 바닥이 아니어도 됨)
            const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
    
            if (isNearBottom) {
                // 스크롤이 거의 바닥에 있을 때만 맨 아래로 스크롤
                messagesEndRef.current.scrollTop = scrollHeight;
            }
        }
    }, [isTyping, chat]); // chat 상태가 변경될 때마다 실행
    

    const startChat = () => {
        setIsLoading(true);
        const newWs = new WebSocket('ws://localhost:8000/ws/chat/');
        newWs.onopen = () => {
            console.log('채팅 서버에 연결되었습니다.');
            setIsConnected(true);
        };
        
        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type === 'chat') {
                setChat((prevChat) => [...prevChat, { message: data.message, sender: data.sender }]);
            } else if (data.type === 'match_success') {
                setIsMatched(true);
                setIsLoading(false);
            } else if (data.type === 'chat_end') {
                // 채팅 종료 메시지를 수신한 경우, 채팅 종료 처리
                alert('채팅이 종료되었습니다.');
                endChat(); // 채팅 종료 로직 실행
            } else if (data.type === 'typing_start' && data.sender !== user.username) {
                setIsTyping(true); // 상대방이 타이핑을 시작했음을 상태로 설정
            } else if (data.type === 'typing_end' && data.sender !== user.username) {
                setIsTyping(false); // 상대방이 타이핑을 멈췄음을 상태로 설정
            }
        };
        
        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
            setIsConnected(false);
            setIsMatched(false);
        };
        setWs(newWs);
    };

    const confirmEndChat = () => {
        setIsConfirmingEndChat(true); // 사용자가 처음 "대화 끝"을 클릭했을 때
    };

    const endChat = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: 'chat_end' }));
            ws.close();
            setWs(null);
            setIsConnected(false);
            setIsMatched(false);
            setChat([]);
            setIsConfirmingEndChat(false);
        }
    };

    const sendMessage = () => {
        if (ws && message) {
            const messageData = { type: 'chat_message', message: message };
            ws.send(JSON.stringify(messageData));
            //setMessage('');
        }
    };

    const handleTyping = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: 'typing_start', sender: user.username }));
            clearTimeout(typingTimeoutRef.current); // 이전 타이머 취소
            typingTimeoutRef.current = setTimeout(() => { // 새 타이머 설정
                ws.send(JSON.stringify({ type: 'typing_end', sender: user.username }));
            }, 1000); // 2초 동안 추가 입력이 없으면 타이핑 종료로 간주
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

    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);
    

    return (
        <div className="chat-container">
            
            <div className="chat-header">
                <h2>랜덤 채팅</h2>
                {isLoading && <p>매칭중...</p>}
                {isMatched && <p>채팅이 연결되었습니다!</p>}
            </div>
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
                {isMatched ? (
                    <>
                        {isConnected &&
                            (isConfirmingEndChat ? (
                                <button onClick={endChat}>정말?</button> // 사용자가 확인해야 하는 경우
                            ) : (
                                <button onClick={confirmEndChat}>대화 끝</button> // 초기 상태
                        ))}
                        <input 
                            type="text" 
                            value={message} 
                            onChange={(e) => {setMessage(e.target.value); handleTyping();}}
                            onKeyDown={handleKeyDown}
                            placeholder="메시지를 입력하세요"
                        />
                        <button onClick={sendMessage}>보내기</button>
                    </>
                ) : (
                    <button onClick={startChat} className="start-chat-button">채팅 시작하기</button>
                )}
            </div>
        </div>
    );
}

export default ChatForm;
