import React, { useState } from 'react';
import axios from 'axios';
import './account.css';
//export { SignupForm };

function SignupForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        school: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const schools = [
        { id: '0', name: '성균관대학교' },
        { id: '1', name: '광주과학기술원' },
        { id: '2', name: '서강대학교' },
        { id: '3', name: '울산과학기술원' },
        { id: '4', name: '중앙대학교' },
        { id: '5', name: '한국과학기술원' },
        { id: '6', name: '한양대학교' },
        { id: '7', name: '서울대학교' },
        { id: '8', name: '연세대학교' },
        { id: '9', name: '고려대학교' },
        { id: '10', name: '경희대학교' },
        { id: '11', name: '한국외국어대학교' },
        { id: '12', name: '서울시립대학교' },
        { id: '13', name: '가톨릭대학교' },
        { id: '14', name: '건국대학교' },
        { id: '15', name: '광운대학교' },
        { id: '16', name: '국민대학교' },
        { id: '17', name: '동국대학교' },
        { id: '18', name: '서울과학기술대학교' },
        { id: '19', name: '세종대학교' },
        { id: '20', name: '숭실대학교' },
        { id: '21', name: '홍익대학교' },
        { id: '22', name: '가천대학교' },
        { id: '23', name: '인하대학교' },
        { id: '24', name: '아주대학교' },
        { id: '25', name: '한국항공대학교' },
        { id: '26', name: '이화여자대학교' },
        { id: '27', name: '성신여자대학교' },
        { id: '28', name: '서울여자대학교' },
        { id: '29', name: '숙명여자대학교' },
        { id: '30', name: '동덕여자대학교' },
        { id: '31', name: '덕성여자대학교' },
        { id: '32', name: '한국예술종합학교' },
        { id: '33', name: '대구경북과학기술원' },
        { id: '34', name: '포항공과대학교' },
        { id: '35', name: '전남대학교' },
        { id: '36', name: '한동대학교' },
        { id: '37', name: '충남대학교' },
        { id: '38', name: '부산대학교' }

    ];


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/signup/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(response.data);
            // 회원가입 성공 처리 로직
            console.log('회원가입 성공');
        } catch (error) {
            console.error(error);
            // 에러 처리 로직
            console.log('회원가입 실패');
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit}>
                <input
                    className="signup-input"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                />
                <input
                    className="signup-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                />
                <input
                    className="signup-input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                />
                <select
                    className="signup-select"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                >
                    <option value="">학교 선택</option>
                    {schools.map(school => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                </select>
                <button className="signup-button" type="submit">회원가입</button>
            </form>
        </div>
    );
  
}
export default SignupForm;