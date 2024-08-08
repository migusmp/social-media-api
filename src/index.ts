import express from 'express';

const app = express()

app.get("/", (_req, res) => {
    res.send('<h1>Hola mundo!</h1>')
})

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`App listen on http://localhost:${PORT}`)
})
