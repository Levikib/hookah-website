"use client";

import React, {
  useRef, useEffect, useState, useCallback,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SESSIONS, CUSTOM_PRICING, type SessionTier } from "@/data/sessions";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";

gsap.registerPlugin(ScrollTrigger);

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

// ─── Cinematic SVG Scene Illustrations ───────────────────────────────────────
// Each one tells a visual story. Full scenes, not icons.

function SceneSolo() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes sc-smoke1 { 0%{transform:translate(0,0) scaleX(1);opacity:0.7} 100%{transform:translate(-8px,-60px) scaleX(1.6);opacity:0} }
        @keyframes sc-smoke2 { 0%{transform:translate(0,0) scaleX(1);opacity:0.5} 100%{transform:translate(10px,-70px) scaleX(1.8);opacity:0} }
        @keyframes sc-smoke3 { 0%{transform:translate(0,0) scaleX(1);opacity:0.4} 100%{transform:translate(-4px,-55px) scaleX(2);opacity:0} }
        @keyframes sc-breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes sc-moon { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes sc-star { 0%,100%{opacity:0.2} 50%{opacity:0.9} }
        @keyframes sc-coal { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .sc-s1{animation:sc-smoke1 3.2s ease-in infinite}
        .sc-s2{animation:sc-smoke2 3.8s ease-in infinite 0.9s}
        .sc-s3{animation:sc-smoke3 4.1s ease-in infinite 1.7s}
        .sc-person{animation:sc-breathe 4s ease-in-out infinite}
        .sc-moon{animation:sc-moon 5s ease-in-out infinite}
        .sc-st1{animation:sc-star 2.1s ease-in-out infinite 0s}
        .sc-st2{animation:sc-star 1.8s ease-in-out infinite 0.6s}
        .sc-st3{animation:sc-star 2.5s ease-in-out infinite 1.2s}
        .sc-coal{animation:sc-coal 1.2s ease-in-out infinite}
      `}</style>
      {/* Night sky */}
      <rect width="280" height="200" fill="url(#solo-sky)" rx="12"/>
      <defs>
        <radialGradient id="solo-sky" cx="60%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a0a3e"/>
          <stop offset="100%" stopColor="#05030a"/>
        </radialGradient>
      </defs>
      {/* Stars */}
      <circle className="sc-st1" cx="40" cy="25" r="1.2" fill="white"/>
      <circle className="sc-st2" cx="220" cy="18" r="1" fill="white"/>
      <circle className="sc-st3" cx="160" cy="35" r="1.5" fill="white"/>
      <circle cx="80" cy="40" r="0.8" fill="white" opacity="0.5"/>
      <circle cx="245" cy="50" r="1" fill="white" opacity="0.4"/>
      <circle cx="30" cy="60" r="0.7" fill="white" opacity="0.35"/>
      {/* Moon */}
      <circle className="sc-moon" cx="230" cy="30" r="18" fill="#fffde7" opacity="0.15"/>
      <circle cx="238" cy="26" r="14" fill="#05030a" opacity="0.85"/>
      {/* Floor */}
      <ellipse cx="140" cy="195" rx="120" ry="18" fill="#0d0a1e"/>
      {/* Cushion/mat */}
      <ellipse cx="120" cy="175" rx="45" ry="12" fill="#1a1235" stroke="#7c3aed22" strokeWidth="1"/>
      <ellipse cx="120" cy="175" rx="38" ry="9" fill="#120d28"/>
      {/* Person meditating */}
      <g className="sc-person">
        {/* crossed legs */}
        <path d="M88 172 Q100 168 112 172 Q120 175 128 172 Q140 168 152 172" stroke="#a89bc4" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9"/>
        {/* torso */}
        <rect x="107" y="140" width="18" height="30" rx="9" fill="#a89bc4"/>
        {/* head */}
        <circle cx="116" cy="132" r="12" fill="#c8b8e0"/>
        {/* hair */}
        <path d="M106 128 Q116 118 126 128" fill="#6b5f88" opacity="0.8"/>
        {/* left arm — resting on knee */}
        <path d="M108 155 Q96 162 90 168" stroke="#a89bc4" strokeWidth="7" strokeLinecap="round"/>
        {/* right arm — resting on knee */}
        <path d="M124 155 Q136 162 150 168" stroke="#a89bc4" strokeWidth="7" strokeLinecap="round"/>
        {/* hands open, palms up */}
        <circle cx="89" cy="169" r="5" fill="#b8a8d0"/>
        <circle cx="151" cy="169" r="5" fill="#b8a8d0"/>
        {/* eyes closed peaceful */}
        <path d="M112 131 Q116 133 120 131" stroke="#4a3d6e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
      {/* Hookah — right side */}
      <g transform="translate(170, 90)">
        {/* Base */}
        <ellipse cx="30" cy="88" rx="22" ry="7" fill="#2d1b69" stroke="#7c3aed44" strokeWidth="1"/>
        {/* Vase */}
        <path d="M16 85 Q14 65 18 50 Q22 38 30 35 Q38 38 42 50 Q46 65 44 85Z" fill="#1a0a3e" stroke="#9d5cf544" strokeWidth="1.5"/>
        <path d="M22 75 Q20 60 23 50 Q27 42 30 40 Q33 42 37 50 Q40 60 38 75Z" fill="#120d28" opacity="0.8"/>
        {/* Water line shimmer */}
        <ellipse cx="30" cy="68" rx="12" ry="3" fill="#7c3aed22" stroke="#9d5cf533" strokeWidth="0.5"/>
        {/* Stem */}
        <rect x="28" y="15" width="4" height="22" rx="2" fill="#4a2080"/>
        {/* Bowl */}
        <path d="M20 15 Q30 8 40 15 L38 22 Q30 18 22 22Z" fill="#6b2fa0" stroke="#9d5cf555" strokeWidth="1"/>
        {/* Coal glow */}
        <ellipse className="sc-coal" cx="30" cy="13" rx="10" ry="4" fill="#ff6b35" opacity="0.8"/>
        <ellipse cx="30" cy="13" rx="6" ry="2.5" fill="#ffa040" opacity="0.9"/>
        {/* Hose */}
        <path d="M44 60 Q70 55 80 70 Q85 78 75 82" stroke="#4a2080" strokeWidth="4" fill="none" strokeLinecap="round"/>
        {/* Mouthpiece tip near person's hand */}
        <circle cx="74" cy="82" r="4" fill="#6b2fa0"/>
      </g>
      {/* Smoke wisps from bowl */}
      <g transform="translate(200, 88)">
        <ellipse className="sc-s1" cx="0" cy="0" rx="5" ry="8" fill="rgba(157,92,245,0.4)"/>
        <ellipse className="sc-s2" cx="3" cy="-5" rx="6" ry="10" fill="rgba(124,58,237,0.3)"/>
        <ellipse className="sc-s3" cx="-2" cy="-2" rx="4" ry="7" fill="rgba(232,121,249,0.25)"/>
      </g>
      {/* Ambient glow around person */}
      <ellipse cx="120" cy="150" rx="55" ry="40" fill="rgba(124,58,237,0.06)"/>
      {/* Floor candle / incense */}
      <rect x="75" y="168" width="2" height="14" rx="1" fill="#c8b8e0" opacity="0.5"/>
      <circle cx="76" cy="167" r="2" fill="#f59e0b" opacity="0.8"/>
    </svg>
  );
}

function SceneDuo() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes duo-smoke1{0%{transform:translate(0,0);opacity:0.7}100%{transform:translate(-10px,-65px);opacity:0}}
        @keyframes duo-smoke2{0%{transform:translate(0,0);opacity:0.5}100%{transform:translate(8px,-70px);opacity:0}}
        @keyframes duo-bob1{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes duo-bob2{0%,100%{transform:translateY(-1px)}50%{transform:translateY(1px)}}
        @keyframes duo-glow{0%,100%{opacity:0.3}50%{opacity:0.7}}
        .ds1{animation:duo-smoke1 3.5s ease-in infinite}
        .ds2{animation:duo-smoke2 4s ease-in infinite 1.2s}
        .dp1{animation:duo-bob1 4.5s ease-in-out infinite}
        .dp2{animation:duo-bob2 4.2s ease-in-out infinite 0.8s}
        .dg{animation:duo-glow 3s ease-in-out infinite}
      `}</style>
      <rect width="280" height="200" fill="url(#duo-bg)" rx="12"/>
      <defs>
        <radialGradient id="duo-bg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#0d2818"/>
          <stop offset="100%" stopColor="#05030a"/>
        </radialGradient>
      </defs>
      {/* Ambient garden light */}
      <ellipse className="dg" cx="140" cy="100" rx="90" ry="60" fill="rgba(34,211,104,0.05)"/>
      {/* Floor */}
      <rect x="0" y="165" width="280" height="35" fill="#0a1a0d" opacity="0.8"/>
      {/* Low table between them */}
      <rect x="108" y="148" width="64" height="28" rx="6" fill="#1a2e1d" stroke="#276749" strokeWidth="1"/>
      <rect x="112" y="144" width="56" height="8" rx="3" fill="#1e3a22"/>
      {/* Hookah on table */}
      <g transform="translate(125, 80)">
        <ellipse cx="15" cy="70" rx="15" ry="5" fill="#1e3a22" stroke="#276749" strokeWidth="1"/>
        <path d="M6 67 Q5 52 8 42 Q11 33 15 30 Q19 33 22 42 Q25 52 24 67Z" fill="#0d2818" stroke="#27674955" strokeWidth="1.5"/>
        <rect x="13" y="12" width="4" height="20" rx="2" fill="#276749"/>
        <path d="M8 12 Q15 6 22 12 L21 18 Q15 14 9 18Z" fill="#34d399" opacity="0.7"/>
        <ellipse cx="15" cy="10" rx="8" ry="3" fill="#f59e0b" opacity="0.7"/>
        <ellipse cx="15" cy="10" rx="5" ry="2" fill="#ff6b35" opacity="0.8"/>
        {/* Two hoses */}
        <path d="M22 45 Q45 42 55 55" stroke="#276749" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M8 45 Q-15 42 -25 55" stroke="#276749" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      </g>
      {/* Smoke */}
      <g transform="translate(140, 80)">
        <ellipse className="ds1" cx="0" cy="0" rx="5" ry="9" fill="rgba(52,211,153,0.35)"/>
        <ellipse className="ds2" cx="2" cy="-4" rx="6" ry="11" fill="rgba(16,185,129,0.25)"/>
      </g>
      {/* Person 1 — left, leaning slightly toward hookah */}
      <g className="dp1" transform="translate(32,100)">
        {/* legs/sitting */}
        <path d="M10 72 Q22 68 34 72" stroke="#68d391" strokeWidth="7" strokeLinecap="round" fill="none"/>
        {/* torso */}
        <rect x="16" y="44" width="16" height="26" rx="8" fill="#68d391"/>
        {/* head */}
        <circle cx="24" cy="36" r="11" fill="#86efac"/>
        {/* hair */}
        <path d="M14 33 Q24 23 34 33" fill="#166534"/>
        {/* arm reaching for hose */}
        <path d="M32 55 Q50 52 62 58" stroke="#68d391" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="62" cy="58" r="4.5" fill="#86efac"/>
        {/* face — relaxed smile */}
        <path d="M20 37 Q24 40 28 37" stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="21" cy="35" r="1.5" fill="#166534"/>
        <circle cx="27" cy="35" r="1.5" fill="#166534"/>
      </g>
      {/* Person 2 — right */}
      <g className="dp2" transform="translate(186,100)">
        <path d="M8 72 Q20 68 32 72" stroke="#34d399" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="12" y="44" width="16" height="26" rx="8" fill="#34d399"/>
        <circle cx="20" cy="36" r="11" fill="#6ee7b7"/>
        <path d="M10 33 Q20 23 30 33" fill="#065f46"/>
        <path d="M-2 55 Q-15 52 -28 58" stroke="#34d399" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="-28" cy="58" r="4.5" fill="#6ee7b7"/>
        <path d="M16 37 Q20 40 24 37" stroke="#065f46" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="17" cy="35" r="1.5" fill="#065f46"/>
        <circle cx="23" cy="35" r="1.5" fill="#065f46"/>
      </g>
      {/* Tea cups on table */}
      <ellipse cx="122" cy="153" rx="7" ry="4" fill="#276749" opacity="0.6"/>
      <ellipse cx="158" cy="153" rx="7" ry="4" fill="#276749" opacity="0.6"/>
      {/* Fairy lights string */}
      <path d="M0 30 Q70 22 140 28 Q210 34 280 26" stroke="rgba(255,255,200,0.2)" strokeWidth="1" fill="none"/>
      {[20,55,90,130,168,208,248].map((x,i)=>(
        <circle key={i} cx={x} cy={22 + (i%3)*4} r="2.5" fill="#fffde7" opacity={0.4 + (i%3)*0.2}/>
      ))}
    </svg>
  );
}

