DO $$
DECLARE
    i INT;  -- Counter for the loop
    random_email TEXT;
    random_username TEXT;
    random_password TEXT;
    random_current_points INT;
    random_total_points INT;
BEGIN
    FOR i IN 1..5000 LOOP  -- Loop 10 times to insert 10 random rows
        -- Get random email, username, and password
        SELECT 
            e.email,
            f.name,
            p.password,
            floor(random() * 500)::INT INTO random_email, random_username, random_password, random_current_points
        FROM 
            (SELECT email FROM emails ORDER BY random() LIMIT 1) AS e,
            (SELECT name FROM first_names ORDER BY random() LIMIT 1) AS f,
            (SELECT password FROM passwords ORDER BY random() LIMIT 1) AS p;

        -- Calculate total_points
        random_total_points := random_current_points + floor(random() * 100)::INT;

        -- Insert into customers table
        INSERT INTO customers (email, username, password, current_points, total_points)
        VALUES (random_email, random_username, random_password, random_current_points, random_total_points)
        ON CONFLICT (email) DO NOTHING;  -- Handle email duplicates
    END LOOP;
END $$;

