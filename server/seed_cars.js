const { poolPromise, sql } = require('./config/db');

async function seed() {
  try {
    const pool = await poolPromise;
    
    // Get an admin ID (the one I recreated)
    const adminResult = await pool.request().query("SELECT admin_id FROM Admins");
    if (adminResult.recordset.length === 0) {
        console.error("No admin found. Please register or recreate admin first.");
        process.exit(1);
    }
    const adminId = adminResult.recordset[0].admin_id;

    const cars = [
      { brand: 'Toyota', model: 'Camry', year: 2023, category_id: 1, price_per_day: 7500, seating_capacity: 5, transmission_type: 'Automatic', fuel_type: 'Hybrid', image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000', description: 'Executive sedan with excellent fuel economy.' },
      { brand: 'Honda', model: 'Civic', year: 2022, category_id: 1, price_per_day: 8500, seating_capacity: 5, transmission_type: 'Automatic', fuel_type: 'Petrol', image_url: 'https://images.unsplash.com/photo-1594070319944-7c0cbebb6f58?auto=format&fit=crop&q=80&w=1000', description: 'Sporty and reliable sedan.' },
      { brand: 'Kia', model: 'Sportage', year: 2023, category_id: 2, price_per_day: 13500, seating_capacity: 5, transmission_type: 'Automatic', fuel_type: 'Petrol', image_url: 'https://images.unsplash.com/photo-1623860841270-dc32d665790c?auto=format&fit=crop&q=80&w=1000', description: 'Modern SUV with premium features.' },
      { brand: 'Mercedes', model: 'S-Class', year: 2023, category_id: 5, price_per_day: 45000, seating_capacity: 5, transmission_type: 'Automatic', fuel_type: 'Petrol', image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69e88?auto=format&fit=crop&q=80&w=1000', description: 'The pinnacle of luxury and comfort.' }
    ];

    for (const car of cars) {
      await pool.request()
        .input('cat', sql.Int, car.category_id)
        .input('stat', sql.Int, 1) // Available
        .input('adm', sql.Int, adminId)
        .input('brd', sql.VarChar, car.brand)
        .input('mod', sql.VarChar, car.model)
        .input('yr', sql.Int, car.year)
        .input('trans', sql.VarChar, car.transmission_type)
        .input('fuel', sql.VarChar, car.fuel_type)
        .input('price', sql.Decimal, car.price_per_day)
        .input('seat', sql.Int, car.seating_capacity)
        .input('desc', sql.VarChar, car.description)
        .input('img', sql.VarChar, car.image_url)
        .query(`INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
                VALUES (@cat, @stat, @adm, @brd, @mod, @yr, @trans, @fuel, @price, @seat, @desc, @img)`);
    }

    console.log("Sample cars seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
