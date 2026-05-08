-- ============================================================
--  CarMatrix — SQL Server Database Script
--  Course  : Database Systems Lab | Spring 2026
--  FAST-NU  Lahore
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'CarMatrix')
    DROP DATABASE CarMatrix;
GO

CREATE DATABASE CarMatrix;
GO

USE CarMatrix;
GO

-- ============================================================
--  SECTION 1 — TABLE CREATION (in dependency order)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CAR_STATUS  (no dependencies)
-- ------------------------------------------------------------
CREATE TABLE Car_Status (
    status_id   INT           IDENTITY(1,1) PRIMARY KEY,
    status_name VARCHAR(50)   NOT NULL UNIQUE
        CONSTRAINT CK_CarStatus_Name
            CHECK (status_name IN ('Available','Booked','Under Maintenance','Reserved'))
);
GO

-- ------------------------------------------------------------
-- 2. CAR_CATEGORIES  (no dependencies)
-- ------------------------------------------------------------
CREATE TABLE Car_Categories (
    category_id   INT          IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);
GO

-- ------------------------------------------------------------
-- 3. EXTRA_SERVICES  (no dependencies)
-- ------------------------------------------------------------
CREATE TABLE Extra_Services (
    service_id        INT           IDENTITY(1,1) PRIMARY KEY,
    service_name      VARCHAR(100)  NOT NULL,
    service_cost_type VARCHAR(20)   NOT NULL
        CONSTRAINT CK_Service_CostType
            CHECK (service_cost_type IN ('Fixed','PerDay')),
    service_cost      DECIMAL(10,2) NOT NULL
        CONSTRAINT CK_Service_Cost CHECK (service_cost >= 0)
);
GO

