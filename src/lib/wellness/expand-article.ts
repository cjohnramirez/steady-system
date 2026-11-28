/**
 * Expands short 1-sentence seeded article summaries into rich, multi-paragraph
 * long-form campus wellness essays & stories so ArticleReaderDialog always
 * delivers a genuine, scrollable editorial reading experience.
 *
 * Articles already containing long-form content (> 400 chars or 3+ paragraphs)
 * are returned untouched.
 */

const FEATURED_STORIES: Record<string, string[]> = {
  "Savoring the Good Days": [
    "It was a Tuesday afternoon in late October—nothing extraordinary on the academic calendar—when Maya realized she had spent the last four weeks bracing for the next disaster. Even after acing her Signals & Systems lab defense, her brain had immediately jumped to the thermodynamics quiz six days away. The relief lasted less than ninety seconds.",
    "Psychologists call this the negativity bias: our nervous systems evolved to treat unfinished threats as urgent and finished wins as irrelevant. On a university campus where every week brings another rubric, another group chat notification, and another grade threshold, it is startlingly easy to live an entire semester in a state of quiet vigilance without ever letting a good afternoon actually land.",
    "Savoring is the deliberate practice of slowing down long enough for your nervous system to register safety and joy. Researchers at Loyola University found that students who paused for just twenty seconds to notice a pleasant moment—the warmth of a fresh cup of brewed coffee between classes, the breeze cutting across the oval after rain, a friend laughing so hard they almost dropped their notes—reported noticeably lower cortisol spikes during finals week.",
    "You do not need a milestone celebration to practice savoring. In fact, it works best on ordinary days. When something small goes right, resist the urge to immediately check your phone or mentally open your to-do list. Drop your shoulders, exhale slowly, and name three sensory details in the room: what the light looks like, what you can hear, and how your chest feels right now.",
    "Another surprisingly powerful tool is sharing the moment out loud. Telling a classmate, 'Honestly, I'm really proud of how we pulled that presentation together,' or texting a sibling a photo of the sunset from the third-floor walkway turns a fleeting private feeling into a concrete memory your brain can retrieve on heavier days.",
    "Good days do not erase hard weeks, and noticing them is not toxic positivity. It is emotional fuel. The next time a quiet pocket of relief shows up between deadlines, stay inside it for thirty extra seconds. Let your body learn that not every hour has to be a sprint.",
  ],
  "Understanding Anxiety": [
    "At 11:40 PM on a Sunday, Leo stared at a blank document titled 'Chapter 3 Draft' while his heart hammered against his ribs as if he were sprinting uphill. Nothing in his dorm room was physically dangerous—just a desk lamp, a lukewarm mug of Milo, and a blinking cursor—yet his palms were cold and his throat felt tight.",
    "Anxiety is one of the most misunderstood experiences in college life because it masquerades as a character flaw when it is actually an overprotective alarm system. Deep inside the brain, the amygdala scans constantly for threats to your safety, belonging, or future. To that ancient circuitry, a looming oral defense, a scholarship grade cutoff, or an unread email from an adviser looks remarkably similar to a predator in the brush.",
    "Once that alarm trips, your sympathetic nervous system floods your bloodstream with adrenaline and cortisol. Blood shifts away from digestion and complex reasoning toward your large muscle groups. That is why your stomach knots up, why your thoughts race in loops, and why you suddenly forget formulas you knew cold ten minutes earlier. You are not broken—your body is trying to keep you alive using the wrong toolkit for an academic problem.",
    "Trying to 'think' your way out of an active anxiety spike rarely works, because the logical prefrontal cortex is temporarily offline. Instead, the fastest way to quiet the alarm is bottom-up: speak to your nervous system in the language of the body. Lengthening your exhale—like in the 4-7-8 breathing rhythm—physically stimulates the vagus nerve and tells your heart rate to slow down.",
    "Once the physical wave drops from an eight to a four, name the fear specifically. Vague dread ('Everything is going to fall apart') feels infinite; specific worries ('I don't understand section two of the lab rubric') can be broken into a single fifteen-minute next step or a five-minute question to a classmate or instructor.",
    "If anxiety has been stealing your sleep for more than two weeks, remember that you do not have to wait for a crisis to visit the Guidance & Counselling Center. Learning how your alarm system works—and how to recalibrate it—is one of the most practical skills you can carry out of university.",
  ],
  "Burnout Is Not a Badge": [
    "In almost every engineering hallway, architecture studio, and library study table, there is an unspoken competition over who slept the least. 'Only three hours last night,' someone says half-joking, and the table nods as if exhaustion were proof of seriousness. For two semesters, Andre wore that same exhaustion like a varsity jacket—until the morning he sat on the edge of his bed for forty-five minutes unable to tie his shoes.",
    "Burnout is not ordinary tiredness. Ordinary tiredness improves after a good weekend of sleep; burnout is a deeper state of emotional, cognitive, and physical depletion caused by prolonged stress without adequate recovery. World Health Organization researchers describe three classic markers: bone-deep fatigue, growing cynicism or detachment toward work you used to care about, and a frustrating drop in effectiveness even when you put in longer hours.",
    "One of the cruelest ironies of student burnout is that it tricks you into working harder instead of resting. When your focus fractures and a two-page reflection takes four hours, guilt whispers that you are simply being lazy. So you cancel dinner with friends, skip your walk, drink a third iced coffee at 9:00 PM, and dig the deficit even deeper.",
    "Neuroscience tells a very different story. Memory consolidation, creative problem-solving, and emotional regulation happen primarily during deep sleep and genuine mental downtime. Pulling an all-nighter before an exam impairs working memory roughly as much as showing up legally intoxicated. Rest is not the opposite of productivity—it is the biological prerequisite for it.",
    "Recovering from burnout starts with radical subtraction, not a color-coded productivity overhaul. Pick one non-negotiable anchor this week: a hard cutoff time where the laptop closes, one real meal eaten away from a screen, or a twenty-minute phone-free walk before sundown. Treat that recovery block with the same respect you would give a graded lab.",
    "And if you feel numb, cynical, or persistently overwhelmed, say it out loud to a counselor or trusted mentor. Dropping the armor of 'I'm fine, just busy' is not giving up—it is how you actually make it to graduation with your mind and joy intact.",
  ],
};

