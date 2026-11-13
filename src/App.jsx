import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Clock3,
  Menu,
  X,
  Play,
  Pause,
  Volume1,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import { chapters } from "./chapters";

const rain =
  "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=85";

// Keeps local images and music working on localhost and GitHub Pages.
const publicAsset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

function getProgress() {
  try {
    return JSON.parse(
      localStorage.getItem("blu-progress") || '{"last":1,"done":[]}'
    );
  } catch {
    return { last: 1, done: [] };
  }
}

function saveProgress(number, done = false) {
  const chapterData = chapters.find((item) => item.number === number);
  if (!chapterData || chapterData.comingSoon) return;
  const progress = getProgress();
  localStorage.setItem(
    "blu-progress",
    JSON.stringify({
      last: number,
      done: done ? [...new Set([...(progress.done || []), number])] : progress.done || [],
    })
  );
}

function Header({ dark = false }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={`header ${dark ? "transparent" : ""}`}>
      <Link to="/" className="brand">
         THE BLU <i>BASEMENT</i>
      </Link>
      <button className="mobile-menu" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "open" : ""}>
        <NavLink to="/" onClick={() => setOpen(false)}>HOME</NavLink>
        <NavLink to="/story" onClick={() => setOpen(false)}>THE STORY</NavLink>
        <NavLink to="/author" onClick={() => setOpen(false)}>THE AUTHOR</NavLink>
      </nav>
      <Link to="/story" className="enter-small">ENTER ↗</Link>
    </header>
  );
}

// Compact soundtrack player shown in the sticky chapter sidebar.
function MusicPlayer({ chapterNumber, chapterTitle }) {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [error, setError] = useState("");
  const track = publicAsset(`music/chapter-${chapterNumber}.mp3`);

  function fadeTo(target, duration = 650) {
    const audio = audioRef.current;
    if (!audio) return;
    window.clearInterval(fadeRef.current);
    const start = audio.volume;
    const steps = 16;
    const increment = (target - start) / steps;
    let count = 0;
    fadeRef.current = window.setInterval(() => {
      count += 1;
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, start + increment * count));
      }
      if (count >= steps) {
        window.clearInterval(fadeRef.current);
        if (audioRef.current) audioRef.current.volume = target;
      }
    }, duration / steps);
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      window.clearInterval(fadeRef.current);
      fadeTo(0, 220);
      window.setTimeout(() => {
        audio.pause();
        setIsPlaying(false);
      }, 240);
      return;
    }
    try {
      setError("");
      audio.volume = 0;
      await audio.play();
      setIsPlaying(true);
      fadeTo(volume, 700);
    } catch {
      setIsPlaying(false);
      setError(`Add chapter-${chapterNumber}.mp3 to public/music`);
    }
  }

  function changeVolume(value) {
    const nextVolume = Number(value);
    setVolume(nextVolume);
    if (audioRef.current && isPlaying) fadeTo(nextVolume, 180);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    window.clearInterval(fadeRef.current);
    audio.pause();
    audio.currentTime = 0;
    audio.src = track;
    audio.load();
    setIsPlaying(false);
    setError("");
    return () => window.clearInterval(fadeRef.current);
  }, [track]);

  useEffect(() => () => {
    window.clearInterval(fadeRef.current);
    if (audioRef.current) audioRef.current.pause();
  }, []);

  return (
    <div className={`mini-music-player ${isPlaying ? "is-playing" : ""}`}>
      <audio
        ref={audioRef}
        src={track}
        loop
        preload="metadata"
        onError={() => {
          if (isPlaying) setError(`Audio unavailable: chapter-${chapterNumber}.mp3`);
        }}
      />
      <div className="mini-player-topline">
        <span className="mini-music-orb"><Music size={15} /></span>
        <div className="mini-music-copy">
          <span className="mini-music-kicker">NOW IN THE ROOM</span>
          <strong title={chapterTitle}>{chapterTitle}</strong>
        </div>
        <button
          type="button"
          className="mini-play-button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
          title={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
      <div className="mini-volume-row">
        <Volume1 size={14} className="mini-volume-low" />
        <input
          className="mini-volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(event) => changeVolume(event.target.value)}
          aria-label="Soundtrack volume"
          title="Soundtrack volume"
        />
        <Volume2 size={15} className="mini-volume-high" />
      </div>
      <span className="mini-music-status" aria-live="polite">
        {error || (isPlaying ? "PLAYING · AMBIENT" : "SOUNDTRACK · PAUSED")}
      </span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="brand">THE BLU <i>BASEMENT</i></Link>
      <span>MEMORY IS A ROOM WITH NO LOCK.</span>
      <Link to="/author">GOBINDA PANDA ↗</Link>
    </footer>
  );
}

