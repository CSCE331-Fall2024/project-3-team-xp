DO $$
DECLARE
    random_choice INT;
    random_customer RECORD;
    transaction RECORD;
BEGIN
    FOR transaction IN SELECT * FROM transactions LOOP
        random_choice := FLOOR(RANDOM() * 3) + 1;

        IF random_choice = 1 THEN
            SELECT * INTO random_customer FROM customers ORDER BY RANDOM() LIMIT 1;
            UPDATE transactions 
            SET customer = random_customer.username,
                customer_account = random_customer.customer_id 
            WHERE transaction_id = transaction."transaction_id";
        END IF;
    END LOOP;
END $$;