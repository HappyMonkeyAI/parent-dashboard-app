-- Parent Portal: Storage bucket and policies for file attachments

-- Create the attachments bucket
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false);

-- Family members can upload to attachments
create policy "Authenticated users can upload attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
  );

-- Family members can view attachments they have access to
create policy "Authenticated users can view attachments"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
  );

-- Uploaders can delete their own files
create policy "Users can delete their own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and owner = auth.uid()
  );