function SceneSquad() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes sq-fire{0%,100%{transform:scaleY(1) skewX(-2deg);opacity:0.9}50%{transform:scaleY(1.12) skewX(3deg);opacity:1}}
        @keyframes sq-sm{0%{transform:translateY(0);opacity:0.7}100%{transform:translateY(-55px);opacity:0}}
        @keyframes sq-pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes sq-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .sq-fi{animation:sq-fire 1.4s ease-in-out infinite;transform-origin:50% 100%}
        .sq-sm1{animation:sq-sm 2.8s ease-in infinite}
        .sq-sm2{animation:sq-sm 3.2s ease-in infinite 0.7s}
        .sq-sm3{animation:sq-sm 3.6s ease-in infinite 1.4s}
        .sq-pl{animation:sq-pulse 2s ease-in-out infinite}
        .sq-b1{animation:sq-bob 3.5s ease-in-out infinite}
        .sq-b2{animation:sq-bob 3.8s ease-in-out infinite 0.5s}
        .sq-b3{animation:sq-bob 3.2s ease-in-out infinite 1s}
        .sq-b4{animation:sq-bob 4s ease-in-out infinite 1.5s}
      `}</style>
      <rect width="280" height="200" fill="url(#sq-bg)" rx="12"/>
      <defs>
        <radialGradient id="sq-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a0e30"/>
          <stop offset="100%" stopColor="#05030a"/>
        </radialGradient>
      </defs>
      {/* Party lights / bokeh */}
      {[30,70,120,160,200,240].map((x,i)=>(
        <circle key={i} className="sq-pl" cx={x} cy={15+(i%2)*12} r={3+i%3} fill={["#e879f9","#22d3ee","#f59e0b","#ff6b35","#a78bfa","#34d399"][i]} opacity="0.5"/>
      ))}
      {/* Rug / hangout area */}
      <ellipse cx="140" cy="185" rx="118" ry="20" fill="#1a0e30" opacity="0.9"/>
      <ellipse cx="140" cy="182" rx="100" ry="14" fill="#120d28"/>
      {/* Central hookah — commanding */}
      <g transform="translate(114,60)">
        <ellipse cx="26" cy="105" rx="26" ry="9" fill="#2d1b69" stroke="#9d5cf466" strokeWidth="1.5"/>
        <path d="M10 100 Q8 74 13 56 Q18 42 26 37 Q34 42 39 56 Q44 74 42 100Z" fill="#1a0a3e" stroke="#7c3aed55" strokeWidth="2"/>
        <path d="M17 88 Q15 68 19 55 Q23 45 26 42 Q29 45 33 55 Q37 68 35 88Z" fill="rgba(124,58,237,0.15)"/>
        <rect x="23" y="14" width="6" height="25" rx="3" fill="#7c3aed"/>
        <path d="M12 14 Q26 5 40 14 L38 22 Q26 16 14 22Z" fill="#9d5cf4"/>
        <ellipse cx="26" cy="11" rx="14" ry="5" fill="#ff6b35" opacity="0.9"/>
        <ellipse cx="26" cy="10" rx="9" ry="3.5" fill="#ffa040"/>
        <g className="sq-fi"><path d="M18 10 Q26 0 34 10 Q30 6 26 5 Q22 6 18 10Z" fill="#f59e0b" opacity="0.9"/></g>
        {/* 4 hoses */}
        <path d="M40 70 Q68 65 80 78" stroke="#7c3aed" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M40 80 Q65 88 75 100" stroke="#9d5cf4" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M12 70 Q-16 65 -28 78" stroke="#7c3aed" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M12 80 Q-13 88 -23 100" stroke="#9d5cf4" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      </g>
      {/* Smoke */}
      <g transform="translate(140,60)">
        <ellipse className="sq-sm1" cx="-4" cy="0" rx="6" ry="10" fill="rgba(157,92,245,0.4)"/>
        <ellipse className="sq-sm2" cx="5" cy="-6" rx="8" ry="13" fill="rgba(232,121,249,0.3)"/>
        <ellipse className="sq-sm3" cx="-1" cy="-3" rx="5" ry="8" fill="rgba(124,58,237,0.35)"/>
      </g>
      {/* 4 people around */}
      {/* Top-left */}
      <g className="sq-b1" transform="translate(28,95)">
        <path d="M0 65 Q14 60 28 65" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="6" y="38" width="16" height="24" rx="8" fill="#a78bfa"/>
        <circle cx="14" cy="30" r="10" fill="#c4b5fd"/>
        <path d="M5 28 Q14 20 23 28" fill="#5b21b6"/>
      </g>
      {/* Top-right */}
      <g className="sq-b2" transform="translate(210,95)">
        <path d="M0 65 Q14 60 28 65" stroke="#f472b6" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="6" y="38" width="16" height="24" rx="8" fill="#f472b6"/>
        <circle cx="14" cy="30" r="10" fill="#fbcfe8"/>
        <path d="M5 28 Q14 20 23 28" fill="#9d174d"/>
      </g>
      {/* Bottom-left */}
      <g className="sq-b3" transform="translate(42,135)">
        <path d="M0 40 Q14 36 28 40" stroke="#34d399" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="6" y="14" width="16" height="24" rx="8" fill="#34d399"/>
        <circle cx="14" cy="6" r="10" fill="#6ee7b7"/>
        <path d="M5 4 Q14 -4 23 4" fill="#065f46"/>
      </g>
      {/* Bottom-right */}
      <g className="sq-b4" transform="translate(194,135)">
        <path d="M0 40 Q14 36 28 40" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="6" y="14" width="16" height="24" rx="8" fill="#fbbf24"/>
        <circle cx="14" cy="6" r="10" fill="#fde68a"/>
        <path d="M5 4 Q14 -4 23 4" fill="#92400e"/>
      </g>
      {/* Drinks + snacks on rug */}
      <circle cx="105" cy="175" r="5" fill="#7c3aed" opacity="0.6"/>
      <circle cx="175" cy="175" r="5" fill="#7c3aed" opacity="0.6"/>
      <rect x="128" y="170" width="24" height="10" rx="3" fill="#1a0e30" stroke="#9d5cf433" strokeWidth="1"/>
    </svg>
  );
}

function SceneVIP() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes vip-shine{0%,100%{opacity:0.4;transform:rotate(0deg)}50%{opacity:1;transform:rotate(5deg)}}
        @keyframes vip-sm{0%{transform:translateY(0) rotate(-5deg);opacity:0.6}100%{transform:translateY(-60px) rotate(5deg);opacity:0}}
        @keyframes vip-candle{0%,100%{transform:scaleY(1)skewX(-3deg)}50%{transform:scaleY(1.15)skewX(4deg)}}
        @keyframes vip-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        .vs1{animation:vip-sm 3s ease-in infinite}
        .vs2{animation:vip-sm 3.6s ease-in infinite 1s}
        .vs3{animation:vip-sm 4s ease-in infinite 2s}
        .vc{animation:vip-candle 1.6s ease-in-out infinite;transform-origin:50% 100%}
        .vb{animation:vip-bob 5s ease-in-out infinite}
        .vs-glow{animation:vip-shine 4s ease-in-out infinite}
      `}</style>
      <rect width="280" height="200" fill="url(#vip-bg)" rx="12"/>
      <defs>
        <radialGradient id="vip-bg" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1c1200"/>
          <stop offset="100%" stopColor="#05030a"/>
        </radialGradient>
        <radialGradient id="vip-chandelier" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#92400e"/>
        </radialGradient>
      </defs>
      {/* Chandelier */}
      <g>
        <line x1="140" y1="0" x2="140" y2="20" stroke="#b45309" strokeWidth="2"/>
        <ellipse cx="140" cy="22" rx="30" ry="6" fill="none" stroke="#b45309" strokeWidth="1.5"/>
        {[110,122,135,145,158,170].map((x,i)=>(
          <g key={i}>
            <line x1={x} y1="22" x2={x+(i%2?2:-2)} y2="34" stroke="#b45309" strokeWidth="1"/>
            <ellipse className="vc" cx={x+(i%2?2:-2)} cy="34" rx="3" ry="5" fill="#fbbf24" opacity="0.8"/>
            <circle cx={x+(i%2?2:-2)} cy="30" r="2" fill="#fff" opacity="0.6"/>
          </g>
        ))}
      </g>
      {/* Gold floor/carpet */}
      <ellipse cx="140" cy="192" rx="125" ry="16" fill="#451a03" opacity="0.8"/>
      <ellipse cx="140" cy="190" rx="105" ry="11" fill="#1c0f00"/>
      {/* Ornate low table */}
      <rect x="80" y="145" width="120" height="40" rx="8" fill="#1c1200" stroke="#b4530966" strokeWidth="2"/>
      <rect x="84" y="141" width="112" height="10" rx="4" fill="#292000" stroke="#b4530955" strokeWidth="1"/>
      {/* Table ornaments */}
      <ellipse cx="100" cy="148" rx="10" ry="4" fill="#b45309" opacity="0.5"/>
      <ellipse cx="180" cy="148" rx="10" ry="4" fill="#b45309" opacity="0.5"/>
      {/* Gold hookah — premium */}
      <g transform="translate(112,68)">
        <ellipse cx="28" cy="80" rx="24" ry="8" fill="#292000" stroke="#b4530988" strokeWidth="2"/>
        <path d="M12 77 Q10 57 14 43 Q19 31 28 27 Q37 31 42 43 Q46 57 44 77Z" fill="#1c1200" stroke="#fbbf2466" strokeWidth="2"/>
        <path d="M18 70 Q16 55 19 44 Q23 36 28 33 Q33 36 37 44 Q40 55 38 70Z" fill="rgba(251,191,36,0.1)"/>
        {/* Gold filigree detail */}
        <path d="M14 55 Q18 50 22 55 Q18 60 14 55" stroke="#b45309" strokeWidth="0.8" fill="none"/>
        <path d="M34 55 Q38 50 42 55 Q38 60 34 55" stroke="#b45309" strokeWidth="0.8" fill="none"/>
        <rect x="25.5" y="8" width="5" height="21" rx="2.5" fill="#b45309"/>
        {/* Gold bowl */}
        <path d="M14 8 Q28 0 42 8 L40 16 Q28 10 16 16Z" fill="#b45309" stroke="#fbbf2477" strokeWidth="1.5"/>
        <ellipse cx="28" cy="6" rx="13" ry="4.5" fill="#ff6b35" opacity="0.85"/>
        <ellipse cx="28" cy="5" rx="8" ry="3" fill="#ffa040"/>
        <ellipse className="vs-glow" cx="28" cy="4" rx="5" ry="2" fill="white" opacity="0.5"/>
        {/* Hoses — gold */}
        <path d="M44 55 Q72 50 85 63" stroke="#b45309" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M12 55 Q-16 50 -29 63" stroke="#b45309" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="86" cy="64" r="5" fill="#92400e"/>
        <circle cx="-30" cy="64" r="5" fill="#92400e"/>
      </g>
      {/* Smoke — gold tinted */}
      <g transform="translate(140,68)">
        <ellipse className="vs1" cx="0" cy="0" rx="5" ry="9" fill="rgba(251,191,36,0.35)"/>
        <ellipse className="vs2" cx="4" cy="-5" rx="7" ry="12" fill="rgba(245,158,11,0.25)"/>
        <ellipse className="vs3" cx="-3" cy="-2" rx="4" ry="8" fill="rgba(217,119,6,0.3)"/>
      </g>
      {/* 2 VIP guests on cushioned sofas */}
      <g className="vb" transform="translate(22,110)">
        <rect x="0" y="45" width="52" height="20" rx="6" fill="#292000" stroke="#b4530944" strokeWidth="1"/>
        <path d="M8 48 Q26 44 44 48" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85"/>
        <rect x="14" y="24" width="14" height="22" rx="7" fill="#d4a017"/>
        <circle cx="21" cy="17" r="10" fill="#f0c040"/>
        <path d="M12 15 Q21 6 30 15" fill="#78350f"/>
        <path d="M17 18 Q21 21 25 18" stroke="#78350f" strokeWidth="1.5" fill="none"/>
      </g>
      <g className="vb" transform="translate(196,110)">
        <rect x="0" y="45" width="58" height="20" rx="6" fill="#292000" stroke="#b4530944" strokeWidth="1"/>
        <path d="M8 48 Q29 44 50 48" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.85"/>
        <rect x="16" y="24" width="14" height="22" rx="7" fill="#c084fc"/>
        <circle cx="23" cy="17" r="10" fill="#e9d5ff"/>
        <path d="M14 15 Q23 6 32 15" fill="#581c87"/>
        <path d="M19 18 Q23 21 27 18" stroke="#581c87" strokeWidth="1.5" fill="none"/>
      </g>
      {/* Candles on table */}
      {[96,140,184].map((x,i)=>(
        <g key={i}>
          <rect x={x-2} y="137" width="4" height="10" rx="2" fill="#fffde7" opacity="0.7"/>
          <g className="vc"><ellipse cx={x} cy="137" rx="3" ry="5" fill="#fbbf24" opacity="0.8"/></g>
        </g>
      ))}
    </svg>
  );
}

