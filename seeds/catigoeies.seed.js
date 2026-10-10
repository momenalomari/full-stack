 const catigoriesSeed = async(pool)=>{
    await pool.query(`
        INSERT INTO categories (name, description, price, status)
        VALUES 
        ('Electronics', 'Devices and gadgets', 100.00, true),
        ('Clothing', 'Apparel and accessories', 50.00, true),
        ('Books', 'Printed and digital books', 20.00, true),
        ('Home & Kitchen', 'Household items and kitchenware', 75.00, true),
        ('Sports & Outdoors', 'Sporting goods and outdoor equipment', 150.00, true)
    `);
}
export default catigoriesSeed;