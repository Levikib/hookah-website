"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RENTAL_MODELS } from "@/data/rentals";
import type { RentalModel } from "@/data/rentals";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/context/MobileContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

// ─── Animated Hookah Illustrations ───────────────────────────────────────────
// Each model gets a unique hand-crafted animated SVG — no two alike.

function HookahClassic({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <style>{`
        @keyframes hc-smoke1{0%{transform:translate(0,0)scaleX(1);opacity:.7}100%{transform:translate(-8px,-50px)scaleX(1.8);opacity:0}}
        @keyframes hc-smoke2{0%{transform:translate(0,0)scaleX(1);opacity:.5}100%{transform:translate(10px,-60px)scaleX(2);opacity:0}}
        @keyframes hc-coal{0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes hc-shine{0%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .hc-s1{animation:hc-smoke1 2.8s ease-in infinite${active ? "" : ";animation-play-state:paused"}}
        .hc-s2{animation:hc-smoke2 3.4s ease-in infinite .9s${active ? "" : ";animation-play-state:paused"}}
        .hc-coal{animation:hc-coal 1.2s ease-in-out infinite${active ? "" : ";animation-play-state:paused"}}
        .hc-shine{animation:hc-shine 3s ease-in-out infinite${active ? "" : ";animation-play-state:paused"}}
      `}</style>
      {/* Smoke */}
      <g transform="translate(60,28)">
        <ellipse className="hc-s1" cx="0" cy="0" rx="5" ry="9" fill={`${color}88`}/>
        <ellipse className="hc-s2" cx="2" cy="-5" rx="7" ry="12" fill={`${color}55`}/>
      </g>
      {/* Coal glow */}
      <ellipse className="hc-coal" cx="60" cy="32" rx="18" ry="6" fill={color} opacity=".9"/>
      <ellipse cx="60" cy="31" rx="11" ry="4" fill="white" opacity=".3"/>
      {/* Bowl — wide, classic shape */}
      <path d="M36 32 Q32 52 38 62 Q48 70 60 71 Q72 70 82 62 Q88 52 84 32Z" fill={color} opacity=".85"/>
      <path d="M44 36 Q40 52 44 60 Q50 66 58 67" stroke="white" strokeWidth="1.5" fill="none" opacity=".2"/>
      {/* Bowl neck */}
      <rect x="55" y="71" width="10" height="14" rx="4" fill={color} opacity=".75"/>
      {/* Tray */}
      <ellipse cx="60" cy="87" rx="28" ry="9" fill={color} opacity=".6"/>
      <ellipse cx="60" cy="87" rx="20" ry="6" fill={color} opacity=".35"/>
      {/* Shaft — ornate brass */}
      <rect x="57" y="96" width="6" height="100" rx="3" fill={color} opacity=".7"/>
      {/* Rings */}
      <ellipse cx="60" cy="118" rx="10" ry="4" fill={color} opacity=".9"/>
      <ellipse cx="60" cy="118" rx="7" ry="2.5" fill="white" opacity=".15"/>
      <ellipse cx="60" cy="148" rx="9" ry="3.5" fill={color} opacity=".85"/>
      <ellipse cx="60" cy="175" rx="8" ry="3" fill={color} opacity=".8"/>
      {/* Vase — teardrop */}
      <path d="M36 196 Q28 218 34 238 Q42 258 60 261 Q78 258 86 238 Q92 218 84 196Z" fill={color} opacity=".8"/>
      <path d="M42 200 Q36 220 40 238 Q44 250 52 256" stroke="white" strokeWidth="2" fill="none" opacity=".18"/>
      {/* Water shimmer in vase */}
      <ellipse className="hc-shine" cx="60" cy="228" rx="18" ry="5" fill="white" opacity=".07"/>
      {/* Base */}
      <ellipse cx="60" cy="262" rx="32" ry="10" fill={color} opacity=".75"/>
      <ellipse cx="60" cy="266" rx="22" ry="7" fill={color} opacity=".5"/>
      {/* Hose port */}
      <circle cx="82" cy="220" r="5.5" fill={color} opacity=".9"/>
      {/* Hose */}
      <path d="M87 220 Q110 212 114 232 Q118 252 100 258 Q88 263 85 256" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity=".65"/>
      <ellipse cx="85" cy="256" rx="6" ry="4" fill={color} opacity=".85"/>
    </svg>
  );
}