-- ------------------------------------------------------------
-- 4. USERS  (no dependencies)
-- ------------------------------------------------------------
CREATE TABLE Users (
    user_id           INT           IDENTITY(1,1) PRIMARY KEY,
    name              VARCHAR(100)  NOT NULL,
    email             VARCHAR(150)  NOT NULL UNIQUE,
    phone             VARCHAR(20)   NOT NULL,
    cnic              VARCHAR(20)   NOT NULL UNIQUE,
    password_hash     VARCHAR(255)  NOT NULL,
    role              VARCHAR(20)   NOT NULL,
    CONSTRAINT CK_Users_Role CHECK (role IN ('Customer','Admin')),
    CONSTRAINT CK_Users_Phone CHECK (phone LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    registration_date DATE          NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    is_active         BIT           NOT NULL DEFAULT 1
);
GO

-- ------------------------------------------------------------
-- 5. CUSTOMERS  (depends on Users)
-- ------------------------------------------------------------
CREATE TABLE Customers (
    customer_id             INT          IDENTITY(1,1) PRIMARY KEY,
    user_id                 INT          NOT NULL UNIQUE,
    driving_license_number  VARCHAR(50)  NULL,
    license_upload_path     VARCHAR(255) NULL,
    student_status          BIT          NOT NULL DEFAULT 0,

    CONSTRAINT FK_Customers_Users
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);
GO

-- ------------------------------------------------------------
-- 6. ADMINS  (depends on Users)
-- ------------------------------------------------------------
CREATE TABLE Admins (
    admin_id    INT          IDENTITY(1,1) PRIMARY KEY,
    user_id     INT          NOT NULL UNIQUE,
    admin_level VARCHAR(50)  NOT NULL DEFAULT 'Staff'
        CONSTRAINT CK_Admins_Level
            CHECK (admin_level IN ('SuperAdmin','Manager','Staff')),

    CONSTRAINT FK_Admins_Users
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);
GO

-- ------------------------------------------------------------
-- 7. DRIVERS  (no dependencies)
-- ------------------------------------------------------------
CREATE TABLE Drivers (
    driver_id           INT           IDENTITY(1,1) PRIMARY KEY,
    name                VARCHAR(100)  NOT NULL,
    phone               VARCHAR(20)   NOT NULL UNIQUE,
    license_number      VARCHAR(50)   NOT NULL UNIQUE,
    availability_status VARCHAR(20)   NOT NULL DEFAULT 'Available'
        CONSTRAINT CK_Driver_Status
            CHECK (availability_status IN ('Available','On Trip','Inactive')),
    charge_per_day      DECIMAL(10,2) NOT NULL
        CONSTRAINT CK_Driver_Charge CHECK (charge_per_day >= 0),
    CONSTRAINT CK_Drivers_Phone CHECK (phone LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);
GO

-- ------------------------------------------------------------
-- 8. CARS  (depends on Car_Categories, Car_Status, Admins)
-- ------------------------------------------------------------
CREATE TABLE Cars (
    car_id            INT           IDENTITY(1,1) PRIMARY KEY,
    category_id       INT           NOT NULL,
    status_id         INT           NOT NULL,
    admin_id          INT           NOT NULL,
    brand             VARCHAR(100)  NOT NULL,
    model             VARCHAR(100)  NOT NULL,
    year              INT           NOT NULL
        CONSTRAINT CK_Cars_Year CHECK (year >= 2000 AND year <= 2100),
    transmission_type VARCHAR(20)   NOT NULL
        CONSTRAINT CK_Cars_Transmission CHECK (transmission_type IN ('Manual','Automatic')),
    fuel_type         VARCHAR(20)   NOT NULL
        CONSTRAINT CK_Cars_Fuel CHECK (fuel_type IN ('Petrol','Diesel','Electric','Hybrid')),
    price_per_day     DECIMAL(10,2) NOT NULL
        CONSTRAINT CK_Cars_Price CHECK (price_per_day > 0),
    seating_capacity  INT           NOT NULL
        CONSTRAINT CK_Cars_Seats CHECK (seating_capacity BETWEEN 2 AND 15),
    description       VARCHAR(MAX)  NULL,
    image_url         VARCHAR(255)  NULL,

    CONSTRAINT FK_Cars_Category FOREIGN KEY (category_id)
        REFERENCES Car_Categories(category_id),
    CONSTRAINT FK_Cars_Status   FOREIGN KEY (status_id)
        REFERENCES Car_Status(status_id),
    CONSTRAINT FK_Cars_Admin    FOREIGN KEY (admin_id)
        REFERENCES Admins(admin_id)
);
GO

-- ------------------------------------------------------------
-- 9. BOOKINGS  (depends on Customers, Cars, Drivers)
-- ------------------------------------------------------------
CREATE TABLE Bookings (
    booking_id      INT           IDENTITY(1,1) PRIMARY KEY,
    customer_id     INT           NOT NULL,
    car_id          INT           NOT NULL,
    driver_id       INT           NULL,          -- NULL = self-drive
    start_date      DATE          NOT NULL,
    end_date        DATE          NOT NULL,
    total_days      AS DATEDIFF(DAY, start_date, end_date),  -- computed column
    base_price      DECIMAL(10,2) NOT NULL,
    extra_charges   DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(10,2) NOT NULL,
    booking_status  VARCHAR(20)   NOT NULL DEFAULT 'Pending'
        CONSTRAINT CK_Booking_Status
            CHECK (booking_status IN ('Pending','Confirmed','Cancelled','Completed')),
    booking_date    DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Bookings_Customer FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id),
    CONSTRAINT FK_Bookings_Car      FOREIGN KEY (car_id)
        REFERENCES Cars(car_id),
    CONSTRAINT FK_Bookings_Driver   FOREIGN KEY (driver_id)
        REFERENCES Drivers(driver_id),
    CONSTRAINT CK_Bookings_Dates
        CHECK (end_date > start_date)
);
GO

-- ------------------------------------------------------------
-- 10. BOOKING_SERVICES  (depends on Bookings, Extra_Services)
-- ------------------------------------------------------------
CREATE TABLE Booking_Services (
    booking_service_id    INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id            INT           NOT NULL,
    service_id            INT           NOT NULL,
    service_cost_snapshot DECIMAL(10,2) NOT NULL,  -- price at time of booking

    CONSTRAINT FK_BS_Booking FOREIGN KEY (booking_id)
        REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT FK_BS_Service FOREIGN KEY (service_id)
        REFERENCES Extra_Services(service_id),
    CONSTRAINT UQ_BS_BookingService UNIQUE (booking_id, service_id)
);
GO

-- ------------------------------------------------------------
-- 11. PAYMENTS  (depends on Bookings)
-- ------------------------------------------------------------
CREATE TABLE Payments (
    payment_id            INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id            INT           NOT NULL UNIQUE,
    payment_method        VARCHAR(50)   NOT NULL
        CONSTRAINT CK_Payment_Method
            CHECK (payment_method IN ('Cash','Card','JazzCash','EasyPaisa','BankTransfer')),
    payment_status        VARCHAR(20)   NOT NULL DEFAULT 'Pending'
        CONSTRAINT CK_Payment_Status
            CHECK (payment_status IN ('Pending','Completed','Refunded','Failed')),
    payment_date          DATETIME      NULL,
    amount_paid           DECIMAL(10,2) NOT NULL
        CONSTRAINT CK_Payment_Amount CHECK (amount_paid >= 0),
    transaction_reference VARCHAR(100)  NULL,

    CONSTRAINT FK_Payments_Booking FOREIGN KEY (booking_id)
        REFERENCES Bookings(booking_id)
);
GO

-- ------------------------------------------------------------
-- 12. RECEIPTS  (depends on Bookings)
-- ------------------------------------------------------------
CREATE TABLE Receipts (
    receipt_id        INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id        INT           NOT NULL UNIQUE,
    total_amount      DECIMAL(10,2) NOT NULL,
    rental_days       INT           NOT NULL,
    tax_amount        DECIMAL(10,2) NOT NULL DEFAULT 0,
    generated_date    DATETIME      NOT NULL DEFAULT GETDATE(),
    receipt_file_path VARCHAR(255)  NULL,

    CONSTRAINT FK_Receipts_Booking FOREIGN KEY (booking_id)
        REFERENCES Bookings(booking_id)
);
GO

-- ------------------------------------------------------------
-- 13. REVIEWS  (depends on Customers, Cars)
-- ------------------------------------------------------------
CREATE TABLE Reviews (
    review_id   INT           IDENTITY(1,1) PRIMARY KEY,
    customer_id INT           NOT NULL,
    car_id      INT           NOT NULL,
    rating      INT           NOT NULL
        CONSTRAINT CK_Reviews_Rating CHECK (rating BETWEEN 1 AND 5),
    review_text VARCHAR(MAX)  NULL,
    review_date DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Reviews_Customer FOREIGN KEY (customer_id)
        REFERENCES Customers(customer_id),
    CONSTRAINT FK_Reviews_Car      FOREIGN KEY (car_id)
        REFERENCES Cars(car_id),
    CONSTRAINT UQ_Reviews_Once
        UNIQUE (customer_id, car_id)   -- one review per customer per car
);
GO


-- ============================================================
--  SECTION 2 — INDEXES  (for performance)
-- ============================================================

CREATE INDEX IX_Cars_Status       ON Cars(status_id);
CREATE INDEX IX_Cars_Category     ON Cars(category_id);
CREATE INDEX IX_Bookings_Customer ON Bookings(customer_id);
CREATE INDEX IX_Bookings_Car      ON Bookings(car_id);
CREATE INDEX IX_Bookings_Status   ON Bookings(booking_status);
CREATE INDEX IX_Bookings_Dates    ON Bookings(start_date, end_date);
CREATE INDEX IX_Payments_Status   ON Payments(payment_status);
CREATE INDEX IX_Reviews_Car       ON Reviews(car_id);
GO


-- ============================================================
--  SECTION 3 — STORED PROCEDURES
-- ============================================================

-- ------------------------------------------------------------
-- SP 1: Create a Booking
--   Checks for car availability (no date overlap),
--   calculates total, inserts booking row.
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_CreateBooking
    @customer_id  INT,
    @car_id       INT,
    @driver_id    INT = NULL,
    @start_date   DATE,
    @end_date     DATE,
    @service_ids  VARCHAR(MAX) = NULL   -- comma-separated service IDs
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validate dates
        IF @end_date <= @start_date
            THROW 50001, 'End date must be after start date.', 1;

        -- 2. Check car exists and is Available
        IF NOT EXISTS (
            SELECT 1 FROM Cars c
            JOIN Car_Status cs ON c.status_id = cs.status_id
            WHERE c.car_id = @car_id AND cs.status_name = 'Available'
        )
            THROW 50002, 'Car is not available.', 1;

        -- 3. Check no overlapping confirmed bookings for this car
        IF EXISTS (
            SELECT 1 FROM Bookings
            WHERE car_id = @car_id
              AND booking_status IN ('Confirmed','Pending')
              AND NOT (@end_date <= start_date OR @start_date >= end_date)
        )
            THROW 50003, 'Car is already booked for the selected dates.', 1;

        -- 4. Calculate base price
        DECLARE @price_per_day DECIMAL(10,2),
                @total_days    INT,
                @base_price    DECIMAL(10,2),
                @driver_charge DECIMAL(10,2) = 0,
                @extra_charges DECIMAL(10,2) = 0,
                @total_amount  DECIMAL(10,2);

        SELECT @price_per_day = price_per_day FROM Cars WHERE car_id = @car_id;
        SET @total_days  = DATEDIFF(DAY, @start_date, @end_date);
        SET @base_price  = @price_per_day * @total_days;

        -- 5. Add driver charge if selected
        IF @driver_id IS NOT NULL
        BEGIN
            SELECT @driver_charge = charge_per_day * @total_days
            FROM Drivers WHERE driver_id = @driver_id;
            SET @extra_charges = @extra_charges + @driver_charge;
            
            -- Mark driver as On Trip
            UPDATE Drivers SET availability_status = 'On Trip' WHERE driver_id = @driver_id;
        END

        -- 5b. Add extra services charge
        IF @service_ids IS NOT NULL
        BEGIN
            DECLARE @services_total DECIMAL(10,2);
            SELECT @services_total = SUM(
                CASE WHEN es.service_cost_type = 'PerDay' 
                     THEN es.service_cost * @total_days 
                     ELSE es.service_cost 
                END
            )
            FROM Extra_Services es
            WHERE CHARINDEX(CAST(es.service_id AS VARCHAR), @service_ids) > 0;
            
            SET @extra_charges = @extra_charges + ISNULL(@services_total, 0);
        END

        SET @total_amount = @base_price + @extra_charges;

        -- 5c. Loyalty Logic: 10% discount for students (reg > 2 years & > 3 rentals)
        DECLARE @is_student BIT, @reg_date DATE, @prev_rentals INT;
        SELECT @is_student = c.student_status, @reg_date = u.registration_date
        FROM Customers c JOIN Users u ON c.user_id = u.user_id WHERE c.customer_id = @customer_id;

        SELECT @prev_rentals = COUNT(*) FROM Bookings WHERE customer_id = @customer_id AND booking_status = 'Completed';

        IF (@is_student = 1 AND DATEDIFF(YEAR, @reg_date, GETDATE()) >= 2 AND @prev_rentals > 3)
        BEGIN
            SET @total_amount = @total_amount * 0.9; -- 10% Discount
        END

        -- 6. Insert booking
        DECLARE @new_booking_id INT;
        INSERT INTO Bookings
            (customer_id, car_id, driver_id, start_date, end_date,
             base_price, extra_charges, total_amount, booking_status)
        VALUES
            (@customer_id, @car_id, @driver_id, @start_date, @end_date,
             @base_price, @extra_charges, @total_amount, 'Confirmed');

        SET @new_booking_id = SCOPE_IDENTITY();

        -- 7. Link extra services
        IF @service_ids IS NOT NULL
        BEGIN
            INSERT INTO Booking_Services (booking_id, service_id, service_cost_snapshot)
            SELECT
                @new_booking_id,
                es.service_id,
                es.service_cost
            FROM Extra_Services es
            WHERE CHARINDEX(CAST(es.service_id AS VARCHAR), @service_ids) > 0;
        END

        -- 8. Mark car as Booked
        UPDATE Cars
        SET status_id = (SELECT status_id FROM Car_Status WHERE status_name = 'Booked')
        WHERE car_id = @car_id;

        -- 9. Create pending payment record
        INSERT INTO Payments (booking_id, payment_method, payment_status, amount_paid)
        VALUES (@new_booking_id, 'Cash', 'Pending', @total_amount);

        -- 10. Auto-replenish: Clone the booked car to add further cars for others
        INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url)
        SELECT category_id, (SELECT status_id FROM Car_Status WHERE status_name = 'Available'), admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity, description, image_url
        FROM Cars
        WHERE car_id = @car_id;

        COMMIT TRANSACTION;

        -- Return new booking ID
        SELECT @new_booking_id AS booking_id, @total_amount AS total_amount;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


