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
  mcap: string;
  volume24h: string;
  priceChange24h: number;
  mintedAmount: string;
  totalAmount: string;
}

// Mock Data
export const MOCK_TOKENS: Token[] = [
  {
    address: "0x1d41...cb9a",
    name: "BasedKitty",
    symbol: "BKITTY",
    creator: "0xabcd...ef12",
    description: "The most memeable memecoin in existence.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pepe",
    price: 0.0004762,
    progress: 99.0,
    reserve: "1,250 OKB",
    isGraduated: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
    mcap: "$380.4k",
    volume24h: "$125.0k",
    priceChange24h: 0,
    mintedAmount: "20.79M",
    totalAmount: "21M",
  },
  {
    address: "0xb05d...1be2",
    name: "MathRock",
    symbol: "MROCK",
    creator: "0x9999...8888",
    description: "Rocking the math world.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leash",
    price: 0.00000635,
    progress: 25.0,
    reserve: "5,000 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    mcap: "$1.3k",
    volume24h: "$90.0k",
    priceChange24h: -22.0,
    mintedAmount: "5.25M",
    totalAmount: "21M",
  },
  {
    address: "0xa450...e88e",
    name: "CurveLord",
    symbol: "CURVE",
    creator: "0x1111...2222",
    description: "Only for true chads.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chad",
    price: 0.00000794,
    progress: 40.0,
    reserve: "450 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
    mcap: "$2.6k",
    volume24h: "$85.0k",
    priceChange24h: 13.0,
    mintedAmount: "8.4M",
    totalAmount: "21M",
  },
  {
    address: "0x4823...6315",
    name: "Hyperbolic",
    symbol: "HYPER",
    creator: "0x3333...4444",
    description: "I know that feel bro.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wojak",
    price: 0.0000106,
    progress: 55.0,
    reserve: "800 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    mcap: "$4.7k",
    volume24h: "$80.0k",
    priceChange24h: 48.0,
    mintedAmount: "11.55M",
    totalAmount: "21M",
  },
  {
    address: "0x94c6...591c",
    name: "CurveBro",
    symbol: "CBRO",
    creator: "0x5555...6666",
    description: "Based on what?",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Based",
    price: 0.000028,
    progress: 83.0,
    reserve: "2,100 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 17, // 17 hours ago
    mcap: "$18.8k",
    volume24h: "$78.0k",
    priceChange24h: 0,
    mintedAmount: "17.43M",
    totalAmount: "21M",
  },
  {
    address: "0x1992...3ab5",
    name: "ExponentialOwl",
    symbol: "EXPO",
    creator: "0xcccc...dddd",
    description: "Giga chad token.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Giga",
    price: 0.00000491,
    progress: 3.0,
    reserve: "10 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    mcap: "$119",
    volume24h: "$73.0k",
    priceChange24h: 51.0,
    mintedAmount: "630k",
    totalAmount: "21M",
  }
];
