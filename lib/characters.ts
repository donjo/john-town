/**
 * Character Map
 *
 * Maps each dev framework to an animal "townsperson" with an emoji and job title.
 * Inspired by Richard Scarry's Busytown where every character has a role,
 * and Animal Crossing's cast of friendly animal villagers.
 */

interface Character {
  emoji: string;
  label: string;
}

const CHARACTER_MAP: Record<string, Character> = {
  "Vite": { emoji: "🐱", label: "Cat Painter" },
  "Fresh": { emoji: "🐸", label: "Frog Juicer" },
  "Next.js": { emoji: "🦉", label: "Owl Librarian" },
  "React": { emoji: "🦝", label: "Raccoon Builder" },
  "Node.js": { emoji: "🐻", label: "Bear Operator" },
  "Django": { emoji: "🐶", label: "Dog Mail Carrier" },
  "Python": { emoji: "🐍", label: "Snake Scientist" },
  "Rails": { emoji: "🦊", label: "Fox Conductor" },
  "Astro": { emoji: "🐰", label: "Rabbit Astronomer" },
  "Phoenix": { emoji: "🐦", label: "Bird Messenger" },
  "Nuxt": { emoji: "🐿️", label: "Squirrel Organizer" },
  "Remix": { emoji: "🦜", label: "Parrot DJ" },
  "Jupyter": { emoji: "🐭", label: "Mouse Scribe" },
  "Flask": { emoji: "🦔", label: "Hedgehog Alchemist" },
  "Deno": { emoji: "🦕", label: "Dino Builder" },
  "Unknown": { emoji: "🐹", label: "Hamster Helper" },
};

const DEFAULT_CHARACTER: Character = { emoji: "🐹", label: "Hamster Helper" };

export function getCharacter(framework: string): Character {
  return CHARACTER_MAP[framework] ?? DEFAULT_CHARACTER;
}
