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


    const { user } = useContext(UserContext);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = messagesEndRef.current;
            
            // 스크롤이 바닥에 거의 도달했는지 확인 (여유분을 두어 완전히 바닥이 아니어도 됨)
            const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
    
            if (isNearBottom) {
                // 스크롤이 거의 바닥에 있을 때만 맨 아래로 스크롤
                messagesEndRef.current.scrollTop = scrollHeight;
            }
        }
    }, [chat]); // chat 상태가 변경될 때마다 실행
    

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
            ws.send(JSON.stringify({ type: 'chat_message', message: message }));
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
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
                {!isConnected && <button onClick={startChat}>채팅 시작하기</button>}
                
                {isLoading && <p>매칭중...</p>}
                {isMatched && <p>채팅이 연결되었습니다!</p>}
            </div>
            {isMatched && (
                <>
                    <div className="chat-messages" ref={messagesEndRef}>
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                className={`message-bubble ${msg.sender === user.username ? 'my-message' : 'their-message'}`}
                            >
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        {isConnected &&
                            (isConfirmingEndChat ? (
                                <button onClick={endChat}>정말?</button> // 사용자가 확인해야 하는 경우
                            ) : (
                                <button onClick={confirmEndChat}>대화 끝</button> // 초기 상태
                        ))}
                        <input 
                            type="text" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="메시지를 입력하세요"
                        />
                        <button onClick={sendMessage}>보내기</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatForm;
