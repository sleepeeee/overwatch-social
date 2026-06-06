"use client";

import React, { useEffect, useRef } from "react";

// Canvas 慢速星塵粒子背景組件
export function CosmicParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      color: string;
      speedX: number;
      speedY: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];
    const shootingStars: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      maxOpacity: number;
      fadeState: "in" | "out";
    }> = [];
    const mouse: { x: number | null; y: number | null; radius: number } = {
      x: null,
      y: null,
      radius: 140,
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      particles.length = 0;
      const particleCount = Math.min(65, Math.floor((width * height) / 24000));

      const colors = [
        "rgba(192, 132, 252, ",
        "rgba(139, 92, 246, ",
        "rgba(99, 102, 241, ",
        "rgba(255, 255, 255, ",
      ];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.4,
          baseAlpha: Math.random() * 0.35 + 0.08,
          alpha: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.12,
          speedY: (Math.random() - 0.5) * 0.12,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const createShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.003) {
        shootingStars.push({
          x: Math.random() * width * 0.6,
          y: Math.random() * height * 0.4,
          length: Math.random() * 70 + 40,
          speed: Math.random() * 2 + 1.2,
          angle: Math.PI / 6 + Math.random() * 0.08,
          opacity: 0,
          maxOpacity: Math.random() * 0.4 + 0.15,
          fadeState: "in",
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.twinklePhase += p.twinkleSpeed;
        const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;
        p.alpha = p.baseAlpha * (0.2 + twinkle * 0.8);

        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * force * 0.4;
            p.y += (dy / dist) * force * 0.4;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        if (p.radius > 1.5) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = "#c084fc";
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.7})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      createShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const dx = Math.cos(s.angle) * s.speed;
        const dy = Math.sin(s.angle) * s.speed;
        s.x += dx;
        s.y += dy;

        if (s.fadeState === "in") {
          s.opacity += 0.008;
          if (s.opacity >= s.maxOpacity) s.fadeState = "out";
        } else {
          s.opacity -= 0.005;
        }

        if (s.opacity <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length
        );
        grad.addColorStop(0, `rgba(192, 132, 252, ${s.opacity})`);
        grad.addColorStop(0.3, `rgba(139, 92, 246, ${s.opacity * 0.6})`);
        grad.addColorStop(1, "rgba(139, 92, 246, 0)");

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    resizeCanvas();
    initParticles();
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

// 極簡「月牙星芒」優雅微縮圖示
export function ElegantCrescentIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M 65,20 A 38,38 0 1,0 80,55 A 33,33 0 1,1 65,20 Z" fill="url(#iconGrad)" opacity="0.9" />
      <path d="M 68,16 C 68,22 71,25 77,25 C 71,25 68,28 68,34 C 68,28 65,25 59,25 C 65,25 68,22 68,16 Z" fill="#fff" filter="drop-shadow(0 0 4px #c084fc)" />
    </svg>
  );
}

// 頁尾專用極簡「星之軌道鑰匙」
export function FooterMinimalNodeIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20,60 A 45,45 0 0,1 80,40" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M 15,45 A 45,45 0 0,1 85,55" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" opacity="0.3" />
      <circle cx="50" cy="48" r="4.5" fill="#c084fc" filter="drop-shadow(0 0 5px #c084fc)" />
      <circle cx="28" cy="30" r="1.5" fill="#fff" opacity="0.6" />
      <circle cx="72" cy="65" r="1" fill="#fff" opacity="0.4" />
    </svg>
  );
}

