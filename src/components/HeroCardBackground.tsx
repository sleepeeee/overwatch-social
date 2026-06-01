"use client";

import React from 'react';
import { HeroBackgroundConfig } from '@/types/card';

interface HeroCardBackgroundProps {
  config: HeroBackgroundConfig;
  heroName: string;
}

export const HeroCardBackground: React.FC<HeroCardBackgroundProps> = ({ config, heroName }) => {
  const { gradient, glowColor, glowPosition = '50% 50%', shapes } = config;

  return (
    <div 
      className="absolute inset-0 z-0 select-none overflow-hidden transition-all duration-700 ease-out"
      style={{ background: gradient }}
      aria-hidden="true"
    >
      {/* 層 1: 基礎極細網格科技線 (Tech Mesh Layer - 增強未來科幻質感) */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{ 
          backgroundImage: "repeating-linear-gradient(45deg, #8c7c6c 0, #8c7c6c 1px, transparent 0, transparent 50%)", 
          backgroundSize: "8px 8px" 
        }} 
      />

      {/* 層 2: 氛圍徑向背部淡光暈 (Ambient Radial Glow Layer) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out blur-3xl scale-110"
        style={{
          background: `radial-gradient(circle at ${glowPosition}, ${glowColor} 0%, transparent 68%)`
        }}
      />

      {/* 層 3: 精密極簡幾何裝飾層 (Precision Geometric Accents Layer - 附帶平滑Hover微互動) */}
      {shapes.map((shape, index) => {
        const key = `${shape.type}-${index}`;
        
        if (shape.type === 'circle') {
          return (
            <div 
              key={key} 
              className={`absolute rounded-full border border-white/5 mix-blend-overlay pointer-events-none transition-all duration-1000 ease-out group-hover/hero:scale-110 group-hover/hero:rotate-[10deg] ${shape.className}`}
              style={shape.style}
            />
          );
        }
        
        if (shape.type === 'polygon') {
          return (
            <div 
              key={key} 
              className={`absolute mix-blend-overlay pointer-events-none transition-all duration-1000 ease-out group-hover/hero:scale-105 group-hover/hero:-translate-y-1.5 ${shape.className}`}
              style={shape.style}
            />
          );
        }
        
        if (shape.type === 'stripes') {
          return (
            <div 
              key={key} 
              className={`absolute transition-all duration-1000 ease-out group-hover/hero:translate-x-2.5 group-hover/hero:-translate-y-1 ${shape.className}`}
              style={shape.style}
            />
          );
        }
        
        return null;
      })}
    </div>
  );
};
export default HeroCardBackground;
