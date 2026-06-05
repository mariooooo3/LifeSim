import type { SimAction, MoodState } from "./types";


const ROLE_ACTION: Partial<Record<string, Partial<Record<SimAction, string[]>>>> = {
  Architect: {
    work:      ["Reviewing blueprints", "Drafting site plans", "On a client call", "Running structural calculations"],
    socialize: ["Networking at a design event", "Coffee with a colleague", "Discussing a project over lunch"],
    relax:     ["Sketching in a notebook", "Browsing architecture blogs", "Taking a long walk"],
    eat:       ["Grabbing a quick lunch", "Eating at the studio desk"],
    sleep:     ["Catching up on rest", "Sleeping through a rare quiet night"],
  },
  Bartender: {
    work:      ["Mixing drinks behind the bar", "Closing the bar late", "Setting up for the evening shift"],
    socialize: ["Catching up with regulars", "Out with coworkers after shift"],
    relax:     ["Watching football at home", "Napping before the evening shift"],
    eat:       ["Eating before the shift", "Quick takeaway after closing"],
    sleep:     ["Sleeping in after a late night", "Resting between shifts"],
  },
  Researcher: {
    work:      ["Deep in reading at the library", "Running an analysis", "Writing a paper", "Reviewing citations"],
    socialize: ["Discussing findings with a peer", "At a quiet café with a colleague"],
    relax:     ["Reading fiction for once", "A slow morning walk", "Listening to a podcast"],
    eat:       ["Eating at the desk", "A quick café lunch"],
    sleep:     ["Sleeping early for a change", "Recovering from an intense week"],
  },
  Florist: {
    work:      ["Arranging a wedding order", "Opening the shop", "Replenishing stock", "Processing deliveries"],
    socialize: ["Chatting with a customer who stayed", "Coffee with a neighbour"],
    relax:     ["Gardening at home", "Rearranging the flat"],
    eat:       ["Eating among the flowers", "Lunch break at the park"],
    sleep:     ["Early to bed, early to rise", "Resting after the market run"],
  },
  Teacher: {
    work:      ["Grading papers at home", "Preparing tomorrow's lesson", "Meeting with a parent", "In the classroom"],
    socialize: ["At a school event", "Dinner with a friend"],
    relax:     ["Reading on the sofa", "An evening walk in the park"],
    eat:       ["Lunch in the staffroom", "Dinner with family"],
    sleep:     ["Sleeping after a long marking session", "Resting before an early start"],
  },
  Founder: {
    work:      ["On a call with investors", "Reviewing metrics", "Writing a pitch deck", "In a long strategy session"],
    socialize: ["A quick networking event", "Dinner with a co-founder", "Coffee with a mentor"],
    relax:     ["Briefly disconnecting", "A rare evening off"],
    eat:       ["Eating between meetings", "Working lunch with the team"],
    sleep:     ["Sleeping late after a long day", "Trying to wind down"],
  },
  Musician: {
    work:      ["Rehearsing in the basement", "Recording a demo", "Busking in the square", "Writing lyrics"],
    socialize: ["Jamming with other musicians", "At a gig scouting venues", "Out after a show"],
    relax:     ["Listening to records", "Wandering the city for inspiration"],
    eat:       ["Eating cheap and fast", "Street food between sets"],
    sleep:     ["Sleeping late", "Crashing after a late session"],
  },
  Nurse: {
    work:      ["On shift at the ward", "Covering an extra shift", "Monitoring patients overnight", "In handover"],
    socialize: ["Unwinding with colleagues", "Texting friends between breaks"],
    relax:     ["Watching something mindless", "A slow bath after a brutal shift"],
    eat:       ["Eating quickly in the break room", "A proper meal at home for once"],
    sleep:     ["Sleeping off a night shift", "Finally getting some rest"],
  },
  Engineer: {
    work:      ["Debugging a critical system", "In a code review", "Writing documentation", "On a technical call"],
    socialize: ["At a team lunch", "After-work drinks with colleagues"],
    relax:     ["Playing a game at home", "Taking a long shower after a focused day"],
    eat:       ["Eating at the desk", "Lunch away from the screen"],
    sleep:     ["Sleeping in to recharge", "Getting to bed at a reasonable hour"],
  },
  Designer: {
    work:      ["Refining mockups", "In a design critique", "Working on a client brief", "Iterating on concepts"],
    socialize: ["At a creative meetup", "Coffee with a friend from studio"],
    relax:     ["Browsing inspiration boards", "A long walk for new ideas"],
    eat:       ["Eating somewhere aesthetically pleasing", "Quick lunch between reviews"],
    sleep:     ["Sleeping after a long render", "Resting before a presentation"],
  },
  Developer: {
    work:      ["Pushing a fix at midnight", "Deep in a pull request", "Debugging production", "Writing a feature no one asked for yet"],
    socialize: ["Talking shop at a meetup", "Co-working with a friend", "Explaining the bug over coffee"],
    relax:     ["Gaming at home", "Reading documentation voluntarily", "Building a side project for fun"],
    eat:       ["Eating at the desk", "Ordering in for the third time this week"],
    sleep:     ["Finally closing the laptop", "Sleeping after one more commit"],
  },
  Doctor: {
    work:      ["On rounds", "Reviewing charts", "In consultation", "Finishing notes after a long shift"],
    socialize: ["Dinner with a colleague", "Briefly at a gathering, checking the time"],
    relax:     ["Watching something mindless", "A quiet walk after the hospital"],
    eat:       ["A rushed meal between patients", "Eating properly for once"],
    sleep:     ["Sleeping before an early shift", "Recovering from a hard week"],
  },
  Lawyer: {
    work:      ["Reviewing contracts", "Preparing for court", "On a call with a client", "Writing a brief at 11pm"],
    socialize: ["Networking at a firm event", "Dinner with opposing counsel"],
    relax:     ["Reading anything but case law", "A rare evening without work"],
    eat:       ["Lunch billed to the client", "Eating quickly between filings"],
    sleep:     ["Sleeping later than planned", "Resting before a hearing"],
  },
  Journalist: {
    work:      ["Chasing a source", "Writing against a deadline", "Editing the final draft", "At a press briefing"],
    socialize: ["After-work drinks with the team", "Coffee with a contact"],
    relax:     ["Reading old articles", "Doomscrolling ironically"],
    eat:       ["Eating at the desk", "Grabbing something before the next story"],
    sleep:     ["Sleeping after filing", "Catching up on rest between assignments"],
  },
  Writer: {
    work:      ["Staring at a blank page", "Revising the third draft", "Finding the right word", "Finally writing something good"],
    socialize: ["At a reading event", "Coffee with another writer"],
    relax:     ["Reading in a bookshop", "A long walk with nowhere to be"],
    eat:       ["Eating while rereading yesterday's pages", "Cooking as a distraction from writing"],
    sleep:     ["Sleeping after the chapter is done", "Resting between drafts"],
  },
  Photographer: {
    work:      ["Shooting on location", "Editing in Lightroom", "On a client shoot", "Looking for the right light"],
    socialize: ["At a gallery opening", "Showing work to a friend"],
    relax:     ["Wandering the city with a camera", "Looking at other people's photography"],
    eat:       ["Eating near the shoot location", "A late lunch between edits"],
    sleep:     ["Sleeping after the shoot wraps", "Resting before a dawn shoot"],
  },
  Artist: {
    work:      ["In the studio for hours", "Stretching a new canvas", "Working on a commission", "Starting something with no plan"],
    socialize: ["At an opening", "In the studio with a collaborator", "Talking about ideas over wine"],
    relax:     ["Wandering the city for texture", "Sketching in a café"],
    eat:       ["Eating whatever's nearby", "A long lunch that becomes research"],
    sleep:     ["Sleeping in after a late session", "Resting before the gallery deadline"],
  },
  DJ: {
    work:      ["Setting up for the night", "In the booth at 2am", "Mixing in the bedroom studio", "Sending a demo to a club"],
    socialize: ["At the after-party", "Connecting with the crowd between tracks"],
    relax:     ["Listening to new releases all afternoon", "Sleeping in — it's the job"],
    eat:       ["Eating before the set", "Late-night food after close"],
    sleep:     ["Sleeping at 5am", "Finally crashing after the weekend"],
  },
  Chef: {
    work:      ["On the line during service", "Prepping mise en place", "Developing a new dish", "Closing the kitchen"],
    socialize: ["Drinking with the back-of-house crew", "Eating at a rival's restaurant"],
    relax:     ["Cooking something simple at home", "Watching food documentaries"],
    eat:       ["Eating staff meal before service", "A proper meal on the day off"],
    sleep:     ["Sleeping in after a late close", "Resting before the lunch rush"],
  },
  Barista: {
    work:      ["Opening the café at 6am", "On the machine during the rush", "Dialing in the espresso", "Cleaning before close"],
    socialize: ["Chatting with the regulars", "After-shift coffee with a coworker"],
    relax:     ["Exploring a new café on the day off", "Reading in the corner after close"],
    eat:       ["A croissant between customers", "A proper meal after the morning rush"],
    sleep:     ["Sleeping early for the 5am alarm", "Resting after standing all day"],
  },
  Athlete: {
    work:      ["In training at 6am", "Working with the coach", "Running the same drill again", "Reviewing game footage"],
    socialize: ["Post-training with the team", "A quiet dinner before a match"],
    relax:     ["Recovering with ice and silence", "An easy day between competitions"],
    eat:       ["Eating exactly what the plan says", "A cheat meal after a win"],
    sleep:     ["Sleeping 9 hours like it's a workout", "Recovering after a hard session"],
  },
  Actor: {
    work:      ["Rehearsing lines alone", "On set all day", "In an audition waiting room", "Running the scene again"],
    socialize: ["At an industry gathering", "Drinks with the cast after wrap"],
    relax:     ["Watching old films", "A quiet day between productions"],
    eat:       ["Catering on set", "A meal out when work is slow"],
    sleep:     ["Sleeping off a night shoot", "Resting before the big scene"],
  },
  Influencer: {
    work:      ["Filming content for tomorrow's post", "Editing a reel at midnight", "Replying to brand DMs", "At a gifting event"],
    socialize: ["Collabing with another creator", "Out somewhere worth photographing"],
    relax:     ["Actually offline for once", "Scrolling other people's content"],
    eat:       ["Eating somewhere aesthetic", "Grabbing something while content-planning"],
    sleep:     ["Sleeping after the post goes live", "Resting after a content sprint"],
  },
  Entrepreneur: {
    work:      ["Pitching a new idea", "Running the numbers again", "In a meeting that could have been an email", "Working on the weekend"],
    socialize: ["At a startup event", "Coffee with a potential partner"],
    relax:     ["Taking a rare afternoon off", "Thinking in the bath"],
    eat:       ["Eating while checking metrics", "Lunch with someone who might be useful"],
    sleep:     ["Sleeping less than planned", "Crashing after a long day"],
  },
  Trader: {
    work:      ["Watching the market open", "Executing a position", "Reading economic news at 5am", "In a tense call with a broker"],
    socialize: ["Drinks with colleagues from the floor", "Dinner with someone who knows something"],
    relax:     ["Trying to disconnect from the screens", "A workout to burn off the stress"],
    eat:       ["Eating quickly between trades", "A good meal when the market closes green"],
    sleep:     ["Sleeping with one eye on Asia", "Resting during a quiet session"],
  },
  Student: {
    work:      ["In the library until it closes", "Procrastinating productively", "Writing the essay that's due tomorrow", "Sitting through another lecture"],
    socialize: ["At a flat party", "Coffee with a classmate before the exam"],
    relax:     ["Watching lectures at 1.5x speed", "A whole day doing nothing"],
    eat:       ["Something cheap and fast", "Cooking for the first time this week"],
    sleep:     ["Sleeping through the morning", "Napping at the library"],
  },
};

