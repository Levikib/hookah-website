"use client";
import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTitleProps {
  text: string;             // use \n for line breaks
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3";
  stagger?: number;
  start?: string;
}

export default function AnimatedTitle({
  text,
  className = "",
  style = {},
  as: Tag = "h2",
  stagger = 0.02,
  start = "80 bottom",
}: AnimatedTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const buildMarkup = useCallback(() => {
    if (!containerRef.current) return;
    const lines = text.split("\n");
    containerRef.current.innerHTML = "";

    lines.forEach((line, li) => {
      const lineEl = document.createElement("div");
      lineEl.style.display = "block";
      lineEl.style.overflow = "hidden"; // clip the reveal
      lineEl.style.paddingBottom = "0.08em"; // prevent descender clip

      const words = line.split(" ");
      words.forEach((word, wi) => {
        const span = document.createElement("span");
        span.textContent = word + (wi < words.length - 1 ? " " : "");
        span.className = "animated-word";
        lineEl.appendChild(span);
      });

      if (li < lines.length - 1) {
        const br = document.createElement("br");
        containerRef.current!.appendChild(br);
      }
      containerRef.current!.appendChild(lineEl);
    });
  }, [text]);

  useEffect(() => {
    if (!containerRef.current) return;
    buildMarkup();
    const words = containerRef.current.querySelectorAll(".animated-word");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start,
        end: "center bottom",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(words, {
      opacity: 1,
      y: 0,
      rotateY: 0,
      rotateX: 0,
      ease: "power2.out",
      stagger,
      duration: 0.6,
    });

    return () => { tl.kill(); ScrollTrigger.getAll().forEach(t => { if (t.vars?.trigger === containerRef.current) t.kill(); }); };
  }, [text, stagger, start, buildMarkup]);

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={`animated-title ${className}`}
      style={{
        perspective: "600px",
        perspectiveOrigin: "center",
        transformStyle: "preserve-3d",
        ...style,
      }}
    />
  );
}