function SceneRooftop() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes rt-cloud{0%{transform:translateX(0)}100%{transform:translateX(280px)}}
        @keyframes rt-glow{0%,100%{opacity:0.5}50%{opacity:0.9}}
        @keyframes rt-sm{0%{transform:translateY(0);opacity:0.6}100%{transform:translateY(-50px);opacity:0}}
        @keyframes rt-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes rt-city{0%,100%{opacity:0.6}50%{opacity:1}}
        .rc{animation:rt-cloud 22s linear infinite}
        .rg{animation:rt-glow 3s ease-in-out infinite}
        .rs1{animation:rt-sm 3.2s ease-in infinite}
        .rs2{animation:rt-sm 3.8s ease-in infinite 1s}
        .rb{animation:rt-bob 4s ease-in-out infinite}
        .rcity{animation:rt-city 4s ease-in-out infinite}
      `}</style>
      <defs>
        <linearGradient id="rt-sunset" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e0050"/>
          <stop offset="40%" stopColor="#7c1d6f"/>
          <stop offset="70%" stopColor="#c2410c"/>
          <stop offset="100%" stopColor="#1e0050"/>
        </linearGradient>
      </defs>
      <rect width="280" height="200" fill="url(#rt-sunset)" rx="12"/>
      {/* Sun/moon setting */}
      <circle cx="200" cy="85" r="28" fill="#fbbf24" opacity="0.2"/>
      <circle cx="200" cy="85" r="20" fill="#f59e0b" opacity="0.4"/>
      <circle cx="200" cy="85" r="14" fill="#fde68a" opacity="0.6"/>
      {/* Horizon line */}
      <rect x="0" y="130" width="280" height="70" fill="#0a0018" opacity="0.95"/>
      {/* City skyline silhouette */}
      <g fill="#0d0025" opacity="0.95">
        <rect x="0" y="115" width="20" height="55"/>
        <rect x="15" y="108" width="15" height="62"/>
        <rect x="25" y="120" width="22" height="50"/>
        <rect x="42" y="100" width="18" height="70"/>
        <rect x="54" y="112" width="12" height="58"/>
        <rect x="200" y="105" width="20" height="65"/>
        <rect x="215" y="98" width="14" height="72"/>
        <rect x="224" y="110" width="22" height="60"/>
        <rect x="240" y="103" width="18" height="67"/>
        <rect x="254" y="115" width="26" height="55"/>
      </g>
      {/* City lights twinkling */}
      {[[22,125],[36,118],[50,110],[205,113],[218,106],[230,118],[244,111]].map(([x,y],i)=>(
        <circle key={i} className="rcity" cx={x} cy={y} r="1.5" fill="#fbbf24" opacity="0.7"/>
      ))}
      {/* Rooftop floor */}
      <rect x="60" y="128" width="160" height="72" fill="#1a0030" stroke="#7c3aed33" strokeWidth="1"/>
      {/* Railing */}
      <rect x="60" y="126" width="160" height="4" rx="2" fill="#2d1b69"/>
      {[68,85,102,119,136,153,170,187,204].map((x,i)=>(
        <rect key={i} x={x} y="118" width="2" height="12" rx="1" fill="#4a2080" opacity="0.7"/>
      ))}
      {/* Hookah — elegant outdoor setup */}
      <g transform="translate(116,80)">
        <ellipse cx="24" cy="52" rx="20" ry="7" fill="#1a0030" stroke="#9d5cf444" strokeWidth="1.5"/>
        <path d="M10 48 Q8 34 12 24 Q16 16 24 12 Q32 16 36 24 Q40 34 38 48Z" fill="#12001e" stroke="#7c3aed55" strokeWidth="1.5"/>
        <rect x="21.5" y="3" width="5" height="11" rx="2.5" fill="#7c3aed"/>
        <path d="M13 3 Q24 -3 35 3 L33 10 Q24 5 15 10Z" fill="#9d5cf4"/>
        <ellipse cx="24" cy="1" rx="11" ry="4" fill="#ff6b35" opacity="0.85"/>
        <ellipse cx="24" cy="0" rx="7" ry="2.5" fill="#ffa040"/>
        <path d="M36 35 Q55 32 65 42" stroke="#7c3aed" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M12 35 Q-7 32 -17 42" stroke="#9d5cf4" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      </g>
      {/* Smoke */}
      <g transform="translate(140,80)">
        <ellipse className="rs1" cx="0" cy="0" rx="5" ry="9" fill="rgba(157,92,245,0.45)"/>
        <ellipse className="rs2" cx="3" cy="-4" rx="7" ry="12" fill="rgba(232,121,249,0.3)"/>
      </g>
      {/* 2 people at railing looking at city */}
      <g className="rb" transform="translate(74,98)">
        <path d="M2 32 Q12 28 22 32" stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="6" y="12" width="13" height="20" rx="6.5" fill="#a78bfa"/>
        <circle cx="12" cy="6" r="9" fill="#c4b5fd"/>
        <path d="M4 4 Q12 -3 20 4" fill="#5b21b6"/>
        {/* Arm on railing */}
        <path d="M19 20 Q30 22 38 22" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/>
      </g>
      <g className="rb" transform="translate(175,98)">
        <path d="M2 32 Q12 28 22 32" stroke="#fb923c" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <rect x="6" y="12" width="13" height="20" rx="6.5" fill="#f97316"/>
        <circle cx="12" cy="6" r="9" fill="#fdba74"/>
        <path d="M4 4 Q12 -3 20 4" fill="#7c2d12"/>
        <path d="M2 20 Q-9 22 -17 22" stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
      </g>
      {/* Outdoor lanterns */}
      <g>
        <line x1="85" y1="128" x2="85" y2="118" stroke="#4a2080" strokeWidth="2"/>
        <rect x="80" y="116" width="10" height="14" rx="3" fill="#1a0030" stroke="#7c3aed44" strokeWidth="1"/>
        <rect x="82" y="118" width="6" height="10" rx="2" fill="#fbbf24" opacity="0.4"/>
      </g>
      <g>
        <line x1="195" y1="128" x2="195" y2="118" stroke="#4a2080" strokeWidth="2"/>
        <rect x="190" y="116" width="10" height="14" rx="3" fill="#1a0030" stroke="#7c3aed44" strokeWidth="1"/>
        <rect x="192" y="118" width="6" height="10" rx="2" fill="#fbbf24" opacity="0.4"/>
      </g>
    </svg>
  );
}

function SceneCorporate() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes co-sm{0%{transform:translateY(0);opacity:0.6}100%{transform:translateY(-50px);opacity:0}}
        @keyframes co-nod{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
        @keyframes co-tab{0%,100%{opacity:0.5}50%{opacity:1}}
        .cos1{animation:co-sm 3.4s ease-in infinite}
        .cos2{animation:co-sm 4s ease-in infinite 1.2s}
        .co-nd{animation:co-nod 3s ease-in-out infinite;transform-origin:50% 100%}
        .co-tb{animation:co-tab 2.5s ease-in-out infinite}
      `}</style>
      <rect width="280" height="200" fill="url(#co-bg)" rx="12"/>
      <defs>
        <linearGradient id="co-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0c1a2e"/>
          <stop offset="100%" stopColor="#05030a"/>
        </linearGradient>
      </defs>
      {/* Window — city view in bg */}
      <rect x="20" y="15" width="240" height="90" rx="4" fill="#071428" stroke="#1e3a5f" strokeWidth="1.5"/>
      <rect x="22" y="17" width="236" height="86" rx="3" fill="url(#co-window)"/>
      <defs>
        <linearGradient id="co-window" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a1f35"/>
          <stop offset="100%" stopColor="#071020"/>
        </linearGradient>
      </defs>
      {/* City through window */}
      {[[30,60,35],[60,45,25],[90,55,20],[120,40,30],[155,50,22],[185,42,28],[215,58,24],[240,48,26]].map(([x,y,w],i)=>(
        <rect key={i} x={x} y={y} width={w} height={103-y} fill="#0d2040" opacity="0.9"/>
      ))}
      {[[40,80],[70,65],[100,72],[130,60],[160,70],[195,62],[220,75]].map(([x,y],i)=>(
        <circle key={i} className="co-tb" cx={x} cy={y} r="1.5" fill="#63b3ed" opacity="0.7"/>
      ))}
      {/* Conference table */}
      <ellipse cx="140" cy="168" rx="110" ry="20" fill="#0c1a2e" stroke="#1e3a5f" strokeWidth="2"/>
      <ellipse cx="140" cy="163" rx="100" ry="14" fill="#091526"/>
      {/* Hookah centerpiece */}
      <g transform="translate(120,100)">
        <ellipse cx="20" cy="65" rx="18" ry="6" fill="#0c1a2e" stroke="#63b3ed44" strokeWidth="1.5"/>
        <path d="M8 62 Q6 46 10 35 Q14 25 20 22 Q26 25 30 35 Q34 46 32 62Z" fill="#071020" stroke="#3b82f644" strokeWidth="1.5"/>
        <rect x="17.5" y="6" width="5" height="18" rx="2.5" fill="#3b82f6"/>
        <path d="M10 6 Q20 0 30 6 L28 13 Q20 8 12 13Z" fill="#60a5fa"/>
        <ellipse cx="20" cy="4" rx="10" ry="3.5" fill="#ff6b35" opacity="0.8"/>
        <ellipse cx="20" cy="3" rx="6" ry="2" fill="#ffa040"/>
        {/* Multiple short hoses around the table */}
        <path d="M30 40 Q50 37 62 45" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M10 40 Q-10 37 -22 45" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M20 63 Q20 75 20 80" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
      {/* Smoke */}
      <g transform="translate(140,100)">
        <ellipse className="cos1" cx="0" cy="0" rx="4" ry="8" fill="rgba(99,179,237,0.35)"/>
        <ellipse className="cos2" cx="3" cy="-4" rx="6" ry="10" fill="rgba(59,130,246,0.25)"/>
      </g>
      {/* People at table — 4 silhouettes */}
      {[
        { x: 28, y: 138, c: "#60a5fa", hc: "#1e3a5f" },
        { x: 86, y: 140, c: "#34d399", hc: "#064e3b" },
        { x: 168, y: 140, c: "#f472b6", hc: "#831843" },
        { x: 220, y: 138, c: "#fbbf24", hc: "#78350f" },
      ].map((p, i) => (
        <g key={i} className="co-nd" transform={`translate(${p.x},${p.y})`}>
          <rect x="4" y="16" width="14" height="22" rx="7" fill={p.c}/>
          <circle cx="11" cy="10" r="9.5" fill={p.c} opacity="0.9"/>
          <path d={`M3 8 Q11 0 19 8`} fill={p.hc}/>
          {/* Tablet/phone on table */}
          <rect x="2" y="35" width="18" height="12" rx="3" fill={p.hc} opacity="0.6"/>
          <rect x="4" y="37" width="14" height="8" rx="2" fill={p.c} opacity="0.25"/>
        </g>
      ))}
    </svg>
  );
}

