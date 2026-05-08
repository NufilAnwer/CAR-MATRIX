-- Seed Script: Add 10 Dummy Cars for Fleet Variety
-- Categories: 1=Sedan, 2=SUV, 3=Hatchback, 4=Van, 5=Luxury

INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
VALUES 
(1, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Toyota', 'Camry', 2023, 'Automatic', 'Hybrid', 7500.00, 5, 'Executive sedan with excellent fuel economy.', NULL),
(2, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Honda', 'CR-V', 2022, 'Automatic', 'Petrol', 12000.00, 5, 'Spacious SUV perfect for family trips.', NULL),
(3, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Suzuki', 'Swift', 2024, 'Manual', 'Petrol', 4500.00, 5, 'Compact and agile city car.', NULL),
(4, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Toyota', 'Hiace', 2021, 'Manual', 'Diesel', 15000.00, 12, 'Large van for group travel and tours.', NULL),
(5, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Mercedes', 'S-Class', 2023, 'Automatic', 'Petrol', 45000.00, 5, 'The pinnacle of luxury and comfort.', NULL),
(1, (SELECT status_id FROM Car_Status WHERE status_name = 'Booked'), 1, 'Honda', 'Civic', 2022, 'Automatic', 'Petrol', 8500.00, 5, 'Sporty and reliable sedan.', NULL),
(2, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Kia', 'Sportage', 2023, 'Automatic', 'Petrol', 13500.00, 5, 'Modern SUV with premium features.', NULL),
(3, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Hyundai', 'i10', 2022, 'Automatic', 'Petrol', 5000.00, 5, 'Efficient hatchback for daily commute.', NULL),
(5, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), 1, 'Audi', 'A6', 2022, 'Automatic', 'Petrol', 38000.00, 5, 'Sophisticated luxury sedan.', NULL),
(2, (SELECT status_id FROM Car_Status WHERE status_name = 'Under Maintenance'), 1, 'Toyota', 'Land Cruiser', 2020, 'Automatic', 'Diesel', 35000.00, 7, 'Off-road beast (Currently being serviced).', NULL);
