-- Session 2 seed data for curriculum browsing and debate setup
insert into public.families (name, slug, description, sort_order)
values
  (
    'Existence of God',
    'existence-of-god',
    'Classical and contemporary arguments for and against the existence of God.',
    1
  ),
  (
    'Reliability of Scripture',
    'reliability-of-scripture',
    'Textual reliability, manuscript evidence, and canon formation questions.',
    2
  ),
  (
    'Resurrection of Jesus',
    'resurrection-of-jesus',
    'Historical case for and objections to the resurrection.',
    3
  ),
  (
    'Problem of Evil',
    'problem-of-evil',
    'Logical and evidential problem of evil and Christian responses.',
    4
  ),
  (
    'Morality and Meaning',
    'morality-and-meaning',
    'Grounding objective morality and life purpose in worldview debates.',
    5
  ),
  (
    'Religious Pluralism',
    'religious-pluralism',
    'How to engage claims that all religions are equally true.',
    6
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.learning_tracks (name, slug, description, sort_order)
values
  (
    'Foundations',
    'foundations',
    'Start with core worldview and Scripture reliability debates.',
    1
  ),
  (
    'Core Objections',
    'core-objections',
    'Practice common objections from skeptics and secular critics.',
    2
  ),
  (
    'Advanced Engagement',
    'advanced-engagement',
    'High-pressure and nuanced discussions for experienced learners.',
    3
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;
