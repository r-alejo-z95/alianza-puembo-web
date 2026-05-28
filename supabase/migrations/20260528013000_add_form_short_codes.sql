alter table public.forms
  add column if not exists short_code text;

with normalized_forms as (
  select
    id,
    title
  from public.forms
  where short_code is null
),
tokens as (
  select
    normalized_forms.id,
    token.word,
    token.word_index
  from normalized_forms
  cross join lateral regexp_split_to_table(
    regexp_replace(
      lower(translate(coalesce(normalized_forms.title, ''), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    '-'
  ) with ordinality as token(word, word_index)
  where token.word <> ''
    and token.word not in ('a', 'al', 'de', 'del', 'el', 'en', 'formulario', 'la', 'las', 'los', 'para', 'por', 'un', 'una', 'y', 'con')
),
parts as (
  select
    id,
    string_agg(
      case
        when word ~ '^[0-9]+$' then word
        when char_length(word) <= 3 then word
        else left(word, 3)
      end,
      '-' order by word_index
    ) as raw_base
  from tokens
  group by id
),
bases as (
  select
    normalized_forms.id,
    left(
      case
        when parts.raw_base is null or parts.raw_base = '' then 'form'
        when char_length(parts.raw_base) < 3 then parts.raw_base || '-form'
        else parts.raw_base
      end,
      40
    ) as base
  from normalized_forms
  left join parts on parts.id = normalized_forms.id
),
numbered as (
  select
    id,
    base,
    row_number() over (partition by base order by id) as duplicate_index
  from bases
)
update public.forms as f
set short_code = case
  when numbered.duplicate_index = 1 then numbered.base
  else regexp_replace(
    left(
      numbered.base,
      greatest(1, 40 - char_length(numbered.duplicate_index::text) - 1)
    ),
    '-+$',
    ''
  ) || '-' || numbered.duplicate_index::text
end
from numbered
where f.short_code is null
  and f.id = numbered.id;

alter table public.forms
  drop constraint if exists forms_short_code_format_check;

alter table public.forms
  add constraint forms_short_code_format_check
  check (
    short_code is null
    or (
      char_length(short_code) between 3 and 40
      and short_code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    )
  );

create unique index if not exists forms_short_code_unique_idx
  on public.forms (short_code)
  where short_code is not null;
