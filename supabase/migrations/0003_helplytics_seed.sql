-- Skills (initial catalog, ~40)
insert into public.skills (name, category) values
  ('JavaScript','Programming'),('TypeScript','Programming'),('React','Programming'),
  ('Node.js','Programming'),('Python','Programming'),('SQL','Programming'),
  ('HTML/CSS','Programming'),('Git','Programming'),('Docker','DevOps'),
  ('AWS','DevOps'),('Linux','DevOps'),('Figma','Design'),('UI Design','Design'),
  ('UX Research','Design'),('Photoshop','Design'),('Illustration','Design'),
  ('Writing','Content'),('Editing','Content'),('Translation','Content'),
  ('Math','Academic'),('Physics','Academic'),('Chemistry','Academic'),
  ('Biology','Academic'),('Economics','Academic'),('Accounting','Business'),
  ('Marketing','Business'),('SEO','Business'),('Data Analysis','Data'),
  ('Excel','Data'),('Machine Learning','Data'),('Presentation','Soft'),
  ('Public Speaking','Soft'),('Arabic','Language'),('English','Language'),
  ('Urdu','Language'),('Research','Academic'),('Thesis Help','Academic'),
  ('Career Advice','Soft'),('Resume Review','Soft'),('Mock Interview','Soft')
  on conflict (name) do nothing;

-- Interests (~20)
insert into public.interests (name) values
  ('Web Dev'),('Mobile'),('AI/ML'),('Data Science'),('Startups'),('Open Source'),
  ('Design Systems'),('Writing'),('Photography'),('Reading'),('Gaming'),
  ('Fitness'),('Cooking'),('Travel'),('Music'),('Film'),('Finance'),
  ('Productivity'),('Teaching'),('Community')
  on conflict (name) do nothing;

-- Badges
insert into public.badges (slug, name, description, icon, criteria) values
  ('first_help','First Helper','Offered help on your first request','🌱','{"type":"helps","count":1}'),
  ('ten_helps','Helper x10','Helped on 10 requests','🔟','{"type":"helps","count":10}'),
  ('fifty_helps','Community Pillar','Helped on 50 requests','🏛️','{"type":"helps","count":50}'),
  ('first_ask','First Step','Posted your first request','🚀','{"type":"requests","count":1}'),
  ('fast_responder','Fast Responder','Replied within 1h on 5 requests','⚡','{"type":"fast","count":5}'),
  ('trusted','Trusted','Trust score ≥ 100','✅','{"type":"trust","min":100}'),
  ('streak_7','Weekly Streak','Active 7 days in a row','🔥','{"type":"streak","days":7}')
  on conflict (slug) do nothing;
