"use client";

import { useState, useEffect, useCallback } from "react";
import TemplateShell from "./TemplateShell";
import type { TemplateProps } from "./types";

type CategoryId = "Animals" | "Food" | "Nature" | "Objects" | "Emotions" | "Random";

interface WordEntry {
  word: string;
  fact: string;
}

const WORD_DATA: Record<Exclude<CategoryId, "Random">, WordEntry[]> = {
  Animals: [
    { word: "Axolotl", fact: "Can regenerate entire limbs, heart, and parts of its brain." },
    { word: "Narwhal", fact: "Its spiral tusk is actually a giant tooth that can reach 3 metres." },
    { word: "Quokka", fact: "Often called the world's happiest animal due to its smile-like expression." },
    { word: "Pangolin", fact: "The most trafficked mammal in the world, covered in keratin scales." },
    { word: "Tardigrade", fact: "Can survive in outer space and boiling water. Nearly indestructible." },
    { word: "Capybara", fact: "The world's largest rodent. Incredibly chill around other animals." },
    { word: "Platypus", fact: "One of the few venomous mammals and one of even fewer that lay eggs." },
    { word: "Mantis Shrimp", fact: "Has 16 types of colour receptors — humans have just 3." },
    { word: "Blobfish", fact: "Only looks blob-like out of water due to depressurisation." },
    { word: "Fossa", fact: "Madagascar's top predator and a distant relative of the mongoose." },
    { word: "Aye-aye", fact: "Has a long thin middle finger to tap trees and extract insects." },
    { word: "Shoebill", fact: "A prehistoric-looking bird that can stand motionless for hours." },
    { word: "Maned Wolf", fact: "Neither a wolf nor a fox — it's in its own genus entirely." },
    { word: "Okapi", fact: "Related to giraffes despite looking like a zebra-horse hybrid." },
    { word: "Saiga", fact: "Has an enormous bulbous nose that filters dusty steppe air." },
    { word: "Wombat", fact: "Produces cube-shaped droppings — the only animal known to do so." },
    { word: "Firefly", fact: "Their cold light is the most efficient light production in nature." },
    { word: "Mimic Octopus", fact: "Can impersonate over 15 different species to avoid predators." },
    { word: "Honey Badger", fact: "Famous for being fearless — will confront animals far larger than itself." },
    { word: "Sun Bear", fact: "The smallest bear species, native to Southeast Asia's rainforests." },
    { word: "Kinkajou", fact: "Uses its long tongue to extract nectar, helping pollinate flowers." },
    { word: "Tapir", fact: "A living fossil — its body plan has barely changed in millions of years." },
    { word: "Liger", fact: "The offspring of a lion and tigress — the largest known cat." },
    { word: "Vampire Bat", fact: "The only mammals that feed entirely on blood." },
    { word: "Star-nosed Mole", fact: "Has the most sensitive touch organ of any known animal." },
    { word: "Binturong", fact: "Also called a bearcat. Smells strongly of buttered popcorn." },
    { word: "Leafy Sea Dragon", fact: "Uses camouflage so convincing it's nearly invisible among seaweed." },
    { word: "Thorny Devil", fact: "Channels morning dew from its skin all the way to its mouth." },
    { word: "Blue-footed Booby", fact: "Males attract mates by showing off their bright blue feet." },
    { word: "Dugong", fact: "The real inspiration for mermaid legends — swims upright to breathe." },
  ],
  Food: [
    { word: "Durian", fact: "Known as the king of fruits — beloved in Asia, banned in some hotels." },
    { word: "Saffron", fact: "More expensive by weight than gold — each strand is a hand-picked crocus stigma." },
    { word: "Tempeh", fact: "Fermented soybeans from Indonesia — one of the oldest soy products." },
    { word: "Kimchi", fact: "Korea's national dish — has been made for over 2,000 years." },
    { word: "Truffle", fact: "Pigs and dogs can smell them underground from meters away." },
    { word: "Miso", fact: "Traditional Japanese paste made from fermented soy, rice, or barley." },
    { word: "Halloumi", fact: "Has a high melting point so it can be grilled without losing shape." },
    { word: "Tamarind", fact: "Used in everything from curries to Worcestershire sauce." },
    { word: "Edamame", fact: "Young soybeans harvested before they harden — high in complete protein." },
    { word: "Guanciale", fact: "Italian cured pork cheek — the authentic base of carbonara." },
    { word: "Pomelo", fact: "The largest citrus fruit — ancestor of the grapefruit." },
    { word: "Jackfruit", fact: "Can weigh up to 35 kg and is used as a meat substitute when unripe." },
    { word: "Rambutan", fact: "Its hairy red exterior hides a sweet translucent flesh inside." },
    { word: "Sumac", fact: "Tangy red spice used in Middle Eastern cooking instead of lemon." },
    { word: "Ceviche", fact: "Seafood 'cooked' purely by the acid in citrus juice — no heat required." },
    { word: "Burrata", fact: "Fresh Italian cheese with a creamy, soft filling inside a mozzarella shell." },
    { word: "Mochi", fact: "Made from glutinous rice pounded into a sticky, chewy dough." },
    { word: "Pandan", fact: "Fragrant green leaf used across Southeast Asia as the vanilla of the region." },
    { word: "Labneh", fact: "Strained yogurt cheese popular across the Middle East." },
    { word: "Injera", fact: "Ethiopian sourdough flatbread used as both plate and utensil." },
    { word: "Salsa Verde", fact: "Exists in both Italian and Mexican versions with completely different ingredients." },
    { word: "Berbere", fact: "Ethiopian spice blend of up to 20 ingredients including fenugreek and korarima." },
    { word: "Teff", fact: "Tiny grain native to Ethiopia — the basis of injera and very nutritious." },
    { word: "Lotus Root", fact: "Has a beautiful flower-like cross-section and a crunchy texture." },
    { word: "Kohlrabi", fact: "Looks like a spacecraft, tastes like a mild turnip-apple hybrid." },
    { word: "Wasabi", fact: "Most wasabi outside Japan is actually horseradish dyed green." },
    { word: "Natto", fact: "Fermented sticky soybeans — an acquired taste even in Japan." },
    { word: "Cassava", fact: "Must be prepared correctly to remove naturally occurring cyanide." },
    { word: "Feijoa", fact: "Tastes like a mix of pineapple, guava, and mint." },
    { word: "Ackee", fact: "Jamaica's national fruit — deadly if eaten unripe." },
  ],
  Nature: [
    { word: "Fjord", fact: "Formed by glaciers carving deep valleys that later filled with seawater." },
    { word: "Bioluminescence", fact: "Living organisms producing their own light through chemical reactions." },
    { word: "Permafrost", fact: "Ground that stays frozen for at least two consecutive years." },
    { word: "Sinkhole", fact: "Forms when underground rock dissolves and the ground above collapses." },
    { word: "Estuary", fact: "Where a river meets the sea — among the most productive ecosystems on Earth." },
    { word: "Alluvial Fan", fact: "A fan-shaped deposit formed where a fast stream meets flat ground." },
    { word: "Aurora", fact: "Caused by charged solar particles colliding with atmospheric gases." },
    { word: "Moraine", fact: "Debris accumulated and deposited by a glacier." },
    { word: "Fen", fact: "A type of waterlogged peat-forming wetland fed by groundwater." },
    { word: "Caldera", fact: "A large volcanic crater formed by a collapsed magma chamber." },
    { word: "Kelp Forest", fact: "Underwater forests that can grow 30 cm per day in ideal conditions." },
    { word: "Lichen", fact: "A symbiosis of fungi and algae — some individuals are thousands of years old." },
    { word: "Arroyo", fact: "A dry desert gully that briefly floods during heavy rain." },
    { word: "Atoll", fact: "A ring-shaped coral reef island surrounding a central lagoon." },
    { word: "Geode", fact: "A hollow rock lined with crystals formed from mineral-rich water." },
    { word: "Loess", fact: "Fine windblown dust that forms some of the world's most fertile soils." },
    { word: "Thermocline", fact: "A thin ocean layer where temperature drops sharply with depth." },
    { word: "Tundra", fact: "A treeless biome where the subsoil is permanently frozen." },
    { word: "Vortex", fact: "A rotating flow of fluid or air creating a spiral pattern." },
    { word: "Mangrove", fact: "Coastal trees that filter salt water and protect shorelines from erosion." },
    { word: "Stalactite", fact: "Calcium deposits hanging down from cave ceilings over millennia." },
    { word: "Glacier", fact: "A slow river of ice that reshapes entire mountain ranges over centuries." },
    { word: "Quicksand", fact: "Saturated loose sand that behaves like a liquid under pressure." },
    { word: "Sargasso Sea", fact: "The only sea without land borders — defined entirely by ocean currents." },
    { word: "Pyroclastic Flow", fact: "A fast-moving avalanche of hot gas and volcanic matter." },
    { word: "Taiga", fact: "The world's largest biome — vast boreal forests stretching across northern latitudes." },
    { word: "Mirga", fact: "A mirage caused by light bending through layers of different temperatures." },
    { word: "Solstice", fact: "The day the sun reaches its highest or lowest point in the sky." },
    { word: "Supercell", fact: "A long-lived thunderstorm with a rotating updraft that spawns tornadoes." },
    { word: "Tepui", fact: "Flat-topped table mountains in South America, home to unique species." },
  ],
  Objects: [
    { word: "Sextant", fact: "A navigational instrument used to measure the angle between celestial objects." },
    { word: "Gyroscope", fact: "Maintains orientation regardless of external forces — used in spacecraft." },
    { word: "Astrolabe", fact: "An ancient instrument for astronomical measurements and telling time." },
    { word: "Theodolite", fact: "A precision instrument for measuring horizontal and vertical angles." },
    { word: "Anvil", fact: "Forged from a single piece of steel — essentially unchanged for centuries." },
    { word: "Bellows", fact: "A device for pumping air to fuel fires — essential to blacksmiths for millennia." },
    { word: "Calipers", fact: "Measure internal and external dimensions with great precision." },
    { word: "Dowsing Rod", fact: "Used to claim detection of water underground — no scientific evidence supports this." },
    { word: "Orrery", fact: "A mechanical model of the solar system showing planetary orbits." },
    { word: "Vellum", fact: "Writing material made from calf skin — more durable than paper." },
    { word: "Sundial", fact: "The oldest known time-telling device — predates clocks by millennia." },
    { word: "Lathe", fact: "Shapes materials by rotating them against a cutting tool." },
    { word: "Trebuchet", fact: "A counterweight siege weapon capable of launching 150 kg projectiles." },
    { word: "Sextant", fact: "Allowed sailors to determine their exact position at sea for the first time." },
    { word: "Lens", fact: "A curved piece of glass that refracts light — foundation of all optics." },
    { word: "Ratchet", fact: "Allows motion in one direction only — key to many mechanical devices." },
    { word: "Prism", fact: "Splits white light into its spectrum of component colours." },
    { word: "Crucible", fact: "A container able to withstand extreme heat for melting metals." },
    { word: "Flint", fact: "A microcrystalline quartz used to make the first human tools." },
    { word: "Abacus", fact: "Still the fastest calculating tool for an expert user in some cases." },
    { word: "Mallet", fact: "A hammer with a large head, usually made of wood or rubber." },
    { word: "Mortar", fact: "A bowl used to grind and blend substances using a pestle." },
    { word: "Plumb Line", fact: "The simplest way to establish a true vertical — gravity does the work." },
    { word: "Belljar", fact: "A glass jar used to create a vacuum or display objects under glass." },
    { word: "Winch", fact: "A device that winds rope or cable to lift or pull heavy loads." },
    { word: "Ferrule", fact: "A metal ring or cap fitted over a cane or pencil to prevent splitting." },
    { word: "Trowel", fact: "Used since ancient Egypt for masonry and laying mortar." },
    { word: "Parabolic Mirror", fact: "Focuses parallel rays to a single point — used in telescopes and solar cookers." },
    { word: "Niblick", fact: "An old golf club with a small, rounded head for iron shots." },
    { word: "Bodkin", fact: "A blunt thick needle used for threading ribbon through fabric." },
  ],
  Emotions: [
    { word: "Sonder", fact: "The realisation that each passerby has a life as vivid and complex as your own." },
    { word: "Hiraeth", fact: "Welsh longing for a home you can't return to, or one that never was." },
    { word: "Hygge", fact: "Danish concept of cosiness, comfort, and convivial togetherness." },
    { word: "Mono no Aware", fact: "Japanese term for the bittersweet awareness of impermanence." },
    { word: "Toska", fact: "Russian for a longing with nothing to long for — a deep spiritual anguish." },
    { word: "Schadenfreude", fact: "German for pleasure derived from another's misfortune." },
    { word: "Wabi-sabi", fact: "Japanese appreciation of imperfect, incomplete, and impermanent beauty." },
    { word: "Ennui", fact: "French for listlessness and dissatisfaction from a lack of excitement." },
    { word: "Mamihlapinatapai", fact: "A look shared by two people who both wish the other would initiate." },
    { word: "Fernweh", fact: "German for a longing to travel to distant places — the opposite of homesickness." },
    { word: "Meraki", fact: "Greek: doing something with soul, creativity, and love." },
    { word: "Forelsket", fact: "Norwegian: the euphoria felt when falling in love for the first time." },
    { word: "Cafuné", fact: "Brazilian Portuguese: tenderly running your fingers through someone's hair." },
    { word: "Frisson", fact: "A sudden, passing sensation of excitement, usually chills from music or art." },
    { word: "Waldeinsamkeit", fact: "German: the peaceful, eerie solitude felt alone in the woods." },
    { word: "Litost", fact: "Czech: a state of torment created by the sudden sight of one's own misery." },
    { word: "Sehnsucht", fact: "German: an intense longing for something indefinite and unattainable." },
    { word: "Lacrimosa", fact: "Latin: full of tears; the feeling a piece of music is heartbreakingly sad." },
    { word: "Novitiate", fact: "The state of being a beginner — carrying both excitement and uncertainty." },
    { word: "Mudita", fact: "Sanskrit: finding joy in the joy and success of others." },
    { word: "Ikigai", fact: "Japanese: the reason you get out of bed in the morning." },
    { word: "Duende", fact: "Spanish: the mysterious power of art to deeply move a person." },
    { word: "Natsukashii", fact: "Japanese: nostalgic longing for the past, with both joy and sadness." },
    { word: "Commuovere", fact: "Italian: to be moved to tears by a story, artwork, or gesture of kindness." },
    { word: "Goya", fact: "Urdu: the transporting suspension of disbelief that happens in great storytelling." },
    { word: "Voorpret", fact: "Dutch: anticipatory pleasure felt before an event." },
    { word: "Filotimo", fact: "Greek: a deep sense of honor, love, and duty to one's community." },
    { word: "Pronoia", fact: "The opposite of paranoia: a sense that the world conspires in your favour." },
    { word: "Awumbuk", fact: "Baining: the feeling of emptiness after visitors leave." },
    { word: "Pochemuchka", fact: "Russian: a person who asks too many questions — not negative, just curious." },
  ],
};

