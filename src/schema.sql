create table users(
    id serial primary key,
    username varchar(50) not null,
    email varchar(50) not null unique,
    hashed_password varchar(100) not null,
    status varchar(20) default 'pending',
    role varchar(20) default 'user',
    is_active boolean default true,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);