-- Phase 4: Matchmaking and Heartbeat SQL Script

-- 1. Create matchmaking_pool table
CREATE TABLE IF NOT EXISTS public.matchmaking_pool (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  category text not null,
  duration integer not null,
  status text not null default 'waiting', -- 'waiting' or 'matched'
  room_id uuid, -- Will be set when matched
  last_heartbeat timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create active_rooms table
CREATE TABLE IF NOT EXISTS public.active_rooms (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'active', -- 'active' or 'closed'
  user1_id uuid references public.profiles(id) on delete set null,
  user2_id uuid references public.profiles(id) on delete set null,
  last_heartbeat_user1 timestamp with time zone,
  last_heartbeat_user2 timestamp with time zone
);

-- 3. RLS Policies
ALTER TABLE public.matchmaking_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matchmaking state" ON public.matchmaking_pool FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can see their active rooms" ON public.active_rooms FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 4. RPC: ping_matchmaking
CREATE OR REPLACE FUNCTION public.ping_matchmaking(p_user_id uuid, p_category text, p_duration integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_my_record record;
    v_matched_user uuid;
    v_new_room_id uuid;
BEGIN
    -- Check my current state
    SELECT * INTO v_my_record FROM public.matchmaking_pool WHERE user_id = p_user_id;

    IF FOUND AND v_my_record.status = 'matched' AND v_my_record.room_id IS NOT NULL THEN
        -- Someone else matched with me or I already matched
        UPDATE public.matchmaking_pool SET last_heartbeat = now() WHERE user_id = p_user_id;
        RETURN v_my_record.room_id;
    END IF;

    -- Try to match with someone waiting in the same pool with recent heartbeat (last 15s)
    SELECT user_id INTO v_matched_user
    FROM public.matchmaking_pool
    WHERE category = p_category 
      AND duration = p_duration 
      AND user_id != p_user_id
      AND status = 'waiting'
      AND last_heartbeat > now() - interval '15 seconds'
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    IF v_matched_user IS NOT NULL THEN
        -- We found a match! Create an active room
        INSERT INTO public.active_rooms (user1_id, user2_id, last_heartbeat_user1, last_heartbeat_user2) 
        VALUES (p_user_id, v_matched_user, now(), now())
        RETURNING id INTO v_new_room_id;
        
        -- Update both users to 'matched'
        INSERT INTO public.matchmaking_pool (user_id, category, duration, status, last_heartbeat, room_id)
        VALUES (p_user_id, p_category, p_duration, 'matched', now(), v_new_room_id)
        ON CONFLICT (user_id) DO UPDATE SET 
            status = 'matched', last_heartbeat = now(), room_id = v_new_room_id;

        UPDATE public.matchmaking_pool 
        SET status = 'matched', room_id = v_new_room_id 
        WHERE user_id = v_matched_user;

        RETURN v_new_room_id;
    ELSE
        -- No match found, update/insert me as waiting
        INSERT INTO public.matchmaking_pool (user_id, category, duration, status, last_heartbeat, room_id)
        VALUES (p_user_id, p_category, p_duration, 'waiting', now(), NULL)
        ON CONFLICT (user_id) DO UPDATE SET 
            category = p_category, duration = p_duration, status = 'waiting', last_heartbeat = now(), room_id = NULL;

        RETURN NULL;
    END IF;
END;
$$;

-- 5. RPC: ping_room
CREATE OR REPLACE FUNCTION public.ping_room(p_room_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room record;
    v_partner_heartbeat timestamp with time zone;
BEGIN
    SELECT * INTO v_room FROM public.active_rooms WHERE id = p_room_id;
    
    IF NOT FOUND OR v_room.status = 'closed' THEN
        RETURN 'closed';
    END IF;

    -- Update my heartbeat
    IF v_room.user1_id = p_user_id THEN
        UPDATE public.active_rooms SET last_heartbeat_user1 = now() WHERE id = p_room_id;
        v_partner_heartbeat := v_room.last_heartbeat_user2;
    ELSIF v_room.user2_id = p_user_id THEN
        UPDATE public.active_rooms SET last_heartbeat_user2 = now() WHERE id = p_room_id;
        v_partner_heartbeat := v_room.last_heartbeat_user1;
    ELSE
        RETURN 'invalid_user';
    END IF;

    -- Check if partner heartbeat is older than 12 seconds
    IF v_partner_heartbeat < now() - interval '12 seconds' THEN
        -- Partner is ghost/dropped
        UPDATE public.active_rooms SET status = 'closed' WHERE id = p_room_id;
        -- Remove both from matchmaking pool simply to clean up
        DELETE FROM public.matchmaking_pool WHERE room_id = p_room_id;
        RETURN 'partner_dropped';
    END IF;

    RETURN 'active';
END;
$$;

-- 6. RPC: leave_pool
-- When user explicitly cancels matchmaking
CREATE OR REPLACE FUNCTION public.leave_pool(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.matchmaking_pool WHERE user_id = p_user_id;
$$;

-- 7. Add XP to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_xp(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.profiles SET xp = xp + p_amount WHERE id = p_user_id;
$$;