export default function RandomWord({ config, spellId }: TemplateProps) {
  const color = config.primaryColor || "#6366f1";
  const savedKey = `incant-${spellId}-savedwords`;

  const [category, setCategory] = useState<CategoryId>("Animals");
  const [current, setCurrent] = useState<WordEntry | null>(null);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const CATEGORY_ICONS: Record<CategoryId, string> = {
    Animals: "🐾",
    Food: "🍕",
    Nature: "🌿",
    Objects: "🔧",
    Emotions: "😊",
    Random: "🎲",
  };

  useEffect(() => {
    const stored = localStorage.getItem(savedKey);
    if (stored) {
      try {
        setSaved(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [savedKey]);

  const saveToStorage = (words: string[]) => {
    setSaved(words);
    localStorage.setItem(savedKey, JSON.stringify(words));
  };

  const pickWord = useCallback(() => {
    let pool: WordEntry[];
    if (category === "Random") {
      const all = Object.values(WORD_DATA).flat();
      pool = all;
    } else {
      pool = WORD_DATA[category];
    }
    const entry = pool[Math.floor(Math.random() * pool.length)];
    setVisible(false);
    setTimeout(() => {
      setCurrent(entry);
      setVisible(true);
    }, 150);
  }, [category]);

  const keepWord = () => {
    if (!current) return;
    if (!saved.includes(current.word)) {
      saveToStorage([...saved, current.word]);
    }
  };

  const removeWord = (word: string) => {
    saveToStorage(saved.filter((w) => w !== word));
  };

  const copyWord = () => {
    if (!current) return;
    navigator.clipboard.writeText(current.word).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TemplateShell config={config} icon="🎲">
      <div className="p-4 space-y-4">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_ICONS) as CategoryId[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: category === cat ? color : "#f3f4f6",
                color: category === cat ? "#fff" : "#6b7280",
              }}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Word display */}
        <div
          className="min-h-40 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center transition-all"
          style={{ backgroundColor: `${color}10` }}
        >
          {current ? (
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
              className="space-y-2"
            >
              <p className="text-4xl font-bold" style={{ color }}>
                {current.word}
              </p>
              <p className="text-sm text-gray-500 max-w-xs">{current.fact}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={copyWord}
                  className="text-xs px-3 py-1 rounded-full border transition-colors"
                  style={{ borderColor: color, color }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={keepWord}
                  disabled={saved.includes(current.word)}
                  className="text-xs px-3 py-1 rounded-full text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: color }}
                >
                  {saved.includes(current.word) ? "Saved ✓" : "Keep"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Pick a word to get started</p>
          )}
        </div>

        {/* Pick button */}
        <button
          onClick={pickWord}
          className="w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-md transition-transform active:scale-[0.98]"
          style={{ backgroundColor: color }}
        >
          {CATEGORY_ICONS[category]} Pick a Word
        </button>

        {/* Saved words */}
        {saved.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Saved words ({saved.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {saved.map((word) => (
                <div
                  key={word}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <span className="font-medium">{word}</span>
                  <button
                    onClick={() => removeWord(word)}
                    className="text-xs text-gray-400 hover:text-red-400 leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TemplateShell>
  );
}
