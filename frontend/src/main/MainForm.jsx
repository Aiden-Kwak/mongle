import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import slide1 from '../static/img/slide1.png';
import slide2 from '../static/img/slide2.png';

function MainForm() {
    // 이미지 배열
    const slides = [slide1, slide2];
    // 현재 보여지는 이미지의 인덱스
    const [currentSlide, setCurrentSlide] = useState(0);

    // 자동으로 다음 이미지로 전환하는 함수
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    // 1초마다 이미지가 변경되도록 설정
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    // 이미지를 수동으로 변경할 수 있는 버튼을 위한 함수
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className='main-container'>
            <div className='img-container'>
                {slides.map((slide, index) => (
                    <img 
                        key={index} 
                        src={slide} 
                        alt={`slide-${index}`} 
                        style={{ display: index === currentSlide ? 'block' : 'none' }} 
                    />
                ))}
                <div className='carousel-buttons'>
                    {slides.map((_, index) => (
                        <button 
                            key={index} 
                            className={index === currentSlide ? 'active' : ''} 
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            </div> 
            <div className='catchp'>
                <p className='bold'><span className='color'>대학생</span>의,</p>
                <p className='bold'>대학생에 의한,</p>
                <p className='bold'>대학생을 위한</p>
                <p className='bold'>"단 하나뿐인 안전한 <span className='color'>랜덤채팅</span>"</p>
            </div>
        </div>
    );
}

export default MainForm;