-- ------------------------------------------------------------
-- SP 2: Complete a Booking (return car, generate receipt)
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_CompleteBooking
    @booking_id      INT,
    @payment_method  VARCHAR(50),
    @amount_paid     DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate booking exists and is Confirmed
        IF NOT EXISTS (
            SELECT 1 FROM Bookings
            WHERE booking_id = @booking_id AND booking_status = 'Confirmed'
        )
            THROW 50004, 'Booking not found or already completed.', 1;

        DECLARE @car_id      INT,
                @total       DECIMAL(10,2),
                @days        INT,
                @tax_rate    DECIMAL(5,4) = 0.05,   -- 5% tax
                @tax_amount  DECIMAL(10,2);

        SELECT @car_id  = car_id,
               @total   = total_amount,
               @days    = DATEDIFF(DAY, start_date, end_date)
        FROM Bookings WHERE booking_id = @booking_id;

        SET @tax_amount = @total * @tax_rate;

        -- Update booking status
        UPDATE Bookings
        SET booking_status = 'Completed'
        WHERE booking_id = @booking_id;

        -- Update payment
        UPDATE Payments
        SET payment_method  = @payment_method,
            payment_status  = 'Completed',
            payment_date    = GETDATE(),
            amount_paid     = @amount_paid,
            transaction_reference = NEWID()
        WHERE booking_id = @booking_id;

        -- Free up the car
        UPDATE Cars
        SET status_id = (SELECT status_id FROM Car_Status WHERE status_name = 'Available')
        WHERE car_id = @car_id;

        -- Generate receipt
        INSERT INTO Receipts (booking_id, total_amount, rental_days, tax_amount)
        VALUES (@booking_id, @total + @tax_amount, @days, @tax_amount);

        COMMIT TRANSACTION;

        SELECT 'Booking completed successfully.' AS message,
               @total + @tax_amount AS final_total;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


