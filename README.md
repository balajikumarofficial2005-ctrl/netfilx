# Week 11: Netflix-Inspired Login Page

A complete learning project with a React frontend, an Express backend, and mock authentication. No database or paid account is needed. This is not Netflix and is not affiliated with Netflix. Use only the demo credentials below.

## 1. What you need

- Install Node.js 22.12 or newer (a current LTS release is recommended) from https://nodejs.org/. npm is included.
- A code editor such as VS Code: https://code.visualstudio.com/.
- Extract the project ZIP and open the `netflix-login` folder in your editor.
- Open the editor's terminal from **Terminal > New Terminal**. Make sure it is inside the folder containing `package.json`.

## 2. Run the project

### In VS Code: press F5

1. Install Node.js and the desktop version of VS Code using the links above. Reopen VS Code after installing Node.js.
2. Extract the ZIP. Inside `netflix-login`, double-click `netflix-login.code-workspace`. Alternatively, in VS Code choose **File > Open Workspace from File** and select it.
3. Review the files. If VS Code asks about Workspace Trust, enable it only if you trust this project's code; restricted mode will not run the tasks.
4. Choose **Run > Start Debugging**, or press **F5**. Select **Run full project (React + Express)** if prompted.
5. The included configuration installs dependencies, starts React and Express, and is configured to open the browser when Vite is ready. If the browser does not open, visit **http://localhost:5173** yourself.

Use **Run > Stop Debugging** to stop the project. Read the **Debug Console** if startup fails. Node.js/npm must be installed; these files do not install software on your computer automatically. No extra VS Code extension is required. The F5 configuration is included but could not be executed here because this environment has no desktop VS Code.

### Or use the terminal

First, install the dependencies:

```sh
npm install
```

Then start the frontend and backend together:

```sh
npm run dev
```

Open **http://localhost:5173** in your browser. Leave the terminal running. Press Ctrl+C in that terminal to stop both servers.

## 3. Sign in

| Field | Demo value |
| --- | --- |
| Email | `demo@example.com` |
| Password | `Demo@123` |

Click **Use demo credentials** to fill the form, then **Sign in**. You will be redirected to `/dashboard`. Sign out using the button in the top right.

Do not enter your real Netflix credentials or any other real password. The credentials are deliberately public and static.

## 4. How it works

1. The form stores email and password in React state.
2. React checks required fields and email format. Invalid fields get a helpful message and keyboard focus.
3. Fetch sends `POST /api/login` with JSON to Express.
4. Express validates the fields again and compares them with the static demo credentials.
5. On success, the server sets a random, HttpOnly session cookie and returns the demo user's profile. The password is never returned.
6. React opens the protected dashboard. Reloading checks `GET /api/me` to restore the session.
7. Sign out sends `POST /api/logout`, invalidates the session, and returns to the login page.

During development, Vite proxies `/api` requests to port 3001, avoiding cross-origin setup. After a production build, Express serves both the API and the React files on port 3001.

## 5. Files to understand

```text
netflix-login/
  .vscode/
    launch.json          F5: install dependencies and run the whole project
    tasks.json           Dependency-install task for VS Code
  netflix-login.code-workspace  Open this file in desktop VS Code
  public/
    art/                 Downloaded background photography
    favicon.svg          Local app icon
  server/
    app.js               Express routes, validation, and in-memory sessions
    index.js             Starts the Express server
    auth.test.js         Automated API tests
  src/
    App.jsx              Login, protected dashboard, and project details
    api.js               Shared Fetch helper
    catalog.js           Fictional dashboard titles
    main.jsx             React entry point and router
    styles.css           Responsive styling
  index.html             HTML entry point
  vite.config.js         React plugin and API proxy
  package.json           Dependencies and commands
  package-lock.json      Reproducible dependency versions
```

## 6. Assignment checklist