function Landing() {
  const go = useNavigate();
  return (
    <main className="landing">
      <div className="cover" style={{ backgroundImage: `url(${rain})` }} />
      <div className="cover-shade" />
      <Header dark />
      <section className="hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="kicker"><span /> A PSYCHOLOGICAL MYSTERY <span /></div>
          <h1>THE BLU<br /><em>BASEMENT</em></h1>
          <p className="tagline">Some doors keep secrets.<br />Others remember who you were.</p>
          <button className="cta" onClick={() => go("/story")}>ENTER THE BASEMENT <ArrowRight size={17} /></button>
          <p className="byline">AN IMMERSIVE READING EXPERIENCE <b>·</b> BY GOBINDA PANDA</p>
        </motion.div>
      </section>
      <div className="hero-foot">
        <span>34°03' N / 118°14' W</span><span>A STORY IN BLUE — VOL. 01</span>
        <a href="#threshold"><ArrowDown size={14} /> DESCEND</a>
      </div>
      <section id="threshold" className="threshold">
        <div className="threshold-photo" style={{ backgroundImage: `url(${rain})` }} />
        <div>
          <span className="eyebrow">BEFORE YOU BEGIN / 001</span>
          <h2>Not every memory<br />belongs to <em>you.</em></h2>
          <p>Rain. A nameless feeling. A door that should not exist. Step inside a story where the past is never as far away as it seems—and every silence has a pulse.</p>
          <Link className="text-link" to="/story">Begin reading <ArrowRight size={15} /></Link>
        </div>
      </section>
      <Footer /><div className="grain" />
    </main>
  );
}

function Story() {
  const progress = getProgress();
  const last = chapters.find((chapter) => chapter.number === progress.last && !chapter.comingSoon) || chapters[0];
  return (
    <main className="page">
      <Header />
      <section className="intro">
        <span className="eyebrow">● THE ARCHIVE / TWENTY CHAPTERS</span>
        <h1>Every room has<br />a <em>memory.</em></h1>
        <p>Read slowly. Notice what changes. The story is waiting on the other side of the door.</p>
        <Link className="resume" to={`/chapter/${last.number}`}>
          <BookOpen /><span><small>{progress.last > 1 ? "PICK UP WHERE YOU LEFT OFF" : "YOUR FIRST DESCENT"}</small><strong>{last.title}</strong><small>CHAPTER {String(last.number).padStart(2, "0")} OF 20</small></span><ArrowRight />
        </Link>
      </section>
      
<section className="archive">
  <div className="archive-label">
    <span>THE CHAPTERS</span>
    <span>20 ENTRIES · ONE STORY</span>
  </div>

  <div className="grid">
    {chapters.map((chapter, index) => (
      <Link
        to={`/chapter/${chapter.number}`}
        className="card"
        key={chapter.number}
      >
        {/* Chapter artwork */}
        <div className={`art art${chapter.number}`}>
          <img
            src={publicAsset(`media/Chapter ${chapter.number}.png`)}
            alt={`Chapter ${chapter.number}: ${chapter.title}`}
            className="chapter-card-image"
            loading="lazy"
          />

          <span className="artnum">
            {String(chapter.number).padStart(2, "0")}
          </span>

          <small>{chapter.eyebrow}</small>

          {!chapter.comingSoon &&
            progress.done?.includes(chapter.number) && (
              <label>READ</label>
            )}
        </div>

        {/* Chapter information */}
        <div className="cardcopy">
          <small>
            CHAPTER {String(chapter.number).padStart(2, "0")}
          </small>

          <h3>{chapter.title}</h3>

          <p>{chapter.summary}</p>

          <span>
            {chapter.comingSoon
              ? "COMING SOON · STAY CLOSE"
              : "OPEN CHAPTER →"}
          </span>
        </div>
      </Link>
    ))}
  </div>
</section>

      <blockquote>“The first thing I remember isn't my name.<br />It's Blu.”<small>— FROM CHAPTER ONE</small></blockquote>
      <Footer /><div className="grain" />
    </main>
  );
}