-- ------------------------------------------------------------
-- SP 3: Cancel a Booking
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_CancelBooking
    @booking_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1 FROM Bookings
            WHERE booking_id = @booking_id
              AND booking_status IN ('Pending','Confirmed')
        )
            THROW 50005, 'Booking cannot be cancelled.', 1;

        DECLARE @car_id INT;
        SELECT @car_id = car_id FROM Bookings WHERE booking_id = @booking_id;

        UPDATE Bookings SET booking_status = 'Cancelled' WHERE booking_id = @booking_id;

        UPDATE Payments
        SET payment_status = 'Refunded'
        WHERE booking_id = @booking_id AND payment_status = 'Completed';

        UPDATE Cars
        SET status_id = (SELECT status_id FROM Car_Status WHERE status_name = 'Available')
        WHERE car_id = @car_id;

        COMMIT TRANSACTION;
        SELECT 'Booking cancelled successfully.' AS message;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


-- ------------------------------------------------------------
-- SP 4: Search Available Cars by filters
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_SearchAvailableCars
    @start_date       DATE,
    @end_date         DATE,
    @category_id      INT  = NULL,
    @transmission     VARCHAR(20) = NULL,
    @fuel_type        VARCHAR(20) = NULL,
    @min_price        DECIMAL(10,2) = NULL,
    @max_price        DECIMAL(10,2) = NULL,
    @min_seats        INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.car_id,
        c.brand,
        c.model,
        c.year,
        cc.category_name,
        c.transmission_type,
        c.fuel_type,
        c.price_per_day,
        c.seating_capacity,
        c.image_url,
        ISNULL(AVG(CAST(r.rating AS FLOAT)), 0) AS avg_rating,
        -- Availability logic
        CASE 
            WHEN cs.status_name <> 'Available' THEN 0
            WHEN @start_date IS NULL OR @end_date IS NULL THEN 1
            WHEN EXISTS (
                SELECT 1 FROM Bookings b
                WHERE b.car_id = c.car_id 
                  AND b.booking_status IN ('Confirmed','Pending')
                  AND NOT (@end_date <= b.start_date OR @start_date >= b.end_date)
            ) THEN 0
            ELSE 1
        END AS is_available
    FROM Cars c
    JOIN Car_Categories cc ON c.category_id = cc.category_id
    JOIN Car_Status cs     ON c.status_id   = cs.status_id
    LEFT JOIN Reviews r    ON c.car_id      = r.car_id
    WHERE
        cs.status_name IN ('Available', 'Booked')
        AND (@category_id   IS NULL OR c.category_id       = @category_id)
        AND (@transmission  IS NULL OR c.transmission_type = @transmission)
        AND (@fuel_type     IS NULL OR c.fuel_type         = @fuel_type)
        AND (@min_price     IS NULL OR c.price_per_day    >= @min_price)
        AND (@max_price     IS NULL OR c.price_per_day    <= @max_price)
        AND (@min_seats     IS NULL OR c.seating_capacity >= @min_seats)
    GROUP BY
        c.car_id, c.brand, c.model, c.year, cc.category_name,
        c.transmission_type, c.fuel_type, c.price_per_day,
        c.seating_capacity, c.image_url, cs.status_name
    ORDER BY avg_rating DESC, c.price_per_day ASC;
