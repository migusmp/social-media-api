import mongoose from "mongoose";

const db_url = process.env.DATABASE_URL;

const connection = async () => {
    try {
        await mongoose.connect(`${db_url}`)
        console.log("CONEXIÓN A LA BASE DE DATOS EXITOSA!");
    } catch (e) {
        console.error("Error al establecer conexión con la BBDD:", e);
    }
}

export default connection;
