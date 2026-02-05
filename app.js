import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import postRoutes from './routes/postRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import commentRoutes from './routes/commentRoute.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev')); // para ver las peticiones en consola
app.use(express.json()); // para que express entienda json en las peticiones
app.use(cookieParser()); // para leer cookies

app.use("/api", authRoutes); //todas las rutas de auth empiezan con /api
app.use("/api", categoryRoutes);
app.use("/api", commentRoutes);
app.use("/api", postRoutes);

export default app;