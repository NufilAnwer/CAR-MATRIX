const { sql, poolPromise } = require('./config/db');

async function update() {
  try {
    const pool = await poolPromise;
    await pool.request().query(`
CREATE OR ALTER PROCEDURE sp_CreateBooking
    @customer_id  INT,
    @car_id       INT,
    @driver_id    INT = NULL,
    @start_date   DATE,
    @end_date     DATE,
    @service_ids  VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        IF @driver_id IS NULL
        BEGIN
            SELECT @driver_id = driver_id FROM Cars WHERE car_id = @car_id;
        END

        IF @end_date <= @start_date
            THROW 50001, 'End date must be after start date.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM Cars c
            JOIN Car_Status cs ON c.status_id = cs.status_id
            WHERE c.car_id = @car_id AND cs.status_name = 'Available'
        )
            THROW 50002, 'Car is not available.', 1;

        IF EXISTS (
            SELECT 1 FROM Bookings
            WHERE car_id = @car_id
              AND booking_status IN ('Confirmed','Pending')
              AND NOT (@end_date <= start_date OR @start_date >= end_date)
        )
            THROW 50003, 'Car is already booked for the selected dates.', 1;

        DECLARE @price_per_day DECIMAL(10,2),
                @total_days    INT,
                @base_price    DECIMAL(10,2),
                @driver_charge DECIMAL(10,2) = 0,
                @extra_charges DECIMAL(10,2) = 0,
                @total_amount  DECIMAL(10,2);

        SELECT @price_per_day = price_per_day FROM Cars WHERE car_id = @car_id;
        SET @total_days  = DATEDIFF(DAY, @start_date, @end_date);
        SET @base_price  = @price_per_day * @total_days;

        IF @driver_id IS NOT NULL
        BEGIN
            SELECT @driver_charge = charge_per_day * @total_days
            FROM Drivers WHERE driver_id = @driver_id;
            SET @extra_charges = @extra_charges + @driver_charge;
            UPDATE Drivers SET availability_status = 'On Trip' WHERE driver_id = @driver_id;
        END

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

        DECLARE @is_student BIT, @reg_date DATE, @prev_rentals INT;
        SELECT @is_student = c.student_status, @reg_date = u.registration_date
        FROM Customers c JOIN Users u ON c.user_id = u.user_id WHERE c.customer_id = @customer_id;

        SELECT @prev_rentals = COUNT(*) FROM Bookings WHERE customer_id = @customer_id AND booking_status = 'Completed';

        IF (@is_student = 1 AND DATEDIFF(YEAR, @reg_date, GETDATE()) >= 2 AND @prev_rentals > 3)
        BEGIN
            SET @total_amount = @total_amount * 0.9;
        END

        DECLARE @new_booking_id INT;
        INSERT INTO Bookings
            (customer_id, car_id, driver_id, start_date, end_date,
             base_price, extra_charges, total_amount, booking_status)
        VALUES
            (@customer_id, @car_id, @driver_id, @start_date, @end_date,
             @base_price, @extra_charges, @total_amount, 'Confirmed');

        SET @new_booking_id = SCOPE_IDENTITY();

        IF @service_ids IS NOT NULL
        BEGIN
            INSERT INTO Booking_Services (booking_id, service_id, service_cost_snapshot)
            SELECT @new_booking_id, es.service_id, es.service_cost
            FROM Extra_Services es
            WHERE CHARINDEX(CAST(es.service_id AS VARCHAR), @service_ids) > 0;
        END

        UPDATE Cars
        SET status_id = (SELECT status_id FROM Car_Status WHERE status_name = 'Booked')
        WHERE car_id = @car_id;

        INSERT INTO Payments (booking_id, payment_method, payment_status, amount_paid)
        VALUES (@new_booking_id, 'Cash', 'Pending', @total_amount);

        COMMIT TRANSACTION;
        SELECT @new_booking_id AS booking_id, @total_amount AS total_amount;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;`);
    console.log("sp_CreateBooking updated successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

update();
