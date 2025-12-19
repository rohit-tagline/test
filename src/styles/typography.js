import { RFValue } from 'react-native-responsive-fontsize';

export const fontSizes = {
  xs: RFValue(12),
  sm: RFValue(14),
  md: RFValue(16),
  lg: RFValue(20),
  xl: RFValue(26),
  hero: RFValue(34),
};

export const fontFamilies = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const getFont = (sizeKey = 'md', weight = 'regular') => ({
  fontSize: fontSizes[sizeKey] ?? fontSizes.md,
  fontFamily: fontFamilies[weight] ?? fontFamilies.regular,
});




