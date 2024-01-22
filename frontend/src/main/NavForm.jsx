import React, { useContext } from 'react';
import { UserContext } from '../UserContext';

function NavForm() {
    const { user } = useContext(UserContext);

    return (
        <nav>
            {user ? <p>안녕하세요, {user.username}님</p> : <p>로그아웃 상태입니다...</p>}
            {/* 나머지 네비게이션 요소 */}
        </nav>
    );
}

export default NavForm;