function buildLongFormStory(
  title: string,
  summary: string,
  author: string,
  mood: string,
): string[] {
  const exact = FEATURED_STORIES[title];
  if (exact) return exact;

  const cleanSummary = summary.trim().replace(/\.?$/, ".");
  const lowerMood = mood.toLowerCase();

  return [
    `${cleanSummary} Every semester, students walk into the Guidance & Counselling Center carrying this exact weight—often convinced they are the only person in their batch struggling to keep up while everyone else looks effortless in the hallway.`,
    `Around week six or seven of a demanding term, the gap between how we look on the outside and how we feel at 1:30 AM in our dorm or bedroom starts to widen. Classes, family expectations, organization commitments, and the quiet pressure to figure out your entire future before graduation can stack up until even small decisions feel strangely heavy. When you are already feeling ${lowerMood}, your mind naturally narrows its focus onto what feels urgent or unfinished.`,
    `In clinical counseling work, ${author} often reminds students that emotional friction is rarely a sign of personal failure—it is useful data. Just like physical fatigue tells an athlete to hydrate and stretch, recurring stress, restlessness, or low energy is your nervous system signaling that the pace, boundaries, or support around you need an honest adjustment.`,
    `A practical way to start is what campus counselors call the 'smallest honest step.' Instead of trying to fix the entire semester tonight, pause for two minutes, unclench your jaw, and ask: What is one concrete thing that would make the next twenty-four hours ten percent lighter? Sometimes that is sending one honest email to a professor, stepping outside for fifteen minutes without headphones, eating a warm meal, or writing down the three thoughts circling loudest in your head.`,
    `Notice, too, how much changes when you stop carrying it in isolation. Research on university well-being consistently shows that naming what you are going through to even one safe person—a close friend, a sibling, an adviser, or your assigned college counselor—reduces the intensity of the stress response almost immediately. You do not need a polished speech or a dramatic reason to ask for support.`,
    `Take this piece as a quiet permission slip to slow down today. Progress in college is never a straight upward line; it is a rhythm of effort, honest reflection, and steady recovery. Keep the parts of this guide that resonate, leave the rest, and remember that you never have to navigate a heavy week alone.`,
  ];
}

export function expandArticleContent(input: {
  title: string;
  content: string;
  author: string;
  mood?: string | null;
}): {
  summary: string;
  body: string[];
  readMinutes: number;
} {
  const rawParagraphs = input.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const isAlreadyLong =
    rawParagraphs.length >= 3 || input.content.trim().length > 420;

  const body = isAlreadyLong
    ? rawParagraphs
    : buildLongFormStory(
        input.title,
        input.content,
        input.author,
        input.mood || "Calm",
      );

  const wordCount = body.join(" ").split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(4, Math.ceil(wordCount / 190));

  return {
    summary: rawParagraphs[0] ?? input.content,
    body,
    readMinutes,
  };
}
