// Fantasy mayor names, English, in the style of isekai light novels: a given name plus a family name.
// GIVEN x FAMILY gives every combination; fantasyName(i) walks them in a fixed order.
// 114 given names x 48 family names = 5,472 names. Keep gcd(GIVEN.length + 1, FAMILY.length) = 1,
// or fantasyName stops reaching every combination (a test checks this).

export const GIVEN: readonly string[] = [
  'Kael', 'Lyra', 'Seren', 'Aldric', 'Elowen', 'Rhys', 'Mira', 'Theron', 'Sylvie', 'Corvin', 'Aveline',
  'Ren', 'Cassian', 'Isolde', 'Dorian', 'Liora', 'Fennick', 'Talia', 'Orrin', 'Brielle', 'Caspar', 'Nadine',
  'Ewan', 'Odette', 'Lucan', 'Maren', 'Tobias', 'Wren', 'Soren', 'Amara', 'Jory', 'Celeste', 'Hadrian',
  'Ilse', 'Bastian', 'Rowena', 'Edric', 'Linnea', 'Gideon', 'Briar', 'Matthias', 'Yvaine', 'Percival',
  'Nerys', 'Alaric', 'Juniper', 'Cedric', 'Felix', 'Rosalind', 'Emeric', 'Thea', 'Leopold', 'Vesna', 'Ansel',
  'Marisol', 'Quentin', 'Ottilie', 'Roland', 'Ines', 'Silas', 'Calla', 'Desmond', 'Lorcan', 'Elara',
  'Tamsin', 'Garrick', 'Mirela', 'Viggo', 'Anouk', 'Raphael', 'Eira', 'Lucius', 'Ondine', 'Selene', 'Aurek',
  'Kestrel', 'Nell', 'Ivo', 'Petra', 'Corin', 'Esme', 'Lennox', 'Rosa', 'Ardan', 'Yara', 'Florian', 'Greta',
  'Hollis', 'Ilya', 'Jessamy', 'Kit', 'Magnus', 'Nola', 'Osric', 'Pippa', 'Quill', 'Rafe', 'Saffron',
  'Tavish', 'Una', 'Valen', 'Winona', 'Xavi', 'Yorick', 'Alder', 'Belisa', 'Cyprian', 'Delphine', 'Emrys',
  'Faye', 'Galen', 'Hespera', 'Idris', 'Jael',
];
export const FAMILY: readonly string[] = [
  'Ashborne', 'Starfall', 'Duskvale', 'Thornwick', 'Silverlake', 'Valcourt', 'Everhart', 'Blackwood',
  'Ravenscar', 'Highmoor', 'Stormrider', 'Emberly', 'Frostmere', 'Goldcrest', 'Hollowell', 'Ironwood',
  'Larkspur', 'Moonbrook', 'Nightshade', 'Oakheart', 'Pendrake', 'Quillon', 'Redmane', 'Sablecourt',
  'Thistle', 'Umberlight', 'Wolfsbane', 'Wintermere', 'Yarrowby', 'Zephyrine', 'Albrecht', 'Belmonte',
  'Dravenholt', 'Fairhallow', 'Greymantle', 'Halloway', 'Kingsley', 'Lindgren', 'Marchbank', 'Northvale',
  'Rosewater', 'Swiftbrook', 'Tarrow', 'Vantis', 'Westerly', 'Crowley', 'Aubrecourt', 'Brightwell',
];

/** How many distinct names there are. */
export const FANTASY_NAME_COUNT = GIVEN.length * FAMILY.length;

/** The i-th name. Neighbouring i differ in both parts, so a short run of names looks varied. */
export function fantasyName(i: number): string {
  const n = ((Math.floor(i) % FANTASY_NAME_COUNT) + FANTASY_NAME_COUNT) % FANTASY_NAME_COUNT;
  const g = n % GIVEN.length;
  const f = (n + Math.floor(n / GIVEN.length)) % FAMILY.length;
  return `${GIVEN[g]} ${FAMILY[f]}`;
}

/** A name from a random number in [0, 1), e.g. Math.random(). */
export const randomFantasyName = (r: number) => fantasyName(Math.floor(r * FANTASY_NAME_COUNT));
