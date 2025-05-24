import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';

// Importamos la función encargada de conectarnos con la BBDD MongoDB
import connection from './db/connection';

// Importamos el router de la API
import MainRouter from './routes/index';

// connection(); // Establecemos conexión con la BBDD

const app = express() // Inicializamos la app

// Middlewares para cors y para parsear datos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// Endpoints de la API
app.use("/api", MainRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

if (process.env.NODE_ENV !== 'test') {
    connection();
}

export default app;
