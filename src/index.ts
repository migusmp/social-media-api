import express from 'express';
import cors from 'cors';

// Importamos la función encargada de conectarnos con la BBDD MongoDB
import connection from './db/connection';

// Importamos el router de la API
import MainRouter from './routes/index';

connection(); // Establecemos conexión con la BBDD

const app = express() // Inicializamos la app

// Middlewares para cors y para parsear datos
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api", MainRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App listen on http://localhost:${PORT}`)
})
