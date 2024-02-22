import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import { BackButton } from '../snippets';

function TestForm() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [click, setClick] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

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
        console.log('useEffect');
        setScreenSize(); // 페이지가 로드될 때 한 번 호출
        // 브라우저 창의 크기가 변경될 때마다 호출
        window.addEventListener('resize', setScreenSize);
        // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
        return () => {
            window.removeEventListener('resize', setScreenSize);
        };
    }, []);

    //let prevVisualViewport = 0
    //function handleVisualViewportResize() {
    //    let vh = window.innerHeight * 0.01;
    //    document.documentElement.style.setProperty('--vh', `${vh}px`);
    //    const currentVisualViewport = window.visualViewport.height
    //    
    //    if (
    //        prevVisualViewport - 30 > currentVisualViewport &&
    //        prevVisualViewport - 100 < currentVisualViewport
    //    ) {
    //        const scrollHeight = window.document.scrollingElement.scrollHeight
    //        const scrollTop = scrollHeight - window.visualViewport.height
    //        window.scrollTo(0, scrollTop) // 입력창이 키보드에 가려지지 않도록 조절
    //    }
    //    prevVisualViewport = window.visualViewport.height
    //}
    //useEffect(() => {
    //    window.visualViewport.onresize = handleVisualViewportResize
    //}  , [])
        
    useEffect(() => {
        // 로그인 페이지에서만 touch-action 스타일 적용
        const originalTouchAction = document.body.style.touchAction;
        document.body.style.touchAction = 'none';

        return () => {
            // 컴포넌트가 언마운트될 때 원래의 touch-action 스타일로 복원
            document.body.style.touchAction = originalTouchAction;
        };
    }, []);  


    const sendMessage = () => {
        // 메시지 배열에 새 메시지 추가
        const newMessage = { message: message, sender: "me" }; // 임시로 "me"로 설정
        setChat([...chat, newMessage]);
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
                    <p className='status'>테스트1 채팅방1</p>
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
                    />
                    <button onClick={sendMessage}>보내기</button>
                </div>
            </div>
        </div>
    );
}

export default TestForm;
