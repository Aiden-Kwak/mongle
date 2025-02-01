import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './chat.css';
import { UserContext } from '../UserContext';
import { BackButton } from '../snippets';
import { URLManagement } from '../snippets';
import { OnlineUser } from '../snippets';

function GroupChatForm() {
    const { roomName } = useParams();  // URL에서 roomName 가져오기
    const location = useLocation();
    const roomTitle = location.state?.roomTitle || "채팅방";
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState([]); // 현재 참여중인 유저 목록
    const [isTyping, setIsTyping] = useState(false);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    const [newEnter, setNewEnter] = useState('');

    const { user } = useContext(UserContext);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const WS_BASE_URL = URLManagement('ws');

    const messageIdSet = useRef(new Set());

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    

    useEffect(() => {
        //console.log(roomName);
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [ws]);

    useEffect(() => {
        sessionStorage.setItem("needReload", "true"); // 뒤로 가기 시 새로고침 트리거 설정
    }, []);


    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [chat]);

    const wsRef = useRef(null);


    const sendMessage = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && message.trim() !== '') {
            const messageId = crypto.randomUUID();  // 각 메시지에 고유 ID 추가
            //console.log("메시지 전송:", message.trim(), "ID:", messageId);
    
            wsRef.current.send(JSON.stringify({ 
                type: 'group_chat_message', 
                message: message.trim(), 
                message_id: messageId  // 서버로 전송할 메시지 ID 추가
            }));
    
            setMessage('');
        } else {
            console.log("WebSocket이 열려있지 않아 메시지 전송 불가");
        }
    };

    const playBeep = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
    
        // 1음 (500Hz)
        oscillator1.type = "sine";  // 사인파
        oscillator1.frequency.setValueAtTime(500, audioContext.currentTime);
        gainNode1.gain.setValueAtTime(0.2, audioContext.currentTime);  // 볼륨 설정
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
    
        // 2음 (600Hz)
        oscillator2.type = "sine";  // 사인파
        oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
    
        // 1음 시작
        oscillator1.start();
        setTimeout(() => {
            oscillator1.stop();
    
            // 1음이 끝난 후 2음 시작
            oscillator2.start();
            setTimeout(() => {
                oscillator2.stop();
            }, 100);  // 2음 지속 시간 (0.2초)
            
        }, 300);  // 1음 지속 시간 (0.2초)
    };
    
    
    

    const connectWebsocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            //console.log("기존 WebSocket 닫기");
            wsRef.current.close();
        }
    
        //console.log("새로운 WebSocket 연결 시작:", roomName);
        const newWs = new WebSocket(`${WS_BASE_URL}/ws/chat/group/${roomName}/`);
    
        newWs.onopen = () => {
            //console.log("WebSocket 연결 성공! 방 입장 요청 보냄:", roomName);
            setIsConnected(true);
            newWs.send(JSON.stringify({ 
                type: 'join_group_chat',
                room_name: roomName 
            }));
            /*
            setTimeout(() => {
                if (newWs.readyState === WebSocket.OPEN) {  // ✅ WebSocket 상태 확인
                    setMessage('SYSTEM: 입장알림1'); // input 필드에 자동 입력
                    sendMessage(); // ✅ WebSocket이 열려 있으면 메시지 전송
                } else {
                    console.warn("⚠️ WebSocket이 아직 열려있지 않아 메시지 전송을 건너뜁니다.");
                }
            }, 500);*/
        };
    
        newWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            //console.log("WebSocket 메시지 수신:", data);
            //console.log("DATA!!!!!!!", data);
            switch (data.type) {
                case 'group_chat':
                    if (!messageIdSet.current.has(data.message_id)) {  // 중복 메시지 필터링
                        messageIdSet.current.add(data.message_id);  // message_id 저장
                        setChat((prevChat) => [{
                            message: data.message, 
                            sender: data.sender,
                            sender_nick: data.sender_nick,
                            sender_school: data.sender_school,
                            message_id: data.message_id
                        }, ...prevChat]);
                    }
                    break;
                case 'participant_list':
                    setParticipants(data.participants);
                    if (data.participants.length > 1){
                        setNewEnter(`${data.participants[0]}`+"님이 입장하셨습니다.");
                        playBeep();
                    }
                    break;
                case 'typing_start':
                    if (data.sender !== user.username) setIsTyping(true);
                    break;
                case 'typing_end':
                    if (data.sender !== user.username) setIsTyping(false);
                    break;
                //case 'update_participants':
                //    setParticipants(data.participants);
                //    break;
                default:
                    break;
            }
        };
    
        newWs.onclose = () => {
            //console.log("WebSocket 연결 종료됨");
            setIsConnected(false);
            setParticipants([]);
        };
    
        wsRef.current = newWs;
    };

    useEffect(() => {
        connectWebsocket();
    }, [roomName]);

    /*
    const sendMessage = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && message.trim() !== '') {
            console.log("메시지 전송:", message.trim());
            wsRef.current.send(JSON.stringify({ type: 'group_chat_message', message: message.trim() }));
            setMessage('');
        } else {
            console.log("WebSocket이 열려있지 않아 메시지 전송 불가");
        }
    };*/
    
    
    

    const handleTyping = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: 'typing_start', sender: user.username }));
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                ws.send(JSON.stringify({ type: 'typing_end', sender: user.username }));
            }, 500);
        }
    };

    const handleKeyDown = (e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter' && message.trim() !== '') {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="total-chat-container">
            <div className="chat-container">
                <div className='back-and-onlineuser'>
                    <BackButton />
                    <OnlineUser />
                </div>
                <div className="chat-header">
                    <h2 className='groupchat-name'>{roomTitle}</h2>
                </div>
                <div className="participants">
                    <p>채팅방 참여자: {participants.length}</p>
                    <p>{newEnter}</p>
                </div>
                <div className="chat-messages" ref={messagesEndRef}>
                    {chat.map((msg, index) => (
                        
                        <div
                            key={msg.message_id}
                            className={`message-bubble ${msg.sender === user.username ? 'my-message' : 'their-message'}`}
                        >
                            <p className='sender_nick'>{msg.sender_nick}<span className='sender_school'>{msg.sender_school}</span></p>
                            <p>{msg.message}</p>
                        </div>
                    ))}
                </div>
                {isTyping && <div className="loading">상대방이 입력 중입니다...</div>}
                <div className="chat-input">
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyUp={handleTyping}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요"
                        onClick={() => setIsKeyboardActive(true)}
                        onFocus={() => setIsKeyboardActive(true)}
                        onBlur={() => setIsKeyboardActive(false)}
                    />
                    <button onClick={sendMessage}>보내기</button>
                </div>
            </div>
        </div>
    );
}

export default GroupChatForm;
