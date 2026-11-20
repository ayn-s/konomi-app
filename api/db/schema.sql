-- コノミの履歴テーブル(PostgreSQL)。npm run db:init で作ります(何度実行しても大丈夫)。
-- 記録するのは 日時・天気・気温・選んだ4項目・飲み物の見た目 だけ(体温・顔などは記録しない)。
create table if not exists drinks (
  id      integer generated always as identity primary key,
  at      timestamptz not null default now(),   -- 日時はサーバーが付ける
  weather jsonb,                                 -- { "sky": "晴れ", "tempC": 18 } か null
  recipe  jsonb not null,                        -- 選んだ4項目・名前・色・配合
  -- 大きすぎるデータを入れられないように大きさを制限
  constraint recipe_size  check (pg_column_size(recipe) < 4000),
  constraint weather_size check (weather is null or pg_column_size(weather) < 300)
);

create index if not exists drinks_at_idx on drinks (at desc, id desc);
