export interface Project {
  name: string;
  description: string;
  language: string;
  href: string;
  note: string;
}

export const projects: Project[] = [
  {
    name: 'beulah_intrusion',
    description: 'A C++ developed malware obfuscator.',
    language: 'C++',
    href: 'https://github.com/ITEKONGIT/beulah_intrusion',
    note: 'Windows internals and controlled evasion research.',
  },
  {
    name: 'lyr',
    description: 'Multimodal sensory fusion and cyber-physical perception engine.',
    language: 'Python',
    href: 'https://github.com/ITEKONGIT/lyr',
    note: 'Perception, signals, and the engineering underneath them.',
  },
  {
    name: 'bleeding-eye',
    description: 'Bleeding Eye: Automated Vulnerability Detection Framework.',
    language: 'Python',
    href: 'https://github.com/ITEKONGIT/bleeding-eye',
    note: 'Finding weakness through repeatable analysis instead of guesswork.',
  },
  {
    name: 'shellvault',
    description: 'A TypeScript project for managing server access.',
    language: 'TypeScript',
    href: 'https://github.com/ITEKONGIT/shellvault',
    note: 'A practical answer to the reality of credentials and environments.',
  },
  {
    name: 'jericho',
    description: 'A personalized toolkit.',
    language: 'Python',
    href: 'https://github.com/ITEKONGIT/jericho',
    note: 'The personal workbench: utilities, experiments, and repeated habits.',
  },
];
