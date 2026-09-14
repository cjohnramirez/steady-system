-- Demo content for the landing page, the portal and /admin/landing.
--
-- Dates are relative to the moment the seed runs, so there are always past, ongoing
-- and upcoming announcements no matter when the database was reset. Images are
-- filled in by 25_images.sql, which scripts/seed/upload-images.mjs generates after
-- uploading the placeholder photos to Cloudinary. Without it, tiles fall back to
-- /placeholder.png.

-- ---------------------------------------------------------------------------
-- Announcements: 40, from two months ago to two months ahead
-- ---------------------------------------------------------------------------

insert into public.announcement (title, description, location, start_date, end_date)
select
  t.title,
  t.description,
  (array['Student Center Auditorium','Room 204, CITC Building','University Gymnasium',
         'Guidance Office, Student Services Building','Open Grounds','Library Function Hall',
         'Online via Google Meet','CEA Lecture Hall'])[1 + (t.n % 8)],
  date_trunc('hour', now()) + make_interval(days => (t.n * 3) - 60, hours => 9),
  date_trunc('hour', now()) + make_interval(days => (t.n * 3) - 60 + (t.n % 4), hours => 12 + (t.n % 5))
from (
  select (row_number() over ())::int as n, title, description
  from (values
    ('Mental Health Awareness Week', 'Talks, workshops and drop-in sessions open to every student.'),
    ('Peer Counseling Orientation', 'An introduction for students who want to become peer counselors.'),
    ('Stress Management Workshop', 'Practical breathing and planning techniques for exam season.'),
    ('Career Guidance Fair', 'Meet partner companies and learn what they look for in graduates.'),
    ('Freshmen Welcome Circle', 'A relaxed first meeting for new students to find their people.'),
    ('Wellness Wednesday: Yoga', 'A gentle, beginner-friendly session. Mats are provided.'),
    ('Study Skills Bootcamp', 'Note-taking, spaced repetition and time blocking in one afternoon.'),
    ('Grief Support Group', 'A confidential space facilitated by a licensed counselor.'),
    ('Suicide Prevention Seminar', 'Learn the warning signs and how to connect someone with help.'),
    ('Mindfulness Morning', 'Twenty minutes of guided mindfulness before classes begin.'),
    ('Parent Orientation', 'How families can support students through their first year.'),
    ('Scholarship Application Clinic', 'One-on-one help with essays and requirements.'),
    ('Healthy Relationships Talk', 'Boundaries, communication and recognising unhealthy patterns.'),
    ('Board Exam Readiness Session', 'Coping strategies for licensure exam candidates.'),
    ('Art Therapy Afternoon', 'Express what words cannot. No art experience needed.'),
    ('Digital Detox Challenge', 'A week-long challenge to rebuild healthier screen habits.'),
    ('LGBTQ+ Support Circle', 'A safe and affirming peer space, facilitated by guidance staff.'),
    ('Financial Wellness Workshop', 'Budgeting basics for students living away from home.'),
    ('Sleep Hygiene Clinic', 'Why rest matters and how to protect it during finals.'),
    ('Resume Writing Workshop', 'Build a first resume with feedback from career advisers.'),
    ('Mock Job Interviews', 'Practice with counselors and alumni volunteers.'),
    ('Anti-Bullying Campaign Launch', 'Pledge signing and a talk on bystander intervention.'),
    ('World Mental Health Day', 'Campus-wide activities and free counseling booths.'),
    ('Exam Week Therapy Dogs', 'Take a break with our furry volunteers.'),
    ('Self-Care Fair', 'Booths on nutrition, movement, rest and emotional health.'),
    ('Leadership Mentoring Kickoff', 'Pairing student leaders with faculty mentors.'),
    ('Coping With Homesickness', 'Stories and strategies from upperclassmen.'),
    ('Earthquake Preparedness and Anxiety', 'Staying calm and ready after recent tremors.'),
    ('Academic Probation Support Session', 'A plan to get back on track, without judgment.'),
    ('Wellness Week Post-Midterms', 'Games, music and rest after a long midterm season.'),
    ('Journaling for Clarity', 'A guided introduction to reflective journaling.'),
    ('Graduating Students Exit Talk', 'Preparing for life after university.'),
    ('Cultural Night for Well-being', 'Music and dance celebrating student communities.'),
    ('Time Management Masterclass', 'Plan a semester that leaves room for rest.'),
    ('Online Safety and Mental Health', 'Navigating social media without losing yourself.'),
    ('Volunteer Counselor Training', 'Training for students joining the peer support program.'),
    ('Motivation Reset Workshop', 'For anyone who has lost momentum this semester.'),
    ('Public Speaking Confidence', 'Manage presentation anxiety with small, practical steps.'),
    ('Holiday Break Wellness Tips', 'Staying well while away from campus routines.'),
    ('Semester Opening Assembly', 'Meet the guidance team and learn about our services.')
  ) as v(title, description)
) as t;

-- ---------------------------------------------------------------------------
-- Articles: 40, five per mood
-- ---------------------------------------------------------------------------

insert into public.article (
  title, content, link, author_name, publisher_name, emotional_status_id, added_at
)
select
  a.title,
  a.summary,
  'https://example.test/articles/' || a.n,
  (array['Dr. L. Fernandez','Dr. R. Villanueva','M. Reyes','Prof. A. Santos',
         'Dr. C. Mercado','J. Ocampo, RPsy','Dr. P. Lim','K. Aquino, RGC'])[1 + (a.n % 8)],
  (array['University Press','Campus Health','Mindful Campus','Steady Journal'])[1 + (a.n % 4)],
  ('11111111-1111-1111-1111-' || lpad((1 + ((a.n - 1) / 5) % 8)::text, 12, '0'))::uuid,
  now() - make_interval(days => a.n * 4)
