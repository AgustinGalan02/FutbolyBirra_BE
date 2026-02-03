import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(morgan('dev')); // para ver las peticiones en consola
app.use(express.json()); // para que express entienda json en las peticiones
app.use(cookieParser()); // para leer cookies
app.use("/api", authRoutes); //todas las rutas de auth empiezan con /api

export default app;