const seedUsers = async (pool) => {
    await pool.query(`
        INSERT INTO users
        (username, email, password_hash, role, is_active)
        VALUES
        ('admin', 'admin@example.com', '$2b$12$...', 'admin', true)
    `);
};

export default seedUsers;