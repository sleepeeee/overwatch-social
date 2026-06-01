"use client";

import React from "react";

export default function FluidClipPath() {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none -z-50">
      <defs>
        {/* 側邊欄專用自適應波浪曲線 */}
        <clipPath id="sidebar-curve" clipPathUnits="objectBoundingPoints">
          <path d="M 0,0 
                   L 0.82,0 
                   C 0.82,0.1 0.78,0.22 0.88,0.35 
                   C 0.96,0.46 0.98,0.58 0.85,0.72 
                   C 0.72,0.85 0.85,0.92 0.85,1 
                   L 0,1 Z" />
        </clipPath>

        {/* 橫幅專用不規則液態形狀 */}
        <clipPath id="banner-curve" clipPathUnits="objectBoundingPoints">
          <path d="M 0,0 
                   L 0.7,0 
                   C 0.8,0.12 0.75,0.28 0.88,0.42 
                   C 0.98,0.54 0.92,0.72 0.78,0.85 
                   C 0.68,0.94 0.6,0.98 0,1 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
