CREATE TABLE admin_contacts (
	id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	phone TEXT NOT NULL UNIQUE
);

CREATE TABLE admin_routes (
	id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	path TEXT NOT NULL,
	name TEXT NOT NULL
);

CREATE TABLE admin_contact_routes (
	contact UUID NOT NULL REFERENCES admin_contacts (id),
	route UUID NOT NULL REFERENCES admin_routes (id),
	PRIMARY KEY (contact, route)
);