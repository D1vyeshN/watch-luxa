const CODE_MAP: Record<string, string> = {
  black: 'BLK', white: 'WHT', blue: 'BLU', green: 'GRN',
  brown: 'BRN', silver: 'SLV', salmon: 'SLM', red: 'RED',
  grey: 'GRY', gray: 'GRY', champagne: 'CHP', ivory: 'IVR',
  steel: 'STL', titanium: 'TIT', gold: 'GLD', platinum: 'PLT',
  ceramic: 'CRM', bronze: 'BRZ', tantalum: 'TAN', carbon: 'CBN',
  'rose gold': 'RGD', 'yellow gold': 'YGD', 'white gold': 'WGD',
  'oystersteel': 'STL', 'stainless steel': 'STL',
  oyster: 'OYS', jubilee: 'JUB', leather: 'LEA', rubber: 'RUB',
  nato: 'NAT', mesh: 'MSH', bracelet: 'BRL', strap: 'STR',
  silicon: 'SIL', fabric: 'FAB',
};

const toCode = (value: string, maxLen = 3): string => {
  const lower = value.toLowerCase().trim();
  if (CODE_MAP[lower]) return CODE_MAP[lower];
  return lower
    .replace(/[^a-z0-9]/g, '')
    .slice(0, maxLen)
    .toUpperCase();
};

export const generateSku = (
  brandName: string,
  variant: {
    dialColor: string;
    caseMaterial: string;
    strapType: string;
    caseSize: number;
  }
): string => {
  const brand = brandName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const dial = toCode(variant.dialColor);
  const material = toCode(variant.caseMaterial);
  const strap = toCode(variant.strapType);
  const size = variant.caseSize;

  return `${brand}-${dial}-${material}-${strap}-${size}`;
};