function Reader() {
  const { id } = useParams();
  const chapter = chapters.find((item) => item.number === Number(id));
  const [size, setSize] = useState(1);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (chapter && !chapter.comingSoon) saveProgress(chapter.number);
  }, [id]);

  if (!chapter) return <Story />;

  const previous = chapters.find((item) => item.number === chapter.number - 1);
  const next = chapters.find((item) => item.number === chapter.number + 1);
  const body = (chapter.paragraphs || []).filter((paragraph) =>
    !/^chapter\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|\d+)/i.test(paragraph) &&
    paragraph.toUpperCase() !== chapter.title.toUpperCase()
  );
  const chapterImages = {
    1: publicAsset("media/Chapter 1.png"), 2: publicAsset("media/Chapter 2.png"), 3: publicAsset("media/Chapter 3.png"), 4: publicAsset("media/Chapter 4.png"),
    5: publicAsset("media/Chapter 5.png"), 6: publicAsset("media/Chapter 6.png"), 7: publicAsset("media/Chapter 7.png"), 8: publicAsset("media/Chapter 8.png"),
    9: publicAsset("media/Chapter 9.png"), 10: publicAsset("media/Chapter 10.png"), 11: publicAsset("media/Chapter 11.png"), 12: publicAsset("media/Chapter 12.png"),
    13: publicAsset("media/Chapter 13.png"), 14: publicAsset("media/Chapter 14.png"), 15: publicAsset("media/Chapter 15.png"), 16: publicAsset("media/Chapter 16.png"),
    17: publicAsset("media/Chapter 17.png"), 18: publicAsset("media/Chapter 18.png"), 19: publicAsset("media/Chapter 19.png"), 20: publicAsset("media/Chapter 20.png")
  };
  const visual = chapterImages[chapter.number] || null;
  const moodNames = ["Rain at Pillar 287", "Butter, garlic & silence", "The impossible garden", "A door behind the wall", "The memory of her mother", "A quiet kind of safety", "Blu Land", "The warm library"];
  const comingSoonStyle = { background: "radial-gradient(ellipse at 50% 30%, rgba(55, 75, 112, .48), transparent 55%), linear-gradient(145deg, #101725, #080b12 72%)" };

  return (
    <main className="reader">
      <Header />
      <div className="readerbar"><Link to="/story">← ALL CHAPTERS</Link><span>CHAPTER {String(chapter.number).padStart(2, "0")} / 20</span><button onClick={() => setMenu((value) => !value)}>CHAPTER MENU⌄</button></div>
      {menu && <div className="chapmenu">{chapters.map((item) => <Link key={item.number} to={`/chapter/${item.number}`}>{String(item.number).padStart(2, "0")}　{item.title}</Link>)}</div>}
      <section className={`readhero rh${chapter.number}`} style={chapter.comingSoon ? comingSoonStyle : { backgroundImage: `linear-gradient(90deg, rgba(7,10,17,0.35), rgba(16,24,39,0.25)), url("${visual}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <span className="eyebrow">THE BLU BASEMENT / CHAPTER {String(chapter.number).padStart(2, "0")}</span>
        <h1>{chapter.title}<em>.</em></h1><p>{chapter.summary}</p>
        <div className="readmeta"><span>BY GOBINDA PANDA</span><span><Clock3 size={13} /> {Math.max(1, Math.ceil(body.join(" ").split(/\s+/).length / 220))} MIN READ</span></div>
      </section>
      <div className="reader-layout">
        <aside><div className="sticky">
          <span className="eyebrow">VISUAL FILE / {String(chapter.number).padStart(2, "0")}</span>
          <div className={`visual visual${chapter.number}`} style={chapter.comingSoon ? { ...comingSoonStyle, minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 20, boxSizing: "border-box" } : { backgroundImage: `linear-gradient(0deg, rgba(7,10,17,0.15), rgba(7,10,17,0.15)), url("${visual}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            <span>{chapter.comingSoon ? "FUTURE ENTRY / 0" + chapter.number : "MOOD STUDY"}</span><div><b>{chapter.comingSoon ? "COMING SOON" : moodNames[chapter.number - 1]}</b></div><span>THE BLU BASEMENT</span>
          </div>
          <MusicPlayer chapterNumber={chapter.number} chapterTitle={chapter.title} />

          <div className="fonttools"><span>TEXT SIZE</span><button onClick={() => setSize((value) => Math.max(0.85, value - 0.07))}>A−</button><button onClick={() => setSize((value) => Math.min(1.25, value + 0.07))}>A+</button></div>
          {/* <p className="aside-note">Add your own chapter artwork or video in <code>public/media</code>. Instructions are included in README.</p> */}
        </div></aside>
        <article className="storytext" style={{ fontSize: `${17 * size}px` }}>
          <div className="startreading"><b>0{chapter.number}</b><span>BEGIN READING</span></div>
          {chapter.comingSoon ? (
            <div className="coming-soon-panel" style={{ minHeight: 430, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "56px 24px", borderTop: "1px solid rgba(157,174,211,.22)", borderBottom: "1px solid rgba(157,174,211,.22)" }}>
              <span className="eyebrow">THE STORY CONTINUES</span>
              <div aria-hidden="true" style={{ color: "#8fa9d9", fontSize: 28, margin: "26px 0 18px" }}>✳</div>
              <h6 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: ".12em", fontWeight: 400, margin: 0 }}>One new chapter every Friday</h6>
              <p style={{ maxWidth: 380, lineHeight: 1.9, color: "#aeb7c9", marginTop: 20 }}>This part of the story is still unfolding. The next door will open when it is ready.</p>
              <Link to="/story" className="text-link" style={{ marginTop: 24 }}>RETURN TO THE ARCHIVE <ArrowRight size={15} /></Link>
            </div>
          ) : (
            <>
              {body.map((paragraph, index) => /^(MO|BLU|BLU:|MO:)$/i.test(paragraph.trim()) ? <h3 key={index}>{paragraph.replace(":", "")}</h3> : <p className={index === 0 ? "first" : ""} key={index}>{paragraph}</p>)}
              <div className="endchapter"><small>END OF CHAPTER {String(chapter.number).padStart(2, "0")}</small><b>✳</b><p>Some things are better left unopened.</p></div>
            </>
          )}
        </article>
      </div>
      <section className="chapter-nav">
        {previous ? <Link to={`/chapter/${previous.number}`}><small>← PREVIOUS CHAPTER</small><b>{previous.title}</b></Link> : <Link to="/story"><small>← BACK TO ARCHIVE</small><b>All chapters</b></Link>}
        <div>{chapters.map((item) => <Link aria-label={`Chapter ${item.number}`} key={item.number} className={!item.comingSoon && item.number <= chapter.number ? "filled" : ""} to={`/chapter/${item.number}`} />)}</div>
        {next ? <Link className="next" to={`/chapter/${next.number}`} onClick={() => !chapter.comingSoon && saveProgress(chapter.number, true)}><small>NEXT CHAPTER →</small><b>{next.title}</b></Link> : <Link className="next" to="/story"><small>RETURN TO ARCHIVE →</small><b>Stay a little longer</b></Link>}
      </section>
      <Footer /><div className="grain" />
    </main>
  );
}