function HookahPhantom({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <style>{`
        @keyframes hp-sm{0%{transform:translate(0,0);opacity:.6}100%{transform:translate(5px,-55px);opacity:0}}
        @keyframes hp-pulse{0%,100%{opacity:.5}50%{opacity:.9}}
        @keyframes hp-hose{0%,100%{transform:rotate(0deg)}50%{transform:rotate(1.5deg)}}
        .hp-s1{animation:hp-sm 3s ease-in infinite${active?"":";animation-play-state:paused"}}
        .hp-s2{animation:hp-sm 3.6s ease-in infinite 1.1s${active?"":";animation-play-state:paused"}}
        .hp-p{animation:hp-pulse 2s ease-in-out infinite${active?"":";animation-play-state:paused"}}
        .hp-h{animation:hp-hose 4s ease-in-out infinite${active?"":";animation-play-state:paused"};transform-origin:82px 225px}
      `}</style>
      {/* Smoke — thin, mysterious */}
      <g transform="translate(60,26)">
        <ellipse className="hp-s1" cx="0" cy="0" rx="3" ry="7" fill={`${color}99`}/>
        <ellipse className="hp-s2" cx="3" cy="-4" rx="4" ry="9" fill={`${color}66`}/>
      </g>
      {/* Coal — ember glow */}
      <ellipse className="hp-p" cx="60" cy="30" rx="14" ry="5" fill={color} opacity=".8"/>
      <ellipse cx="60" cy="30" rx="7" ry="2.5" fill="#ff4444" opacity=".6"/>
      {/* Bowl — angular, modern */}
      <path d="M40 30 L38 58 L48 66 L60 68 L72 66 L82 58 L80 30Z" fill="#1a1a2e" stroke={color} strokeWidth="1.5" opacity=".95"/>
      <path d="M46 35 L44 56 L50 62" stroke={color} strokeWidth=".8" fill="none" opacity=".4"/>
      {/* Collar */}
      <rect x="53" y="68" width="14" height="10" rx="2" fill={color} opacity=".8"/>
      {/* Tray — angular */}
      <path d="M35 80 L85 80 L90 90 L30 90Z" fill="#111122" stroke={color} strokeWidth="1" opacity=".9"/>
      {/* Shaft — dead straight, matte black */}
      <rect x="57.5" y="90" width="5" height="115" fill="#111122" stroke={color} strokeWidth=".8" opacity=".95"/>
      {/* Accent bands */}
      {[115, 145, 170].map((y, i) => (
        <rect key={i} x="54" y={y} width="12" height="4" rx="2" fill={color} opacity=".7"/>
      ))}
      {/* Vase — cylindrical, architectural */}
      <rect x="34" y="206" width="52" height="56" rx="8" fill="#111122" stroke={color} strokeWidth="1.5" opacity=".95"/>
      <rect x="38" y="210" width="44" height="48" rx="6" fill="#0a0a18" opacity=".8"/>
      {/* Vertical lines on vase */}
      {[44,52,60,68,76].map((x,i) => (
        <line key={i} x1={x} y1="214" x2={x} y2="254" stroke={color} strokeWidth=".5" opacity=".25"/>
      ))}
      {/* Base */}
      <rect x="28" y="260" width="64" height="12" rx="4" fill={color} opacity=".7"/>
      <rect x="32" y="264" width="56" height="6" rx="3" fill="#111122" opacity=".8"/>
      {/* Hose */}
      <g className="hp-h">
        <path d="M86 225 Q112 218 116 240 Q118 258 102 262 Q90 265 87 258" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" opacity=".7"/>
        <ellipse cx="87" cy="258" rx="5.5" ry="3.5" fill={color} opacity=".9"/>
      </g>
      <circle cx="83" cy="225" r="5" fill={color} opacity=".9"/>
    </svg>
  );
}

