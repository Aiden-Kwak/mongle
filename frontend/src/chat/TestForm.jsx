import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import { BackButton } from '../snippets';

function TestForm() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [click, setClick] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    function setScreenSize2() {
        let vh = window.outerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    function setScreenSize() {
        console.log(window.innerHeight);
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    useEffect(() => {
        // setInterval을 사용하여 someFunction을 1초마다 호출
        const interval = setInterval(() => {
            if(setIsKeyboardActive === false){
                setScreenSize();
            }
        }, 500);
    
        // 컴포넌트가 언마운트될 때 setInterval을 정리
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setScreenSize(); // 페이지가 로드될 때 한 번 호출
        // 브라우저 창의 크기가 변경될 때마다 호출
        window.addEventListener('resize', setScreenSize);
        // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
        return () => {
            window.removeEventListener('resize', setScreenSize);
        };
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = messagesEndRef.current;
            
            // 스크롤이 바닥에 거의 도달했는지 확인 (여유분을 두어 완전히 바닥이 아니어도 됨)
            const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
    
            if (isNearBottom || isKeyboardActive === true) {
                // 스크롤이 거의 바닥에 있을 때만 맨 아래로 스크롤
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }
    }, [chat, isKeyboardActive]); // chat 상태가 변경될 때마다 실행

    const sendMessage = () => {
        // 메시지 배열에 새 메시지 추가
        const newMessage = { message: message, sender: "me" }; // 임시로 "me"로 설정
        setChat([newMessage, ...chat]);
        setMessage(''); // 입력 필드 초기화
        inputRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && message.trim() !== '') {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="total-chat-container">
            <BackButton />
            <div className="chat-container">
                <div className="chat-header">
                    <p className='status'>테스트 채팅방1</p>
                </div>
                <div className="chat-messages" ref={messagesEndRef}>
                    {chat.map((msg, index) => (
                        <div
                            key={index}
                            className={`message-bubble ${msg.sender === "me" ? 'my-message' : 'their-message'}`}
                        >
                            {msg.message}
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="메시지를 입력하세요"
                        onClick={setScreenSize2}
                        onFocus={() => setIsKeyboardActive(true)} // 입력 필드에 포커스가 있을 때
                        onBlur={() => setIsKeyboardActive(false)}
                    />
                    <button onClick={sendMessage}>보내기</button>
                </div>
            </div>
        </div>
    );
}

export default TestForm;
