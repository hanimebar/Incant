import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";
import type { CastResult, TemplateId } from "@/types";

export const runtime = "nodejs";

const TEMPLATE_DESCRIPTIONS = `
- habit-tracker: Track daily habits with streaks (e.g. "meditate every day", "read 20 pages")
- water-intake: Log daily water/fluid consumption toward a goal (e.g. "drink 2 liters")
- mood-tracker: Record mood/feelings multiple times per day with notes
- workout-log: Log exercises, sets, reps, weights for gym/fitness sessions
- sleep-tracker: Track sleep start/end times and rate sleep quality
- expense-logger: Log spending by category, track monthly budget
- tip-calculator: Enter bill amount, select tip %, see split per person
- bill-splitter: Enter total bill + people, split evenly or custom
- savings-goal: Set a savings target, log contributions, see progress bar
- todo-list: Add tasks, check them off, organize with priorities
- reading-list: Track books to read, currently reading, finished
- link-saver: Save URLs with titles/tags, organize useful links
- daily-journal: Write daily entries with prompts, private notes
- goal-tracker: Set SMART goals with milestones, track % complete
- quiz-builder: Create Q&A sets, take quizzes, see score
- countdown-timer: Set a future date, show days/hours remaining
- form-survey: Custom form with fields, collect and view responses
- flashcard-deck: Front/back cards for studying, flip to reveal answer
- data-table: Simple table with custom columns, add/view rows
- custom-reminder: Set recurring reminders with custom message and frequency
- simon-says: Classic Simon Says colour sequence memory game — watch the pattern, repeat it
- snake: Snake arcade game — eat food, grow longer, avoid walls and yourself
- minesweeper: Classic Minesweeper — reveal cells, flag mines, clear the grid
- wordle-clone: Wordle-style 5-letter word guessing game — 6 attempts, colour hints
- tic-tac-toe: Classic Tic Tac Toe — play against a friend or the computer
- memory-match: Card matching memory game — flip cards to find matching pairs
- rock-paper-scissors: Rock Paper Scissors against the computer — track your win streak
- number-guess: Number guessing game — guess a secret number with higher/lower hints
- hangman: Classic Hangman word game — guess letters before the stick figure is complete
- coin-flip: Flip a virtual coin — heads or tails, with flip history
- random-number: Generate random numbers within any range you set
- dice-roller: Roll any combination of dice — d4, d6, d8, d10, d12, d20
- magic-8-ball: Ask the Magic 8 Ball a yes/no question and get a mystical answer
- spin-wheel: Customisable spinning wheel — add options and let it decide
- random-name-picker: Enter a list of names, pick one at random — great for giveaways
- decision-maker: Can't decide? Enter your options and let the app choose for you
- would-you-rather: Generate Would You Rather dilemmas to play with friends
- truth-or-dare: Truth or Dare card game — generate questions and dares
- fortune-cookie: Get a random fortune cookie message whenever you need inspiration
- compliment-machine: Get a genuine compliment whenever you need one — press and feel good
- unit-converter: Convert between units — length, weight, temperature, volume and more
- bmi-calculator: Calculate Body Mass Index from height and weight with category display
- age-calculator: Calculate exact age in years, months, days from any birthdate
- loan-calculator: Monthly loan repayment calculator with amortisation breakdown
- compound-interest: Calculate compound interest growth over time with contributions
- percentage-calc: Quick percentage calculations — find %, increases, and original values
- roman-numerals: Convert numbers to Roman numerals and back
- binary-hex: Convert between binary, decimal, hexadecimal, and octal number systems
- colour-contrast: Check WCAG colour contrast ratio between two colours for accessibility
- password-generator: Generate secure random passwords with customisable options
- qr-generator: Generate a QR code from any text or URL, download as PNG
- gradient-maker: Create CSS gradients visually — pick colours, angle, copy the code
- colour-palette: Generate harmonious colour palettes from a seed colour
- pixel-art: Pixelate any uploaded image into retro 8-bit pixel art
- ascii-art: Convert text into ASCII art with different block font styles
- pomodoro-timer: Pomodoro productivity timer — 25-minute work sessions with breaks
- kanban-board: Simple Kanban board — drag tasks through To Do, In Progress, Done
- pros-cons-list: Create a pros and cons list with a verdict to help make decisions
- bucket-list: Track your bucket list — add goals, mark them done as you achieve them
- typing-speed-test: Test your typing speed in WPM with accuracy tracking
- breathing-exercise: Guided breathing exercise with configurable inhale/hold/exhale timing
- meeting-agenda: Build and run timed meeting agendas with presenter notes
- random-word: Generate random words by category for creative prompts and games
- fake-quote: Generate absurd inspirational quotes attributed to made-up names
- excuse-generator: Generate creative excuses by category with believability rating
`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { input } = await req.json();
    if (!input || typeof input !== "string" || input.trim().length < 3) {
      return NextResponse.json({ error: "Input too short" }, { status: 400 });
    }

    // Check tier limits
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("tier, app_count, username")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const LIMITS: Record<string, number> = { free: 2, caster: Infinity, wizard: Infinity };
    if (profile.app_count >= LIMITS[profile.tier]) {
      return NextResponse.json(
        { error: "App limit reached", tier: profile.tier },
        { status: 403 }
      );
    }

    // Parse with Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an app parser for a platform called Incant. A user has described an app they want.

User input: "${input.trim()}"

Available templates:
${TEMPLATE_DESCRIPTIONS}

Return a JSON object (no markdown, just raw JSON) with this exact shape:
{
  "templateId": "<one of the template IDs above>",
  "config": {
    "name": "<short catchy app name based on user input, max 30 chars>",
    "description": "<one sentence describing this specific app>",
    "primaryColor": "<hex color that fits the vibe, e.g. #6366f1>",
    "accentColor": "<hex accent color>",
    "goal": <number if applicable, else omit>,
    "unit": "<unit string if applicable e.g. 'glasses', 'km', '€', else omit>",
    "currency": "<currency symbol if finance app, else omit>",
    "categories": [<array of category strings if expense/data app, else omit>],
    "targetDate": "<ISO date string if countdown, else omit>",
    "customData": {}
  },
  "confidence": <0.0-1.0>
}

Pick the best matching template. Be creative with the name.`,
        },
      ],
    });

    let castResult: CastResult;
    try {
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      castResult = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    if (castResult.confidence < 0.35) {
      return NextResponse.json(
        { error: "We couldn't match that to a supported app type yet. Try describing a tracker, list, calculator, journal, quiz, or countdown." },
        { status: 422 }
      );
    }

    // Generate unique slug
    const baseSlug = slugify(castResult.config.name || "my-app");
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const { data: existing } = await service
        .from("spells")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${nanoid(4)}`;
      if (attempt > 10) {
        slug = `app-${nanoid(8)}`;
        break;
      }
    }

    // Save spell
    const { data: spell, error } = await service
      .from("spells")
      .insert({
        user_id: user.id,
        slug,
        name: castResult.config.name,
        template_id: castResult.templateId as TemplateId,
        config: castResult.config,
        is_public: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Failed to save spell: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      spell,
      username: profile.username,
      url: `/u/${profile.username}/${slug}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cast] unhandled error:", message);
    return NextResponse.json({ error: `Cast failed: ${message}` }, { status: 500 });
  }
}