const FALLBACK_ACTION: Record<SimAction, string[]> = {
  work:      ["Focused on work", "At work", "Pushing through the day"],
  socialize: ["Spending time with others", "Catching up with someone", "Out with friends"],
  relax:     ["Taking it easy", "Unwinding", "Slowing down"],
  eat:       ["Having a meal", "Grabbing food", "Taking a lunch break"],
  sleep:     ["Resting", "Sleeping", "Recovering"],
};

function pickFrom(arr: string[], seed: number): string {
  return arr[Math.abs(seed) % arr.length];
}

export function describeNpcAction(
  role: string,
  action: SimAction,
  nameSeed: number,
): string {
  const roleMap = ROLE_ACTION[role];
  const options = roleMap?.[action] ?? FALLBACK_ACTION[action];
  return pickFrom(options, nameSeed);
}


export function buildFeedLine(
  name: string,
  role: string,
  action: SimAction,
  seed: number,
): string {
  const desc = describeNpcAction(role, action, seed);
  return `${name} — ${desc.toLowerCase()}`;
}


export function narrateRightNow(npc: {
  name: string;
  role: string;
  currentAction: SimAction;
  stress: number;
  mood: MoodState;
  needs: { energy: number; social: number };
  money: number;
}, day = 1): string {
  const seed = npc.name.charCodeAt(0) ^ (day * 37);
  const base = describeNpcAction(npc.role, npc.currentAction, seed);

  let colour = "";
  if (npc.stress > 80)               colour = "The strain is visible.";
  else if (npc.stress > 60)          colour = "Running on fumes.";
  else if (npc.needs.energy < 25)    colour = "Energy is nearly gone.";
  else if (npc.needs.social < 20)    colour = "Feels quite alone.";
  else if (npc.mood === "content")   colour = "Seems settled for now.";
  else if (npc.mood === "hopeful")   colour = "Something good feels possible.";
  else if (npc.money < 0)            colour = "Money is a growing worry.";
  else                               colour = "Things feel manageable.";

  return `${base}. ${colour}`;
}


