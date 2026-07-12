export interface MoleculeDetail {
  name: string
  formula: string
  description: string
}

export const MOLECULE_DETAILS: Record<string, MoleculeDetail> = {
  H2O: {
    name: 'Water',
    formula: 'H\u2082O',
    description: 'Essential solvent for all known forms of life. Forms hydrogen bonds that stabilize biomolecules.',
  },
  CH4: {
    name: 'Methane',
    formula: 'CH\u2084',
    description: 'Simple organic molecule likely abundant in the early Earth atmosphere from volcanic outgassing.',
  },
  NH3: {
    name: 'Ammonia',
    formula: 'NH\u2083',
    description: 'Source of nitrogen for early organic synthesis. Reacts with other molecules to form amino acids.',
  },
  H2: {
    name: 'Hydrogen',
    formula: 'H\u2082',
    description: 'The most abundant element in the universe. Key component of the reducing atmosphere on early Earth.',
  },
  CO2: {
    name: 'Carbon Dioxide',
    formula: 'CO\u2082',
    description: 'Carbon source for early organic molecules. Volcanic activity released large amounts into the atmosphere.',
  },
  HCN: {
    name: 'Hydrogen Cyanide',
    formula: 'HCN',
    description: 'Key intermediate in the formation of nucleobases. Can polymerize to form adenine under prebiotic conditions.',
  },
  N2: {
    name: 'Nitrogen',
    formula: 'N\u2082',
    description: 'Major component of the early atmosphere. Fixed by lightning into more reactive forms.',
  },
  H2S: {
    name: 'Hydrogen Sulfide',
    formula: 'H\u2082S',
    description: 'Volcanic gas that may have been an energy source for early chemotrophic life.',
  },
  A: {
    name: 'Adenine',
    formula: 'C\u2085H\u2085N\u2085',
    description: 'A purine nucleobase. Pairs with uracil in RNA via two hydrogen bonds.',
  },
  U: {
    name: 'Uracil',
    formula: 'C\u2084H\u2084N\u2082O\u2082',
    description: 'A pyrimidine nucleobase unique to RNA. Pairs with adenine via two hydrogen bonds.',
  },
  G: {
    name: 'Guanine',
    formula: 'C\u2085H\u2085N\u2085O',
    description: 'A purine nucleobase. Pairs with cytosine in RNA via three hydrogen bonds.',
  },
  C: {
    name: 'Cytosine',
    formula: 'C\u2084H\u2085N\u2083O',
    description: 'A pyrimidine nucleobase. Pairs with guanine in RNA via three hydrogen bonds.',
  },
  Pi: {
    name: 'Phosphate',
    formula: 'PO\u2084\u00B3\u207B',
    description: 'Key component of the RNA backbone. Links ribose sugars via phosphodiester bonds.',
  },
  Ribose: {
    name: 'Ribose',
    formula: 'C\u2085H\u2081\u2080O\u2085',
    description: 'A pentose sugar. Forms the backbone of RNA when linked by phosphodiester bonds.',
  },
  Bond: {
    name: 'Phosphodiester Bond',
    formula: 'PO\u2084\u00B3\u207B',
    description: 'The chemical linkage between nucleotides in RNA. Forms when the phosphate group of one nucleotide bonds to the sugar of another, releasing water.',
  },
  '5prime': {
    name: "5' End",
    formula: '5\u2032',
    description: "The end of an RNA strand with a free phosphate group on the 5' carbon of the ribose sugar. Nucleotides are added in the 5' to 3' direction during synthesis.",
  },
  '3prime': {
    name: "3' End",
    formula: '3\u2032',
    description: "The end of an RNA strand with a free hydroxyl (OH) group on the 3' carbon of the ribose sugar. New nucleotides are always added here during polymerization.",
  },
  Stem: {
    name: 'Stem',
    formula: 'Double Helix',
    description: 'The paired region of folded RNA formed by complementary base pairs (A-U, G-C). Stems give RNA its structural stability, similar to DNA helices.',
  },
  Loop: {
    name: 'Loop',
    formula: 'Unpaired Region',
    description: 'An unpaired single-stranded region at the end of a stem where bases do not form hydrogen bonds. Loops are common functional sites in RNA structures like tRNA hairpins.',
  },
  NTP: {
    name: 'Nucleotide Triphosphate',
    formula: 'NTP',
    description: 'An activated nucleotide with three phosphate groups. Free NTPs in solution are the building blocks for RNA synthesis, providing energy for polymerization.',
  },
  'Phospholipid': {
    name: 'Phospholipid',
    formula: 'C\u2081\u2080H\u2082\u2080O\u2087P',
    description: 'The primary building block of biological membranes. Each phospholipid has a hydrophilic (water-loving) head and two hydrophobic (water-fearing) tails. In water, they spontaneously self-assemble into bilayers — the foundation of every cell membrane.',
  },
  'Phospho-head': {
    name: 'Hydrophilic Head',
    formula: 'PO\u2084\u00B3\u207B',
    description: 'The phosphate-containing head of a phospholipid that readily forms hydrogen bonds with water. This water-loving property keeps the head facing outward, where it contacts the aqueous environment inside and outside the cell.',
  },
  'Fatty-tail': {
    name: 'Hydrophobic Tail',
    formula: 'C\u2081\u2080H\u2082\u2080',
    description: 'Long hydrocarbon chains that repel water. The tails cluster together in the interior of the bilayer, forming a greasy, watertight barrier that prevents ions and large molecules from passing through freely.',
  },
  'Protocell': {
    name: 'Protocell',
    formula: '\u2014',
    description: 'A primitive cell-like compartment formed when a lipid bilayer spontaneously encloses a volume of water containing replicating RNA. Protocells represent a crucial step in the origin of life — they concentrate reactants, protect genetic material, and enable natural selection at the cellular level.',
  },
  'O2': {
    name: 'Oxygen',
    formula: 'O\u2082',
    description: 'A diatomic molecule essential for cellular respiration. Makes up about 21% of Earth\'s atmosphere and diffuses from the alveolar air into the bloodstream where it binds to hemoglobin.',
  },
  'Alveolus': {
    name: 'Alveolus',
    formula: '\u2014',
    description: 'Tiny air sacs in the lungs where gas exchange occurs. Each lung contains about 300 million alveoli, providing a surface area of roughly 70 m\u00B2 for efficient oxygen and carbon dioxide exchange.',
  },
  'RedBloodCell': {
    name: 'Red Blood Cell',
    formula: '\u2014',
    description: 'Biconcave disk-shaped cells that carry oxygen throughout the body. Each red blood cell contains about 270 million hemoglobin molecules, enabling it to transport up to one billion oxygen molecules.',
  },
  'Hemoglobin': {
    name: 'Hemoglobin',
    formula: 'C\u2082\u2099\u2085\u2082H\u2084\u2086\u2086\u2084N\u2088\u2081\u2082O\u2088\u2083\u2082S\u2088Fe\u2084',
    description: 'The iron-containing protein in red blood cells that binds oxygen. Each hemoglobin molecule has four heme groups containing iron, allowing it to carry up to four O\u2082 molecules. Binding is cooperative — the first O\u2082 makes it easier for the next to bind.',
  },
  'Capillary': {
    name: 'Capillary',
    formula: '\u2014',
    description: 'The smallest blood vessels in the body, only one cell thick. Capillaries form a vast network that brings blood close to every cell, enabling the exchange of oxygen, carbon dioxide, nutrients, and waste.',
  },
  'RespiratoryMembrane': {
    name: 'Respiratory Membrane',
    formula: '\u2014',
    description: 'The ultrathin barrier between alveolar air and capillary blood, measuring only about 0.5 \u00B5m across. It consists of alveolar epithelium, fused basement membranes, and capillary endothelium — gases cross by simple diffusion.',
  },
}