| Requirement | Where it is implemented |
| --- | --- |
| React app with Vite | `src/main.jsx`, `vite.config.js` |
| Netflix-style responsive login UI | `Login` in `src/App.jsx`, `src/styles.css` |
| Capture email and password | Controlled inputs with React state |
| Frontend validation | `submit` in the `Login` component |
| Express backend | `server/app.js` and `server/index.js` |
| Frontend/backend integration | `src/api.js` uses Fetch |
| Static/mock authentication | `POST /api/login` in `server/app.js` |
| Invalid-login error messages | API errors shown in the form |
| Success redirect to dashboard | React Router route guards in `App` |
| Plain CSS styling | `src/styles.css` |

Extras include password visibility, loading states, accessible labels, one-hour sessions, logout, and API tests. Movie cards are fictional placeholders, not streaming content. Registration and password reset are intentionally outside this assignment.

## 7. Test it

Run the automated backend tests:

```sh
npm test
```

Manually check these flows in your browser:

- Submit an empty form: both fields display required errors.
- Enter `hello` as the email: an email-format error appears.
- Enter `demo@example.com` with a wrong password: the server's invalid-credentials error appears.
- Toggle the eye button: the password switches between visible and hidden.
- Use the demo credentials and sign in: the dashboard appears.
- Reload the dashboard: the session is restored.
- Sign out, then open `/dashboard` directly: you return to sign-in.
- Stop the backend, then sign in: a connection error is displayed.
- Try a narrow mobile viewport: there is no horizontal scrolling.

## 8. Run a production build locally

Stop `npm run dev` first, then run:

```sh
npm run build
npm start
```

Open **http://localhost:3001**. Express now serves the built frontend and the API together. You do not need the Vite development server for this mode.

## 9. Troubleshooting

| Problem | What to do |
| --- | --- |
| `npm` is not recognized | Install Node.js, then reopen your terminal/editor. |
| F5 cannot find the `npm` runtime | Install Node.js with npm, then completely restart VS Code. |
| VS Code is in Restricted Mode | Review the project, then enable Workspace Trust if you trust it. |
| Cannot find `package.json` | Open the terminal in the extracted `netflix-login` folder. |
| Port 5173 or 3001 is already in use | Stop the previous development server with Ctrl+C, or close the other app using that port. |
| Cannot reach the server | Run `npm run dev` and open localhost:5173, not the HTML file directly. |
| `npm start` does not show the site | Run `npm run build` first. |
| Session disappears after restarting Express | Expected: this demo stores sessions only in server memory. |
| Styles use a slightly different font offline | Google Fonts is optional; local fallback fonts are provided. Images are bundled. |

## 10. Important limits

This is a classroom demo, not production authentication. It has a public static password, in-memory sessions, no rate limiting, no database, no password hashing, and no account management. A real deployment needs a proper identity system, HTTPS and correctly configured secure cookies/proxy trust, CSRF protection, brute-force protection, and a durable session store. Never use this mock login to protect real personal data.

The separately supplied `login-preview.html` is a portable UI preview. It deliberately simulates the API in browser memory, resets when reloaded, and is clearly labeled. It is not the full-stack project and should not replace this source folder for your submission.

## 11. Customize and explain your work

- Change colors, spacing, and mobile layouts in `src/styles.css`.
- Change the fictional titles in `src/catalog.js`.
- Change the mock user and password in `server/app.js`; update the demo-fill values and tests to match.
- In a presentation, explain why validation happens on both the client and server, what HTTP 400 and 401 mean, and how Fetch connects React to Express.
- Follow your course's rules on AI assistance and make sure you can explain the code you submit.

## Image credits

Photography is from Unsplash, downloaded and included under `public/art`. The title treatments are fictional designs for this project. Unsplash license: https://unsplash.com/license.

- Space: https://images.unsplash.com/photo-1446776811953-b23d57bd21aa
- Mountains: https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05
- City: https://images.unsplash.com/photo-1519501025264-65ba15a82390
- Forest: https://images.unsplash.com/photo-1448375240586-882707db888b
- Stars: https://images.unsplash.com/photo-1519681393784-d120267933ba
- Ocean: https://images.unsplash.com/photo-1518837695005-2083093ee35b

Typography: DM Sans and Barlow Condensed from Google Fonts, with system-font fallbacks.
