
import { ScenarioSet, InquestSet, WordSet, VirusSet } from './types';

export const TABOO_CONSTRAINTS = [
  "No verbs allowed",
  "Must mention a color",
  "Must mention a number",
  "No words starting with 'T'",
  "One-word description only",
  "Must mention an animal",
  "No body parts allowed",
  "Must use a metaphor",
  "Speak in high-pitched voice",
  "Must mention a fruit",
  "No adjectives allowed",
  "Must mention a brand name"
];

export const DEFAULT_WORDS_SET: WordSet = {
  id: 'default-words',
  name: 'Everyday Objects',
  pairs: [
    { wordA: 'Apple', wordB: 'Pear' },
    { wordA: 'Laptop', wordB: 'Tablet' },
    { wordA: 'Bicycle', wordB: 'Scooter' },
    { wordA: 'Coffee', wordB: 'Tea' },
    { wordA: 'Cat', wordB: 'Tiger' },
    { wordA: 'Pizza', wordB: 'Burger' },
    { wordA: 'Sun', wordB: 'Moon' },
    { wordA: 'Soccer', wordB: 'Basketball' },
    { wordA: 'Airplane', wordB: 'Helicopter' },
    { wordA: 'Guitar', wordB: 'Violin' }
  ]
};

export const ABSTRACT_CONCEPTS_SET: WordSet = {
  id: 'words-abstract',
  name: 'Abstract Concepts',
  pairs: [
    { wordA: 'Love', wordB: 'Affection' },
    { wordA: 'Betrayal', wordB: 'Treachery' },
    { wordA: 'Freedom', wordB: 'Liberty' },
    { wordA: 'Justice', wordB: 'Equity' },
    { wordA: 'Chaos', wordB: 'Disorder' },
    { wordA: 'Honor', wordB: 'Integrity' },
    { wordA: 'Silence', wordB: 'Stillness' },
    { wordA: 'Power', wordB: 'Influence' },
    { wordA: 'Time', wordB: 'Duration' },
    { wordA: 'Destiny', wordB: 'Fate' }
  ]
};

export const ANIMALS_NATURE_SET: WordSet = {
  id: 'words-animals',
  name: 'Animals & Nature',
  pairs: [
    { wordA: 'Lion', wordB: 'Tiger' },
    { wordA: 'Dolphin', wordB: 'Whale' },
    { wordA: 'Rose', wordB: 'Tulip' },
    { wordA: 'Forest', wordB: 'Jungle' },
    { wordA: 'Eagle', wordB: 'Falcon' },
    { wordA: 'Mountain', wordB: 'Hill' },
    { wordA: 'Shark', wordB: 'Orca' },
    { wordA: 'Spider', wordB: 'Scorpion' },
    { wordA: 'Oak Tree', wordB: 'Pine Tree' },
    { wordA: 'Butterfly', wordB: 'Moth' }
  ]
};

export const FOOD_DRINKS_SET: WordSet = {
  id: 'words-food',
  name: 'Food & Drinks',
  pairs: [
    { wordA: 'Hamburger', wordB: 'Hot Dog' },
    { wordA: 'Sushi', wordB: 'Sashimi' },
    { wordA: 'Coffee', wordB: 'Hot Chocolate' },
    { wordA: 'Pasta', wordB: 'Lasagna' },
    { wordA: 'Milkshake', wordB: 'Smoothie' },
    { wordA: 'Steak', wordB: 'Pork Chop' },
    { wordA: 'Taco', wordB: 'Burrito' },
    { wordA: 'Ice Cream', wordB: 'Frozen Yogurt' },
    { wordA: 'Whiskey', wordB: 'Brandy' },
    { wordA: 'Coca-Cola', wordB: 'Pepsi' }
  ]
};

