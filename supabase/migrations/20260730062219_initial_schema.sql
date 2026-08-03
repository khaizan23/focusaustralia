
  create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "action" text not null,
    "target_id" uuid,
    "target_name" text,
    "performed_by" uuid,
    "performed_by_name" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."bookmarks" (
    "id" uuid not null default gen_random_uuid(),
    "employer_id" uuid,
    "candidate_id" uuid,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."clientfile" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "title" text not null,
    "description" text,
    "file_path" text not null,
    "file_size" bigint,
    "file_type" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."experiences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "job_title" text not null,
    "company_name" text not null,
    "location" text,
    "employment_type" text,
    "job_description" text,
    "is_current" boolean default true,
    "start_month" text,
    "start_year" text,
    "end_month" text,
    "end_year" text,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "email" text,
    "role" text default 'client'::text,
    "created_at" timestamp with time zone default now(),
    "phone" text,
    "birthdate" date,
    "address" text,
    "bio" text,
    "gender" text,
    "height" numeric,
    "weight" numeric,
    "avatar_url" text,
    "status" text default 'TBA'::text,
    "position" text default 'TBA'::text,
    "company_name" text,
    "company_address" text,
    "industry" text,
    "verification_status" text default 'pending'::text
      );



  create table "public"."video_links" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "title" text not null,
    "description" text,
    "url" text not null,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."videos" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "title" text not null,
    "description" text,
    "file_path" text not null,
    "file_size" bigint,
    "created_at" timestamp with time zone default now(),
    "file_type" text default 'video'::text
      );


CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX bookmarks_employer_id_candidate_id_key ON public.bookmarks USING btree (employer_id, candidate_id);

CREATE UNIQUE INDEX bookmarks_pkey ON public.bookmarks USING btree (id);

CREATE UNIQUE INDEX clientfile_pkey ON public.clientfile USING btree (id);

CREATE UNIQUE INDEX experiences_pkey ON public.experiences USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX video_links_pkey ON public.video_links USING btree (id);

