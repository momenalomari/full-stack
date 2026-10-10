import seedUsers from "../seeds/user.seed.js";
import seedCategories from "../seeds/catigoeies.seed.js";
import { pool } from "../src/config/db.js";

const runSeed = async () => {
    try {

        console.log("Running seed...");

        // await seedUsers(pool);
        await seedCategories(pool);

        console.log("Seed completed successfully.");

    } catch (error) {

        console.error("Error running seed:", error);

    } finally {

        await pool.end();

    }
};

runSeed();