function HookahSultan({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <style>{`
        @keyframes hs-sm{0%{transform:translate(0,0)scaleX(1);opacity:.8}100%{transform:translate(-6px,-65px)scaleX(2.2);opacity:0}}
        @keyframes hs-sm2{0%{transform:translate(0,0);opacity:.6}100%{transform:translate(10px,-70px);opacity:0}}
        @keyframes hs-glow{0%,100%{opacity:.6;filter:blur(2px)}50%{opacity:1;filter:blur(4px)}}
        @keyframes hs-orbit{0%{transform:rotate(0deg)translateX(22px)}100%{transform:rotate(360deg)translateX(22px)}}
        @keyframes hs-shine{0%,100%{opacity:.08}50%{opacity:.18}}
        .hs-s1{animation:hs-sm 2.6s ease-in infinite${active?"":";animation-play-state:paused"}}
        .hs-s2{animation:hs-sm2 3.2s ease-in infinite .8s${active?"":";animation-play-state:paused"}}
        .hs-s3{animation:hs-sm 3.8s ease-in infinite 1.6s${active?"":";animation-play-state:paused"}}
        .hs-gl{animation:hs-glow 2s ease-in-out infinite${active?"":";animation-play-state:paused"}}
        .hs-orb{animation:hs-orbit 4s linear infinite;transform-origin:60px 30px;${active?"":"animation-play-state:paused"}}
        .hs-sh{animation:hs-shine 3s ease-in-out infinite${active?"":";animation-play-state:paused"}}
      `}</style>
      {/* Orbiting gem */}
      <circle className="hs-orb" cx="60" cy="30" r="3.5" fill="#fff" opacity=".9"/>
      {/* Smoke — rich, plentiful */}
      <g transform="translate(60,22)">
        <ellipse className="hs-s1" cx="-3" cy="0" rx="6" ry="10" fill={`${color}99`}/>
        <ellipse className="hs-s2" cx="4" cy="-4" rx="8" ry="13" fill={`${color}66`}/>
        <ellipse className="hs-s3" cx="-1" cy="-2" rx="5" ry="8" fill={`${color}77`}/>
      </g>
      {/* Coal — blazing */}
      <ellipse className="hs-gl" cx="60" cy="28" rx="20" ry="7" fill={color}/>
      <ellipse cx="60" cy="27" rx="13" ry="4.5" fill="white" opacity=".5"/>
      {/* Crown-shaped bowl */}
      <path d="M34 28 L36 16 L44 24 L52 12 L60 22 L68 12 L76 24 L84 16 L86 28Z" fill={color} opacity=".95"/>
      <path d="M34 28 Q30 50 36 62 Q46 74 60 75 Q74 74 84 62 Q90 50 86 28Z" fill={color} opacity=".88"/>
      {/* Gold filigree on bowl */}
      <path d="M40 40 Q44 36 48 40 Q44 44 40 40" stroke="white" strokeWidth=".8" fill="none" opacity=".35"/>
      <path d="M72 40 Q76 36 80 40 Q76 44 72 40" stroke="white" strokeWidth=".8" fill="none" opacity=".35"/>
      <path d="M56 42 Q60 38 64 42 Q60 46 56 42" stroke="white" strokeWidth=".8" fill="none" opacity=".35"/>
      {/* Neck + ornate collar */}
      <rect x="55" y="75" width="10" height="12" rx="4" fill={color} opacity=".8"/>
      {/* Tray — ornate with gems */}
      <ellipse cx="60" cy="90" rx="30" ry="9.5" fill={color} opacity=".75"/>
      <ellipse cx="60" cy="89" rx="22" ry="6.5" fill={color} opacity=".5"/>
      {/* Gem dots on tray */}
      {[30,46,60,74,90].map((x,i) => (
        <circle key={i} cx={x} cy="89" r="2" fill="white" opacity=".4"/>
      ))}
      {/* Shaft — ornate gold */}
      <rect x="57" y="100" width="6" height="106" rx="3" fill={color} opacity=".8"/>
      {/* Elaborate rings */}
      {[120, 148, 170, 192].map((y, i) => (
        <g key={i}>
          <ellipse cx="60" cy={y} rx={11-i} ry={4-i*0.3} fill={color} opacity=".9"/>
          <ellipse cx="60" cy={y} rx={7-i} ry={2.5-i*0.2} fill="white" opacity=".2"/>
        </g>
      ))}
      {/* Vase — opulent urn shape */}
      <path d="M32 206 Q22 228 28 248 Q36 268 60 271 Q84 268 92 248 Q98 228 88 206Z" fill={color} opacity=".85"/>
      <path d="M38 210 Q30 230 34 248 Q40 260 52 265" stroke="white" strokeWidth="2" fill="none" opacity=".2"/>
      {/* Water shimmer */}
      <ellipse className="hs-sh" cx="60" cy="238" rx="22" ry="6" fill="white"/>
      {/* Gem band around vase equator */}
      <ellipse cx="60" cy="238" rx="29" ry="5" fill="none" stroke={color} strokeWidth="1.5" opacity=".6"/>
      {[0,60,120,180,240,300].map((a,i) => {
        const rad = a*Math.PI/180;
        return <circle key={i} cx={60+29*Math.cos(rad)} cy={238+5*Math.sin(rad)} r="2.5" fill="white" opacity=".5"/>;
      })}
      {/* Base — elaborate */}
      <ellipse cx="60" cy="272" rx="36" ry="11" fill={color} opacity=".8"/>
      <ellipse cx="60" cy="275" rx="28" ry="8" fill={color} opacity=".55"/>
      <ellipse cx="60" cy="278" rx="18" ry="5" fill={color} opacity=".4"/>
      {/* Dual hoses */}
      <circle cx="88" cy="225" r="5.5" fill={color} opacity=".9"/>
      <path d="M93 225 Q116 216 118 238 Q120 258 104 262 Q92 266 89 258" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7"/>
      <ellipse cx="89" cy="258" rx="6" ry="4" fill={color} opacity=".9"/>
      <circle cx="32" cy="225" r="5.5" fill={color} opacity=".9"/>
      <path d="M27 225 Q4 216 2 238 Q0 258 16 262 Q28 266 31 258" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7"/>
      <ellipse cx="31" cy="258" rx="6" ry="4" fill={color} opacity=".9"/>
    </svg>
  );
}

