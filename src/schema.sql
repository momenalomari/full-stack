create table if not exists users(
    id serial primary key,
    username varchar(50) not null,
    email varchar(254) not null unique,
    password_hash varchar(255) not null,
    status varchar(20) default 'pending',
    role varchar(20) default 'user',
    is_active boolean default true,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);