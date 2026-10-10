import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("Connected to the database");
        client.release();
    } catch (err) {
        console.error("Error connecting to the database", err);
    }
};

export { connectDB , pool };
