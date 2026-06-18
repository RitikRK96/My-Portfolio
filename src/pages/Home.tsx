import { useState, useEffect, useRef } from "react";
import {
  Github,
  Linkedin,
  Mail,
  Briefcase,
  GraduationCap,
  Award,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import ContactSection from "../components/ContactSection";
import { useSEO } from "../hooks/useSEO";

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words: string[], speed = 110, pause = 1800) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    }

    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return displayed;
}

// ── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const StatCounter = ({ val, label }: { val: string; label: string }) => {
  const num = parseInt(val);
  const { count, ref } = useCounter(num);
  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-white orbitron">
        {count}
        <span className="text-orange-400">+</span>
      </div>
      <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
};

const WEB_SKILLS = [
  { name: "React.js", icon: "https://cdn.simpleicons.org/react" },
  { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs" },
  { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript" },
  { name: "Firebase", icon: "https://cdn.simpleicons.org/firebase" },
  { name: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss" },
  { name: "Git", icon: "https://cdn.simpleicons.org/git" },
];

import powerbiIcon from "../assets/powerbi.png";
import tableauIcon from "../assets/tableau.png";

const AI_SKILLS = [
  { name: "Python", icon: "https://cdn.simpleicons.org/python" },
  { name: "Databricks", icon: "https://cdn.simpleicons.org/databricks" },
  { name: "Apache Spark", icon: "https://cdn.simpleicons.org/apachespark" },
  { name: "Power BI", icon: powerbiIcon },
  { name: "Pandas", icon: "https://cdn.simpleicons.org/pandas/white" },
  { name: "Scikit-learn", icon: "https://cdn.simpleicons.org/scikitlearn" },
  { name: "LangChain", icon: "https://cdn.simpleicons.org/langchain/white" },
  {
    name: "Azure",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  },
  { name: "Tableau", icon: tableauIcon },
  {
    name: "SQL",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
  },
];

const Home = () => {
  const typedRole = useTypewriter(
    ["Full-Stack Developer", "React Developer", "AI Engineer"],
    90,
    2000,
  );

  const [terminalTab, setTerminalTab] = useState<"code" | "terminal" | "json">(
    "code",
  );
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "# Interactive terminal v1.0.0 initialized.",
    "# Click commands below to run simulations...",
    "",
  ]);

  const runServerSim = () => {
    setTerminalLogs([
      "$ npm run dev",
      "  vite v5.2.4 dev server running...",
      "  > Local:   http://localhost:5173/",
      "  > Network: use --host to expose",
      "  ✓ Ready in 210ms",
      "  [info] HMR connection established successfully.",
    ]);
  };

  const trainModelSim = () => {
    setTerminalLogs([
      "$ python train_classifier.py",
      "  [1/3] Loading dataset (34.5k rows)... done.",
      "  [2/3] Extracting features via scikit-learn... done.",
      "  [3/3] Training Random Forest model:",
      "        - Epoch 1/3: val_loss: 0.184 - val_acc: 0.941",
      "        - Epoch 2/3: val_loss: 0.091 - val_acc: 0.972",
      "        - Epoch 3/3: val_loss: 0.054 - val_acc: 0.989",
      "  ✓ Model training complete.",
      "  ✓ Saved weights to ./weights/rf_model.bin",
      "  Accuracy: 98.9% | F1-Score: 0.988",
    ]);
  };

  const resetLogs = () => {
    setTerminalLogs([
      "# Terminal cleared.",
      "# Select a command above to run a task.",
    ]);
  };

  const renderCodeTab = () => {
    return (
      <pre className="text-gray-300 font-mono text-[10px] sm:text-xs leading-relaxed select-all">
        <code>
          <div>
            <span className="text-purple-400">import</span> {"{"}{" "}
            <span className="text-cyan-400">Developer</span> {"}"}{" "}
            <span className="text-purple-400">from</span>{" "}
            <span className="text-green-300">'ritik'</span>;
          </div>
          <div className="text-gray-600">// Professional profile metadata</div>
          <div>
            <span className="text-purple-400">const</span>{" "}
            <span className="text-yellow-400">ritik</span>:{" "}
            <span className="text-cyan-400">Developer</span> = {"{"}
          </div>
          <div className="pl-4">
            <span className="text-orange-300">name</span>:{" "}
            <span className="text-green-300">'Ritik Kumar'</span>,
          </div>
          <div className="pl-4">
            <span className="text-orange-300">role</span>:{" "}
            <span className="text-green-300">'Software Engineer @ Wipro'</span>,
          </div>
          <div className="pl-4">
            <span className="text-orange-300">specialties</span>: [
          </div>
          <div className="pl-8">
            <span className="text-green-300">'Full-Stack Development'</span>,
          </div>
          <div className="pl-8">
            <span className="text-green-300">'Data Analytics'</span>,
          </div>
          <div className="pl-8">
            <span className="text-green-300">
              'AI & Solutions Architecture'
            </span>
          </div>
          <div className="pl-4">],</div>
          <div className="pl-4">
            <span className="text-orange-300">stack</span>: {"{"}
          </div>
          <div className="pl-8">
            <span className="text-orange-300">frontend</span>: [
            <span className="text-green-300">'React.js'</span>,{" "}
            <span className="text-green-300">'TypeScript'</span>,{" "}
            <span className="text-green-300">'TailwindCSS'</span>],
          </div>
          <div className="pl-8">
            <span className="text-orange-300">backend</span>: [
            <span className="text-green-300">'Node.js'</span>,{" "}
            <span className="text-green-300">'Firebase'</span>,{" "}
            <span className="text-green-300">'Express'</span>],
          </div>
          <div className="pl-8">
            <span className="text-orange-300">dataAI</span>: [
            <span className="text-green-300">'Python'</span>,{" "}
            <span className="text-green-300">'Databricks'</span>,{" "}
            <span className="text-green-300">'Apache Spark'</span>,{" "}
            <span className="text-green-300">'SQL'</span>]
          </div>
          <div className="pl-4">{"}"},</div>
          <div className="pl-4">
            <span className="text-orange-300">focus</span>:{" "}
            <span className="text-green-300">
              'High-performance web apps & intelligent data pipes'
            </span>
          </div>
          <div>{"}"};</div>
          <div className="mt-2">
            <span className="text-purple-400">export default</span>{" "}
            <span className="text-yellow-400">ritik</span>;
          </div>
        </code>
      </pre>
    );
  };

  const renderJsonTab = () => {
    return (
      <pre className="text-gray-300 font-mono text-[10px] sm:text-xs leading-relaxed select-all">
        <code>
          <div>{"{"}</div>
          <div className="pl-4">
            <span className="text-orange-300">"status"</span>:{" "}
            <span className="text-green-300">"Active"</span>,
          </div>
          <div className="pl-4">
            <span className="text-orange-300">"location"</span>:{" "}
            <span className="text-green-300">"Bengaluru, India"</span>,
          </div>
          <div className="pl-4">
            <span className="text-orange-300">"experience"</span>:{" "}
            <span className="text-green-300">"2+ Years"</span>,
          </div>
          <div className="pl-4">
            <span className="text-orange-300">"metrics"</span>: {"{"}
          </div>
          <div className="pl-8">
            <span className="text-orange-300">"projectsCompleted"</span>:{" "}
            <span className="text-yellow-400">37</span>,
          </div>
          <div className="pl-8">
            <span className="text-orange-300">"keyEngagements"</span>:{" "}
            <span className="text-yellow-400">10</span>,
          </div>
          <div className="pl-8">
            <span className="text-orange-300">"codeCommits"</span>:{" "}
            <span className="text-green-300">"1,200+"</span>
          </div>
          <div className="pl-4">{"}"},</div>
          <div className="pl-4">
            <span className="text-orange-300">"latestFeatures"</span>: [
          </div>
          <div className="pl-8">
            <span className="text-green-300">
              "MS Word simulated pagination"
            </span>
            ,
          </div>
          <div className="pl-8">
            <span className="text-green-300">
              "Custom high-contrast text selection"
            </span>
          </div>
          <div className="pl-4">],</div>
          <div className="pl-4">
            <span className="text-orange-300">"availableForHire"</span>:{" "}
            <span className="text-purple-400">true</span>
          </div>
          <div>{"}"}</div>
        </code>
      </pre>
    );
  };

  const renderTerminalTab = () => {
    return (
      <div className="flex flex-col h-full font-mono text-[10px] sm:text-xs text-gray-300">
        <div className="flex gap-2 mb-3 bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.05] flex-wrap select-none">
          <button
            onClick={runServerSim}
            className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[9px] font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>▶</span> npm run dev
          </button>
          <button
            onClick={trainModelSim}
            className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded text-[9px] font-bold hover:bg-orange-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>▶</span> python train.py
          </button>
          <button
            onClick={resetLogs}
            className="px-2 py-1 bg-white/[0.05] border border-white/[0.08] text-gray-400 rounded text-[9px] font-bold hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 bg-black/30 p-3 rounded-lg border border-white/[0.03] min-h-[160px] max-h-[220px] scrollbar-none select-all">
          {terminalLogs.map((log, i) => (
            <div
              key={i}
              className={
                log.startsWith("$")
                  ? "text-yellow-400"
                  : log.startsWith("✓")
                    ? "text-green-400"
                    : "text-gray-400"
              }
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    );
  };

  useSEO(
    "Ritik Kumar | Full-Stack Developer & AI Specialist",
    "Portfolio of Ritik Kumar, a Full-Stack Developer specializing in React.js, Node.js, and Data Analytics & AI.",
    "Ritik Kumar, Full-Stack Developer, React.js, Node.js, AI, Data Analytics",
    "https://avatars.githubusercontent.com/u/96340458?v=4",
    "https://ritik.world/",
  );

  return (
    <div className="space-y-0">
      <div className="naruto-bg" />
      {/* ── Hero ── */}
      <section className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
        {/* Floating ambient orbs */}
        <div className="absolute top-1/4 left-[10%] w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
        <div className="absolute bottom-1/4 right-[10%] w-48 h-48 bg-red-500/5 rounded-full blur-[60px] animate-[pulse_8s_ease-in-out_infinite_2s] pointer-events-none" />
        <div className="absolute top-[60%] left-[40%] w-32 h-32 bg-orange-400/3 rounded-full blur-[40px] animate-[pulse_10s_ease-in-out_infinite_4s] pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto z-10 pt-24 pb-8 sm:pt-24 sm:pb-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Text Column */}
            <div className="flex-1 text-center lg:text-left" data-aos="fade-up">
              {/* Status Badge */}
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold tracking-wide backdrop-blur-sm select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  AVAILABLE FOR NEW OPPORTUNITIES
                </div>
              </div>

              <span className="inline-block text-gray-400 text-sm sm:text-base orbitron tracking-[.25em] mb-2 min-h-[1.5em] select-none">
                {"<"} <span className="text-orange-400">{typedRole}</span>
                <span className="inline-block w-0.5 h-4 bg-orange-400 ml-0.5 animate-[blink_0.8s_step-end_infinite] align-middle" />
                {" />"}
              </span>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black orbitron leading-[1.05] mb-3 select-none tracking-tight">
                <span
                  className="naruto-text block"
                  style={{
                    animationDelay: "0s",
                    animation: "slideInLeft 0.7s ease-out both",
                  }}
                >
                  RITIK
                </span>
                <span
                  className="sharingan-text block"
                  style={{
                    animationDelay: "0.3s",
                    animation: "slideInLeft 0.7s ease-out 0.3s both",
                  }}
                >
                  Kumar
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-6 animate-[fadeIn_1s_ease-out_0.4s_both]">
                Software Engineer specializing in building{" "}
                <span className="text-white font-semibold">
                  high-performance web applications
                </span>{" "}
                and
                <span className="text-white font-semibold">
                  {" "}
                  intelligent data &amp; AI systems
                </span>
                . Currently designing robust solutions at Wipro.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
                <Link
                  to="/projects"
                  className="group px-7 py-3.5 rounded-xl bg-orange-500 text-black font-bold orbitron text-sm hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Projects</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </Link>
                <Link
                  to="/contact"
                  className="px-7 py-3.5 rounded-xl border border-white/20 text-gray-300 font-bold orbitron text-sm hover:bg-white/10 hover:border-white/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Get in Touch
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 sm:gap-10 justify-center lg:justify-start border-t border-white/[0.06] pt-6">
                {[
                  { val: "37+", label: "Projects Completed" },
                  { val: "10+", label: "Key Projects" },
                  { val: "2+", label: "Years Experience" },
                ].map((s) => (
                  <StatCounter key={s.label} val={s.val} label={s.label} />
                ))}
              </div>
            </div>

            {/* Interactive IDE Mockup Column */}
            <div
              className="flex-1 w-full flex justify-center"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              <div className="w-full max-w-lg lg:max-w-xl bg-[#09090f]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] flex flex-col">
                {/* Window title bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d15] border-b border-white/[0.06] select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 border border-red-600/30" />
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 border border-yellow-600/30" />
                    <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 border border-green-600/30" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-md text-[10px] text-gray-500 font-mono">
                    <span>~/ritik-kumar/portfolio</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Tabs bar */}
                <div className="flex bg-[#07070c] border-b border-white/[0.04] overflow-x-auto select-none scrollbar-none">
                  {[
                    {
                      id: "code",
                      label: "Developer.tsx",
                      icon: "⚛️",
                      color: "text-cyan-400",
                    },
                    {
                      id: "terminal",
                      label: "terminal.sh",
                      icon: "💻",
                      color: "text-yellow-400",
                    },
                    {
                      id: "json",
                      label: "Analytics.json",
                      icon: "📋",
                      color: "text-orange-400",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTerminalTab(t.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 border-r border-white/[0.04] text-xs font-mono transition-all cursor-pointer ${
                        terminalTab === t.id
                          ? "bg-[#0c0c14] text-white border-b-2 border-b-orange-400 font-semibold"
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className={t.color}>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Workspace content */}
                <div className="p-5 bg-[#0c0c14] min-h-[300px] flex flex-col justify-between">
                  <div className="flex-1 overflow-x-auto scrollbar-thin">
                    {terminalTab === "code" && renderCodeTab()}
                    {terminalTab === "terminal" && renderTerminalTab()}
                    {terminalTab === "json" && renderJsonTab()}
                  </div>

                  {/* Footer status line */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04] text-[9px] text-gray-600 font-mono select-none">
                    <div className="flex items-center gap-3">
                      <span>● UTF-8</span>
                      <span>● TypeScript</span>
                    </div>
                    <div>
                      <span>
                        Ln{" "}
                        {terminalTab === "code"
                          ? "12, Col 2"
                          : terminalTab === "json"
                            ? "15, Col 4"
                            : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-gray-600 hidden sm:block select-none pointer-events-none">
          <ChevronDown size={28} />
        </div>
      </section>

      {/* ── About + Education ── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div
            className="naruto-card p-7 sm:p-9 rounded-2xl"
            data-aos="fade-up"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400">
                <Briefcase size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold orbitron text-white">
                Professional Profile
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-5 text-sm sm:text-base">
              Full-stack developer building responsive, scalable web apps with
              React.js, Node.js &amp; modern JS frameworks — focused on
              performance-optimized, user-centric platforms.
            </p>
            <p className="text-gray-300 leading-relaxed border-l-4 border-red-500 pl-4 text-sm sm:text-base">
              Currently a{" "}
              <span className="text-red-500 font-bold">Software Engineer</span>{" "}
              at Wipro in Data Analytics &amp; AI. Previously at{" "}
              <span className="text-orange-400 font-bold">Lancway</span>,
              delivering full-stack web solutions.
            </p>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {[
                {
                  icon: <Github size={18} />,
                  href: "https://github.com/RitikRK96",
                  label: "GitHub",
                },
                {
                  icon: <Linkedin size={18} />,
                  href: "https://www.linkedin.com/in/ritikkumar08/",
                  label: "LinkedIn",
                },
                {
                  icon: <Mail size={18} />,
                  href: "mailto:ritikrk008@gmail.com",
                  label: "Email",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-[0_0_12px_rgba(255,165,0,0.2)] hover:scale-110 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div
            className="naruto-card p-7 sm:p-9 rounded-2xl"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
                <GraduationCap size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold orbitron text-white">
                Education
              </h3>
            </div>
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <div>
                  <h4 className="font-bold text-white text-base sm:text-lg">
                    B.E. Computer Science
                  </h4>
                  <p className="text-gray-400 text-sm">Chandigarh University</p>
                </div>
                <span className="text-red-500 font-bold orbitron text-sm shrink-0">
                  CGPA: 7.79
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-orange-400" />
                  <h4 className="font-bold text-white">
                    Certifications &amp; Achievements
                  </h4>
                </div>
                <ul className="space-y-1.5 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                    Top 2% NPTEL IoT Certification
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    SQL Expert (HackerRank)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 relative">
        {/* Animated section divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold orbitron mb-3">
              <span className="naruto-text">Technical Skills</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Technologies I work with every day.
            </p>
          </div>

          {/* Web Dev */}
          <div className="mb-10" data-aos="fade-up">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px flex-1 bg-gradient-to-r from-orange-400/40 to-transparent" />
              <span className="text-xs orbitron text-orange-400 tracking-widest">
                WEB DEVELOPMENT
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-orange-400/40 to-transparent" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {WEB_SKILLS.map((s, i) => (
                <div
                  key={s.name}
                  className="naruto-card rounded-xl p-4 text-center group hover:-translate-y-1 transition-all duration-300"
                  data-aos="zoom-in"
                  data-aos-delay={i * 60}
                >
                  <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                    <img
                      src={s.icon}
                      alt={s.name}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-gray-300 text-xs font-medium leading-tight block">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data & AI */}
          <div data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent" />
              <span className="text-xs orbitron text-red-500 tracking-widest">
                DATA ANALYTICS &amp; AI
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-red-500/40 to-transparent" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {AI_SKILLS.map((s, i) => (
                <div
                  key={s.name}
                  className="naruto-card rounded-xl p-4 text-center group hover:-translate-y-1 transition-all duration-300"
                  data-aos="zoom-in"
                  data-aos-delay={i * 50}
                >
                  <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                    <img
                      src={s.icon}
                      alt={s.name}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-gray-300 text-xs font-medium leading-tight block">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Experience Timeline ── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold orbitron mb-3">
              <span className="sharingan-text">Work Experience</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              My professional journey so far.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-5 sm:left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-400 via-red-500 to-transparent md:-translate-x-px" />

            {/* Wipro */}
            <TimelineCard
              side="left"
              dotColor="bg-orange-400 shadow-[0_0_14px_rgba(255,165,0,0.7)]"
              logo="W"
              logoGrad="from-orange-500 to-red-600"
              company="Wipro"
              period="Mar 2026 — Present"
              role="Software Engineer"
              roleColor="text-red-500"
              desc="Data Analytics & AI — Cutting-edge analytics solutions and AI-driven insights to guide business decisions."
              tags={[
                {
                  label: "Data Analytics",
                  cls: "bg-orange-500/10 border-orange-500/20 text-orange-300",
                },
                {
                  label: "AI/ML",
                  cls: "bg-red-500/10 border-red-500/20 text-red-300",
                },
                {
                  label: "GenAI",
                  cls: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
                },
              ]}
              aosDelay={0}
            />

            {/* Lancway */}
            <TimelineCard
              side="right"
              dotColor="bg-red-500 shadow-[0_0_14px_rgba(255,0,0,0.7)]"
              logo="L"
              logoGrad="from-red-500 to-orange-600"
              company="Lancway"
              period="Apr 2025 — Feb 2026"
              role="Full-Stack Developer"
              roleColor="text-orange-400"
              desc="Delivered end-to-end web apps with React, Node.js & Firebase. Clean code, fast performance, scalable architecture."
              tags={[
                {
                  label: "React",
                  cls: "bg-orange-500/10 border-orange-500/20 text-orange-300",
                },
                {
                  label: "Node.js",
                  cls: "bg-red-500/10 border-red-500/20 text-red-300",
                },
                {
                  label: "Firebase",
                  cls: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
                },
                {
                  label: "TypeScript",
                  cls: "bg-blue-500/10 border-blue-500/20 text-blue-300",
                },
              ]}
              aosDelay={120}
            />
          </div>
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-500/5 rounded-[100%] blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs orbitron tracking-wider mb-5">
              Available for Collaboration
            </span>
            <h2 className="text-3xl sm:text-5xl font-black orbitron mb-4 leading-tight">
              <span className="naruto-text">Let's Build Something</span>{" "}
              <span className="sharingan-text">Great</span>
              <br />
              <span className="text-white">Together</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
              Whether it's a fast-growing startup, a custom project, or just a
              professional chat — I'm always excited to connect.
            </p>
          </div>

          <ContactSection />
        </div>
      </section>
    </div>
  );
};

/* ── Timeline Card (reusable) ── */
interface Tag {
  label: string;
  cls: string;
}
interface TimelineCardProps {
  side: "left" | "right";
  dotColor: string;
  logo: string;
  logoGrad: string;
  company: string;
  period: string;
  role: string;
  roleColor: string;
  desc: string;
  tags: Tag[];
  aosDelay: number;
}

const TimelineCard = ({
  side,
  dotColor,
  logo,
  logoGrad,
  company,
  period,
  role,
  roleColor,
  desc,
  tags,
  aosDelay,
}: TimelineCardProps) => {
  const card = (
    <div className="naruto-card p-5 sm:p-6 rounded-xl w-full max-w-sm group-hover:border-orange-500/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${logoGrad} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
        >
          {logo}
        </div>
        <div>
          <h4 className="font-bold text-white text-base sm:text-lg leading-tight">
            {company}
          </h4>
          <span className="text-xs text-orange-400 orbitron">{period}</span>
        </div>
      </div>
      <p className={`${roleColor} font-semibold text-sm mb-2`}>{role}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {tags.map((t) => (
          <span
            key={t.label}
            className={`text-xs px-2 py-1 rounded-full border ${t.cls}`}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="relative flex flex-col md:flex-row items-start mb-12 group"
      data-aos="fade-up"
      data-aos-delay={aosDelay}
    >
      {/* Desktop left */}
      {side === "left" ? (
        <div className="hidden md:flex md:w-1/2 md:justify-end md:pr-12">
          {card}
        </div>
      ) : (
        <div className="hidden md:block md:w-1/2" />
      )}

      {/* Dot */}
      <div
        className={`absolute left-5 sm:left-6 md:left-1/2 w-3 h-3 rounded-full ${dotColor} -translate-x-1/2 mt-6 z-10 ring-4 ring-[#0a0a0f]`}
      />

      {/* Desktop right */}
      {side === "right" ? (
        <div className="hidden md:block md:w-1/2 md:pl-12">{card}</div>
      ) : (
        <div className="hidden md:block md:w-1/2" />
      )}

      {/* Mobile card */}
      <div className="md:hidden ml-12 sm:ml-14 w-[calc(100%-3rem)] sm:w-[calc(100%-3.5rem)]">
        {card}
      </div>
    </div>
  );
};

export default Home;