function HookahStreetKing({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <style>{`
        @keyframes sk-sm{0%{transform:translate(0,0);opacity:.65}100%{transform:translate(-4px,-45px);opacity:0}}
        @keyframes sk-coal{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes sk-tag{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        .sk-s1{animation:sk-sm 2.5s ease-in infinite${active?"":";animation-play-state:paused"}}
        .sk-s2{animation:sk-sm 3s ease-in infinite .7s${active?"":";animation-play-state:paused"}}
        .sk-coal{animation:sk-coal 1s ease-in-out infinite${active?"":";animation-play-state:paused"}}
        .sk-tag{animation:sk-tag 3s ease-in-out infinite;transform-origin:100px 180px;${active?"":"animation-play-state:paused"}}
      `}</style>
      {/* Smoke */}
      <g transform="translate(60,36)">
        <ellipse className="sk-s1" cx="0" cy="0" rx="4" ry="7" fill={`${color}99`}/>
        <ellipse className="sk-s2" cx="3" cy="-4" rx="5" ry="9" fill={`${color}66`}/>
      </g>
      {/* Coal */}
      <ellipse className="sk-coal" cx="60" cy="40" rx="15" ry="5" fill={color} opacity=".85"/>
      {/* Bowl — squat, urban */}
      <path d="M40 40 Q38 56 42 64 Q50 72 60 73 Q70 72 78 64 Q82 56 80 40Z" fill={color} opacity=".88"/>
      {/* Spray paint drip detail */}
      <path d="M44 52 Q42 60 44 66" stroke="white" strokeWidth="1.2" fill="none" opacity=".25"/>
      {/* Neck */}
      <rect x="56" y="73" width="8" height="10" rx="3" fill={color} opacity=".75"/>
      {/* Tray — flat industrial */}
      <rect x="38" y="84" width="44" height="10" rx="3" fill={color} opacity=".7"/>
      <rect x="42" y="86" width="36" height="6" rx="2" fill="rgba(0,0,0,.4)"/>
      {/* Shaft — shorter, chunky */}
      <rect x="56.5" y="94" width="7" height="88" rx="3.5" fill={color} opacity=".75"/>
      {/* Bands */}
      <rect x="53" y="112" width="14" height="5" rx="2.5" fill={color} opacity=".9"/>
      <rect x="53" y="148" width="14" height="5" rx="2.5" fill={color} opacity=".9"/>
      {/* Vase — short, wide cylinder */}
      <rect x="32" y="184" width="56" height="68" rx="12" fill={color} opacity=".82"/>
      <rect x="36" y="188" width="48" height="60" rx="9" fill="rgba(0,0,0,.55)"/>
      {/* Urban texture lines */}
      {[198, 214, 230, 244].map((y,i) => (
        <line key={i} x1="36" y1={y} x2="84" y2={y} stroke={color} strokeWidth=".6" opacity=".2"/>
      ))}
      {/* Tag/label swinging */}
      <g className="sk-tag">
        <rect x="90" y="175" width="22" height="14" rx="3" fill="rgba(0,0,0,.8)" stroke={color} strokeWidth="1"/>
        <line x1="88" y1="183" x2="84" y2="200" stroke={color} strokeWidth=".8" opacity=".5"/>
        <text x="101" y="185" textAnchor="middle" fontSize="5" fill={color} fontFamily="monospace">SK</text>
        <text x="101" y="184" textAnchor="middle" fontSize="5" fill={color} fontFamily="monospace" opacity=".6">01</text>
      </g>
      {/* Base */}
      <rect x="26" y="250" width="68" height="14" rx="5" fill={color} opacity=".7"/>
      {/* Hose — thick rubber */}
      <circle cx="84" cy="216" r="5" fill={color} opacity=".9"/>
      <path d="M89 216 Q112 208 114 228 Q116 246 100 252 Q89 256 87 249" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".7"/>
      <ellipse cx="87" cy="249" rx="6" ry="4" fill={color} opacity=".9"/>
    </svg>
  );
}

