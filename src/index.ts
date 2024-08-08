import express from 'express';
import cors from 'cors';

// Importamos el router de la API
import MainRouter from './routes/index';

const app = express() // Inicializamos la app

// Middlewares para cors y para parsear datos
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api", MainRouter);

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`App listen on http://localhost:${PORT}`)
})