export const BRANDS_SET: WordSet = {
  id: 'words-brands',
  name: 'Global Brands',
  pairs: [
    { wordA: 'Apple', wordB: 'Samsung' },
    { wordA: 'Nike', wordB: 'Adidas' },
    { wordA: 'McDonald\'s', wordB: 'Burger King' },
    { wordA: 'Google', wordB: 'Microsoft' },
    { wordA: 'Visa', wordB: 'Mastercard' },
    { wordA: 'Netflix', wordB: 'Disney+' },
    { wordA: 'Starbucks', wordB: 'Dunkin\'' },
    { wordA: 'BMW', wordB: 'Mercedes' },
    { wordA: 'Sony', wordB: 'Nintendo' },
    { wordA: 'Ferrari', wordB: 'Lamborghini' }
  ]
};

export const SPORTS_SET: WordSet = {
  id: 'words-sports',
  name: 'Sports & Games',
  pairs: [
    { wordA: 'Football', wordB: 'Rugby' },
    { wordA: 'Tennis', wordB: 'Badminton' },
    { wordA: 'Baseball', wordB: 'Cricket' },
    { wordA: 'Golf', wordB: 'Mini Golf' },
    { wordA: 'Boxing', wordB: 'MMA' },
    { wordA: 'Chess', wordB: 'Checkers' },
    { wordA: 'Skiing', wordB: 'Snowboarding' },
    { wordA: 'Surfing', wordB: 'Windsurfing' },
    { wordA: 'Poker', wordB: 'Blackjack' },
    { wordA: 'Bowling', wordB: 'Darts' }
  ]
};

export const JOBS_CRAFTS_SET: WordSet = {
  id: 'words-jobs',
  name: 'Jobs & Crafts',
  pairs: [
    { wordA: 'Doctor', wordB: 'Nurse' },
    { wordA: 'Carpenter', wordB: 'Blacksmith' },
    { wordA: 'Artist', wordB: 'Designer' },
    { wordA: 'Pilot', wordB: 'Captain' },
    { wordA: 'Chef', wordB: 'Baker' },
    { wordA: 'Lawyer', wordB: 'Judge' },
    { wordA: 'Plumber', wordB: 'Electrician' },
    { wordA: 'Police', wordB: 'Soldier' },
    { wordA: 'Firefighter', wordB: 'Paramedic' },
    { wordA: 'Farmer', wordB: 'Gardener' }
  ]
};

export const EDUCATION_SET: WordSet = {
  id: 'words-education',
  name: 'School & Education',
  pairs: [
    { wordA: 'Math', wordB: 'Physics' },
    { wordA: 'History', wordB: 'Geography' },
    { wordA: 'Pencil', wordB: 'Pen' },
    { wordA: 'Notebook', wordB: 'Binder' },
    { wordA: 'Teacher', wordB: 'Professor' },
    { wordA: 'Backpack', wordB: 'Briefcase' },
    { wordA: 'Exam', wordB: 'Quiz' },
    { wordA: 'Library', wordB: 'Bookstore' },
    { wordA: 'Globe', wordB: 'Map' },
    { wordA: 'Graduation', wordB: 'Orientation' }
  ]
};

export const TECHNOLOGY_SET: WordSet = {
  id: 'words-tech',
  name: 'Technology',
  pairs: [
    { wordA: 'Browser', wordB: 'Application' },
    { wordA: 'Keyboard', wordB: 'Mouse' },
    { wordA: 'Wi-Fi', wordB: 'Bluetooth' },
    { wordA: 'Android', wordB: 'iOS' },
    { wordA: 'Server', wordB: 'Database' },
    { wordA: 'Virtual Reality', wordB: 'Augmented Reality' },
    { wordA: 'Podcast', wordB: 'Audiobook' },
    { wordA: 'Messenger', wordB: 'WhatsApp' },
    { wordA: 'Robot', wordB: 'Cyborg' },
    { wordA: 'Encryption', wordB: 'Password' }
  ]
};

