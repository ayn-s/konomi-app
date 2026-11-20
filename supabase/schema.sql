-- コノミの履歴テーブル。Supabase の SQL Editor に貼り付けて Run します(1回だけ)。
-- だれでも「読む」「追加する」はできるが、「書き換える」「消す」はできない設定です。
-- 記録するのは 日時・天気・気温・選んだ項目・飲み物の見た目 だけ(体温・顔などは記録しない)。

create table if not exists public.drinks (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),   -- 日時はサーバーが付ける
  weather jsonb,                                 -- { "sky": "晴れ", "tempC": 18 } か null
  recipe  jsonb not null,                        -- 選んだ項目・名前・色・配合・見た目
  -- いたずらで大きなデータを入れられないように大きさを制限
  constraint recipe_size  check (pg_column_size(recipe) < 4000),
  constraint weather_size check (weather is null or pg_column_size(weather) < 300)
);

create index if not exists drinks_at_idx on public.drinks (at desc);

-- 行ごとの権限(RLS)をオンにして、読む・追加するだけを許可する
alter table public.drinks enable row level security;

drop policy if exists "drinks: anyone can read" on public.drinks;
create policy "drinks: anyone can read" on public.drinks
  for select to anon, authenticated using (true);

drop policy if exists "drinks: anyone can add" on public.drinks;
create policy "drinks: anyone can add" on public.drinks
  for insert to anon, authenticated
  with check (at between now() - interval '1 minute' and now() + interval '1 minute');

grant select, insert on public.drinks to anon, authenticated;
