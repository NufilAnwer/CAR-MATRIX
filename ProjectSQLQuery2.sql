-- ============================================================
--  CarMatrix — Driver Registration Migration
--  Run this AFTER your main CarMatrix_Database.sql
-- ============================================================

USE CarMatrix;
GO

-- ------------------------------------------------------------
-- STEP 1: Add 'Driver' role to Users CHECK constraint
-- First drop the old constraint, then recreate with Driver added
-- ------------------------------------------------------------
ALTER TABLE Users DROP CONSTRAINT CK_Users_Role;
GO

ALTER TABLE Users ADD CONSTRAINT CK_Users_Role
  CHECK (role IN ('Customer', 'Admin', 'Driver'));
GO

-- ------------------------------------------------------------
-- STEP 2: Add user_id FK to Drivers table
-- Allows drivers to have login credentials via Users table
-- ------------------------------------------------------------
ALTER TABLE Drivers ADD user_id INT NULL;
GO

ALTER TABLE Drivers ADD CONSTRAINT FK_Drivers_Users
  FOREIGN KEY (user_id) REFERENCES Users(user_id);
GO

-- Make user_id unique (one driver profile per user)
ALTER TABLE Drivers ADD CONSTRAINT UQ_Drivers_UserId
  UNIQUE (user_id);
GO

-- ------------------------------------------------------------
-- STEP 3: Driver_Applications table
-- Stores pending applications before admin approval
-- ------------------------------------------------------------
CREATE TABLE Driver_Applications (
  application_id    INT           IDENTITY(1,1) PRIMARY KEY,
  -- Personal info (submitted before Users row exists)
  full_name         VARCHAR(100)  NOT NULL,
  email             VARCHAR(150)  NOT NULL UNIQUE,
  phone             VARCHAR(20)   NOT NULL,
  cnic              VARCHAR(20)   NOT NULL UNIQUE,
  password_hash     VARCHAR(255)  NOT NULL,  -- stored ready for account creation
  license_number    VARCHAR(50)   NOT NULL,
  charge_per_day    DECIMAL(10,2) NOT NULL,
  experience_years  INT           NOT NULL DEFAULT 0,
  about_me          VARCHAR(500)  NULL,      -- short bio
  -- Application status
  status            VARCHAR(20)   NOT NULL DEFAULT 'Pending'
    CONSTRAINT CK_DriverApp_Status
      CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  rejection_reason  VARCHAR(255)  NULL,
  applied_at        DATETIME      NOT NULL DEFAULT GETDATE(),
  reviewed_at       DATETIME      NULL,
  reviewed_by       INT           NULL,      -- admin_id who reviewed
  -- Once approved, link to created driver/user
  driver_id         INT           NULL,
  CONSTRAINT FK_DriverApp_Admin   FOREIGN KEY (reviewed_by) REFERENCES Admins(admin_id),
  CONSTRAINT FK_DriverApp_Driver  FOREIGN KEY (driver_id)   REFERENCES Drivers(driver_id)
);
GO

-- ------------------------------------------------------------
-- STEP 4: Driver_Ratings table
-- Customers rate drivers after completed trips
-- ------------------------------------------------------------
CREATE TABLE Driver_Ratings (
  rating_id   INT           IDENTITY(1,1) PRIMARY KEY,
  driver_id   INT           NOT NULL,
  booking_id  INT           NOT NULL UNIQUE,  -- one rating per booking
  customer_id INT           NOT NULL,
  rating      INT           NOT NULL CONSTRAINT CK_DriverRating CHECK (rating BETWEEN 1 AND 5),
  comment     VARCHAR(500)  NULL,
  rated_at    DATETIME      NOT NULL DEFAULT GETDATE(),
  CONSTRAINT FK_DR_Driver   FOREIGN KEY (driver_id)   REFERENCES Drivers(driver_id),
  CONSTRAINT FK_DR_Booking  FOREIGN KEY (booking_id)  REFERENCES Bookings(booking_id),
  CONSTRAINT FK_DR_Customer FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
);
GO