export const POP_CULTURE_SET: WordSet = {
  id: 'words-pop',
  name: 'Pop Culture',
  pairs: [
    { wordA: 'Batman', wordB: 'Superman' },
    { wordA: 'Marvel', wordB: 'DC' },
    { wordA: 'Star Wars', wordB: 'Star Trek' },
    { wordA: 'Harry Potter', wordB: 'Lord of the Rings' },
    { wordA: 'Spider-Man', wordB: 'Iron Man' },
    { wordA: 'Vampire', wordB: 'Werewolf' },
    { wordA: 'Zombie', wordB: 'Ghost' },
    { wordA: 'Mickey Mouse', wordB: 'Bugs Bunny' },
    { wordA: 'Pokémon', wordB: 'Digimon' },
    { wordA: 'Ninja', wordB: 'Samurai' }
  ]
};

export const DEFAULT_WORD_SETS: WordSet[] = [
  DEFAULT_WORDS_SET,
  ABSTRACT_CONCEPTS_SET,
  ANIMALS_NATURE_SET,
  FOOD_DRINKS_SET,
  BRANDS_SET,
  SPORTS_SET,
  JOBS_CRAFTS_SET,
  EDUCATION_SET,
  TECHNOLOGY_SET,
  POP_CULTURE_SET
];

export const DEFAULT_SET: ScenarioSet = {
  id: 'default',
  name: 'Urban Development',
  projects: ['Dog Park', 'Karaoke Bar', 'Cemetery', 'Public Library', 'Shopping Mall', 'Skate Park', 'Community Garden', 'Underground Bunker', 'Casino', 'Spa Center'],
  locations: ['School Gym', 'Police Station', 'Mall Food Court', 'Abandoned Asylum', 'Moon Base', 'Luxury Yacht', 'Retirement Home', 'Fire Station', 'Subway Platform'],
  catches: ['No shoes allowed', 'Only for kids', '100% Silent', 'Costumes mandatory', 'Must whisper', 'Bring your own light', 'Cash only', 'AI robots only', 'Strictly formal wear']
};

export const DEFAULT_INQUEST_SET: InquestSet = {
  id: 'default-inquest',
  name: 'Urban Legends',
  scenarios: [
    {
      id: 'iq-1',
      realProject: 'Nightclub',
      fakeProject: 'Gym',
      location: 'Underground Bunker',
      options: ['Loud thumping bass', 'Clanking metal and grunts', 'Total silence', 'People whispering'],
      questions: ['What is the primary sound?', 'What is the main smell?', 'What is the lighting like?', 'What do people wear?']
    },
    {
      id: 'iq-2',
      realProject: 'Library',
      fakeProject: 'Church',
      location: 'Old Cathedral',
      options: ['Smell of old paper', 'Incense and wax', 'Freshly baked bread', 'Damp earth'],
      questions: ['What do you smell?', 'What is the main activity?', 'Who is the person in charge?', 'What is on the walls?']
    }
  ]
};

export const VIRUS_WORDS_SET: VirusSet = {
  id: 'virus-default',
  name: 'Cyber Core',
  words: [
    'Encryption', 'Firewall', 'Protocol', 'Archive', 'Database', 
    'Malware', 'Trojan', 'Network', 'Gateway', 'Mainframe',
    'Satellite', 'Override', 'Decryption', 'Backdoor', 'Neural',
    'Quantum', 'Bitrate', 'Latency', 'Fiber', 'Voltage',
    'Subnet', 'Bandwidth', 'Kernel', 'Assembly', 'Script',
    'Silicon', 'Motherboard', 'Terminal', 'Console', 'Registry'
  ]
};

export const INVESTMENT_CATEGORIES = ['Safety', 'Comfort', 'Technology', 'Aesthetic'];

export const INITIAL_PLAYER_COUNT = 3;
export const MAX_PLAYERS = 100;
export const MIN_PLAYERS = 3;
