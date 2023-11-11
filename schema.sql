CREATE TABLE admin_contacts (
	id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	phone TEXT NOT NULL UNIQUE
);