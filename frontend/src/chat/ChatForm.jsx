import React, { useState } from 'react';
import './chat.css';

function ChatForm() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMatched, setIsMatched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                setChat((prevChat) => [...prevChat, data.message]);
            } else if (data.type === 'match_success') {
                setIsMatched(true);
                setIsLoading(false);
            }
        };
        
        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
            setIsConnected(false);
            setIsMatched(false);
        };
        setWs(newWs);
    };

    const endChat = () => {
        if (ws) {
            ws.close();
            setWs(null);
            setIsConnected(false);
            setIsMatched(false);
        }
    };

    const sendMessage = () => {
        if (ws && message) {
            ws.send(JSON.stringify({ message }));
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>랜덤 채팅</h2>
                {!isConnected && <button onClick={startChat}>채팅 시작하기</button>}
                {isConnected && <button onClick={endChat}>채팅 종료하기</button>}
                {isLoading && <p>매칭중...</p>}
                {isMatched && <p>채팅이 연결되었습니다!</p>}
            </div>
            {isMatched && (
                <>
                    <div className="chat-messages">
                        {chat.map((msg, index) => (
                            <p key={index}>{msg}</p>
                        ))}
                    </div>
                    <div className="chat-input">
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
