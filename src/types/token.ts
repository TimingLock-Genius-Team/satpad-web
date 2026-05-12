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
export const MOCK_TOKENS: Token[] = [
  {
    address: "0x1234...5678",
    name: "Pepe Coin",
    symbol: "PEPE",
    creator: "0xabcd...ef12",
    description: "The most memeable memecoin in existence. The dogs have had their day, it's time for Pepe to take reign.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pepe",
    price: 0.000012,
    progress: 85,
    reserve: "1,250 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    address: "0x8765...4321",
    name: "Doge Killer",
    symbol: "LEASH",
    creator: "0x9999...8888",
    description: "The killer of all doges.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leash",
    price: 0.0045,
    progress: 100,
    reserve: "5,000 OKB",
    isGraduated: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    address: "0x2222...3333",
    name: "Chad Token",
    symbol: "CHAD",
    creator: "0x1111...2222",
    description: "Only for true chads.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chad",
    price: 0.000005,
    progress: 12,
    reserve: "450 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
  },
  {
    address: "0x4444...5555",
    name: "Wojak",
    symbol: "WOJAK",
    creator: "0x3333...4444",
    description: "I know that feel bro.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wojak",
    price: 0.000008,
    progress: 45,
    reserve: "800 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
  },
  {
    address: "0x6666...7777",
    name: "Based",
    symbol: "BASED",
    creator: "0x5555...6666",
    description: "Based on what?",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Based",
    price: 0.000021,
    progress: 95,
    reserve: "2,100 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
  },
  {
    address: "0xaaaa...bbbb",
    name: "Giga",
    symbol: "GIGA",
    creator: "0xcccc...dddd",
    description: "Giga chad token.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Giga",
    price: 0.000001,
    progress: 2,
    reserve: "10 OKB",
    isGraduated: false,
    createdAt: Date.now() - 1000 * 60 * 5, // 5 mins ago
  }
];