function HookahCrystal({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 120 280" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <style>{`
        @keyframes cr-sm{0%{transform:translate(0,0);opacity:.7}100%{transform:translate(-5px,-60px);opacity:0}}
        @keyframes cr-refract{0%,100%{opacity:.08}50%{opacity:.22}}
        @keyframes cr-bubble{0%{transform:translateY(0)}100%{transform:translateY(-80px);opacity:0}}
        @keyframes cr-glow{0%,100%{opacity:.4}50%{opacity:.9}}
        .cr-s1{animation:cr-sm 3s ease-in infinite${active?"":";animation-play-state:paused"}}
        .cr-s2{animation:cr-sm 3.7s ease-in infinite 1s${active?"":";animation-play-state:paused"}}
        .cr-ref{animation:cr-refract 2.5s ease-in-out infinite${active?"":";animation-play-state:paused"}}
        .cr-b1{animation:cr-bubble 4s ease-in infinite${active?"":";animation-play-state:paused"}}
        .cr-b2{animation:cr-bubble 4s ease-in infinite 1.3s${active?"":";animation-play-state:paused"}}
        .cr-b3{animation:cr-bubble 4s ease-in infinite 2.6s${active?"":";animation-play-state:paused"}}
        .cr-gl{animation:cr-glow 2s ease-in-out infinite${active?"":";animation-play-state:paused"}}
      `}</style>
      {/* Smoke */}
      <g transform="translate(60,24)">
        <ellipse className="cr-s1" cx="0" cy="0" rx="5" ry="9" fill={`${color}88`}/>
        <ellipse className="cr-s2" cx="4" cy="-5" rx="7" ry="12" fill={`${color}55`}/>
      </g>
      {/* Coal glow */}
      <ellipse className="cr-gl" cx="60" cy="28" rx="17" ry="6" fill={color}/>
      <ellipse cx="60" cy="27" rx="10" ry="3.5" fill="white" opacity=".5"/>
      {/* Bowl — faceted crystal */}
      <path d="M38 28 L36 36 L40 50 L48 62 L60 65 L72 62 L80 50 L84 36 L82 28Z" fill={color} opacity=".3" stroke={color} strokeWidth="1.2"/>
      <path d="M38 28 L46 24 L60 22 L74 24 L82 28" fill="none" stroke={color} strokeWidth="1" opacity=".6"/>
      {/* Crystal facets */}
      <line x1="60" y1="22" x2="40" y2="50" stroke="white" strokeWidth=".8" opacity=".2"/>
      <line x1="60" y1="22" x2="80" y2="50" stroke="white" strokeWidth=".8" opacity=".2"/>
      <line x1="60" y1="22" x2="60" y2="65" stroke="white" strokeWidth=".8" opacity=".15"/>
      {/* Refraction highlight */}
      <path className="cr-ref" d="M44 35 L50 28 L56 35Z" fill="white"/>
      <path className="cr-ref" d="M68 42 L74 35 L80 42Z" fill="white"/>
      {/* Neck — crystal clear */}
      <rect x="56" y="65" width="8" height="14" rx="3" fill={color} opacity=".5" stroke={color} strokeWidth="1"/>
      {/* Tray */}
      <ellipse cx="60" cy="81" rx="27" ry="8" fill={color} opacity=".5" stroke={color} strokeWidth="1"/>
      {/* Shaft — fully transparent crystal, bubbles rising inside */}
      <rect x="57" y="89" width="6" height="110" rx="3" fill={color} opacity=".15" stroke={color} strokeWidth="1"/>
      {/* Bubbles rising through shaft */}
      <circle className="cr-b1" cx="60" cy="190" r="2" fill={color} opacity=".6"/>
      <circle className="cr-b2" cx="61" cy="195" r="1.5" fill={color} opacity=".4"/>
      <circle className="cr-b3" cx="59" cy="185" r="1.8" fill={color} opacity=".5"/>
      {/* Vase — pure crystal */}
      <path d="M34 200 Q26 222 32 244 Q40 264 60 267 Q80 264 88 244 Q94 222 86 200Z" fill={color} opacity=".18" stroke={color} strokeWidth="1.5"/>
      {/* Crystal planes in vase */}
      <line x1="60" y1="200" x2="34" y2="244" stroke="white" strokeWidth=".8" opacity=".1"/>
      <line x1="60" y1="200" x2="86" y2="244" stroke="white" strokeWidth=".8" opacity=".1"/>
      <line x1="34" y1="244" x2="86" y2="244" stroke="white" strokeWidth=".8" opacity=".1"/>
      {/* Water level */}
      <ellipse cx="60" cy="238" rx="22" ry="5" fill={color} opacity=".25" stroke={color} strokeWidth=".8"/>
      {/* Base */}
      <ellipse cx="60" cy="268" rx="30" ry="9" fill={color} opacity=".6" stroke={color} strokeWidth="1"/>
      <ellipse cx="60" cy="272" rx="20" ry="6" fill={color} opacity=".3"/>
      {/* Hose */}
      <circle cx="85" cy="224" r="5" fill={color} opacity=".8" stroke={color} strokeWidth="1"/>
      <path d="M90 224 Q113 216 115 238 Q117 256 101 260 Q90 264 87 257" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" opacity=".6"/>
      <ellipse cx="87" cy="257" rx="5.5" ry="3.5" fill={color} opacity=".8"/>
    </svg>
  );
}

function HookahColossus({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 140 280" fill="none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <style>{`
        @keyframes col-sm{0%{transform:translate(0,0)scaleX(1);opacity:.7}100%{transform:translate(var(--dx),-55px)scaleX(1.8);opacity:0}}
        @keyframes col-fire{0%,100%{transform:scaleY(1)skewX(-2deg)}50%{transform:scaleY(1.15)skewX(3deg)}}
        @keyframes col-pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes col-hose{0%,100%{transform:rotate(0deg)}50%{transform:rotate(1deg)}}
        .col-s1{--dx:-10px;animation:col-sm 2.8s ease-in infinite${active?"":";animation-play-state:paused"}}
        .col-s2{--dx:8px;animation:col-sm 3.3s ease-in infinite .6s${active?"":";animation-play-state:paused"}}
        .col-s3{--dx:-4px;animation:col-sm 3.8s ease-in infinite 1.2s${active?"":";animation-play-state:paused"}}
        .col-s4{--dx:12px;animation:col-sm 3s ease-in infinite 1.8s${active?"":";animation-play-state:paused"}}
        .col-fi{animation:col-fire 1.3s ease-in-out infinite;transform-origin:70px 20px;${active?"":"animation-play-state:paused"}}
        .col-p{animation:col-pulse 1.5s ease-in-out infinite${active?"":";animation-play-state:paused"}}
        .col-h1{animation:col-hose 3.5s ease-in-out infinite;transform-origin:112px 215px;${active?"":"animation-play-state:paused"}}
        .col-h2{animation:col-hose 4s ease-in-out infinite .5s;transform-origin:28px 215px;${active?"":"animation-play-state:paused"}}
        .col-h3{animation:col-hose 3.2s ease-in-out infinite 1s;transform-origin:118px 230px;${active?"":"animation-play-state:paused"}}
        .col-h4{animation:col-hose 4.5s ease-in-out infinite 1.5s;transform-origin:22px 230px;${active?"":"animation-play-state:paused"}}
      `}</style>
      {/* Smoke — 4 plumes */}
      <g transform="translate(70,18)">
        <ellipse className="col-s1" cx="-12" cy="0" rx="5" ry="9" fill={`${color}88`}/>
        <ellipse className="col-s2" cx="12" cy="-2" rx="6" ry="11" fill={`${color}77`}/>
        <ellipse className="col-s3" cx="-4" cy="-4" rx="4" ry="8" fill={`${color}66`}/>
        <ellipse className="col-s4" cx="4" cy="-1" rx="5" ry="9" fill={`${color}55`}/>
      </g>
      {/* Fire on coal */}
      <g className="col-fi">
        <path d="M52 18 Q70 4 88 18 Q82 10 70 8 Q58 10 52 18Z" fill="#f59e0b" opacity=".9"/>
      </g>
      {/* Coal — massive, blazing */}
      <ellipse className="col-p" cx="70" cy="22" rx="28" ry="9" fill={color}/>
      <ellipse cx="70" cy="21" rx="18" ry="5.5" fill="white" opacity=".35"/>
      {/* Bowl — huge, dominating */}
      <path d="M36 22 Q30 46 36 62 Q46 80 70 82 Q94 80 104 62 Q110 46 104 22Z" fill={color} opacity=".88"/>
      <path d="M44 28 Q38 48 42 62 Q48 72 58 77" stroke="white" strokeWidth="2" fill="none" opacity=".18"/>
      {/* Neck */}
      <rect x="65" y="82" width="10" height="14" rx="4" fill={color} opacity=".8"/>
      {/* Tray — grand */}
      <ellipse cx="70" cy="99" rx="36" ry="11" fill={color} opacity=".75"/>
      <ellipse cx="70" cy="98" rx="26" ry="7.5" fill={color} opacity=".45"/>
      {/* Shaft — thick, powerful */}
      <rect x="66.5" y="110" width="7" height="100" rx="3.5" fill={color} opacity=".8"/>
      {/* Power rings */}
      {[128, 158, 186].map((y,i) => (
        <g key={i}>
          <ellipse cx="70" cy={y} rx={14-i*2} ry={5-i} fill={color} opacity=".9"/>
          <ellipse cx="70" cy={y} rx={9-i} ry={3-i*0.5} fill="white" opacity=".18"/>
        </g>
      ))}
      {/* Vase — colossal urn */}
      <path d="M30 212 Q18 238 26 260 Q38 282 70 285 Q102 282 114 260 Q122 238 110 212Z" fill={color} opacity=".85"/>
      <path d="M38 216 Q28 240 34 258 Q42 272 56 278" stroke="white" strokeWidth="2.5" fill="none" opacity=".17"/>
      {/* Base — heavy plinth */}
      <rect x="20" y="272" width="100" height="8" rx="4" fill={color} opacity=".7"/>
      <rect x="14" y="278" width="112" height="6" rx="3" fill={color} opacity=".55"/>
      {/* 4 hose ports */}
      <circle cx="108" cy="215" r="6" fill={color} opacity=".9"/>
      <circle cx="32" cy="215" r="6" fill={color} opacity=".9"/>
      <circle cx="112" cy="235" r="5.5" fill={color} opacity=".85"/>
      <circle cx="28" cy="235" r="5.5" fill={color} opacity=".85"/>
      {/* 4 hoses */}
      <g className="col-h1"><path d="M114 215 Q135 205 137 226 Q139 244 124 250" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" opacity=".65"/></g>
      <g className="col-h2"><path d="M26 215 Q5 205 3 226 Q1 244 16 250" stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" opacity=".65"/></g>
      <g className="col-h3"><path d="M117 235 Q138 250 136 268 Q134 280 120 278" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6"/></g>
      <g className="col-h4"><path d="M23 235 Q2 250 4 268 Q6 280 20 278" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6"/></g>
    </svg>
  );
}

const HOOKAH_COMPONENTS: Record<string, React.ComponentType<{ color: string; active: boolean }>> = {
  classic:  HookahClassic,
  phantom:  HookahPhantom,
  sultan:   HookahSultan,
  street:   HookahStreetKing,
  crystal:  HookahCrystal,
  colossus: HookahColossus,
};

const TIER_COLORS: Record<string, string> = {
  Standard: "rgba(255,255,255,0.15)",
  Premium:  "rgba(34,211,238,0.25)",
  Luxury:   "rgba(245,158,11,0.35)",
  Event:    "rgba(168,85,247,0.35)",
};

const TIER_TEXT: Record<string, string> = {
  Standard: "rgba(255,255,255,0.6)",
  Premium:  "#22d3ee",
  Luxury:   "#f59e0b",
  Event:    "#a855f7",
};

// ─── Model Card ───────────────────────────────────────────────────────────────

function ModelCard({
  model,
  isSelected,
  onSelect,
  isMobile,
}: {
  model: RentalModel;
  isSelected: boolean;
  onSelect: () => void;
  isMobile: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const HookahComp = HOOKAH_COMPONENTS[model.id] ?? HookahClassic;
  const pointerDown = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDown.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerDown.current.x);
    const dy = Math.abs(e.clientY - pointerDown.current.y);
    if (dx > 6 || dy > 6) return;
    if (!cardRef.current) { onSelect(); return; }
    gsap.to(cardRef.current, {
      scale: 0.96, duration: 0.08,
      onComplete: () => gsap.to(cardRef.current, { scale: 1, duration: 0.35, ease: "elastic.out(1.2, 0.5)", onComplete: onSelect }),
    });
  }, [onSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: x * 14, rotateX: -y * 10,
      transformPerspective: 900,
      duration: 0.35, ease: "power2.out",
    });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-rental-pedestal
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: isSelected
          ? `linear-gradient(160deg, ${model.accentColor}18 0%, rgba(13,10,30,0.98) 50%)`
          : "rgba(13,10,30,0.92)",
        border: `1px solid ${isSelected ? model.accentColor + "66" : model.accentColor + "22"}`,
        boxShadow: isSelected
          ? `0 0 0 1px ${model.accentColor}44, 0 8px 60px ${model.accentColor}33, 0 4px 30px rgba(0,0,0,0.6)`
          : "0 4px 24px rgba(0,0,0,0.5)",
        cursor: "pointer",
        userSelect: "none",
        willChange: "transform",
        transformStyle: "preserve-3d",
        transition: "box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tier badge — top left */}
      <div style={{
        position: "absolute", top: 14, left: 14, zIndex: 2,
        background: TIER_COLORS[model.tier],
        border: `1px solid ${TIER_TEXT[model.tier]}44`,
        borderRadius: 30,
        padding: "4px 12px",
        fontFamily: "var(--font-mono)",
        fontSize: 8, letterSpacing: "0.2em",
        color: TIER_TEXT[model.tier],
        textTransform: "uppercase",
        backdropFilter: "blur(4px)",
      }}>
        {model.tier}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div style={{
          position: "absolute", top: 14, right: 14, zIndex: 2,
          width: 10, height: 10, borderRadius: "50%",
          background: model.accentColor,
          boxShadow: `0 0 12px ${model.accentColor}`,
        }}/>
      )}

      {/* Hookah illustration */}
      <div style={{
        height: isMobile ? 200 : 260,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "24px 20px 0",
        position: "relative",
        overflow: "visible",
      }}>
        {/* Floor glow */}
        <div style={{
          position: "absolute",
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 120, height: 20,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${model.accentColor}55 0%, transparent 70%)`,
          filter: "blur(6px)",
          transition: "opacity 0.4s",
          opacity: isSelected ? 1 : 0.4,
        }}/>
        {/* Ceiling spotlight cone */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 100, height: "80%",
          background: `linear-gradient(to bottom, ${model.accentColor}${isSelected ? "30" : "14"}, transparent 90%)`,
          clipPath: "polygon(30% 0%, 70% 0%, 80% 100%, 20% 100%)",
          pointerEvents: "none",
          transition: "opacity 0.4s",
        }}/>
        <div style={{
          width: model.id === "colossus" ? "100%" : "75%",
          maxWidth: model.id === "colossus" ? 140 : 90,
          height: "100%",
          filter: isSelected
            ? `drop-shadow(0 0 18px ${model.accentColor}cc) drop-shadow(0 0 40px ${model.accentColor}66)`
            : `drop-shadow(0 0 8px ${model.accentColor}55)`,
          transition: "filter 0.4s ease",
        }}>
          <HookahComp color={model.accentColor} active={isSelected} />
        </div>
      </div>

      {/* Card info */}
      <div style={{ padding: "12px 20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: "var(--font-serif)",
          fontSize: 26, fontWeight: 600, fontStyle: "italic",
          color: "white", lineHeight: 1, marginBottom: 4,
          letterSpacing: "-0.01em",
        }}>
          {model.name}
        </h3>
        <p style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: 13, color: "rgba(255,255,255,0.42)",
          lineHeight: 1.4, marginBottom: 14,
        }}>
          {model.tagline}
        </p>

        {/* Quick specs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { label: model.height },
            { label: model.hoseType },
          ].map(({ label }) => (
            <span key={label} style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4, padding: "3px 8px",
            }}>
              {label}
            </span>
          ))}
        </div>

        {/* Price + availability */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 12,
          borderTop: `1px solid ${model.accentColor}18`,
          marginTop: "auto",
        }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 1 }}>per session</p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: model.accentColor, lineHeight: 1 }}>
              {kes(model.sessionRate)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: model.available > 2 ? "#22d3ee" : model.available === 1 ? "#fbbf24" : "#6b5f88",
                boxShadow: model.available > 0 ? `0 0 6px ${model.available > 2 ? "#22d3ee" : "#fbbf24"}` : "none",
              }}/>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em",
                color: model.available > 2 ? "#22d3ee" : model.available === 1 ? "#fbbf24" : "#6b7280",
                textTransform: "uppercase",
              }}>
                {model.available > 2 ? "Available" : model.available === 1 ? "Last unit" : `${model.available} left`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ model, onClose }: { model: RentalModel; onClose: () => void }) {
  const addToCart = useStore(s => s.addToCart);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const HookahComp = HOOKAH_COMPONENTS[model.id] ?? HookahClassic;

  useEffect(() => {
    if (!panelRef.current || !backdropRef.current) return;
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(panelRef.current, { x: "100%" }, { x: "0%", duration: 0.45, ease: "power3.out" });
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const close = useCallback(() => {
    if (!panelRef.current || !backdropRef.current) { onClose(); return; }
    gsap.to(panelRef.current, { x: "100%", duration: 0.35, ease: "power3.in" });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.35, onComplete: onClose });
  }, [onClose]);

  const handleReserve = () => {
    addToCart({ id: `rental-${model.id}`, type: "rental", name: `${model.name} Hookah`, price: model.sessionRate, quantity: 1 });
    close();
  };

  return (
    <>
      <div ref={backdropRef} onClick={close} style={{
        position: "fixed", inset: 0, background: "rgba(5,3,10,0.65)", zIndex: 200,
        backdropFilter: "blur(4px)",
      }}/>
      <div ref={panelRef} style={{
        position: "fixed", right: 0, top: 0, bottom: 0,
        width: "min(420px, 100vw)",
        background: `linear-gradient(160deg, ${model.accentColor}14 0%, #0d0a1e 35%, #05030a 100%)`,
        borderLeft: `1px solid ${model.accentColor}33`,
        boxShadow: `-32px 0 80px rgba(5,3,10,0.9)`,
        zIndex: 201,
        overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header with hookah illustration */}
        <div style={{
          position: "relative",
          height: 320,
          background: `linear-gradient(160deg, ${model.accentColor}22 0%, rgba(13,10,30,0.8) 100%)`,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          {/* Spotlight */}
          <div style={{
            position: "absolute", top: 0, left: "50%",
            transform: "translateX(-50%)",
            width: 160, height: "90%",
            background: `linear-gradient(to bottom, ${model.accentColor}40, transparent 90%)`,
            clipPath: "polygon(30% 0%, 70% 0%, 80% 100%, 20% 100%)",
            pointerEvents: "none",
          }}/>
          {/* Floor glow */}
          <div style={{
            position: "absolute", bottom: 10, left: "50%",
            transform: "translateX(-50%)",
            width: 180, height: 24, borderRadius: "50%",
            background: `radial-gradient(ellipse, ${model.accentColor}66 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}/>
          <div style={{
            width: model.id === "colossus" ? 180 : 130,
            height: 280,
            paddingBottom: 10,
            filter: `drop-shadow(0 0 24px ${model.accentColor}cc) drop-shadow(0 0 60px ${model.accentColor}44)`,
          }}>
            <HookahComp color={model.accentColor} active={true} />
          </div>
          {/* Close */}
          <button onClick={close} style={{
            position: "absolute", top: 16, right: 16,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          {/* Tier */}
          <div style={{
            position: "absolute", top: 16, left: 16,
            background: TIER_COLORS[model.tier],
            border: `1px solid ${TIER_TEXT[model.tier]}44`,
            borderRadius: 30, padding: "4px 12px",
            fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em",
            color: TIER_TEXT[model.tier], textTransform: "uppercase",
            backdropFilter: "blur(4px)",
          }}>
            {model.tier}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Name */}
          <div>
            <h2 style={{
              fontFamily: "var(--font-serif)", fontSize: 44, fontWeight: 600, fontStyle: "italic",
              color: "white", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 8,
            }}>
              {model.name}
            </h2>
            <p style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.5,
            }}>
              {model.tagline}
            </p>
          </div>

          {/* Specs */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
            padding: "18px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {[
              { label: "Height", value: model.height },
              { label: "Material", value: model.material },
              { label: "Hose Config", value: model.hoseType },
              { label: "Available", value: `${model.available} unit${model.available !== 1 ? "s" : ""}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.3 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Per Session", value: kes(model.sessionRate), accent: true },
              { label: "Daily Rate", value: kes(model.dailyRate), accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{
                flex: 1, padding: "16px",
                background: accent ? `${model.accentColor}14` : "rgba(255,255,255,0.03)",
                border: `1px solid ${accent ? model.accentColor + "33" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12, textAlign: "center",
              }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: accent ? model.accentColor : "rgba(255,255,255,0.6)", lineHeight: 1 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Availability indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: model.available > 2 ? "#22d3ee" : model.available === 1 ? "#fbbf24" : "#6b5f88",
              boxShadow: model.available > 0 ? `0 0 10px ${model.available > 2 ? "#22d3ee" : "#fbbf24"}` : "none",
            }}/>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", color: model.available > 2 ? "#22d3ee" : "#fbbf24", textTransform: "uppercase" }}>
              {model.available > 2 ? `${model.available} units in stock — ready to deploy` : model.available === 1 ? "Last unit available — book fast" : `${model.available} units remaining`}
            </span>
          </div>

          {/* CTA */}
          <button onClick={handleReserve} className="btn-primary" style={{ width: "100%", fontSize: 15, minHeight: 54, marginTop: 4 }}>
            Reserve {model.name} ↗
          </button>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            Added to cart · complete booking during checkout
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function RentalsSection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Section entrance
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true } }
      );
      const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-rental-pedestal]");
      if (cards?.length) {
        gsap.fromTo(Array.from(cards),
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSelect = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? null : idx);
  }, []);

  return (
    <section
      id="rentals"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "var(--void)",
        padding: "clamp(60px,8vw,100px) 0 80px",
        overflow: "hidden",
      }}
    >
      {/* Ambient background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)", top: "10%", left: "-15%" }}/>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", bottom: "5%", right: "-10%" }}/>
        {/* Floor reflection line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "rgba(124,58,237,0.2)" }}/>
      </div>

      {/* Header */}
      <div ref={headerRef} style={{
        padding: "0 clamp(20px,6vw,80px)",
        marginBottom: 52,
        position: "relative", zIndex: 1,
        opacity: 0,
      }}>
        <p className="section-label">The Showroom</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(52px,7vw,96px)",
              fontWeight: 600, fontStyle: "italic",
              color: "white", lineHeight: 0.95,
              letterSpacing: "-0.02em", marginBottom: 14,
            }}>
              Select Your<br/>
              <span style={{ color: "var(--cyan-bright)" }}>Piece.</span>
            </h2>
            <p style={{
              fontFamily: "var(--font-serif)", fontStyle: "italic",
              fontSize: "clamp(15px,1.8vw,18px)",
              color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 480,
            }}>
              Six masterworks. Every one handpicked. Tap any piece to inspect it up close and lock it in for your session.
            </p>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.2)", textTransform: "uppercase",
            alignSelf: "flex-end", paddingBottom: 4,
          }}>
            {RENTAL_MODELS.length} models available
          </div>
        </div>
      </div>

      {/* Grid — all 6 fully clickable */}
      <div ref={gridRef} style={{
        padding: "0 clamp(20px,6vw,80px)",
        display: "grid",
        gridTemplateColumns: isMobile
          ? "repeat(2, 1fr)"
          : "repeat(3, 1fr)",
        gap: isMobile ? 12 : 20,
        position: "relative", zIndex: 1,
      }}>
        {RENTAL_MODELS.map((model, i) => (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={selectedIdx === i}
            onSelect={() => handleSelect(i)}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div style={{ textAlign: "center", marginTop: 36, padding: "0 5vw", position: "relative", zIndex: 1 }}>
        <p style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: 13, color: "rgba(255,255,255,0.18)",
        }}>
          Tap any piece to inspect · all prices in KES · delivery included within Nairobi
        </p>
      </div>

      {/* Detail panel */}
      {selectedIdx !== null && (
        <DetailPanel
          model={RENTAL_MODELS[selectedIdx]}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </section>
  );
}