from (
  select (row_number() over ())::int as n, title, summary
  from (values
    ('Savoring the Good Days', 'How to notice and hold onto moments that feel good.'),
    ('Gratitude as a Daily Habit', 'A five-minute routine that shifts your attention.'),
    ('Sharing Joy With Others', 'Why celebrating together deepens connection.'),
    ('Building on Your Strengths', 'Use what is going well to handle what is not.'),
    ('Happiness Is Not Constant, and That Is Fine', 'Letting emotions come and go.'),
    ('It Is Okay Not to Be Okay', 'Naming sadness is the first step to moving through it.'),
    ('When Sadness Lingers', 'Signs it may be time to talk to a counselor.'),
    ('Small Steps on Heavy Days', 'Tiny actions that make a hard day more bearable.'),
    ('Crying Is Not Weakness', 'What tears do for the body and the mind.'),
    ('Reaching Out When You Feel Low', 'Scripts for starting a hard conversation.'),
    ('Understanding Anxiety', 'What happens in the body when worry takes over.'),
    ('Grounding Techniques That Work', 'The 5-4-3-2-1 method and other quick resets.'),
    ('Test Anxiety and How to Face It', 'Preparing your mind as well as your notes.'),
    ('Social Anxiety on Campus', 'Finding your footing in crowded spaces.'),
    ('Worry Time: A Surprising Strategy', 'Schedule your worries so they do not run your day.'),
    ('Managing Exam Season Stress', 'Practical techniques for when deadlines stack up.'),
    ('The Stress-Performance Curve', 'Why a little pressure helps and a lot hurts.'),
    ('Saying No Without Guilt', 'Protecting your time is part of doing well.'),
    ('Stress and the Body', 'Headaches, sleep and appetite as early warnings.'),
    ('A Weekly Reset Routine', 'Sunday planning that makes Monday lighter.'),
    ('Sleep and Student Performance', 'Why rest is the first thing to protect.'),
    ('Burnout Is Not a Badge', 'Recognising exhaustion before it becomes burnout.'),
    ('Power Naps, Done Right', 'How long, when, and when not to nap.'),
    ('Energy Management Over Time Management', 'Plan tasks around how you feel.'),
    ('Rest Without Guilt', 'Why doing nothing is sometimes the task.'),
    ('Anger Is Information', 'What frustration can tell you about your needs.'),
    ('Cooling Down in the Moment', 'Quick techniques before you react.'),
    ('Resolving Conflict With Roommates', 'A calm framework for difficult talks.'),
    ('When Anger Hides Hurt', 'Looking beneath the surface of strong reactions.'),
    ('Channeling Frustration Into Action', 'Turning irritation into useful change.'),
    ('When You Feel Alone on Campus', 'Finding connection in a large university.'),
    ('Loneliness Is More Common Than You Think', 'You are not the only one feeling this.'),
    ('Joining Organizations as an Introvert', 'Low-pressure ways to find your people.'),
    ('Staying Connected to Home', 'Keeping family close while living away.'),
    ('Being Alone vs Feeling Lonely', 'Learning to enjoy your own company.'),
    ('Setting Goals That Stick', 'Why specific, small goals beat big resolutions.'),
    ('Keeping Momentum After a Win', 'Turning a good week into a good semester.'),
    ('Motivation Follows Action', 'Start before you feel ready.'),
    ('Mentors Who Make a Difference', 'How to find and approach a mentor.'),
    ('Planning Your Career Early', 'Small moves in first year that pay off later.')
  ) as v(title, summary)
) as a;

-- ---------------------------------------------------------------------------
-- Playlists: 32, four per mood
-- ---------------------------------------------------------------------------

insert into public.playlist (title, link, creator, emotional_status_id)
select
  p.title,
  'https://open.spotify.com/playlist/demo' || lpad(p.n::text, 3, '0'),
  (array['Guidance Office','Peer Counselors','Student Council','Campus Radio'])[1 + (p.n % 4)],
  ('11111111-1111-1111-1111-' || lpad((1 + ((p.n - 1) / 4) % 8)::text, 12, '0'))::uuid
from (
  select (row_number() over ())::int as n, title
  from (values
    ('Sunny Side Up'), ('Good Vibes Only'), ('Dance It Out'), ('Feel-Good Classics'),
    ('Rainy Window'), ('Gentle Comfort'), ('Soft Piano'), ('Healing Acoustic'),
    ('Deep Breaths'), ('Calm Waters'), ('Slow Down'), ('Quiet Mind'),
    ('Calm Focus'), ('Study Flow'), ('Lo-fi Pressure Release'), ('Nature Sounds'),
    ('Wind Down'), ('Sleep Stories'), ('Evening Ambient'), ('Recharge'),
    ('Let It Out'), ('Cool Head'), ('Heavy Then Light'), ('Reset Button'),
    ('You Are Not Alone'), ('Company in a Song'), ('Warm Voices'), ('Hometown Radio'),
    ('Lift Off'), ('Morning Momentum'), ('Game Day'), ('Finish Strong')
  ) as v(title)
) as p;
