-- Full Seed Script: Ensuring Categories, Statuses, and Admin exist before adding Cars

-- 1. Populate Car Categories
IF NOT EXISTS (SELECT 1 FROM Car_Categories)
BEGIN
    INSERT INTO Car_Categories (category_name) VALUES ('Sedan'), ('SUV'), ('Hatchback'), ('Van'), ('Luxury');
END

-- 2. Populate Car Statuses
IF NOT EXISTS (SELECT 1 FROM Car_Status)
BEGIN
    INSERT INTO Car_Status (status_name) VALUES ('Available'), ('Booked'), ('Under Maintenance'), ('Reserved');
END

-- 3. Ensure an Admin user exists (Password is 'Admin123' hashed)
IF NOT EXISTS (SELECT 1 FROM Users WHERE role = 'Admin')
BEGIN
    INSERT INTO Users (name, email, phone, cnic, password_hash, role)
    VALUES ('System Admin', 'admin@carmatrix.com', '03000000000', '00000-0000000-0', '$2a$10$Xm5A8.lT2JvIe6y7n.e6u.5P5z7I6v6P6z7I6v6P6z7I6v6P6z7I6', 'Admin');
    
    INSERT INTO Admins (user_id) 
    SELECT user_id FROM Users WHERE email = 'admin@carmatrix.com';
END

-- 4. Populate Cars (Now safer with category and status IDs)
-- Clear existing dummy cars to prevent duplicates if running multiple times
-- DELETE FROM Cars WHERE brand IN ('Toyota', 'Honda', 'Suzuki', 'Mercedes', 'Kia', 'Hyundai', 'Audi');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Sedan'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Toyota', 'Camry', 2023, 'Automatic', 'Hybrid', 7500.00, 5, 'Executive sedan with excellent fuel economy.', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Toyota' AND model='Camry');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'SUV'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Honda', 'CR-V', 2022, 'Automatic', 'Petrol', 12000.00, 5, 'Spacious SUV perfect for family trips.', 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Honda' AND model='CR-V');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Hatchback'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Suzuki', 'Swift', 2024, 'Manual', 'Petrol', 4500.00, 5, 'Compact and agile city car.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Suzuki' AND model='Swift');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Van'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Toyota', 'Hiace', 2021, 'Manual', 'Diesel', 15000.00, 12, 'Large van for group travel and tours.', 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Toyota' AND model='Hiace');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Luxury'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Mercedes', 'S-Class', 2023, 'Automatic', 'Petrol', 45000.00, 5, 'The pinnacle of luxury and comfort.', 'https://images.unsplash.com/photo-1583121274602-3e2820c69e88?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Mercedes' AND model='S-Class');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Sedan'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Honda', 'Civic', 2022, 'Automatic', 'Petrol', 8500.00, 5, 'Sporty and reliable sedan.', 'https://images.unsplash.com/photo-1594070319944-7c0cbebb6f58?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Honda' AND model='Civic');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'SUV'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Kia', 'Sportage', 2023, 'Automatic', 'Petrol', 13500.00, 5, 'Modern SUV with premium features.', 'https://images.unsplash.com/photo-1623860841270-dc32d665790c?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Kia' AND model='Sportage');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Hatchback'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Hyundai', 'i10', 2022, 'Automatic', 'Petrol', 5000.00, 5, 'Efficient hatchback for daily commute.', 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Hyundai' AND model='i10');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'Luxury'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Available'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Audi', 'A6', 2022, 'Automatic', 'Petrol', 38000.00, 5, 'Sophisticated luxury sedan.', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Audi' AND model='A6');

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
SELECT 
    (SELECT category_id FROM Car_Categories WHERE category_name = 'SUV'),
    (SELECT status_id FROM Car_Status WHERE status_name = 'Under Maintenance'),
    (SELECT admin_id FROM Admins LIMIT 1),
    'Toyota', 'Land Cruiser', 2020, 'Automatic', 'Diesel', 35000.00, 7, 'Off-road beast (Currently being serviced).', 'https://images.unsplash.com/photo-1594568284297-7c64464062b1?auto=format&fit=crop&q=80&w=1000'
WHERE NOT EXISTS (SELECT 1 FROM Cars WHERE brand='Toyota' AND model='Land Cruiser');