function Author() {
  const books = [
    ["SELF MADE", "2020"],
    ["STARTED LIVING", "2021"],
    ["BROKEN VOICE", "2021"],
    ["LAST HOPE", "2022"],
    ["CONNECTION UNLEASHED", "2023"],
  ];

  return (
    <main className="page author-page">
      <Header />

      <section className="author-editorial">
        {/* LEFT: 3D portrait and neon signature */}
        <aside className="author-visual-column">
          <div className="author-portrait-frame">
            <img
              className="author-portrait"
              src={publicAsset("media/author-photo.jpg")}
              alt="Gobinda Panda, author of The Blu Basement"
            />
            
          </div>

          <div className="author-signature-wrap">
            

            <img
              className="author-neon-signature"
              src={publicAsset("media/blu-author-signature.png")}
              alt="Author's neon signature"
            />
          </div>

          
        </aside>

        {/* RIGHT: Author biography */}
        <article className="author-copy">
          <span className="eyebrow">
            BEHIND THE STORY / 001
          </span>

          <h1 className="author-heading">
            The mind behind
            <br />
            <em>the basement.</em>
          </h1>

          <div className="rule" />

          <p className="lead">
            Gobinda Panda is a writer and software engineer
            drawn to the places where memory, identity, and
            human connection become difficult to separate.
          </p>

          <p>
            THE BLU BASEMENT is a psychological mystery built
            around the fragile boundary between what we
            remember, what we feel, and what we are willing
            to believe. This digital experience is another
            doorway into that story one that unfolds chapter
            by chapter.
          </p>

          <Link to="/story" className="cta inline">
            RETURN TO THE STORY <ArrowRight size={16} />
          </Link>
        </article>
      </section>

      <section className="otherbooks">
        <span className="eyebrow">OTHER WORKS</span>
        <h2>
          Stories leave
          <br />
          <em>their own marks.</em>
        </h2>

        {books.map(([title, year]) => (
          <div key={title}>
            {title}
            <small>{year}</small>
          </div>
        ))}
      </section>

      <Footer />
      <div className="grain" />
    </main>
  );
}


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/story" element={<Story />} />
      <Route path="/chapter/:id" element={<Reader />} />
      <Route path="/author" element={<Author />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
