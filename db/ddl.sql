-- /////////////////////////////////////////////////////////////////////////////////////
drop table school cascade;
drop table campus cascade;
drop table staff cascade;
drop table parent cascade;
drop table child cascade;
drop table device cascade;
drop table location cascade;
drop table pickup_status cascade;
drop type STAFF_STATUS;
-- /////////////////////////////////////////////////////////////////////////////////////
CREATE TYPE STAFF_STATUS AS ENUM ('PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE', 'REJECTED');
-- /////////////////////////////////////////////////////////////////////////////////////
CREATE TABLE school (
   school_id serial PRIMARY KEY,
   name VARCHAR(50) UNIQUE NOT NULL,
   contact_person VARCHAR(50),
   email VARCHAR(50) UNIQUE,
   phone  VARCHAR(50) UNIQUE,
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE campus (
   campus_id SERIAL PRIMARY KEY,
   school_id INTEGER REFERENCES school (school_id) NOT NULL,
   address VARCHAR(100),
   name VARCHAR (100) NULL,
   latitude NUMERIC(10,6) NOT NULL,
   longitude NUMERIC(10,6) NOT NULL,
   track_radius SMALLINT NOT NULL,
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE staff (
   staff_id SERIAL PRIMARY KEY,
   school_id INTEGER REFERENCES school (school_id),
   name VARCHAR (50) NOT NULL,
   email VARCHAR (50) UNIQUE,
   phone  VARCHAR(50) UNIQUE,
   password TEXT NOT NULL,
   status STAFF_STATUS NOT NULL,
   staff_uuid UUID NOT NULL DEFAULT uuid_generate_v1(),
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE parent (
   parent_id SERIAL PRIMARY KEY,
   name VARCHAR (50) NOT NULL,
   email VARCHAR (50) UNIQUE,
   phone  VARCHAR(50) UNIQUE,
   password TEXT NOT NULL,
   status STAFF_STATUS NOT NULL,
   parent_uuid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v1(),
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE child (
   child_id SERIAL PRIMARY KEY,
   parent_id INTEGER REFERENCES parent (parent_id) NOT NULL,
   campus_id INTEGER REFERENCES campus (campus_id) NOT NULL,
   name VARCHAR (50) NOT NULL,
   grade varchar(20) NOT NULL,
   section varchar(20) NOT NULL,
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE device (
   device_id SERIAL PRIMARY KEY,
   owner_id INTEGER REFERENCES parent (parent_id),
   device_uuid UUID NOT NULL DEFAULT uuid_generate_v1(),
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE location (
   location_id SERIAL PRIMARY KEY,
   parent_id INTEGER REFERENCES parent (parent_id),
   latitude NUMERIC(10,6) NOT NULL,
   longitude NUMERIC(10,6) NOT NULL,
   created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pickup_status (
   pickup_status_id SERIAL PRIMARY KEY,
   parent_id INTEGER REFERENCES parent (parent_id),
   child_id INTEGER REFERENCES child (child_id),
   picked_up_at TIMESTAMP NOT NULL,
   released_by INTEGER REFERENCES staff (staff_id)
);
-- /////////////////////////////////////////////////////////////////////////////////////
CREATE INDEX idx_location_parent_id ON location(parent_id);
CREATE INDEX idx_child_parent_id ON child(parent_id);
-- /////////////////////////////////////////////////////////////////////////////////////
insert into school (name) values ('OGS');
insert into campus (school_id, name, latitude, longitude, track_radius) select school_id, 'OGS Primary', 43.520123, -79.657937, 500 from school where name = 'OGS';
insert into campus (school_id, name, latitude, longitude, track_radius) select school_id, 'OGS Secondary', 43.521969, -79.656713, 500 from school where name = 'OGS';

insert into parent (name, email, phone, password, status, parent_uuid) select 'Jake Doe', 'jake.doe@email.com', '289-999-2222', 'strong', 'PENDING_ACTIVATION', uuid_generate_v1();
insert into child (parent_id, campus_id, name, grade, section) select parent_id, campus_id, 'Jane Doe', '4', 'A' from parent p, campus c where p.name = 'Jake Doe' and c.name = 'OGS Primary';
insert into child (parent_id, campus_id, name, grade, section) select parent_id, campus_id, 'Joanne Doe', '7', 'B' from parent p, campus c where p.name = 'Jake Doe' and c.name = 'OGS Secondary';
insert into child (parent_id, campus_id, name, grade, section) select parent_id, campus_id, 'Joseph Doe', 'JK', 'A' from parent p, campus c where p.name = 'Jake Doe' and c.name = 'OGS Primary';

insert into parent (name, email, phone, password, status, parent_uuid) select 'Henry Doe', 'henry.jake.doe@email.com', '289-999-2223', 'strong', 'PENDING_ACTIVATION', uuid_generate_v1();
insert into child (parent_id, campus_id, name, grade, section) select parent_id, campus_id, 'Jane Doe', '4', 'A' from parent p, campus c where p.name = 'Henry Doe' and c.name = 'OGS Primary';

insert into parent (name, email, phone, password, status, parent_uuid) select 'Jenny Doe', 'jenny.doe@email.com', '289-999-2224', 'strong', 'PENDING_ACTIVATION', uuid_generate_v1();
insert into child (parent_id, campus_id, name, grade, section) select parent_id, campus_id, 'Jane Doe', '7', 'C' from parent p, campus c where p.name = 'Jenny Doe' and c.name = 'OGS Secondary';

insert into parent (name, email, phone, password, status, parent_uuid) select 'Alex Doe', 'alex.doe@email.com', '289-939-2224', 'strong', 'PENDING_ACTIVATION', uuid_generate_v1();
insert into child (parent_id, campus_id, name, grade, section) select parent_id, campus_id, 'Alex Jane Doe', '7', 'A' from parent p, campus c where p.name = 'Alex Doe' and c.name = 'OGS Secondary';

insert into location (parent_id, latitude, longitude) select parent_id, 43.520268, -79.658729 from parent where name = 'Jake Doe';
insert into location (parent_id, latitude, longitude) select parent_id, 43.520328, -79.657951 from parent where name = 'Henry Doe';
insert into location (parent_id, latitude, longitude) select parent_id, 43.520752, -79.658195 from parent where name = 'Jenny Doe';

insert into location (parent_id, latitude, longitude) select parent_id, 43.522198, -79.656493 from parent where name = 'Alex Doe';


select * from school;
select * from campus;
select * from parent;
select * from child;
select * from staff;
select * from location;

delete from staff;
delete from location;
delete from child;
delete from parent;
