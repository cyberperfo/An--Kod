ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS author_name TEXT;

ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE public.memories
ALTER COLUMN uploaded_by DROP NOT NULL;

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "memories: public guestbook read"
ON public.memories;

CREATE POLICY "memories: public guestbook read"
ON public.memories
FOR SELECT
USING (
    "type" = 'text_memory'
    AND author_name IS NOT NULL
    AND message IS NOT NULL
    AND content_url IS NULL
);


DROP POLICY IF EXISTS "memories: public guestbook insert"
ON public.memories;

CREATE POLICY "memories: public guestbook insert"
ON public.memories
FOR INSERT
TO anon, authenticated
WITH CHECK (
    "type" = 'text_memory'
    AND author_name IS NOT NULL
    AND length(trim(author_name)) BETWEEN 1 AND 120
    AND message IS NOT NULL
    AND length(trim(message)) BETWEEN 1 AND 2000
    AND content_url IS NULL
    AND uploaded_by IS NULL
);


DROP POLICY IF EXISTS "memories: memorial owner delete guestbook"
ON public.memories;

CREATE POLICY "memories: memorial owner delete guestbook"
ON public.memories
FOR DELETE
TO authenticated
USING (
    author_name IS NOT NULL
    AND message IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM public.memorials
        WHERE public.memorials.id = public.memories.memorial_id
        AND public.memorials.owner_id = auth.uid()
    )
);