export function currentActionLabel(
  role: string,
  action: SimAction,
  nameSeed: number,
): string {
  return describeNpcAction(role, action, nameSeed);
}


export function computeLastMajorEvent(npc: {
  stress: number;
  mood: MoodState;
  money: number;
  currentAction: SimAction;
  role: string;
  needs: { energy: number; social: number };
  missedOpportunities: number;
  lastMajorEvent: string;
}, nameSeed: number): string {
  if (npc.stress > 85)               return "Barely holding it together";
  if (npc.money < 0)                 return "Can't make the numbers work";
  if (npc.needs.energy < 15)         return "Running on empty";
  if (npc.needs.social < 15)         return "Retreating from everyone";
  if (npc.mood === "content")        return "Things are clicking";
  if (npc.mood === "hopeful")        return "Something shifted this week";
  if (npc.missedOpportunities > 3)   return "Letting too many things slip";
  if (npc.currentAction === "work")  return "Losing track of time";
  if (npc.currentAction === "sleep") return "Breathing for once";
  return npc.lastMajorEvent;
}


export function computeWorldMood(pressure: number): string {
  if (pressure > 0.75) return "The city is stretched thin";
  if (pressure > 0.58) return "Tension runs just below the surface";
  if (pressure > 0.40) return "A typical day — nothing breaks, nothing gives";
  if (pressure > 0.22) return "The city has found its rhythm";
  return "A rare quiet has settled in";
}
