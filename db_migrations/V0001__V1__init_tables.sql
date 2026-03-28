CREATE TABLE t_p54479619_payment_site_rubles.companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    inn TEXT UNIQUE,
    owner_name TEXT,
    owner_phone TEXT,
    owner_email TEXT,
    telegram_chat_id BIGINT,
    api_key TEXT NOT NULL DEFAULT md5(random()::text || clock_timestamp()::text),
    status TEXT DEFAULT 'pending',
    balance NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p54479619_payment_site_rubles.payments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER,
    external_id TEXT,
    description TEXT,
    amount NUMERIC(15,2) NOT NULL,
    commission_amount NUMERIC(15,2),
    net_amount NUMERIC(15,2),
    status TEXT DEFAULT 'pending',
    payer_name TEXT,
    payer_phone TEXT,
    payer_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p54479619_payment_site_rubles.connection_requests (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    inn TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    telegram_username TEXT,
    telegram_chat_id BIGINT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p54479619_payment_site_rubles.owner_earnings (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER,
    company_id INTEGER,
    amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);