END;
GO


-- ------------------------------------------------------------
-- SP 5: Admin Revenue Report
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_RevenueReport
    @from_date DATE = NULL,
    @to_date   DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @from_date = ISNULL(@from_date, '2000-01-01');
    SET @to_date   = ISNULL(@to_date,   CAST(GETDATE() AS DATE));

    SELECT
        COUNT(b.booking_id)       AS total_bookings,
        SUM(b.base_price)         AS gross_base_revenue,
        SUM(b.extra_charges)      AS extra_services_revenue,
        SUM(b.total_amount)       AS net_revenue_pre_tax,
        SUM(r.tax_amount)         AS total_tax_collected,
        SUM(r.total_amount)       AS grand_total_with_tax,
        AVG(b.total_amount)       AS avg_booking_value,
        SUM(DATEDIFF(DAY, b.start_date, b.end_date)) AS total_rental_days
    FROM Bookings b
    LEFT JOIN Receipts r ON b.booking_id = r.booking_id
    WHERE b.booking_status = 'Completed'
      AND CAST(b.booking_date AS DATE) BETWEEN @from_date AND @to_date;

    -- Revenue by car category
    SELECT
        cc.category_name,
        COUNT(b.booking_id)  AS bookings,
        SUM(b.total_amount)  AS revenue
    FROM Bookings b
    JOIN Cars c          ON b.car_id      = c.car_id
    JOIN Car_Categories cc ON c.category_id = cc.category_id
    WHERE b.booking_status = 'Completed'
      AND CAST(b.booking_date AS DATE) BETWEEN @from_date AND @to_date
    GROUP BY cc.category_name
    ORDER BY revenue DESC;
