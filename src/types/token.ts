export interface Token {
  address: string;
  name: string;
  symbol: string;
  creator: string;
  description: string;
  avatarUrl: string;
  price: number;
  progress: number;
  reserve: string;
  isGraduated: boolean;
  createdAt: number;
}

// Mock Data
const MEME_NAMES = [
  "Pepe", "Doge", "Shib", "Floki", "Wojak", "Chad", "Giga", "Based", 
  "Bonk", "Wif", "Samo", "Myro", "Moon", "Safe", "Rocket", "Mars", 
  "Lambo", "Ape", "Bear", "Bull", "Whale", "Frog", "Cat", "Rat",
  "Satoshi", "Nakamoto", "Vitalik", "CZ", "Elon", "Saylor",
  "Peanut", "Sponge", "Brett", "Bome", "Popcat", "Mog", "Toshi",
  "Wen", "Tremp", "Boden", "Turbo", "Roost", "Smog", "Slerf",
  "Duko", "Pundu", "Peng", "Sloth", "Grok", "Degen"
];

const MOCK_DESCRIPTIONS = [
  "The most memeable memecoin in existence.",
  "To the moon and beyond! No utility, just vibes.",
  "Community-driven token with massive potential.",
  "Based on the popular internet meme. Join the army.",
  "We are all gonna make it. Hold strong.",
  "The killer of all other meme tokens.",
  "Built for the culture, by the culture.",
  "100% fair launch, no presale, zero taxes.",
  "Literally just a picture of an animal, but on the blockchain.",
  "Don't fade this one. Next 100x gem."
];

export const MOCK_TOKENS: Token[] = Array.from({ length: 50 }).map((_, i) => {
  const name = MEME_NAMES[i];
  const symbol = name.toUpperCase();
  const desc = MOCK_DESCRIPTIONS[i % MOCK_DESCRIPTIONS.length];
  
  const addressHex = Math.random().toString(16).slice(2, 10);
  const addressHexEnd = Math.random().toString(16).slice(2, 6);
  
  const creatorHex = Math.random().toString(16).slice(2, 6);
  const creatorHexEnd = Math.random().toString(16).slice(2, 6);

  const isGraduated = Math.random() > 0.85;
  const progress = isGraduated ? 100 : Math.floor(Math.random() * 95) + 1;
  const reserveAmount = Math.floor(progress * 50) + Math.floor(Math.random() * 100);

  return {
    address: `0x${addressHex}...${addressHexEnd}`,
    name: name,
    symbol: symbol,
    creator: `0x${creatorHex}...${creatorHexEnd}`,
    description: desc,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    price: Number((Math.random() * 0.0001).toFixed(8)),
    progress: progress,
    reserve: `${reserveAmount.toLocaleString()} OKB`,
    isGraduated: isGraduated,
    createdAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7),
  };
});
