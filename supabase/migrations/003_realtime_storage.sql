alter publication supabase_realtime add table public.messages;
insert into storage.buckets (id, name, public) values ('travel-media','travel-media',true) on conflict (id) do nothing;
create policy "public travel media readable" on storage.objects for select using (bucket_id='travel-media');
create policy "users upload own travel media" on storage.objects for insert to authenticated with check (bucket_id='travel-media' and (storage.foldername(name))[1]=auth.uid()::text);
