import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const [friendRequestReceived, setFriendRequestReceived] = useState(false); // 친구 요청 받았는지 여부
    const [friendRequestSent, setFriendRequestSent] = useState(false); // 친구 요청 보냈는지 여부
    const [friendRequestFrom, setFriendRequestFrom] = useState(''); // 친구 요청을 보낸 사용자
    const [peerUsername, setPeerUsername] = useState('');

    const { user } = useContext(UserContext);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 로그인되지 않은 경우 로그인 페이지로 리디렉트
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

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
    
    
    useEffect(() => {
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                endChat();
                ws.close();
                console.log('채팅 서버 종료.');
            }
        };
    }, [ws, location]);
    

    const connectWebsocket = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }

        const newWs = new WebSocket('ws://localhost:8000/ws/chat/random/');
        newWs.onopen = () => {
            console.log('채팅 서버에 연결되었습니다.');
            setIsConnected(true);
            newWs.send(JSON.stringify({ type: 'start_chat' }));
        };

        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'chat':
                    setChat((prevChat) => [...prevChat, { message: data.message, sender: data.sender }]);
                    break;
                case 'match_success':
                    setIsMatched(true);
                    setIsLoading(false);
                    break;
                case 'chat_end':
                    endChat();
                    break;
                case 'typing_start':
                    if (data.sender !== user.username) setIsTyping(true);
                    break;
                case 'typing_end':
                    if (data.sender !== user.username) setIsTyping(false);
                    break;
                case 'friend_request':
                    setFriendRequestReceived(true);
                    setFriendRequestFrom(data.from_username);
                    break;
                default:
                    console.log("Unknown message type:", data.type);
            }
        };

        newWs.onclose = () => {
            console.log('채팅 서버 연결이 끊어졌습니다.');
            setIsConnected(false);
            setIsMatched(false);
            endChat();
        };

        setWs(newWs);
    };


    const startChat = () => {
        setChat([]);
        setMessage('');
        setIsLoading(true);
        connectWebsocket();
    };

    const confirmEndChat = () => {
        setIsConfirmingEndChat(true); // 사용자가 처음 "대화 끝"을 클릭했을 때
    };

    const endChat = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'chat_end' }));
            ws.close();
            alert('채팅이 종료되었습니다.'); // WebSocket이 열려있을 때만 alert 호출
        }
        // 연결 상태 초기화
        setWs(null);
        setIsConnected(false);
        setIsMatched(false);
        setChat([]);
        setIsConfirmingEndChat(false);
        setFriendRequestReceived(false);
        setFriendRequestSent(false);
        setIsLoading(false);
    };

    const sendMessage = () => {
        if (ws && message) {
            const messageData = { type: 'chat_message', message: message };
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

    const sendFriendRequest = () => {
        console.log('친구 요청을 보냅니다.');
        if (ws) {
            const friendRequestData = { type: 'send_friend_request', to_username: user.username }; // 여기서 상대방 사용자명 설정 필요
            ws.send(JSON.stringify(friendRequestData));
            setFriendRequestSent(true); // 친구 요청을 보냈다고 상태 업데이트
            console.log('친구 요청을 보냈습니다.');
        }
    };

    const acceptFriendRequest = () => {
        if (ws && friendRequestFrom) {
            const acceptionData = { type: 'accept_friend_request', from_username: friendRequestFrom };
            ws.send(JSON.stringify(acceptionData));
            console.log(acceptionData);
            setFriendRequestReceived(false); // 친구 요청 수락 후 상태 초기화
            console.log(`${friendRequestFrom}의 친구 요청을 수락했습니다.`);
        }
    };

    return (
        <div className="chat-container">
            
            <div className="chat-header">
                <div className='notice'>
                    <p>매칭이 지연될 경우, 다시 로그인을 시도해보세요!</p>
                </div>
                <div className='status'>
                    {isLoading && <p>매칭중...</p>}
                    {isMatched && <p>채팅이 연결되었습니다!</p>}
                </div>
                <div className='friend-request-box'>

                </div>
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
                {isMatched && isConnected && (
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
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyUp={handleTyping}
                            onKeyDown={handleKeyDown}
                            placeholder="메시지를 입력하세요"
                        />
                        <button onClick={sendMessage}>보내기</button>
                        {!friendRequestReceived && !friendRequestSent && (
                            <button onClick={sendFriendRequest}>친구 요청 보내기</button>
                        )}
                        {friendRequestReceived && (
                            <button onClick={acceptFriendRequest}>수락</button>
                        )}
                    </>
                )}
                {!isMatched && (
                    <button onClick={startChat} className="start-chat-button">채팅 시작하기</button>
                )}
            </div>
        </div>
    );
}

export default ChatForm;