-- ------------------------------------------------------------
-- STEP 5: Stored Procedure — Approve Driver Application
-- Creates Users row + Drivers row atomically
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_ApproveDriverApplication
  @application_id INT,
  @admin_id       INT
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    -- Validate application exists and is Pending
    IF NOT EXISTS (
      SELECT 1 FROM Driver_Applications
      WHERE application_id = @application_id AND status = 'Pending'
    )
      THROW 50010, 'Application not found or already processed.', 1;

    DECLARE
      @full_name        VARCHAR(100),
      @email            VARCHAR(150),
      @phone            VARCHAR(20),
      @cnic             VARCHAR(20),
      @password_hash    VARCHAR(255),
      @license_number   VARCHAR(50),
      @charge_per_day   DECIMAL(10,2),
      @new_user_id      INT,
      @new_driver_id    INT;

    SELECT
      @full_name      = full_name,
      @email          = email,
      @phone          = phone,
      @cnic           = cnic,
      @password_hash  = password_hash,
      @license_number = license_number,
      @charge_per_day = charge_per_day
    FROM Driver_Applications WHERE application_id = @application_id;

    -- 1. Create Users row
    INSERT INTO Users (name, email, phone, cnic, password_hash, role)
    VALUES (@full_name, @email, @phone, @cnic, @password_hash, 'Driver');

    SET @new_user_id = SCOPE_IDENTITY();

    -- 2. Create Drivers row linked to new user
    INSERT INTO Drivers (user_id, name, phone, license_number, charge_per_day, availability_status)
    VALUES (@new_user_id, @full_name, @phone, @license_number, @charge_per_day, 'Available');

    SET @new_driver_id = SCOPE_IDENTITY();

    -- 3. Update application: Approved + link driver_id
    UPDATE Driver_Applications
    SET
      status       = 'Approved',
      reviewed_at  = GETDATE(),
      reviewed_by  = @admin_id,
      driver_id    = @new_driver_id
    WHERE application_id = @application_id;

    COMMIT TRANSACTION;
    SELECT @new_driver_id AS driver_id, @new_user_id AS user_id;

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END;
GO

-- ------------------------------------------------------------
-- STEP 6: Stored Procedure — Reject Application
-- ------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_RejectDriverApplication
  @application_id  INT,
  @admin_id        INT,
  @reason          VARCHAR(255) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE Driver_Applications
  SET
    status           = 'Rejected',
    reviewed_at      = GETDATE(),
    reviewed_by      = @admin_id,
    rejection_reason = @reason
  WHERE application_id = @application_id AND status = 'Pending';

  IF @@ROWCOUNT = 0
    THROW 50011, 'Application not found or already processed.', 1;
END;
GO

-- ------------------------------------------------------------
-- STEP 7: View — Driver dashboard info
-- ------------------------------------------------------------
CREATE OR ALTER VIEW vw_DriverDashboard AS
SELECT
  d.driver_id,
  d.user_id,
  u.name,
  u.email,
  u.phone,
  d.license_number,
  d.charge_per_day,
  d.availability_status,
  ISNULL(AVG(CAST(dr.rating AS FLOAT)), 0)   AS avg_rating,
  COUNT(DISTINCT dr.rating_id)                AS total_ratings,
  COUNT(DISTINCT b.booking_id)                AS total_trips,
  ISNULL(SUM(b.total_amount * 0.2), 0)        AS total_earnings  -- driver gets 20% of booking
FROM Drivers d
JOIN Users u                ON d.user_id    = u.user_id
LEFT JOIN Driver_Ratings dr ON d.driver_id  = dr.driver_id
LEFT JOIN Bookings b        ON d.driver_id  = b.driver_id
      AND b.booking_status  = 'Completed'
GROUP BY d.driver_id, d.user_id, u.name, u.email, u.phone,
         d.license_number, d.charge_per_day, d.availability_status;
GO

PRINT 'Driver migration completed successfully.';
GO

-- Link your sample driver 'Usman Tariq' to a new User account so he can log in
INSERT INTO Users (name, email, phone, cnic, password_hash, role)
VALUES ('Usman Tariq', 'usman@driver.com', '03331234567', '35202-0000000-1', 'hashed_pass', 'Driver');

UPDATE Drivers 
SET user_id = SCOPE_IDENTITY() 
WHERE name = 'Usman Tariq';