// 動態星空 SVG 大 Logo 元件
export function CosmicFullLogo({ className = "w-full max-w-lg mx-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc"></stop>
          <stop offset="100%" stopColor="#a78bfa"></stop>
        </linearGradient>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9"></stop>
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.6"></stop>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2"></stop>
        </linearGradient>
        <radialGradient id="auroragrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.1"></stop>
          <stop offset="80%" stopColor="#c084fc" stopOpacity="0.01"></stop>
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0"></stop>
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>

      <circle cx="400" cy="330" r="300" fill="url(#auroragrad)"></circle>
      <g id="dynamic-particles">
        {[
          [434.7, 320.1, 2.3, 0.44, 5.4, -2.6],
          [368, 426, 3, 0.61, 9.4, -8.8],
          [342, 301.8, 3, 0.24, 6.9, -1.4],
          [507.1, 128.3, 2.7, 0.58, 8.5, -3.5],
          [42.7, 457.5, 3.4, 0.75, 8.5, -4.7],
          [763.1, 449.9, 2.6, 0.49, 8.2, -6.9],
        ].map(([cx, cy, r, opacity, dur, begin]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#themeGrad)" opacity={opacity}>
            <animate attributeName="cy" values={`${cy}; ${Number(cy) - 80}`} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite"></animate>
            <animate attributeName="opacity" values={`0;${opacity};0`} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite"></animate>
          </circle>
        ))}
      </g>

      <g id="graphic-content" transform="translate(0, 10)">
        <g className="twinkling-star" opacity="0.7">
          <circle cx="240" cy="180" r="1.2" fill="#fff"></circle>
          <circle cx="560" cy="190" r="2" fill="#fff"></circle>
          <circle cx="210" cy="350" r="1.5" fill="#fff"></circle>
          <circle cx="590" cy="320" r="1" fill="#fff"></circle>
          <circle cx="480" cy="140" r="1.2" fill="#fff"></circle>
        </g>

        <ellipse className="orbiting-ring" cx="400" cy="320" rx="195" ry="50" transform="rotate(-15 400 320)" fill="none" stroke="url(#themeGrad)" strokeWidth="1.8" opacity="0.65"></ellipse>
        <ellipse className="orbiting-ring" cx="400" cy="320" rx="210" ry="70" transform="rotate(-40 400 320)" fill="none" stroke="url(#themeGrad)" strokeWidth="1" strokeDasharray="10 8" opacity="0.45"></ellipse>

        <g className="planetary-orbit-1">
          <g transform="translate(195, 0)">
            <circle cx="400" cy="320" r="5" fill="url(#themeGrad)" filter="url(#softGlow)"></circle>
            <circle cx="400" cy="320" r="8" fill="none" stroke="#c084fc" strokeWidth="0.5" opacity="0.5"></circle>
          </g>
        </g>
        <g className="planetary-orbit-2">
          <g transform="translate(-210, 20)">
            <circle cx="400" cy="320" r="3.5" fill="#a78bfa"></circle>
          </g>
        </g>

        <g className="cosmic-crescent">
          <path d="M 400,160 A 150,150 0 0,1 400,460 A 136,143 0 0,0 400,160 Z" fill="url(#themeGrad)"></path>
        </g>

        <g className="fluffy-cloud" transform="translate(0, 10)">
          <path d="M 330,375 C 310,375 295,355 310,335 C 305,315 325,295 345,305 C 355,290 380,295 385,310 C 405,310 415,325 405,345 C 415,365 390,380 375,370 C 360,385 340,385 330,375 Z"></path>
          <path d="M 315,340 C 325,325 350,320 365,335" stroke="#c084fc" strokeWidth="0.6" fill="none" opacity="0.3"></path>
          <path d="M 335,360 C 350,350 380,352 390,362" stroke="#a78bfa" strokeWidth="0.6" fill="none" opacity="0.3"></path>
        </g>

        <g className="main-star" transform="translate(0, -10)">
          <circle cx="400" cy="160" r="10" fill="#c084fc" opacity="0.1" filter="url(#softGlow)"></circle>
          <path d="M 400,145 C 400,155 405,160 415,160 C 405,160 400,165 400,175 C 400,165 395,160 385,160 C 395,160 400,155 400,145 Z" fill="url(#themeGrad)"></path>
        </g>

        <g className="twinkling-star" transform="translate(100, 150)">
          <path d="M 400,145 C 400,150 402,152 407,152 C 402,152 400,154 400,159 C 400,154 398,152 393,152 C 398,152 400,150 400,145 Z" fill="#a78bfa" opacity="0.8"></path>
        </g>
      </g>

      <g id="text-branding" transform="translate(0, 50)">
        <text x="400" y="540" className="brand-title" textAnchor="middle">After Midnight</text>
        <line x1="240" y1="590" x2="360" y2="590" strokeWidth="1.2" className="divider-line"></line>
        <line x1="440" y1="590" x2="560" y2="590" strokeWidth="1.2" className="divider-line"></line>
        <path d="M 400,580 L 403,590 L 413,593 L 403,596 L 400,606 L 397,596 L 387,593 L 397,590 Z" fill="url(#themeGrad)" opacity="0.8"></path>
        <text x="400" y="640" className="brand-slogan" textAnchor="middle">永遠都發生在午夜之後。</text>
      </g>
    </svg>
  );
}
