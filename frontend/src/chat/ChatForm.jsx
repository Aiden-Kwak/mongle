/*import React, { useState, useEffect } from 'react';
import './chat.css'; // CSS 파일 임포트
import {useNavigate} from 'react-router-dom';

function ChatForm() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [ws, setWs] = useState(null);
    const navigate = useNavigate();
      

    useEffect(() => {
        // WebSocket 연결을 설정합니다.
        const newWs = new WebSocket('ws://localhost:8000/ws/chat/');
        newWs.onopen = () => {
            console.log('채팅 서버에 연결되었습니다.');
        };
        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message) {
                setChat((prevChat) => [...prevChat, data.message]);
            }
        };
        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
        };

        // 상태에 WebSocket을 설정합니다.
        setWs(newWs);

        // 컴포넌트가 언마운트 될 때 정리합니다.
        return () => {
            newWs.close();
        };
    }, []);

    const sendMessage = () => {
        // WebSocket을 통해 메시지를 보냅니다.
        if (ws && message) {
            ws.send(JSON.stringify({ message }));
            setMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>랜덤 채팅</h2>
                <p>연결 상대와 1:1 채팅이 시작되었습니다!</p>
                <p>2024-01-19 15:20:39</p>
                <p>Tip - "ㅎㅇ"를 입력하여 채팅을 나눠보세요.</p>
            </div>
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
        </div>
    );
}

export default ChatForm;
*/

import React, { useState, useEffect } from 'react';
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
        // WebSocket 연결을 설정합니다.
        const newWs = new WebSocket('ws://localhost:8000/ws/chat/');
        newWs.onopen = () => {
            console.log('채팅 서버에 연결되었습니다.');
            setIsConnected(true);
            // 랜덤 매칭 요청을 보낼 수 있습니다. 예: newWs.send(JSON.stringify({ action: 'match' }));
        };
        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'match_success') {
                setIsMatched(true);  // 매칭 성공 시
                setIsLoading(false);
            } else if (data.message) {
                setChat((prevChat) => [...prevChat, data.message]);
            }
        };
        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
            setIsConnected(false);
            setIsMatched(false);
        };
        setWs(newWs);
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
