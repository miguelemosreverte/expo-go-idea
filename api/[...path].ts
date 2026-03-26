import { handle } from 'hono/vercel';
import app from '../apps/gateway/src/app.js';

export default handle(app);
