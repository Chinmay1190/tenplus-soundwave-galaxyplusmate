
CREATE POLICY "Users upload own return photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'return-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users view own return photos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'return-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own return photos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'return-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
