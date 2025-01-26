import React, { useRef, useEffect, useState } from 'react';

const FlappyGame = ({ isActive }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [playerY, setPlayerY] = useState(150);
    const [obstacles, setObstacles] = useState([
        { x: 300, gapStart: 100, gapSize: 80 },
    ]);
    const [items, setItems] = useState([]); // 아이템 배열
    const [itemEffect, setItemEffect] = useState(null); // 현재 활성화된 아이템 효과
    const [itemEffectEndScore, setItemEffectEndScore] = useState(0); // 효과 종료 점수
    const gameLoopRef = useRef(null);

    // 주요 설정 값
    const playerRadius = itemEffect === 'shrink' ? 7.5 : 15; // 크기 감소 효과 반영
    const gravity = 2;
    const jumpHeight = 30;
    const obstacleSpeed = itemEffect === 'speed' ? 4 : 2; // 속도 증가 효과 반영
    const canvasWidth = 300;
    const canvasHeight = 300;

    // 게임 중지 함수
    const stopGame = () => {
        if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
            gameLoopRef.current = null;
        }
    };

    // 게임 초기화 및 재시작 함수
    const resetGame = () => {
        stopGame();
        setScore(0);
        setIsGameOver(false);
        setPlayerY(150);
        setObstacles([{ x: 300, gapStart: 100, gapSize: 80 }]);
        setItems([]);
        setItemEffect(null);
        setItemEffectEndScore(0);
    };

    useEffect(() => {
        if (isActive && !isGameOver) {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');

            const updateGame = () => {
                if (!canvasRef.current) return;

                // 공 위치 업데이트
                setPlayerY((prevY) => Math.min(prevY + gravity, canvasHeight - playerRadius));

                // 장애물 업데이트
                setObstacles((prevObstacles) => {
                    const newObstacles = prevObstacles.map((obstacle) => ({
                        ...obstacle,
                        x: obstacle.x - obstacleSpeed,
                    }));
                    if (newObstacles[0].x < -20) {
                        const removedObstacle = newObstacles.shift();
                        newObstacles.push({
                            x: canvasWidth,
                            gapStart: Math.random() * (canvasHeight - 150) + 50,
                            gapSize: 80,
                        });
                        setScore((prevScore) => prevScore + 1);

                        // 아이템 생성 조건: 7개 장애물 지날 때마다
                        if ((score + 1) % 4 === 0) {
                            const previousObstacleX = removedObstacle.x;
                            const nextObstacleX = newObstacles[newObstacles.length - 1].x;

                            setItems((prevItems) => [
                                ...prevItems,
                                {
                                    x: (previousObstacleX + nextObstacleX) / 2, // 중간 거리
                                    y: Math.random() * (canvasHeight - 50) + 25,
                                    effect: Math.random() > 0.5 ? 'speed' : 'shrink', // 랜덤 효과
                                },
                            ]);
                        }
                    }
                    return newObstacles;
                });

                // 아이템 업데이트
                setItems((prevItems) =>
                    prevItems.map((item) => ({ ...item, x: item.x - obstacleSpeed }))
                );

                // 아이템 효과 종료
                if (itemEffect && score >= itemEffectEndScore) {
                    setItemEffect(null);
                }

                // 충돌 감지
                if (
                    playerY - playerRadius < 0 ||
                    playerY + playerRadius > canvasHeight ||
                    obstacles.some(
                        (obstacle) =>
                            obstacle.x < 50 + playerRadius &&
                            obstacle.x + 20 > 50 - playerRadius &&
                            (playerY - playerRadius < obstacle.gapStart ||
                                playerY + playerRadius > obstacle.gapStart + obstacle.gapSize)
                    )
                ) {
                    setIsGameOver(true);
                    stopGame();
                }

                // 아이템 충돌 감지
                setItems((prevItems) =>
                    prevItems.filter((item) => {
                        const isColliding =
                            item.x < 50 + playerRadius &&
                            item.x + 20 > 50 - playerRadius &&
                            item.y < playerY + playerRadius &&
                            item.y + 20 > playerY - playerRadius;

                        if (isColliding) {
                            setItemEffect(item.effect);
                            setItemEffectEndScore(score + 5);
                        }
                        return !isColliding;
                    })
                );
            };

            const drawGame = () => {
                if (!canvasRef.current) return;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                // 공 그리기
                ctx.beginPath();
                ctx.arc(50, playerY, playerRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'purple';
                ctx.fill();

                // 장애물 그리기
                obstacles.forEach((obstacle) => {
                    ctx.fillStyle = 'green';
                    ctx.fillRect(obstacle.x, 0, 20, obstacle.gapStart);
                    ctx.fillRect(
                        obstacle.x,
                        obstacle.gapStart + obstacle.gapSize,
                        20,
                        canvasHeight - obstacle.gapStart - obstacle.gapSize
                    );
                });

                // 아이템 그리기
                items.forEach((item) => {
                    ctx.beginPath();
                    ctx.fillStyle = 'yellow';
                    ctx.moveTo(item.x, item.y);
                    for (let i = 0; i < 5; i++) {
                        ctx.lineTo(
                            item.x + 10 * Math.cos((Math.PI / 5) * (2 * i)),
                            item.y + 10 * Math.sin((Math.PI / 5) * (2 * i))
                        );
                    }
                    ctx.closePath();
                    ctx.fill();
                });

                // 점수 표시
                ctx.fillStyle = 'black';
                ctx.font = '16px Arial';
                ctx.fillText(`Score: ${score}`, 10, 20);
            };

            gameLoopRef.current = setInterval(() => {
                updateGame();
                drawGame();
            }, 20);

            return stopGame;
        }
    }, [isActive, playerY, obstacles, items, itemEffect, score, isGameOver]);

    // 점프 함수
    const jump = () => {
        setPlayerY((prevY) => Math.max(prevY - jumpHeight, 0));
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };

        const handleTouchStart = () => {
            jump();
        };

        if (!isGameOver) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('touchstart', handleTouchStart);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
        };
    }, [isGameOver]);

    return (
        <div style={{ textAlign: 'center' }}>
            <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                style={{
                    border: '1px solid black',
                    display: isGameOver ? 'block' : 'block',
                    margin: '0 auto',
                }}
            />
            {isGameOver && (
                <div>
                    <p>Game Over! Final Score: {score}</p>
                    <button onClick={resetGame} style={{ padding: '10px', fontSize: '16px' }}>
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
};

export default FlappyGame;
