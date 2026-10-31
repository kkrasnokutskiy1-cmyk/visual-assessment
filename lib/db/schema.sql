CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id text NOT NULL,
  assessment_version integer NOT NULL,
  assessment_snapshot jsonb NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  share_token text UNIQUE
);
CREATE INDEX IF NOT EXISTS attempts_user_id_idx ON attempts(user_id);
CREATE TABLE IF NOT EXISTS login_limits (
  email text PRIMARY KEY,
  window_started timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 1
);
