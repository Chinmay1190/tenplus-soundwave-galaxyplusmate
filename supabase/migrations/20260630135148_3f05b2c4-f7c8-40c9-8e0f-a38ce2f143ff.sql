
CREATE TYPE public.return_status AS ENUM ('requested', 'approved', 'picked_up', 'refunded', 'rejected');

CREATE TABLE public.returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason text NOT NULL,
  description text,
  photos text[] NOT NULL DEFAULT '{}',
  status public.return_status NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.returns TO authenticated;
GRANT ALL ON public.returns TO service_role;

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own returns" ON public.returns
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users create own returns" ON public.returns
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Users edit pending returns" ON public.returns
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'requested')
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_returns_updated_at
  BEFORE UPDATE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
