create extension if not exists "pgcrypto";

create table
  post (
    id uuid primary key DEFAULT gen_random_uuid (),
    user_id uuid references auth.users (id) not null,
    comment_id uuid references comment (id) default null,
    content text,
    likes int,
    created_at timestamp with time zone default current_timestamp
  );

create table
  comment (
    id uuid primary key DEFAULT gen_random_uuid (),
    user_id uuid references auth.users (id) not null,
    post_id uuid references post (id) not null,
    comment_id uuid references comment (id) default null,
    content text,
    likes int,
    created_at timestamp with time zone default current_timestamp
  );

create table
  public.profiles (
    id uuid not null references auth.users on delete cascade,
    display_name text,
    primary key (id)
  );

alter table public.profiles enable row level security;

-- inserts a row into public.profiles
create function public.handle_new_user () returns trigger language plpgsql security definer
set
  search_path = '' as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'displayName');
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();