CREATE UNIQUE INDEX videos_pkey ON public.videos USING btree (id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."bookmarks" add constraint "bookmarks_pkey" PRIMARY KEY using index "bookmarks_pkey";

alter table "public"."clientfile" add constraint "clientfile_pkey" PRIMARY KEY using index "clientfile_pkey";

alter table "public"."experiences" add constraint "experiences_pkey" PRIMARY KEY using index "experiences_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."video_links" add constraint "video_links_pkey" PRIMARY KEY using index "video_links_pkey";

alter table "public"."videos" add constraint "videos_pkey" PRIMARY KEY using index "videos_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_performed_by_fkey" FOREIGN KEY (performed_by) REFERENCES public.profiles(id) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_performed_by_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_candidate_id_fkey" FOREIGN KEY (candidate_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_candidate_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_employer_id_candidate_id_key" UNIQUE using index "bookmarks_employer_id_candidate_id_key";

alter table "public"."bookmarks" add constraint "bookmarks_employer_id_fkey" FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_employer_id_fkey";

alter table "public"."clientfile" add constraint "clientfile_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."clientfile" validate constraint "clientfile_user_id_fkey";

alter table "public"."experiences" add constraint "experiences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."experiences" validate constraint "experiences_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."video_links" add constraint "video_links_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."video_links" validate constraint "video_links_user_id_fkey";

alter table "public"."videos" add constraint "videos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."videos" validate constraint "videos_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    company_name,
    company_address,
    industry,
    verification_status
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'company_address',
    NEW.raw_user_meta_data->>'industry',
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'employer' THEN 'pending'
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."bookmarks" to "anon";

grant insert on table "public"."bookmarks" to "anon";

grant references on table "public"."bookmarks" to "anon";

grant select on table "public"."bookmarks" to "anon";

grant trigger on table "public"."bookmarks" to "anon";

grant truncate on table "public"."bookmarks" to "anon";

grant update on table "public"."bookmarks" to "anon";

grant delete on table "public"."bookmarks" to "authenticated";

grant insert on table "public"."bookmarks" to "authenticated";

grant references on table "public"."bookmarks" to "authenticated";

grant select on table "public"."bookmarks" to "authenticated";

grant trigger on table "public"."bookmarks" to "authenticated";

grant truncate on table "public"."bookmarks" to "authenticated";

grant update on table "public"."bookmarks" to "authenticated";

grant delete on table "public"."bookmarks" to "service_role";

grant insert on table "public"."bookmarks" to "service_role";

grant references on table "public"."bookmarks" to "service_role";

grant select on table "public"."bookmarks" to "service_role";

grant trigger on table "public"."bookmarks" to "service_role";

grant truncate on table "public"."bookmarks" to "service_role";

grant update on table "public"."bookmarks" to "service_role";

grant delete on table "public"."clientfile" to "anon";

grant insert on table "public"."clientfile" to "anon";

grant references on table "public"."clientfile" to "anon";

grant select on table "public"."clientfile" to "anon";

grant trigger on table "public"."clientfile" to "anon";

grant truncate on table "public"."clientfile" to "anon";

grant update on table "public"."clientfile" to "anon";

grant delete on table "public"."clientfile" to "authenticated";

grant insert on table "public"."clientfile" to "authenticated";

grant references on table "public"."clientfile" to "authenticated";

grant select on table "public"."clientfile" to "authenticated";

grant trigger on table "public"."clientfile" to "authenticated";

grant truncate on table "public"."clientfile" to "authenticated";

grant update on table "public"."clientfile" to "authenticated";

grant delete on table "public"."clientfile" to "service_role";

grant insert on table "public"."clientfile" to "service_role";

grant references on table "public"."clientfile" to "service_role";

grant select on table "public"."clientfile" to "service_role";

grant trigger on table "public"."clientfile" to "service_role";

grant truncate on table "public"."clientfile" to "service_role";

grant update on table "public"."clientfile" to "service_role";

grant delete on table "public"."experiences" to "anon";

grant insert on table "public"."experiences" to "anon";

grant references on table "public"."experiences" to "anon";

grant select on table "public"."experiences" to "anon";

grant trigger on table "public"."experiences" to "anon";

grant truncate on table "public"."experiences" to "anon";

grant update on table "public"."experiences" to "anon";

grant delete on table "public"."experiences" to "authenticated";

grant insert on table "public"."experiences" to "authenticated";

grant references on table "public"."experiences" to "authenticated";

grant select on table "public"."experiences" to "authenticated";

grant trigger on table "public"."experiences" to "authenticated";

grant truncate on table "public"."experiences" to "authenticated";

grant update on table "public"."experiences" to "authenticated";

grant delete on table "public"."experiences" to "service_role";

grant insert on table "public"."experiences" to "service_role";

grant references on table "public"."experiences" to "service_role";

grant select on table "public"."experiences" to "service_role";

grant trigger on table "public"."experiences" to "service_role";

grant truncate on table "public"."experiences" to "service_role";

grant update on table "public"."experiences" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."video_links" to "anon";

grant insert on table "public"."video_links" to "anon";

grant references on table "public"."video_links" to "anon";

grant select on table "public"."video_links" to "anon";

grant trigger on table "public"."video_links" to "anon";

grant truncate on table "public"."video_links" to "anon";

grant update on table "public"."video_links" to "anon";

grant delete on table "public"."video_links" to "authenticated";

grant insert on table "public"."video_links" to "authenticated";

grant references on table "public"."video_links" to "authenticated";

grant select on table "public"."video_links" to "authenticated";

grant trigger on table "public"."video_links" to "authenticated";

grant truncate on table "public"."video_links" to "authenticated";

grant update on table "public"."video_links" to "authenticated";

grant delete on table "public"."video_links" to "service_role";

grant insert on table "public"."video_links" to "service_role";

grant references on table "public"."video_links" to "service_role";

grant select on table "public"."video_links" to "service_role";

grant trigger on table "public"."video_links" to "service_role";

grant truncate on table "public"."video_links" to "service_role";

grant update on table "public"."video_links" to "service_role";

grant delete on table "public"."videos" to "anon";

grant insert on table "public"."videos" to "anon";

grant references on table "public"."videos" to "anon";

grant select on table "public"."videos" to "anon";

grant trigger on table "public"."videos" to "anon";

grant truncate on table "public"."videos" to "anon";

grant update on table "public"."videos" to "anon";

grant delete on table "public"."videos" to "authenticated";

grant insert on table "public"."videos" to "authenticated";

grant references on table "public"."videos" to "authenticated";

grant select on table "public"."videos" to "authenticated";

grant trigger on table "public"."videos" to "authenticated";

grant truncate on table "public"."videos" to "authenticated";

grant update on table "public"."videos" to "authenticated";

grant delete on table "public"."videos" to "service_role";

grant insert on table "public"."videos" to "service_role";

grant references on table "public"."videos" to "service_role";

grant select on table "public"."videos" to "service_role";

grant trigger on table "public"."videos" to "service_role";

grant truncate on table "public"."videos" to "service_role";

grant update on table "public"."videos" to "service_role";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile();


  create policy "Admin can view all videos"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'videos'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))));



  create policy "Anyone can view avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Anyone can view logos"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'logos'::text));



  create policy "Users can delete logo"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'logos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can delete own videos"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'videos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update avatar"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update logo"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'logos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload avatar"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload logo"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'logos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload videos"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'videos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can view own videos"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'videos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



