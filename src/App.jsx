import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [position, setPosition] = useState({ top: 250, left: 600 });
  const [action, setAction] = useState('idle');
  const [frame, setFrame] = useState({
    idle: 1,
    left: 1,
    right: 1,
    jump: 1,
    dock: 1,
  });
  const [frames, setFrames] = useState({
    idle: 2,
    left: 6,
    right: 5,
    jump: 7,
    dock: 5,
  });
  const [isJumping, setIsJumping] = useState(false);
  const [hasFallen, setHasFallen] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [hp, setHp] = useState(100); 
  const [gameOver, setGameOver] = useState(false); 

  // Bullet generation
  useEffect(() => {
    const bulletInterval = setInterval(() => {
      if (!gameOver) {
        const isVertical = Math.random() < 0.5;
        const newBullet = {
          top: isVertical ? 0 : Math.random() * window.innerHeight,
          left: isVertical ? Math.random() * window.innerWidth : window.innerWidth,
          direction: isVertical ? 'down' : 'left',
          type: isVertical ? 'v' : 'h', 
          speed: 1, 
        };
        setBullets((prev) => [...prev, newBullet]);
      }
    }, 1500);

    return () => clearInterval(bulletInterval);
  }, [gameOver]);

  //Bullet Movement and Collision Detection
  useEffect(() => {
    let animationFrameId;

    const updateBullets = () => {
      setBullets((prevBullets) =>
        prevBullets
          .map((bullet) => {
            let newTop = bullet.top;
            let newLeft = bullet.left;

            
            if (bullet.direction === 'down') {
              newTop += bullet.speed;
            } else {
              newLeft -= bullet.speed;
            }

            
            const playerTop = position.top;
            const playerLeft = position.left;

            if (
              newTop + 50 > playerTop && 
              newTop < playerTop + 130 && 
              newLeft + 50 > playerLeft && 
              newLeft < playerLeft + 120 
            ) {
              setHp((prev) => {
                const newHp = Math.max(prev - 20, 0); 
                if (newHp <= 0) {
                  setGameOver(true); 
                }
                return newHp;
              });
              return null; 
            }

            
            if (newTop > window.innerHeight || newLeft < 0) {
              return null;
            }

            return { ...bullet, top: newTop, left: newLeft };
          })
          .filter(Boolean)
      );

      
      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateBullets);
      }
    };

    
    animationFrameId = requestAnimationFrame(updateBullets);

    return () => cancelAnimationFrame(animationFrameId); 
  }, [position, gameOver]);

  // Player movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (hasFallen || isFalling || gameOver) return; 

      switch (e.key) {
        case 'a':
          setAction('left');
          setPosition((prev) => ({ ...prev, left: prev.left - 10 }));
          setFrame((prev) => ({ ...prev, left: (prev.left % frames .left) + 1 }));
          break;
        case 'd':
          setAction('right');
          setPosition((prev) => ({ ...prev, left: prev.left + 10 }));
          setFrame((prev) => ({ ...prev, right: (prev.right % frames.right) + 1 }));
          break;
        case 'w':
          if (!isJumping && !hasFallen && !isFalling) {
            setIsJumping(true);
            setAction('jump');
            let jumpFrameCount = 0;

            const jumpInterval = setInterval(() => {
              setFrame((prev) => ({ ...prev, jump: (prev.jump % frames.jump) + 1 }));
              jumpFrameCount++;

              if (jumpFrameCount === frames.jump) {
                clearInterval(jumpInterval);
                setIsJumping(false);
                setAction('idle');
                setPosition((prev) => ({ ...prev, top: 250 }));
                setFrame((prev) => ({ ...prev, idle: 1 }));
              }
            }, 100);

            setPosition((prev) => ({ ...prev, top: Math.max(prev.top - 140, 50) }));
            setTimeout(() => {
              setPosition((prev) => ({ ...prev, top: 250 }));
            }, 800);
          }
          break;
        case 's':
          setAction('dock');
          setPosition((prev) => ({ ...prev, top: Math.min(prev.top + 90, 250) }));
          setFrame((prev) => ({ ...prev, dock: (prev.dock % frames.dock) + 1 }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [frames, isJumping, hasFallen, isFalling, gameOver]);

  //Player Falling Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        const isOnArea =
          prev.top + 130 >= 370 && 
          prev.left + 120 >= 520 && 
          prev.left <= 845; 

        if (!isOnArea && !isJumping) {
          setIsFalling(true); 
          if (prev.top + 10 >= window.innerHeight - 130) { 
            setHasFallen(true); 
            setIsFalling(false); 
            setHp(0); 
            setGameOver(true); 
            return { ...prev, top: window.innerHeight - 130 }; 
          }
          return { ...prev, top: prev.top + 10 };
        }

        
        if (isOnArea) {
          setHasFallen(false);
          setIsFalling(false);
        }

        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isJumping]);

  return (
    <div className="body">
      <div
        className={`player ${action}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          backgroundImage: `url('/moves/${action}-${frame[action]}.png')`,
        }}
      ></div>
      <div className="area"></div>

     
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="bullet"
          style={{
            top: `${bullet.top}px`,
            left: `${bullet.left}px`,
            backgroundImage: `url('/moves/bullet_${bullet.type}.png')`,
          }}
        ></div>
      ))}

      
      <div className="hp-bar">
        <div className="hp" style={{ width: `${hp}%` }}></div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h1>Game Over!</h1>
        </div>
      )}
    </div>
  );
}

export default App;