END;
GO


-- ============================================================
--  SECTION 4 — TRIGGERS
-- ============================================================

-- Trigger: Prevent double-booking at database level
CREATE OR ALTER TRIGGER trg_PreventDoubleBooking
ON Bookings
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN Bookings b ON b.car_id = i.car_id
            AND b.booking_id <> i.booking_id
            AND b.booking_status IN ('Confirmed','Pending')
            AND NOT (i.end_date <= b.start_date OR i.start_date >= b.end_date)
    )
    BEGIN
        RAISERROR('Double booking detected for this car and date range.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- Trigger: Auto-set car status back to Available when booking is cancelled
CREATE OR ALTER TRIGGER trg_AutoFreeCarOnCancel
ON Bookings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(booking_status)
    BEGIN
        UPDATE Cars
        SET status_id = (SELECT status_id FROM Car_Status WHERE status_name = 'Available')
        FROM Cars c
        JOIN inserted i ON c.car_id = i.car_id
        WHERE i.booking_status = 'Cancelled';
    END
END;
GO


-- ============================================================
--  SECTION 5 — VIEWS
-- ============================================================

-- View: Full booking details (useful for admin dashboard)
CREATE OR ALTER VIEW vw_BookingDetails AS
SELECT
    b.booking_id,
    u.name          AS customer_name,
    u.email         AS customer_email,
    u.phone         AS customer_phone,
    c.brand + ' ' + c.model + ' (' + CAST(c.year AS VARCHAR) + ')' AS car_name,
    cc.category_name,
    d.name          AS driver_name,
    b.start_date,
    b.end_date,
    b.total_days,
    b.base_price,
    b.extra_charges,
    b.total_amount,
    b.booking_status,
    b.booking_date,
    p.payment_method,
    p.payment_status,
    p.amount_paid
FROM Bookings b
JOIN Customers cu    ON b.customer_id  = cu.customer_id
JOIN Users u         ON cu.user_id     = u.user_id
JOIN Cars c          ON b.car_id       = c.car_id
JOIN Car_Categories cc ON c.category_id = cc.category_id
LEFT JOIN Drivers d  ON b.driver_id    = d.driver_id
LEFT JOIN Payments p ON b.booking_id   = p.booking_id;
GO

-- View: Car availability summary
CREATE OR ALTER VIEW vw_CarAvailability AS
SELECT
    c.car_id,
    c.brand,
    c.model,
    c.year,
    cc.category_name,
    cs.status_name AS current_status,
    c.price_per_day,
    ISNULL(AVG(CAST(r.rating AS FLOAT)), 0) AS avg_rating,
    COUNT(r.review_id) AS total_reviews
FROM Cars c
JOIN Car_Categories cc ON c.category_id = cc.category_id
JOIN Car_Status cs     ON c.status_id   = cs.status_id
LEFT JOIN Reviews r    ON c.car_id      = r.car_id
GROUP BY
    c.car_id, c.brand, c.model, c.year,
    cc.category_name, cs.status_name, c.price_per_day;
GO


-- ============================================================
--  SECTION 6 — SEED DATA (for testing)
-- ============================================================

INSERT INTO Car_Status (status_name) VALUES
    ('Available'), ('Booked'), ('Under Maintenance'), ('Reserved');

INSERT INTO Car_Categories (category_name) VALUES
    ('Sedan'), ('SUV'), ('Hatchback'), ('Van'), ('Luxury'), ('Pickup Truck');

INSERT INTO Extra_Services (service_name, service_cost_type, service_cost) VALUES
    ('GPS Navigation', 'PerDay',  200.00),
    ('Child Seat',     'Fixed',   500.00),
    ('Insurance',      'PerDay',  300.00),
    ('Extra Mileage',  'PerDay',  150.00);

-- Admin user
INSERT INTO Users (name, email, phone, cnic, password_hash, role)
VALUES ('Super Admin', 'admin@carmatrix.pk', '03001234567',
        '35202-1234567-1', 'hashed_password_here', 'Admin');

INSERT INTO Admins (user_id, admin_level) VALUES (1, 'SuperAdmin');

-- Sample customer
INSERT INTO Users (name, email, phone, cnic, password_hash, role)
VALUES ('Ali Hassan', 'ali@example.com', '03009876543',
        '35202-7654321-2', 'hashed_password_here', 'Customer');

INSERT INTO Customers (user_id, driving_license_number, student_status)
VALUES (2, 'LHR-2021-12345', 1);

-- Sample driver
INSERT INTO Drivers (name, phone, license_number, charge_per_day)
VALUES ('Usman Tariq', '03331234567', 'LHR-D-9876', 800.00);

-- Sample cars
INSERT INTO Cars (category_id, status_id, admin_id, brand, model, year, transmission_type, fuel_type, price_per_day, seating_capacity)
VALUES
    (1, 1, 1, 'Toyota',   'Corolla',  2022, 'Automatic', 'Petrol',  3500.00, 5),
    (2, 1, 1, 'Honda',    'CR-V',     2023, 'Automatic', 'Petrol',  6000.00, 7),
    (3, 1, 1, 'Suzuki',   'Alto',     2021, 'Manual',    'Petrol',  2000.00, 5),
    (5, 1, 1, 'Mercedes', 'E-Class',  2023, 'Automatic', 'Petrol', 15000.00, 5),
    (2, 1, 1, 'Toyota',   'Fortuner', 2022, 'Automatic', 'Diesel',  8000.00, 7);
GO


-- ============================================================
--  QUICK TEST QUERIES
-- ============================================================

-- Test 1: Search available cars for a date range
EXEC sp_SearchAvailableCars
    @start_date = '2026-04-01',
    @end_date   = '2026-04-05';

-- Test 2: Create a booking
EXEC sp_CreateBooking
    @customer_id = 1,
    @car_id      = 1,
    @start_date  = '2026-04-01',
    @end_date    = '2026-04-05',
    @service_ids = '1,3';  -- GPS + Insurance

-- Test 3: View all bookings
SELECT * FROM vw_BookingDetails;

-- Test 4: Revenue report
EXEC sp_RevenueReport
    @from_date = '2026-01-01',
    @to_date   = '2026-12-31';

-- Test 5: Compute how long a customer has been registered (no stored column needed)
SELECT
    u.name,
    u.registration_date,
    DATEDIFF(YEAR, u.registration_date, GETDATE()) AS years_registered
FROM Users u
JOIN Customers c ON u.user_id = c.user_id;
GO
