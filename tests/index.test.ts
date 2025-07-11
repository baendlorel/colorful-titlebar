import { defaultColorSet, getColor, getColorByK } from '@/colors';

const names = [
  'Ava-Kingsley',
  'Leo-Harrington',
  'Mila-Voss',
  'Jasper-Quinn',
  'Isla-Remington',
  'Elias-Novak',
  'Zoe-Callahan',
  'Finn-Grayson',
  'Freya-Lin',
  'Theo-Beckett',
  'Clara-Monroe',
  'Silas-Alden',
  'Ivy-Carrington',
  'Hugo-Delaney',
  'Elodie-Hart',
  'Axel-Townsend',
  'Norah-Sterling',
  'Orion-McAllister',
  'Aria-Langford',
  'Cedric-Boone',
  'Luna-Prescott',
  'Ezra-Camden',
  'Sienna-Vale',
  'Rowan-Knox',
  'Daphne-Mercer',
  'Kai-Thorne',
  'Lila-Sinclair',
  'Kian-Rhodes',
  'Maeve-Ellison',
  'Luca-Bramwell',
  'Wren-Carlisle',
  'Dorian-Frost',
  'Mira-Rosenthal',
  'Nolan-Whitaker',
  'Esme-Hollis',
  'Tobias-Vane',
  'Elara-Huxley',
  'Felix-Drummond',
  'Amara-Beck',
  'Miles-Harlow',
  'Calla-Fenwick',
  'Levi-Chandler',
  'Nyla-Waverly',
  'Elias-Brent',
  'Selene-Ashford',
  'Remy-Lancaster',
  'Talia-Sterling',
  'Jude-Larkin',
  'Briar-Hawthorne',
  'Caspian-Ford',
  'Anya-Bellamy',
  'Declan-Storm',
  'Cora-Winslow',
  'Soren-Blackwell',
  'Elina-Crowley',
  'Jett-Radcliffe',
  'Thea-Langston',
  'Maddox-Crane',
  'Lyra-St.',
  'James',
  'Rhys-Holloway',
  'Astrid-Keaton',
  'Ronan-Blake',
  'Ophelia-Mendez',
  'Griffin-York',
  'Veda-Whitmore',
  'Zane-Bell',
  'Nia-Rosenthal',
  'Dante-Wilder',
  'Kiara-Faulkner',
  'Atlas-Penrose',
  'Dahlia-Cross',
  'Enzo-Moriarty',
  'Juniper-Lowell',
  'Nico-Sterling',
  'Maren-Talbot',
  'Idris-Caldwell',
  'Leona-Frost',
  'Cassian-Ridge',
  'Sylvie-Hartwell',
  'Odin-West',
  'Seraphina-Poe',
  'Beck-Wilder',
  'Calista-Monroe',
  'Ronin-Vale',
  'Odessa-Finch',
  'River-Maddox',
  'Azalea-Quinn',
  'Jaxon-Creed',
  'Mira-Hollingsworth',
  'Phoenix-Hale',
  'Elio-Travers',
  'Kaia-Drake',
  'Indigo-Vail',
  'Stellan-Archer',
  'Thalia-Wynn',
  'Blaise-Connell',
  'Solene-Darrow',
  'Kairo-Ashen',
  'Noelle-Griffin',
];
const lines1: string[] = [];
const lines2: string[] = [];
for (const name of names) {
  const c1 = getColor(name, defaultColorSet.light).plain();
  lines1.push(`\x1b[48;2;${c1.r};${c1.g};${c1.b}m \x1b[0m`);
  const c2 = getColor(name, defaultColorSet.dark).plain();
  lines2.push(`\x1b[48;2;${c2.r};${c2.g};${c2.b}m \x1b[0m`);
}
console.log(lines1.join(''));
console.log(lines2.join(''));

const lines3: string[] = [];
const lines4: string[] = [];
for (let i = 0; i < 100; i++) {
  const c3 = getColorByK(i / 100, defaultColorSet.light).plain();
  lines3.push(`\x1b[48;2;${c3.r};${c3.g};${c3.b}m \x1b[0m`);
  const c4 = getColorByK(i / 100, defaultColorSet.dark).plain();
  lines4.push(`\x1b[48;2;${c4.r};${c4.g};${c4.b}m \x1b[0m`);
}
console.log(lines3.join(''));
console.log(lines4.join(''));
