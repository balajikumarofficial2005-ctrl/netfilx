import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from './api.js';
import { titles } from './catalog.js';

function Arrow() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Eye({ visible }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />{visible && <path d="m3 3 18 18" stroke="currentColor" strokeWidth="1.8" />}</svg>;
}

function Poster({ title, decorative = false }) {
  return <div className="poster" style={{ '--poster-color': title.color }}>
    <img src={title.image} alt="" loading={decorative ? 'eager' : 'lazy'} />
    <div className="poster-copy"><span>{title.eyebrow}</span><strong>{title.name}</strong><small>A LOGIN LAB ORIGINAL</small></div>
  </div>;
}

function ProjectDialog({ dialog }) {
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
    <form method="dialog"><button className="close-dialog" aria-label="Close project details">&times;</button></form>
    <span className="eyebrow red">WEEK 11 / THE PROJECT</span>
    <h2 id="project-title">Small form.<br />Full-stack thinking.</h2>
    <p>A Netflix-inspired login page, built with React, Vite, plain CSS, and Node.js with Express.</p>
    <ol className="flow-list">
      <li><b>Validate</b><span>React checks email and password before sending.</span></li>
      <li><b>Authenticate</b><span>Fetch sends JSON to Express. Static demo credentials are checked on the server.</span></li>
      <li><b>Redirect</b><span>A successful login opens a protected dashboard. A cookie keeps your session for one hour.</span></li>
    </ol>
    <p className="fine-print">Educational demo only. No Netflix account, database, subscription, or video streaming. Use demo@example.com / Demo@123, never your real account details.</p>
    {window.__LOGIN_LAB_PREVIEW__ && <div className="preview-detail"><p>This single-file preview simulates the API in browser memory and resets on reload. The downloadable project includes the real Express server.</p><h3>Run the full project</h3><p>Extract netflix-login-project.zip. Open the netflix-login folder in VS Code, then open Terminal &gt; New Terminal.</p><pre>npm install{'\n'}npm run dev</pre><p>Open <code>http://localhost:5173</code>. The included README walks through every step.</p></div>}
  </dialog>;
}

function Login({ onLogin, connectionError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [pending, setPending] = useState(false);
  const emailInput = useRef(null);
  const passwordInput = useRef(null);
  const heading = useRef(null);
  const errorMessage = useRef(null);

  useEffect(() => { document.title = 'Sign In | Login Lab'; heading.current.focus({ preventScroll: true }); window.scrollTo(0, 0); }, []);
  useEffect(() => { if (serverError) errorMessage.current?.focus(); }, [serverError]);

  function update(field, value) {
    if (field === 'email') setEmail(value); else setPassword(value);
    setErrors(previous => ({ ...previous, [field]: '' }));
    setServerError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const next = {};
    if (!email.trim()) next.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!password) next.password = 'Please enter your password.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) {
      (next.email ? emailInput : passwordInput).current.focus();
      return;
    }
    setPending(true);
    try {
      const { user } = await api('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      onLogin(user);
    } catch (error) {
      setServerError(error.status ? error.message : 'Cannot reach the server. Check your connection and make sure the Express server is running.');
    } finally {
      setPending(false);
    }
  }

  function fillDemo() {
    setEmail('demo@example.com');
    setPassword('Demo@123');
    setErrors({});
    setServerError('');
    emailInput.current.focus();
  }

  return <>
    <div className="poster-backdrop" aria-hidden="true"><div className="poster-wall">{Array.from({ length: 21 }, (_, i) => <Poster key={i} title={titles[(i * 5 + Math.floor(i / 7)) % titles.length]} decorative />)}</div></div>
    <main className="login-main">
      <section className="login-card" aria-labelledby="sign-in-title">
        <span className="eyebrow">YOUR NEXT STORY STARTS HERE</span>
        <h1 ref={heading} id="sign-in-title" tabIndex="-1">Sign in</h1>
        <p className="intro">A familiar feeling. A new beginning.</p>
        {(serverError || connectionError) && <div ref={errorMessage} className="form-alert" role="alert" tabIndex="-1">{serverError || connectionError}</div>}
        <form onSubmit={submit} noValidate aria-busy={pending}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input ref={emailInput} id="email" name="email" type="email" autoComplete="username" inputMode="email" placeholder="you@example.com" value={email} onChange={event => update('email', event.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} disabled={pending} required />
            {errors.email && <span id="email-error" className="field-error" role="alert">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input ref={passwordInput} id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={event => update('password', event.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} disabled={pending} required />
              <button className="eye-button" type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)} disabled={pending}><Eye visible={visible} /></button>
            </div>
            {errors.password && <span id="password-error" className="field-error" role="alert">{errors.password}</span>}
          </div>
          <button type="submit" className="primary-button sign-in-button" disabled={pending}>{pending ? <><span className="spinner" />Signing in...</> : <>Sign in<Arrow /></>}</button>
        </form>
        <div className="divider"><span>JUST EXPLORING?</span></div>
        <button type="button" className="demo-button" onClick={fillDemo} disabled={pending}>Use demo credentials<Arrow /></button>
        <div className="demo-credentials"><span>demo@example.com</span><span className="dot" /><code>Demo@123</code></div>
        <p className="demo-note"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.5" /><path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.5" /></svg>Practice project. Use demo credentials only.</p>
      </section>
    </main>
  </>;
}

function Dashboard({ user, openDetails }) {
  const [selected, setSelected] = useState(null);
  const titleDialog = useRef(null);
  const heading = useRef(null);
  useEffect(() => { document.title = 'Dashboard | Login Lab'; heading.current.focus({ preventScroll: true }); window.scrollTo(0, 0); }, []);

  return <main className="dashboard">
    <section className="welcome-strip"><div><span className="status-dot" />Signed in successfully</div><span>{user.email}</span></section>
    <section className="dashboard-hero">
      <img className="hero-art" src="/art/space.jpg" alt="Earth glowing against the darkness of space" />
      <div className="hero-copy"><span className="eyebrow">WELCOME BACK, {user.name.toUpperCase()}</span>
        <h1 ref={heading} tabIndex="-1">A world beyond<br />the ordinary.</h1>
        <p>Your next great story is one click away.<br />For now, enjoy your successfully connected dashboard.</p>
        <button className="primary-button" onClick={openDetails}>Explore the project<Arrow /></button>
        <span className="hero-caption">AFTERLIGHT<span />A FICTIONAL LOGIN LAB ORIGINAL</span>
      </div>
    </section>
    <section className="catalog" aria-labelledby="catalog-title">
      <div className="section-heading"><h2 id="catalog-title">Made for your movie night</h2><span>DEMO COLLECTION / 06</span></div>
      <div className="title-grid">{titles.map(title => <button className="title-card" key={title.name} onClick={() => { setSelected(title); titleDialog.current.showModal(); }} aria-label={`About ${title.name}`}><Poster title={title} /><div className="title-meta"><span>{title.genre}</span><span>{title.year}</span></div></button>)}</div>
    </section>
    <dialog ref={titleDialog} className="project-dialog" aria-labelledby="movie-title" onClick={event => { if (event.target === event.currentTarget) titleDialog.current.close(); }}>
      <form method="dialog"><button className="close-dialog" aria-label="Close title details">&times;</button></form>
      <span className="eyebrow red">FICTIONAL DEMO TITLE</span><h2 id="movie-title">{selected?.name}</h2><p>{selected?.genre} / {selected?.year}</p>
      <p>This is a placeholder content card for your dashboard. The project demonstrates authentication, not video playback.</p>
    </dialog>
  </main>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const dialog = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    api('/me', { signal: controller.signal }).then(data => setUser(data.user)).catch(error => {
      if (error.name !== 'AbortError' && error.status !== 401) setConnectionError('Cannot reach the server. Start the project with npm run dev, then reload.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function logout() {
    setSigningOut(true);
    setLogoutError('');
    try { await api('/logout', { method: 'POST' }); setUser(null); }
    catch { setLogoutError('Could not sign out. Please check your connection and try again.'); }
    finally { setSigningOut(false); }
  }

  return <div className={`app ${user ? 'is-authenticated' : ''}`}>
    <header className="site-header"><div className="brand" aria-label="Netflix-inspired Login Lab">NETFLIX<span>LOGIN LAB</span></div>
      <div className="header-actions">{user ? <><span className="viewer-avatar" aria-hidden="true">D</span><button className="text-button" onClick={logout} disabled={signingOut}>{signingOut ? 'Signing out...' : 'Sign out'}</button></> : <span className="project-badge"><span />EDUCATIONAL DEMO</span>}</div>
    </header>
    {window.__LOGIN_LAB_PREVIEW__ && <div className="preview-banner">Interactive preview<span />API simulated here. Real React + Express source included in the download.</div>}
    {logoutError && <div className="logout-error" role="alert">{logoutError}</div>}
    {loading ? <main className="loading-screen" role="status"><span className="spinner" />Checking your session...</main> : <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={nextUser => { setConnectionError(''); setUser(nextUser); }} connectionError={connectionError} />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} openDetails={() => dialog.current.showModal()} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>}
    <footer className="site-footer"><span>Built for learning. Not affiliated with Netflix.</span><button className="text-button" onClick={() => dialog.current.showModal()}>How this project works<Arrow /></button><span className="stack-label">REACT <i /> EXPRESS</span></footer>
    <ProjectDialog dialog={dialog} />
  </div>;
}
