USE CarMatrix;
GO

CREATE OR ALTER PROCEDURE sp_SearchAvailableCars
    @start_date   DATE = NULL,
    @end_date     DATE = NULL,
    @category_id  INT = NULL,
    @transmission VARCHAR(20) = NULL,
    @fuel_type    VARCHAR(20) = NULL,
    @min_price    DECIMAL(10,2) = NULL,
    @max_price    DECIMAL(10,2) = NULL,
    @min_seats    INT = NULL
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