function SceneWedding() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes wd-petal{0%{transform:translate(0,0)rotate(0deg);opacity:0.8}100%{transform:translate(var(--px),60px)rotate(360deg);opacity:0}}
        @keyframes wd-sm{0%{transform:translateY(0);opacity:0.6}100%{transform:translateY(-65px);opacity:0}}
        @keyframes wd-glow{0%,100%{opacity:0.3}50%{opacity:0.8}}
        @keyframes wd-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes wd-twinkle{0%,100%{opacity:0;transform:scale(0.5)}50%{opacity:1;transform:scale(1)}}
        .ws1{animation:wd-sm 3.5s ease-in infinite}
        .ws2{animation:wd-sm 4s ease-in infinite 1.1s}
        .ws3{animation:wd-sm 3.8s ease-in infinite 2.2s}
        .wg{animation:wd-glow 3s ease-in-out infinite}
        .wb1{animation:wd-bob 4s ease-in-out infinite}
        .wb2{animation:wd-bob 4.5s ease-in-out infinite 0.5s}
        .wt1{animation:wd-twinkle 1.8s ease-in-out infinite 0s}
        .wt2{animation:wd-twinkle 2.2s ease-in-out infinite 0.6s}
        .wt3{animation:wd-twinkle 1.5s ease-in-out infinite 1.2s}
        .wp1{--px:-15px;animation:wd-petal 4s ease-in infinite}
        .wp2{--px:20px;animation:wd-petal 5s ease-in infinite 1.2s}
        .wp3{--px:-5px;animation:wd-petal 4.5s ease-in infinite 2.4s}
      `}</style>
      <rect width="280" height="200" fill="url(#wd-bg)" rx="12"/>
      <defs>
        <radialGradient id="wd-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#2d0a2e"/>
          <stop offset="100%" stopColor="#05030a"/>
        </radialGradient>
      </defs>
      {/* Fairy light strings */}
      {[0,1,2].map(i=>(
        <path key={i} d={`M0 ${20+i*18} Q70 ${12+i*18} 140 ${20+i*18} Q210 ${28+i*18} 280 ${20+i*18}`}
          stroke="rgba(255,240,200,0.15)" strokeWidth="1" fill="none"/>
      ))}
      {/* Fairy lights */}
      {[[25,18],[60,12],[95,20],[130,14],[168,22],[205,16],[240,20],[15,36],[55,30],[100,38],[145,32],[185,40],[225,34],[265,36]].map(([x,y],i)=>(
        <circle key={i} className={`wt${(i%3)+1}`} cx={x} cy={y} r="2.5" fill="#fffde7" opacity="0.85"/>
      ))}
      {/* Falling petals */}
      <ellipse className="wp1" cx="80" cy="40" rx="5" ry="3" fill="#f9a8d4" opacity="0.7"/>
      <ellipse className="wp2" cx="180" cy="30" rx="5" ry="3" fill="#fda4af" opacity="0.7"/>
      <ellipse className="wp3" cx="140" cy="50" rx="4" ry="3" fill="#f472b6" opacity="0.6"/>
      {/* Grand hookah — center stage */}
      <g transform="translate(110,48)">
        <ellipse cx="30" cy="110" rx="30" ry="10" fill="#2d0a2e" stroke="#f9a8d488" strokeWidth="2"/>
        <path d="M12 106 Q10 80 15 60 Q20 44 30 38 Q40 44 45 60 Q50 80 48 106Z" fill="#1a0525" stroke="#e879f966" strokeWidth="2"/>
        <path d="M18 92 Q16 72 20 58 Q24 48 30 44 Q36 48 40 58 Q44 72 42 92Z" fill="rgba(232,121,249,0.1)"/>
        {/* Crystal/glass effect */}
        <path d="M16 78 Q14 70 16 62" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
        <path d="M44 78 Q46 70 44 62" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
        <rect x="27" y="16" width="6" height="24" rx="3" fill="#e879f9"/>
        <path d="M14 16 Q30 6 46 16 L44 26 Q30 18 16 26Z" fill="#f472b6" stroke="#fda4af55" strokeWidth="1.5"/>
        <ellipse cx="30" cy="13" rx="16" ry="5.5" fill="#ff6b35" opacity="0.9"/>
        <ellipse cx="30" cy="12" rx="10" ry="3.5" fill="#ffa040"/>
        <ellipse className="wg" cx="30" cy="10" rx="6" ry="2.5" fill="white" opacity="0.5"/>
        {/* Multiple hoses */}
        <path d="M48 72 Q75 67 88 80" stroke="#e879f9" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M12 72 Q-15 67 -28 80" stroke="#f472b6" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M48 84 Q72 90 82 105" stroke="#e879f9" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M12 84 Q-12 90 -22 105" stroke="#f472b6" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        {/* Rose on hookah */}
        <circle cx="30" cy="14" r="6" fill="#f472b6" opacity="0.5"/>
        <circle cx="30" cy="14" r="3" fill="#fda4af"/>
      </g>
      {/* Smoke */}
      <g transform="translate(140,48)">
        <ellipse className="ws1" cx="0" cy="0" rx="5" ry="10" fill="rgba(249,168,212,0.4)"/>
        <ellipse className="ws2" cx="4" cy="-6" rx="7" ry="13" fill="rgba(244,114,182,0.3)"/>
        <ellipse className="ws3" cx="-3" cy="-3" rx="5" ry="9" fill="rgba(232,121,249,0.35)"/>
      </g>
      {/* Couple — bride & groom */}
      <g className="wb1" transform="translate(45,115)">
        {/* Groom */}
        <rect x="8" y="26" width="14" height="32" rx="7" fill="#1e293b"/>
        <rect x="10" y="28" width="10" height="28" rx="5" fill="#334155" opacity="0.7"/>
        {/* Bow tie */}
        <path d="M12 33 L8 30 L12 27 L16 30Z" fill="white"/>
        <path d="M16 33 L20 30 L16 27 L12 30Z" fill="white"/>
        <circle cx="15" cy="14" r="11" fill="#e2d9f3"/>
        <path d="M5 12 Q15 3 25 12" fill="#1e1b4b"/>
        <path d="M11 15 Q15 18 19 15" stroke="#1e1b4b" strokeWidth="1.5" fill="none"/>
      </g>
      <g className="wb2" transform="translate(186,110)">
        {/* Bride */}
        {/* Dress — flowing */}
        <path d="M8 58 Q2 70 0 82 Q14 78 24 82 Q26 70 20 58Z" fill="white" opacity="0.95"/>
        <path d="M8 58 Q14 62 20 58" fill="white"/>
        <rect x="8" y="30" width="12" height="30" rx="6" fill="white" opacity="0.95"/>
        <circle cx="14" cy="20" r="11" fill="#fce7f3"/>
        {/* Veil */}
        <path d="M4 18 Q14 10 24 18 Q30 30 28 48" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
        {/* Flowers in hair */}
        <circle cx="6" cy="14" r="4" fill="#f9a8d4" opacity="0.9"/>
        <circle cx="4" cy="14" r="2" fill="#fda4af"/>
        <path d="M10 21 Q14 24 18 21" stroke="#9d174d" strokeWidth="1.5" fill="none"/>
      </g>
      {/* Flower arch above hookah */}
      <path d="M100 50 Q140 20 180 50" stroke="#f472b6" strokeWidth="2" fill="none" opacity="0.5"/>
      {[105,120,140,160,175].map((x,i)=>(
        <circle key={i} cx={x} cy={50-Math.sin((x-100)/80*Math.PI)*30} r="5" fill="#f9a8d4" opacity="0.6"/>
      ))}
    </svg>
  );
}

function SceneCustom() {
  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <style>{`
        @keyframes cx-spin{to{transform:rotate(360deg)}}
        @keyframes cx-pulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.1);opacity:1}}
        @keyframes cx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes cx-trail{0%{stroke-dashoffset:400}100%{stroke-dashoffset:0}}
        @keyframes cx-dot{0%,100%{opacity:0.2;r:3}50%{opacity:1;r:5}}
        .cx-sp{animation:cx-spin 12s linear infinite;transform-origin:140px 100px}
        .cx-p1{animation:cx-pulse 2.4s ease-in-out infinite}
        .cx-p2{animation:cx-pulse 2.8s ease-in-out infinite 0.5s}
        .cx-p3{animation:cx-pulse 2.2s ease-in-out infinite 1s}
        .cx-fl{animation:cx-float 4s ease-in-out infinite}
        .cx-tr{animation:cx-trail 4s linear infinite}
        .cx-d1{animation:cx-dot 1.8s ease-in-out infinite 0s}
        .cx-d2{animation:cx-dot 2s ease-in-out infinite 0.4s}
        .cx-d3{animation:cx-dot 2.2s ease-in-out infinite 0.8s}
        .cx-d4{animation:cx-dot 1.6s ease-in-out infinite 1.2s}
        .cx-d5{animation:cx-dot 2.4s ease-in-out infinite 1.6s}
      `}</style>
      <rect width="280" height="200" fill="#05030a" rx="12"/>
      {/* Constellation/orbit ring */}
      <ellipse className="cx-sp" cx="140" cy="100" rx="100" ry="60" stroke="rgba(255,107,53,0.15)" strokeWidth="1" fill="none" strokeDasharray="8 6"/>
      {/* Orbiting flavour dots */}
      <circle className="cx-d1" cx="40" cy="100" r="4" fill="#e879f9"/>
      <circle className="cx-d2" cx="240" cy="100" r="4" fill="#22d3ee"/>
      <circle className="cx-d3" cx="140" cy="40" r="4" fill="#f59e0b"/>
      <circle className="cx-d4" cx="140" cy="160" r="4" fill="#34d399"/>
      <circle className="cx-d5" cx="80" cy="58" r="3" fill="#ff6b35"/>
      {/* Central glowing hookah — abstract/futuristic */}
      <g className="cx-fl">
        {/* Core glow */}
        <circle cx="140" cy="100" r="35" fill="rgba(255,107,53,0.06)"/>
        <circle cx="140" cy="100" r="22" fill="rgba(255,107,53,0.1)"/>
        {/* Hookah silhouette — minimal and beautiful */}
        <ellipse cx="140" cy="148" rx="28" ry="9" fill="rgba(255,107,53,0.2)" stroke="#ff6b3555" strokeWidth="1.5"/>
        <path d="M124 144 Q122 120 126 105 Q130 92 140 88 Q150 92 154 105 Q158 120 156 144Z"
          fill="rgba(255,107,53,0.15)" stroke="#ff6b3577" strokeWidth="1.5"/>
        <rect x="137.5" y="65" width="5" height="25" rx="2.5" fill="#ff6b35" opacity="0.9"/>
        <path d="M128 65 Q140 57 152 65 L150 72 Q140 66 130 72Z" fill="#ff6b35"/>
        <ellipse cx="140" cy="63" rx="13" ry="4.5" fill="#ffa040" opacity="0.8"/>
        {/* Radiating lines from bowl */}
        {Array.from({length:8},(_,i)=>{
          const a=(i*45)*Math.PI/180;
          return <line key={i} x1={140+Math.cos(a)*15} y1={63+Math.sin(a)*5} x2={140+Math.cos(a)*28} y2={63+Math.sin(a)*10}
            stroke="#ff6b35" strokeWidth="1" opacity="0.4"/>;
        })}
      </g>
      {/* Trailing path suggesting freedom/customization */}
      <path className="cx-tr" d="M50 150 Q80 80 140 100 Q200 120 230 60" stroke="rgba(255,107,53,0.3)" strokeWidth="1.5"
        fill="none" strokeDasharray="400" strokeDashoffset="400"/>
      {/* Colour palette dots floating */}
      <circle className="cx-p1" cx="55" cy="55" r="10" fill="#e879f9" opacity="0.6"/>
      <circle className="cx-p2" cx="220" cy="145" r="8" fill="#22d3ee" opacity="0.6"/>
      <circle className="cx-p3" cx="230" cy="55" r="9" fill="#f59e0b" opacity="0.6"/>
      {/* Label: infinite possibilities */}
      <text x="140" y="185" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fill="rgba(255,107,53,0.5)" letterSpacing="3">
        ANYTHING · ANYWHERE
      </text>
    </svg>
  );
}

const SCENE_MAP: Record<string, React.ComponentType> = {
  solo:      SceneSolo,
  duo:       SceneDuo,
  squad:     SceneSquad,
  vip:       SceneVIP,
  rooftop:   SceneRooftop,
  corporate: SceneCorporate,
  wedding:   SceneWedding,
  custom:    SceneCustom,
};

// ─── Session Detail Modal ─────────────────────────────────────────────────────

function SessionModal({
  session,
  onClose,
  onBook,
}: {
  session: SessionTier | null;
  onClose: () => void;
  onBook: (s: SessionTier) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session || !contentRef.current || !backdropRef.current) return;
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(contentRef.current,
      { y: 80, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)" }
    );
  }, [session]);

  const close = useCallback(() => {
    if (!contentRef.current || !backdropRef.current) { onClose(); return; }
    gsap.to(contentRef.current, { y: 40, opacity: 0, scale: 0.95, duration: 0.25, ease: "power2.in" });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
  }, [onClose]);

  if (!session) return null;
  const Scene = SCENE_MAP[session.id] ?? SceneSolo;

  return (
    <div ref={backdropRef} onClick={close} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(5,3,10,0.8)",
      backdropFilter: "blur(10px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div ref={contentRef} onClick={e => e.stopPropagation()} style={{
        width: "min(720px,100%)",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "var(--nebula-mid)",
        border: `1px solid ${session.color}44`,
        borderRadius: "28px 28px 0 0",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Scene illustration header */}
        <div style={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          borderRadius: "28px 28px 0 0",
          flexShrink: 0,
        }}>
          <Scene />
          {/* Gradient overlay so text reads */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, var(--nebula-mid) 0%, rgba(18,13,40,0.5) 60%, transparent 100%)`,
          }}/>
          {/* Name over illustration */}
          <div style={{ position: "absolute", bottom: 20, left: 28, right: 60 }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.3em",
              color: session.color, textTransform: "uppercase", marginBottom: 6,
            }}>
              {session.mood}
            </p>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px,5vw,52px)",
              fontWeight: 600,
              fontStyle: "italic",
              color: "white",
              lineHeight: 1,
            }}>
              {session.name}
            </h2>
          </div>
          {/* Close */}
          <button onClick={close} style={{
            position: "absolute", top: 16, right: 16,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.7)", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Vibe text */}
          <p style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: 18, lineHeight: 1.6,
            color: "rgba(255,255,255,0.65)",
          }}>
            "{session.vibe}"
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { icon: "⏱", label: "Duration", value: session.duration },
              { icon: "👥", label: "Capacity", value: typeof session.people === "number" ? `${session.people} ${session.people === 1 ? "person" : "people"}` : "Custom" },
              { icon: "✦", label: "Vibe", value: session.mood },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                flex: 1, minWidth: 120,
                padding: "12px 16px",
                background: `${session.color}0d`,
                border: `1px solid ${session.color}28`,
                borderRadius: 12,
              }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 4 }}>{icon} {label}</p>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* What's included */}
          {session.equipment.length > 0 && (
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>
                What's included
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {session.equipment.map(eq => (
                  <div key={eq} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-serif)", fontSize: 15, color: "rgba(255,255,255,0.72)" }}>
                    <span style={{ color: session.color, fontFamily: "var(--font-mono)", fontSize: 12 }}>✓</span>
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom pricing */}
          {session.isCustom && (
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 12 }}>Starting rates</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: "Base setup", value: kes(CUSTOM_PRICING.base) },
                  { label: "Per hookah", value: kes(CUSTOM_PRICING.perHookah) },
                  { label: "Per person", value: kes(CUSTOM_PRICING.perPerson) },
                  { label: "Per flavour", value: kes(CUSTOM_PRICING.perFlavour) },
                  { label: "Extra hour", value: kes(CUSTOM_PRICING.extraHour) },
                  { label: "Host/hr", value: kes(CUSTOM_PRICING.hostPerHour) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "8px 14px", background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.22)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                    <span style={{ color: "var(--orange)", fontWeight: 700 }}>{value}</span>
                    <span style={{ marginLeft: 5 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 16, borderTop: `1px solid ${session.color}1a` }}>
            <div>
              {!session.isCustom ? (
                <>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 2 }}>from</p>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 44, fontWeight: 600, color: "var(--gold)", lineHeight: 1 }}>{kes(session.price)}</p>
                </>
              ) : (
                <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 17, color: "var(--orange)" }}>Priced to your vision</p>
              )}
            </div>
            <button onClick={() => onBook(session)} className="btn-primary" style={{ fontSize: 14, padding: "14px 32px", flexShrink: 0 }}>
              {session.isCustom ? "Design My Vibe ↗" : "Reserve This Session ↗"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({
  session,
  onSelect,
  isMobile,
}: {
  session: SessionTier;
  onSelect: (s: SessionTier) => void;
  isMobile: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Scene = SCENE_MAP[session.id] ?? SceneSolo;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: x * 12, rotateX: -y * 8,
      transformPerspective: 1000,
      duration: 0.4, ease: "power2.out",
    });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,0.6)" });
  }, []);

  const pointerDownPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    // Only treat as a tap if movement < 8px (not a scroll drag)
    if (dx > 8 || dy > 8) return;
    if (!cardRef.current) { onSelect(session); return; }
    gsap.to(cardRef.current, {
      scale: 0.97, duration: 0.1,
      onComplete: () => gsap.to(cardRef.current, {
        scale: 1, duration: 0.35, ease: "elastic.out(1.2,0.5)",
        onComplete: () => onSelect(session),
      }),
    });
  }, [onSelect, session]);

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseMove={handleMouseMove}
      data-session-card
      style={{
        width: isMobile ? "min(340px,88vw)" : 360,
        flexShrink: 0,
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(13,10,30,0.95)",
        border: `1px solid ${session.color}2a`,
        willChange: "transform",
        transformStyle: "preserve-3d",
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        boxShadow: `0 4px 40px rgba(0,0,0,0.5)`,
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 60px ${session.color}33, 0 4px 40px rgba(0,0,0,0.6)`;
        (e.currentTarget as HTMLElement).style.borderColor = `${session.color}55`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 40px rgba(0,0,0,0.5)`;
        (e.currentTarget as HTMLElement).style.borderColor = `${session.color}2a`;
        if (cardRef.current) gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,0.6)" });
      }}
    >
      {/* Scene illustration */}
      <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
        <Scene />
        {/* Bottom gradient fade into card body */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(13,10,30,1) 0%, rgba(13,10,30,0.2) 50%, transparent 100%)",
        }}/>
        {/* Popular badge */}
        {session.popular && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(245,158,11,0.18)",
            border: "1px solid rgba(245,158,11,0.45)",
            borderRadius: 30,
            padding: "4px 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.15em",
            color: "var(--gold)", textTransform: "uppercase",
          }}>
            ★ Most loved
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "4px 24px 24px" }}>
        {/* Mood chip */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 10,
          padding: "4px 12px",
          background: `${session.color}15`,
          border: `1px solid ${session.color}30`,
          borderRadius: 30,
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.18em", color: session.color,
          textTransform: "uppercase",
        }}>
          {session.emoji} {session.mood}
        </div>

        {/* Name — Cormorant Garamond — executive serif */}
        <h3 style={{
          fontFamily: "var(--font-serif)",
          fontSize: 34,
          fontWeight: 600,
          fontStyle: "italic",
          color: "white",
          lineHeight: 1,
          letterSpacing: "-0.01em",
          marginBottom: 6,
        }}>
          {session.name}
        </h3>

        {/* Tagline */}
        <p style={{
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.5,
          marginBottom: 16,
          fontStyle: "italic",
        }}>
          {session.tagline}
        </p>

        {/* Meta row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: session.color,
            background: `${session.color}15`,
            border: `1px solid ${session.color}28`,
            borderRadius: 4, padding: "3px 9px",
          }}>
            ⏱ {session.duration}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "rgba(255,255,255,0.45)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 4, padding: "3px 9px",
          }}>
            👥 {session.people}{typeof session.people === "number" && session.people === 1 ? " person" : typeof session.people === "number" ? " people" : ""}
          </span>
        </div>

        {/* Price + CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 16,
          borderTop: `1px solid ${session.color}18`,
        }}>
          <div>
            {!session.isCustom ? (
              <>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 2 }}>from</p>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 600, color: "var(--gold)", lineHeight: 1 }}>
                  {kes(session.price)}
                </p>
              </>
            ) : (
              <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15, color: "var(--orange)" }}>Custom pricing</p>
            )}
          </div>
          <div style={{
            fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: session.color, display: "flex", alignItems: "center", gap: 6,
          }}>
            Explore →
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function SessionsSection() {
  const setBookingOpen    = useStore(s => s.setBookingOpen);
  const setBookingSession = useStore(s => s.setBookingSession);
  const isMobile = useIsMobile();

  const [selected, setSelected] = useState<SessionTier | null>(null);

  const sectionRef   = useRef<HTMLElement>(null);
  const headerRef    = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const dotContRef   = useRef<HTMLDivElement>(null);

  // Momentum scroll state
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, velX: 0, lastX: 0, lastT: 0 });
  const rafMomentum = useRef<number>(0);

  const cancelMomentum = useCallback(() => {
    cancelAnimationFrame(rafMomentum.current);
  }, []);

  const updateProgress = useCallback(() => {
    if (!trackRef.current || !progressRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const max = scrollWidth - clientWidth;
    const pct = max <= 0 ? 0 : scrollLeft / max;
    progressRef.current.style.transform = `scaleX(${pct})`;

    if (!dotContRef.current) return;
    const dots = dotContRef.current.querySelectorAll<HTMLElement>(".sess-dot");
    const cardW = 376; // card 360 + gap 16
    const active = Math.min(Math.round(scrollLeft / cardW), SESSIONS.length - 1);
    dots.forEach((d, i) => {
      const isActive = i === active;
      d.style.width = isActive ? "28px" : "8px";
      d.style.opacity = isActive ? "1" : "0.3";
      d.style.background = isActive ? (SESSIONS[i]?.color ?? "white") : "rgba(255,255,255,0.4)";
    });
  }, []);

  // Momentum physics
  const startMomentum = useCallback(() => {
    cancelAnimationFrame(rafMomentum.current);
    const track = trackRef.current;
    if (!track) return;
    let vel = drag.current.velX * -1;

    const step = () => {
      if (Math.abs(vel) < 0.3) return;
      track.scrollLeft += vel;
      vel *= 0.94;
      updateProgress();
      rafMomentum.current = requestAnimationFrame(step);
    };
    rafMomentum.current = requestAnimationFrame(step);
  }, [updateProgress]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!trackRef.current) return;
    // Only handle primary button (left click / touch)
    if (e.button !== 0 && e.pointerType === "mouse") return;
    cancelMomentum();
    drag.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: trackRef.current.scrollLeft,
      velX: 0,
      lastX: e.clientX,
      lastT: performance.now(),
    };
    trackRef.current.style.cursor = "grabbing";
    // Do NOT setPointerCapture — that swallows card click events
  }, [cancelMomentum]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active || !trackRef.current) return;
    const dx = e.clientX - drag.current.startX;
    trackRef.current.scrollLeft = drag.current.scrollLeft - dx;

    const now = performance.now();
    const dt = now - drag.current.lastT;
    if (dt > 0) {
      drag.current.velX = (e.clientX - drag.current.lastX) / dt * 16;
    }
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
    updateProgress();
  }, [updateProgress]);

  const onPointerUp = useCallback(() => {
    if (!trackRef.current) return;
    drag.current.active = false;
    trackRef.current.style.cursor = "grab";
    startMomentum();
  }, [startMomentum]);

  // Scroll snap to nearest card after momentum
  const snapToCard = useCallback(() => {
    if (!trackRef.current) return;
    const cardW = 376;
    const nearest = Math.round(trackRef.current.scrollLeft / cardW) * cardW;
    gsap.to(trackRef.current, {
      scrollLeft: nearest,
      duration: 0.4,
      ease: "power3.out",
      onUpdate: updateProgress,
    });
  }, [updateProgress]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    // Wheel — native smooth
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelMomentum();
      track.scrollLeft += e.deltaY * 1.2;
      updateProgress();
    };
    track.addEventListener("wheel", onWheel, { passive: false });

    // Snap on idle after pointer drag
    let snapTimer: ReturnType<typeof setTimeout>;
    const onScrollEnd = () => {
      clearTimeout(snapTimer);
      if (!drag.current.active) {
        snapTimer = setTimeout(snapToCard, 180);
      }
    };
    track.addEventListener("scroll", onScrollEnd, { passive: true });

    return () => {
      track.removeEventListener("scroll", updateProgress);
      track.removeEventListener("wheel", onWheel);
      track.removeEventListener("scroll", onScrollEnd);
      cancelMomentum();
    };
  }, [updateProgress, cancelMomentum, snapToCard]);

  // Section entrance
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true } }
      );
      const cards = trackRef.current?.querySelectorAll<HTMLElement>("[data-session-card]");
      if (cards?.length) {
        gsap.fromTo(Array.from(cards),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSelect = useCallback((s: SessionTier) => {
    if (s.isCustom) { setBookingSession(s); setBookingOpen(true); }
    else setSelected(s);
  }, [setBookingOpen, setBookingSession]);

  const handleBook = useCallback((s: SessionTier) => {
    setBookingSession(s);
    setBookingOpen(true);
    setSelected(null);
  }, [setBookingSession, setBookingOpen]);

  const scrollBy = useCallback((dir: "left" | "right") => {
    if (!trackRef.current) return;
    cancelMomentum();
    const target = trackRef.current.scrollLeft + (dir === "right" ? 376 : -376);
    gsap.to(trackRef.current, { scrollLeft: target, duration: 0.6, ease: "power3.inOut", onUpdate: updateProgress });
  }, [cancelMomentum, updateProgress]);

  return (
    <>
      <section ref={sectionRef} id="sessions" style={{
        background: "var(--nebula)",
        minHeight: "100vh",
        padding: "clamp(60px,8vw,100px) 0 80px",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Ambient blobs */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", top: "-15%", left: "-10%" }}/>
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,121,249,0.07) 0%, transparent 70%)", bottom: "-5%", right: "-5%" }}/>
        </div>

        {/* ── Header ── */}
        <div ref={headerRef} style={{
          padding: "0 clamp(20px,6vw,80px)",
          marginBottom: 52,
          position: "relative", zIndex: 1,
          opacity: 0,
        }}>
          <p className="section-label">Sessions</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 600 }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(52px,7vw,96px)",
                fontWeight: 600,
                fontStyle: "italic",
                color: "white",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}>
                Pick Your<br/>
                <span style={{ color: "var(--gold)" }}>Vibe.</span>
              </h2>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(16px,2vw,20px)",
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.6,
                maxWidth: 500,
              }}>
                Eight ways to enjoy the ritual. Solo introspection to grand celebrations — we set everything up, you just show up and breathe.
              </p>
            </div>

            {!isMobile && (
              <div style={{ display: "flex", gap: 10, flexShrink: 0, alignSelf: "flex-end", paddingBottom: 4 }}>
                {(["left","right"] as const).map(dir => (
                  <button key={dir} onClick={() => scrollBy(dir)} style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(124,58,237,0.18)"; el.style.borderColor = "rgba(124,58,237,0.45)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.04)"; el.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  >
                    {dir === "left" ? "←" : "→"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Scroll Track ── */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            ref={trackRef}
            className="no-scrollbar"
            onPointerDown={isMobile ? undefined : onPointerDown}
            onPointerMove={isMobile ? undefined : onPointerMove}
            onPointerUp={isMobile ? undefined : onPointerUp}
            onPointerCancel={isMobile ? undefined : onPointerUp}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              overflowY: "visible",
              padding: "20px clamp(20px,6vw,80px) 36px",
              cursor: isMobile ? "default" : "grab",
              WebkitOverflowScrolling: "touch",
              // Don't use CSS scroll-snap — we handle snap via JS for buttery feel
            }}
          >
            {SESSIONS.map(session => (
              <div key={session.id} style={{ flexShrink: 0 }}>
                <SessionCard session={session} onSelect={handleSelect} isMobile={isMobile} />
              </div>
            ))}
            <div style={{ width: "max(20px, calc(6vw - 16px))", flexShrink: 0 }} />
          </div>

          {/* Progress bar */}
          <div style={{
            margin: "0 clamp(20px,6vw,80px)",
            height: 1,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 1,
            overflow: "hidden",
          }}>
            <div ref={progressRef} style={{
              height: "100%", width: "100%",
              background: "linear-gradient(90deg, var(--violet), var(--magenta), var(--gold))",
              transformOrigin: "left center",
              transform: "scaleX(0)",
              borderRadius: 1,
            }}/>
          </div>

          {/* Dot indicator */}
          <div ref={dotContRef} style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
            {SESSIONS.map((s, i) => (
              <button
                key={s.id}
                className="sess-dot"
                onClick={() => {
                  if (!trackRef.current) return;
                  cancelMomentum();
                  gsap.to(trackRef.current, { scrollLeft: i * 376, duration: 0.55, ease: "power3.inOut", onUpdate: updateProgress });
                }}
                style={{
                  width: i === 0 ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === 0 ? (SESSIONS[0]?.color ?? "white") : "rgba(255,255,255,0.4)",
                  border: "none", opacity: i === 0 ? 1 : 0.3,
                  transition: "width 0.35s ease, opacity 0.35s ease, background 0.35s ease",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 40, padding: "0 5vw", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>
            All sessions include setup · teardown · premium coal management · Nairobi delivery
          </p>
        </div>
      </section>

      {selected && (
        <SessionModal session={selected} onClose={() => setSelected(null)} onBook={handleBook} />
      )}
    </>
  );
}
