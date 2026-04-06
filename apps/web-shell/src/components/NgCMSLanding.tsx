/**
 * NgCMS ERP Landing Page
 * Converted from ngcms-landing-animated.html (compiled React app)
 *
 * Dependencies:
 *   npm install framer-motion gsap @gsap/react
 *   Fonts: https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────
// CSS (inject once via a <style> tag or import a .css file)
// ─────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

*,::after,::before{box-sizing:border-box;margin:0;padding:0}
:root{
  --indigo:#4338f7;--indigo-light:#6366f1;--indigo-glow:#4338f773;
  --navy:#080719;--navy-mid:#10102a;--white:#fff;--grey:#8892a4;
  --border:#ffffff12;--card:#ffffff08;
}
html{scroll-behavior:smooth}
body{background:var(--navy);color:var(--white);cursor:none;font-family:'DM Sans',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}

/* Custom cursor */
.cursor-dot{background:#fff;border-radius:50%;height:8px;width:8px;mix-blend-mode:difference;z-index:9999;left:0;pointer-events:none;position:fixed;top:0;transform:translate(-50%,-50%)}
.cursor-ring{border:1.5px solid rgba(99,102,241,.7);border-radius:50%;height:36px;width:36px;z-index:9998;left:0;pointer-events:none;position:fixed;top:0;transform:translate(-50%,-50%)}

/* Nav */
.nav{align-items:center;border-bottom:1px solid transparent;display:flex;justify-content:space-between;left:0;padding:1.1rem 5%;position:fixed;right:0;top:0;transition:background .3s,border-color .3s;z-index:200}
.nav.nav-scrolled{-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);background:rgba(8,7,25,.875);border-color:var(--border)}
.nav-logo{align-items:center;display:flex;gap:.7rem}
.nav-logo-icon{background:var(--indigo);border-radius:10px;box-shadow:0 0 20px var(--indigo-glow);display:grid;font-size:1rem;height:34px;place-items:center;width:34px}
.nav-logo-text{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700}
.nav-logo-text span{color:var(--indigo-light)}
.nav-links{display:flex;gap:2rem;list-style:none}
.nav-links a{color:var(--grey);font-size:.88rem;text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--white)}
.nav-cta{background:var(--indigo);border-radius:50px;box-shadow:0 0 24px rgba(67,56,247,.35);color:#fff;display:inline-block;font-size:.88rem;font-weight:500;padding:.55rem 1.3rem;text-decoration:none}

/* Hero */
.hero{align-items:center;display:flex;justify-content:center;min-height:100vh;overflow:hidden;padding:8rem 5% 5rem;position:relative}
.hero-bg,.particle-canvas{inset:0;pointer-events:none;position:absolute;z-index:0}
.hero-bg{background:radial-gradient(ellipse 65% 55% at 50% -5%,rgba(67,56,247,.4) 0,transparent 70%),radial-gradient(ellipse 35% 35% at 85% 75%,rgba(99,102,241,.15) 0,transparent 60%)}
.hero-grid{background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 0),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 0);background-size:64px 64px;inset:0;-webkit-mask-image:radial-gradient(ellipse 85% 85% at 50% 40%,#000 20%,transparent 75%);mask-image:radial-gradient(ellipse 85% 85% at 50% 40%,#000 20%,transparent 75%);pointer-events:none;position:absolute;z-index:0}
.hero-content{max-width:860px;position:relative;text-align:center;z-index:1}
.hero-badge{align-items:center;background:rgba(67,56,247,.16);border:1px solid rgba(99,102,241,.3);border-radius:50px;color:#a5b4fc;display:inline-flex;font-size:.76rem;font-weight:500;gap:.5rem;letter-spacing:.08em;margin-bottom:2rem;padding:.38rem 1rem;text-transform:uppercase}
.badge-pulse{animation:pulse 2s infinite;background:var(--indigo-light);border-radius:50%;display:inline-block;height:7px;width:7px}
@keyframes pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
.hero-h1{font-family:'Syne',sans-serif;font-size:clamp(3rem,7vw,5.5rem);font-weight:800;letter-spacing:-.04em;line-height:1;margin-bottom:1.6rem}
.hero-line-thin{color:rgba(255,255,255,.3);font-size:.6em;font-weight:400;letter-spacing:.18em}
.hero-line-accent{color:var(--indigo-light);display:inline-block}
.hero-line-white{color:var(--white)}
.hero-sub{color:var(--grey);font-size:1.05rem;line-height:1.75;margin:0 auto 2.4rem;max-width:520px}
.hero-actions{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin-bottom:3rem}
.btn-primary{align-items:center;background:var(--indigo);border-radius:50px;box-shadow:0 4px 32px rgba(67,56,247,.5);color:#fff;display:inline-flex;font-size:1rem;font-weight:500;gap:.4rem;padding:.85rem 2.1rem;text-decoration:none}
.btn-arrow{display:inline-block;transition:transform .2s}
.btn-primary:hover .btn-arrow{transform:translateX(4px)}
.btn-ghost{background:transparent;border:1px solid rgba(255,255,255,.18);border-radius:50px;color:#fff;display:inline-block;font-size:1rem;font-weight:500;padding:.85rem 2.1rem;text-decoration:none}
.hero-stats{border-top:1px solid var(--border);display:flex;gap:2.5rem;justify-content:center;padding-top:1rem}
.hero-stat{text-align:center}
.hero-stat strong{display:block;font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800}
.hero-stat span{font-size:.72rem;letter-spacing:.07em;color:var(--grey);text-transform:uppercase}
.hero-scroll-hint{align-items:center;bottom:2.5rem;display:flex;flex-direction:column;font-size:.68rem;gap:.4rem;left:50%;letter-spacing:.1em;position:absolute;transform:translateX(-50%);z-index:1;color:var(--grey);text-transform:uppercase}
.scroll-line{background:linear-gradient(to bottom,transparent,var(--indigo-light));height:36px;width:1px}

/* Marquee */
.marquee-wrap{border-bottom:1px solid var(--border);border-top:1px solid var(--border);overflow:hidden;padding:1rem 0}
.marquee-track{animation:marquee 28s linear infinite;display:flex;white-space:nowrap}
@keyframes marquee{0%{transform:translateX(0)}to{transform:translateX(-50%)}}
.marquee-item{color:var(--grey);flex-shrink:0;font-size:.78rem;letter-spacing:.06em;padding:0 2rem;text-transform:uppercase}
.marquee-dot{color:var(--indigo-light)}

/* Stats Row */
.stats-row{display:flex;flex-wrap:wrap;justify-content:center;padding:3.5rem 5%}
.stat-item{border-right:1px solid var(--border);flex:1 1;min-width:150px;padding:1.5rem;text-align:center}
.stat-item:last-child{border-right:none}
.stat-num{font-family:'Syne',sans-serif;font-size:2.8rem;font-weight:800;letter-spacing:-.05em}
.stat-label{color:var(--grey);font-size:.78rem;margin-top:.3rem}

/* Mockup */
.mockup-section{margin:0 auto;max-width:1200px;padding:5rem 5%}
.mockup-label{margin-bottom:3rem}
.mockup-wrapper{box-shadow:0 60px 120px rgba(0,0,0,.7),0 0 0 1px rgba(99,102,241,.2),0 0 80px rgba(67,56,247,.12);border-radius:18px;overflow:hidden}
.screen-wrap{background:var(--navy-mid);border-radius:18px;overflow:hidden}
.screen-bar{align-items:center;background:var(--navy);display:flex;gap:.5rem;padding:.7rem 1rem}
.screen-dot{border-radius:50%;height:10px;width:10px}
.screen-dot.d1{background:#ff5f57}.screen-dot.d2{background:#febc2e}.screen-dot.d3{background:#28c840}
.screen-url{background:rgba(255,255,255,.05);border-radius:6px;color:var(--grey);flex:1;font-family:monospace;font-size:.7rem;margin:0 .5rem;padding:.22rem .7rem}
.screen-inner{display:grid;grid-template-columns:200px 1fr;min-height:380px}
.m-sidebar{background:var(--navy);border-right:1px solid rgba(255,255,255,.05);display:flex;flex-direction:column;gap:.25rem;padding:1rem .75rem}
.m-brand{color:#a5b4fc;font-family:'Syne',sans-serif;font-size:.78rem;font-weight:700;padding:.4rem .5rem .9rem}
.m-brand small{display:block;font-family:'DM Sans',sans-serif;font-size:.58rem;font-weight:400;letter-spacing:.08em;color:var(--grey)}
.m-item{align-items:center;border-radius:7px;display:flex;font-size:.7rem;gap:.45rem;padding:.4rem .55rem;color:var(--grey)}
.m-item.active{background:rgba(67,56,247,.2);color:#a5b4fc}
.m-item-icon{background:currentColor;border-radius:3px;flex-shrink:0;height:12px;opacity:.5;width:12px}
.m-section{color:rgba(255,255,255,.2);font-size:.56rem;letter-spacing:.1em;padding:.6rem .55rem .15rem;text-transform:uppercase}
.m-avatar{align-items:center;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:.5rem;margin-top:auto;padding:.6rem .5rem}
.m-av-circle{background:var(--indigo);border-radius:50%;display:grid;flex-shrink:0;font-size:.62rem;font-weight:700;height:24px;place-items:center;width:24px}
.m-av-info{font-size:.64rem;line-height:1.3}
.m-av-info small{color:#4ade80;display:block;font-size:.54rem}
.m-content{padding:1.2rem}
.m-header{align-items:flex-start;display:flex;justify-content:space-between;margin-bottom:.8rem}
.m-role-label{color:var(--grey);font-size:.58rem;letter-spacing:.08em;margin-bottom:.15rem;text-transform:uppercase}
.m-title{font-family:'Syne',sans-serif;font-size:.88rem;font-weight:700}
.m-title span{color:var(--indigo-light)}
.m-subtitle{font-size:.58rem;color:var(--grey);margin-top:.1rem}
.m-date{font-size:.6rem;line-height:1.5;text-align:right;color:var(--grey)}
.m-cards{gap:.5rem;display:grid;grid-template-columns:repeat(4,1fr);margin-bottom:.7rem}
.m-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:.65rem}
.m-card-ico{background:rgba(67,56,247,.28);border-radius:6px;height:20px;margin-bottom:.3rem;width:20px}
.m-card-ico.red{background:rgba(239,68,68,.28)}
.m-card-label{color:var(--grey);font-size:.54rem;letter-spacing:.05em;text-transform:uppercase}
.m-card-num{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin:.15rem 0}
.m-card-sub{color:#4ade80;font-size:.5rem}
.m-card-sub.grey{color:var(--grey)}
.m-card-sub.alert{color:#f87171}
.m-bottom{gap:.6rem;display:grid;grid-template-columns:1fr 1fr}
.m-panel{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:.7rem}
.m-panel-title{font-size:.65rem;font-weight:600;margin-bottom:.35rem}
.m-panel-empty{color:var(--grey);font-size:.6rem;padding:.3rem 0}
.m-action-card{background:var(--navy);border-radius:9px;padding:.7rem}
.m-action-title{font-size:.65rem;font-weight:600;margin-bottom:.2rem}
.m-action-desc{color:var(--grey);font-size:.58rem;line-height:1.55}
.m-action-btn{border:1px solid rgba(255,255,255,.18);border-radius:5px;color:#fff;display:inline-block;font-size:.56rem;margin-top:.45rem;padding:.22rem .55rem}

/* Section helpers */
.section-tag{color:var(--indigo-light);font-size:.72rem;font-weight:600;letter-spacing:.14em;margin-bottom:.6rem;text-transform:uppercase}
.section-title{font-family:'Syne',sans-serif;font-size:clamp(1.9rem,3.8vw,3rem);font-weight:800;letter-spacing:-.035em;line-height:1.08}
.section-title .accent{color:var(--indigo-light)}

/* Horizontal scroll features */
.h-features-section{display:flex;flex-direction:column;height:100vh;overflow:hidden;padding-top:5rem;position:relative}
.h-features-label{padding:0 5% 2rem}
.h-scroll-hint{color:var(--grey);font-size:.75rem;margin-top:.8rem}
.h-features-track{display:flex;flex-shrink:0;gap:1.4rem;padding:0 5%;will-change:transform}
.h-feat-card{background:var(--card);border:1px solid var(--border);border-radius:20px;flex-shrink:0;overflow:hidden;padding:2.2rem 1.8rem;position:relative;transition:border-color .25s;width:320px}
.h-feat-card:hover{border-color:var(--accent,var(--indigo-light))}
.h-feat-num{color:rgba(255,255,255,.05);font-family:'Syne',sans-serif;font-size:3rem;font-weight:800;line-height:1;margin-bottom:.8rem}
.h-feat-icon{border-radius:14px;display:grid;font-size:1.5rem;height:52px;margin-bottom:1.2rem;place-items:center;width:52px}
.h-feat-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:.6rem}
.h-feat-desc{color:var(--grey);font-size:.85rem;line-height:1.65}
.h-feat-bar{bottom:0;height:2px;left:0;opacity:.6;position:absolute;right:0}
.h-feat-card:hover .h-feat-bar{opacity:1}

/* Roles */
.roles-section{padding:7rem 5%}
.roles-inner{margin:0 auto;max-width:1100px}
.roles-tabs{display:flex;flex-wrap:wrap;gap:.7rem;margin:2.5rem 0}
.role-tab{align-items:center;background:var(--card);border:1px solid var(--border);border-radius:50px;color:var(--grey);cursor:pointer;display:flex;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;gap:.55rem;padding:.6rem 1.3rem;transition:all .25s}
.role-tab:hover{border-color:rgba(255,255,255,.2);color:var(--white)}
.role-tab.active{background:rgba(67,56,247,.15);border-color:var(--col);color:var(--white)}
.role-tab-emoji{font-size:1.1rem}
.role-panel{gap:3rem;background:var(--card);border:1px solid var(--border);border-top:2px solid var(--col,var(--indigo));border-radius:24px;display:grid;grid-template-columns:1fr 1fr;padding:3rem}
.role-big-emoji{display:block;font-size:3.5rem;margin-bottom:1rem}
.role-tag-badge{border-radius:50px;display:inline-block;font-size:.72rem;font-weight:600;letter-spacing:.06em;margin-bottom:1rem;padding:.3rem .85rem;text-transform:uppercase}
.role-panel-name{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;margin-bottom:.7rem}
.role-panel-desc{color:var(--grey);font-size:.9rem;line-height:1.7}
.role-perks-title{color:var(--grey);font-size:.72rem;letter-spacing:.1em;margin-bottom:1.2rem;text-transform:uppercase}
.role-perk{align-items:center;border-bottom:1px solid var(--border);color:rgba(255,255,255,.85);display:flex;font-size:.9rem;gap:.75rem;padding:.8rem 0}
.role-perk:last-child{border-bottom:none}
.perk-check{flex-shrink:0;font-size:1rem}

/* CTA */
.cta-section{display:flex;justify-content:center;padding:5rem 5%}
.cta-box{background:linear-gradient(135deg,#3730e8,#6d28d9 60%,#4338f7);border-radius:28px;box-shadow:0 30px 100px var(--indigo-glow),0 0 0 1px rgba(99,102,241,.3);max-width:860px;overflow:hidden;padding:5rem;position:relative;text-align:center;width:100%}
.cta-orb{border-radius:50%;pointer-events:none;position:absolute}
.cta-orb1{background:rgba(255,255,255,.07);height:500px;right:-15%;top:-40%;width:500px}
.cta-orb2{background:rgba(255,255,255,.05);bottom:-35%;height:350px;left:-8%;width:350px}
.cta-inner{position:relative;z-index:1}
.cta-h2{font-family:'Syne',sans-serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:800;letter-spacing:-.035em;margin:.6rem 0 1rem}
.cta-sub{color:rgba(255,255,255,.78);font-size:.95rem;line-height:1.7;margin:0 auto 2.4rem;max-width:500px}
.cta-actions{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center}
.cta-btn{background:#fff;border-radius:50px;color:var(--indigo);display:inline-block;font-size:1rem;font-weight:600;padding:.85rem 2.2rem;text-decoration:none}
.cta-ghost{border:1px solid rgba(255,255,255,.3);border-radius:50px;color:rgba(255,255,255,.85);display:inline-block;font-size:1rem;padding:.85rem 2rem;text-decoration:none}

/* Footer */
.footer{border-top:1px solid var(--border);padding:2.2rem 5%}
.footer-inner{flex-wrap:wrap;gap:1rem;justify-content:space-between;margin:0 auto;max-width:1200px;align-items:center;display:flex}
.footer-brand{align-items:center;display:flex;gap:.7rem}
.footer-name{font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700}
.footer-name span{color:var(--indigo-light)}
.footer-tagline{font-size:.72rem;color:var(--grey)}
.footer-copy{font-size:.78rem;color:var(--grey)}
.footer-links{display:flex;gap:1.5rem}
.footer-links a{color:var(--grey);font-size:.78rem;text-decoration:none;transition:color .2s}
.footer-links a:hover{color:var(--white)}

@media(max-width:900px){
  .nav-links{display:none}
  .screen-inner{grid-template-columns:160px 1fr}
  .m-cards{grid-template-columns:1fr 1fr}
  .h-features-section{height:auto}
  .h-features-track{flex-wrap:wrap}
  .h-feat-card{width:calc(50% - .7rem)}
  .role-panel{gap:2rem;grid-template-columns:1fr}
}
@media(max-width:600px){
  .m-sidebar{display:none}
  .screen-inner{grid-template-columns:1fr}
  .h-feat-card{width:100%}
  .stats-row{align-items:center;flex-direction:column}
  .stat-item{border-bottom:1px solid var(--border);border-right:none;width:100%}
  .cta-box{padding:3rem 1.5rem}
  .hero-stats{gap:1.5rem}
}
`;

// ─────────────────────────────────────────
// Custom Cursor
// ─────────────────────────────────────────
export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.08 });
    };
    let raf: number;
    const loop = () => {
      ring.current.x += 0.1 * (mouse.current.x - ring.current.x);
      ring.current.y += 0.1 * (mouse.current.y - ring.current.y);
      gsap.set(ringRef.current, { x: ring.current.x, y: ring.current.y });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

// ─────────────────────────────────────────
// Particle Canvas
// ─────────────────────────────────────────
export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let mouse = { x: w / 2, y: h / 2 };

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0.35 * (Math.random() - 0.5),
      vy: 0.35 * (Math.random() - 0.5),
      r: 1.6 * Math.random() + 0.3,
      alpha: 0.4 * Math.random() + 0.15,
    }));

    const onMove = (e: MouseEvent) => { mouse = { x: e.clientX, y: e.clientY }; };
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) { p.vx += (dx / dist) * 0.018; p.vy += (dy / dist) * 0.018; }
        p.vx *= 0.97; p.vy *= 0.97;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.sqrt((particles[i].x - particles[j].x) ** 2 + (particles[i].y - particles[j].y) ** 2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.1 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

// ─────────────────────────────────────────
// Scramble Text Hook
// ─────────────────────────────────────────
function useScramble(text: string, active: boolean): string {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  useEffect(() => {
    if (!active) return;
    let step = 0;
    const id = setInterval(() => {
      setDisplay(text.split("").map((c, i) => c === " " ? " " : step / 22 > i / text.length ? c : chars[Math.floor(40 * Math.random())]).join(""));
      step++;
      if (step > 22) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [active, text]); // eslint-disable-line
  return display;
}

// ─────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────
export const Counter: React.FC<{ to: number; suffix?: string }> = ({ to, suffix = "" }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let v = 0;
        const tick = () => {
          v += 0.09 * (to - v) + 0.3;
          setCount(Math.min(Math.floor(v), to));
          if (v < to) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─────────────────────────────────────────
// Marquee
// ─────────────────────────────────────────
export const Marquee: React.FC = () => {
  const items = ["Academics","Attendance","Exams & Results","Timetable","Placements","Digital Library","Communication","Admin Control"];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-dot">✦</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Stats Bar
// ─────────────────────────────────────────
export const StatsBar: React.FC = () => (
  <div>
    <Marquee />
    <div className="stats-row">
      {[
        { to: 12, suffix: "+", label: "Roles Supported" },
        { to: 5000, suffix: "+", label: "Student Profiles" },
        { to: 99, suffix: "%", label: "Uptime SLA" },
        { to: 6, suffix: "", label: "Core Modules" },
      ].map((s, i) => (
        <motion.div key={i} className="stat-item"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.5 }}>
          <div className="stat-num"><Counter to={s.to} suffix={s.suffix} /></div>
          <div className="stat-label">{s.label}</div>
        </motion.div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────
// Mockup Section
// ─────────────────────────────────────────
export const MockupSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 1], [14, 0, -6]);
  const scale = useTransform(scrollYProgress, [0, 0.25], [0.88, 1]);

  const sidebarItems = [["Dashboard","Students"],["Subjects","Timetable","Attendance","Exams"],["Library","Placement"]];
  const cards = [
    { label: "Total Students", num: "60", sub: "↑ Active Roll", cls: "" },
    { label: "Classes Today", num: "0", sub: "Next: 11:30 AM", cls: "grey" },
    { label: "Shortage Alerts", num: "0", sub: "Below 75%", cls: "alert" },
    { label: "Assignments", num: "1", sub: "Ungraded", cls: "grey" },
  ];

  return (
    <div ref={ref} className="mockup-section">
      <div className="mockup-label">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="section-tag">Live Preview</div>
          <h2 className="section-title">See it in <span className="accent">action</span></h2>
        </motion.div>
      </div>
      <motion.div className="mockup-wrapper" style={{ y, rotateX, scale, transformPerspective: 1400 }}>
        <div className="screen-wrap">
          <div className="screen-bar">
            <div className="screen-dot d1" /><div className="screen-dot d2" /><div className="screen-dot d3" />
            <div className="screen-url">ngcms.xaviers.edu/dashboard</div>
          </div>
          <div className="screen-inner">
            {/* Sidebar */}
            <div className="m-sidebar">
              <div className="m-brand">NgCMS ERP<small>AI POWERED ERP</small></div>
              {["Dashboard","Students"].map(item => (
                <div key={item} className={`m-item${item === "Dashboard" ? " active" : ""}`}>
                  <div className="m-item-icon" />{item}
                </div>
              ))}
              <div className="m-section">ACADEMIC HUB</div>
              {["Subjects","Timetable","Attendance","Exams"].map(item => (
                <div key={item} className="m-item"><div className="m-item-icon" />{item}</div>
              ))}
              <div className="m-section">CAMPUS LIFE</div>
              {["Library","Placement"].map(item => (
                <div key={item} className="m-item"><div className="m-item-icon" />{item}</div>
              ))}
              <div className="m-avatar">
                <div className="m-av-circle">P</div>
                <div className="m-av-info">Prof. Alan Turing<small>Teacher ●</small></div>
              </div>
            </div>
            {/* Content */}
            <div className="m-content">
              <div className="m-header">
                <div>
                  <div className="m-role-label">TEACHER</div>
                  <div className="m-title">PORTAL <span>OVERVIEW</span></div>
                  <div className="m-subtitle">Spring Semester 2024</div>
                </div>
                <div className="m-date">SUNDAY<br />APRIL 5, 2026</div>
              </div>
              <div className="m-cards">
                {cards.map((c, i) => (
                  <motion.div key={i} className="m-card"
                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.3 + 0.08 * i }}>
                    <div className={`m-card-ico${c.cls === "alert" ? " red" : ""}`} />
                    <div className="m-card-label">{c.label}</div>
                    <div className="m-card-num">{c.num}</div>
                    <div className={`m-card-sub ${c.cls}`}>{c.sub}</div>
                  </motion.div>
                ))}
              </div>
              <div className="m-bottom">
                <div className="m-panel">
                  <div className="m-panel-title">Immediate Schedule</div>
                  <div className="m-panel-empty">No classes for remainder of today.</div>
                </div>
                <div className="m-action-card">
                  <div className="m-action-title">Publish Results</div>
                  <div className="m-action-desc">Admin reviewed Mark Records for Spring Internal. Ready for portal publishing?</div>
                  <div className="m-action-btn">VERIFY INTERNAL 01</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────
// Horizontal Scroll Features
// ─────────────────────────────────────────
export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const dist = track.scrollWidth - window.innerWidth + 120;
      gsap.to(track, {
        x: -dist, ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${dist + 400}`,
          scrub: 1.4, pin: true, anticipatePin: 1,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { icon: "📋", title: "Smart Attendance", desc: "Real-time tracking with shortage alerts and automated parent notifications below 75%.", color: "#4338F7" },
    { icon: "📝", title: "Exams & Results", desc: "End-to-end exam lifecycle — mark entry, verification, and secure admin-approved publishing.", color: "#7c3aed" },
    { icon: "📚", title: "Subjects & Materials", desc: "Upload syllabi and references. Students access everything from one searchable hub.", color: "#0ea5e9" },
    { icon: "🗓️", title: "Live Timetable", desc: "Role-aware schedule views with instant real-time propagation across all users.", color: "#10b981" },
    { icon: "💬", title: "Communication Hub", desc: "Announcements, messages, and notice boards connecting every stakeholder securely.", color: "#f59e0b" },
    { icon: "🎓", title: "Placement Portal", desc: "Track drives, applications, and offer letters. Full pipeline for placement cells.", color: "#ec4899" },
  ];

  return (
    <section ref={sectionRef} className="h-features-section" id="features">
      <div className="h-features-label">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="section-tag">Core Modules</div>
          <h2 className="section-title">Everything your<br /><span className="accent">campus needs</span></h2>
          <p className="h-scroll-hint">← Drag to explore →</p>
        </motion.div>
      </div>
      <div ref={trackRef} className="h-features-track">
        {features.map((f, i) => (
          <motion.div key={i} className="h-feat-card" style={{ "--accent": f.color } as React.CSSProperties}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.05 * i, duration: 0.5 }}>
            <div className="h-feat-num">0{i + 1}</div>
            <div className="h-feat-icon" style={{ background: f.color + "20" }}>{f.icon}</div>
            <h3 className="h-feat-title">{f.title}</h3>
            <p className="h-feat-desc">{f.desc}</p>
            <div className="h-feat-bar" style={{ background: f.color }} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────
// Roles Section
// ─────────────────────────────────────────
export const RolesSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const roles = [
    { emoji: "🏛️", name: "Administrator", tag: "Full Access", color: "#4338F7", desc: "Complete institutional oversight — manage users, approve results, configure modules, and monitor the entire campus ecosystem.", perks: ["User & Role Management","Result Approval Workflow","System Configuration","Analytics & Reports","Full Module Access"] },
    { emoji: "👨‍🏫", name: "Teacher", tag: "Academic Access", color: "#7c3aed", desc: "Your classroom, digitized. Mark attendance, upload materials, grade assignments, and publish verified results for your subjects.", perks: ["Attendance Marking","Material Uploads","Assignment Grading","Result Publishing","Timetable View"] },
    { emoji: "🎒", name: "Student", tag: "Student Portal", color: "#0ea5e9", desc: "Everything you need, one place. Track attendance, download materials, check results, and manage your placement journey.", perks: ["Attendance Tracking","Material Downloads","Result Viewing","Placement Applications","Communication"] },
    { emoji: "👨‍👩‍👧", name: "Parent", tag: "Guardian View", color: "#10b981", desc: "Stay connected with your ward's academic journey. Get instant alerts and monitor performance without stepping into the office.", perks: ["Attendance Monitoring","Result Viewing","Shortage Alerts","Communication","Progress Reports"] },
  ];

  return (
    <section className="roles-section" id="roles">
      <div className="roles-inner">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="section-tag">Access Control</div>
          <h2 className="section-title">One platform,<br /><span className="accent">every role</span></h2>
        </motion.div>
        <div className="roles-tabs">
          {roles.map((r, i) => (
            <motion.button key={i} className={`role-tab${active === i ? " active" : ""}`}
              onClick={() => setActive(i)}
              style={{ "--col": r.color } as React.CSSProperties}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <span className="role-tab-emoji">{r.emoji}</span>
              <span>{r.name}</span>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} className="role-panel"
            style={{ "--col": roles[active].color } as React.CSSProperties}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <div>
              <motion.div className="role-big-emoji"
                animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 0.5 }}>
                {roles[active].emoji}
              </motion.div>
              <div className="role-tag-badge"
                style={{ color: roles[active].color, background: roles[active].color + "18", border: `1px solid ${roles[active].color}44` }}>
                {roles[active].tag}
              </div>
              <h3 className="role-panel-name">{roles[active].name}</h3>
              <p className="role-panel-desc">{roles[active].desc}</p>
            </div>
            <div>
              <div className="role-perks-title">Capabilities</div>
              {roles[active].perks.map((perk, i) => (
                <motion.div key={perk} className="role-perk"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.07 * i, duration: 0.35 }}>
                  <span className="perk-check" style={{ color: roles[active].color }}>✓</span>
                  {perk}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────
// CTA Section
// ─────────────────────────────────────────
export const CTASection: React.FC = () => (
  <section className="cta-section" id="login">
    <motion.div className="cta-box"
      initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <div className="cta-orb cta-orb1" />
      <div className="cta-orb cta-orb2" />
      <div className="cta-inner">
        <div className="section-tag" style={{ color: "rgba(255,255,255,0.7)" }}>Ready to get started?</div>
        <h2 className="cta-h2">Digitize your campus.<br />Unify your institution.</h2>
        <p className="cta-sub">Join faculty, students, and staff on NgCMS ERP — the secure, AI-powered platform built for modern education.</p>
        <div className="cta-actions">
          <motion.a href="/login" className="cta-btn"
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,255,255,0.25)" }}
            whileTap={{ scale: 0.97 }}>Initialize Connection →</motion.a>
          <a href="#" className="cta-ghost">Request a Demo</a>
        </div>
      </div>
    </motion.div>
  </section>
);

// ─────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────
export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <motion.nav className={`nav${scrolled ? " nav-scrolled" : ""}`}
      initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <div className="nav-logo">
        <div className="nav-logo-icon">✦</div>
        <div className="nav-logo-text">NgCMS <span>ERP</span></div>
      </div>
      <ul className="nav-links">
        {["Features","Roles","About","Contact"].map(item => (
          <li key={item}><a href={`#${item.toLowerCase()}`}>{item}</a></li>
        ))}
      </ul>
      <motion.a href="/login" className="nav-cta"
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>Sign In →</motion.a>
    </motion.nav>
  );
};

// ─────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────
export const HeroSection: React.FC = () => {
  const [active, setActive] = useState(false);
  const line1 = useScramble("INTELLIGENT", active);
  const line2 = useScramble("CAMPUS OS", active);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 160]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0]);

  useEffect(() => { const t = setTimeout(() => setActive(true), 400); return () => clearTimeout(t); }, []);

  return (
    <section className="hero">
      <ParticleCanvas />
      <div className="hero-bg" />
      <div className="hero-grid" />
      <motion.div className="hero-content" style={{ y, opacity }}>
        <motion.div className="hero-badge"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}>
          <span className="badge-pulse" /> &nbsp;St. Xavier's Digital Curator
        </motion.div>
        <motion.h1 className="hero-h1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.2 }}>
          <span className="hero-line-thin">THE</span><br />
          <span className="hero-line-accent">{line1}</span><br />
          <span className="hero-line-white">{line2}</span>
        </motion.h1>
        <motion.p className="hero-sub"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}>
          NgCMS ERP unifies academics, attendance, exams, placements, and communication — tailored for every role, powered by AI.
        </motion.p>
        <motion.div className="hero-actions"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}>
          <motion.a href="/login" className="btn-primary" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Initialize Connection <span className="btn-arrow">→</span>
          </motion.a>
          <motion.a href="#features" className="btn-ghost" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Explore Features
          </motion.a>
        </motion.div>
        <motion.div className="hero-stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}>
          {[["60+","Students"],["4","Roles"],["99%","Uptime"]].map(([val, label]) => (
            <div key={label} className="hero-stat">
              <strong>{val}</strong>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
      <motion.div className="hero-scroll-hint"
        animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
        <div className="scroll-line" /> scroll
      </motion.div>
    </section>
  );
};

// ─────────────────────────────────────────
// Footer
// ─────────────────────────────────────────
export const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <div className="nav-logo-icon" style={{ width: 28, height: 28, fontSize: ".85rem" }}>✦</div>
        <div>
          <div className="footer-name">NgCMS <span>ERP</span></div>
          <div className="footer-tagline">St. Xavier's Digital Curator</div>
        </div>
      </div>
      <div className="footer-copy">© 2026 NgCMS ERP. All rights reserved.</div>
      <div className="footer-links">
        {["Privacy","Terms","Support"].map(l => <a key={l} href="#">{l}</a>)}
      </div>
    </div>
  </footer>
);

// ─────────────────────────────────────────
// Style injector (call once at app root)
// ─────────────────────────────────────────
export const NgCMSStyles: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
);

// ─────────────────────────────────────────
// Root App Component
// ─────────────────────────────────────────
const NgCMSLandingPage: React.FC = () => (
  <>
    <NgCMSStyles />
    <CustomCursor />
    <Navbar />
    <HeroSection />
    <StatsBar />
    <MockupSection />
    <FeaturesSection />
    <RolesSection />
    <CTASection />
    <Footer />
  </>
);

export default NgCMSLandingPage;
