import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import { Link } from 'react-router-dom';

import logo from '../static/img/logo.png';
import '../static/font/font.css';
import './main.css';

function NavForm() {
    const { user } = useContext(UserContext);

    return (
       <nav>
            <div className="nav-wrapper">
                <Link to="/" className="nav-logo">
                <img src={logo} alt="Logo" />
                <div>
                    <span style={{fontSize:".9rem", marginLeft:".2rem"}}>대학생 랜덤채팅</span>
                    <span style={{fontSize:"2rem", fontFamily:"ugro-bold", color:"black"}}>
                        몽글몽글
                    </span>
                </div>
                </Link>
                <div className="nav-menu">
                    <Link to="/profile"><span>프로필</span></Link>
                    <Link to="/"><span>커뮤니티</span></Link>
                    <Link to="/"><span>친구관리</span></Link>
                    {user ?
                    <Link to="/logout"><span>로그아웃</span></Link>:
                    <Link to="/login"><span>로그인</span></Link>
                    }
                    <Link to="/chat"><button className="chat-button">채팅시작</button></Link>
                </div>
            </div>
       </nav>
        
    );
}

export default NavForm;
