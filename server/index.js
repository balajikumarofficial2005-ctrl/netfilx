import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3001;
createApp().listen(port, () => {
  console.log(`Login Lab API: http://localhost:${port}`);
  console.log('Development frontend: http://localhost:5173');
});
