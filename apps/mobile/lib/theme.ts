import { useColorScheme } from 'react-native';

const paper = {
  paper: '#F1EBE0',
  sheet: '#F7F2E8',
  well: '#E6DFD2',
  ink: '#2B261F',
  inkSoft: '#5E574C',
  inkFaint: '#8A8274',
  rule: '#D3C9B8',
  sage: '#6E7F6A',
  rust: '#9A5B4A',
};

const stone = {
  paper: '#24211E',
  sheet: '#2F2B27',
  well: '#1A1816',
  ink: '#E6DFD2',
  inkSoft: '#B2A99A',
  inkFaint: '#7A7368',
  rule: '#454039',
  sage: '#9AA890',
  rust: '#C48978',
};

export function useTheme() {
  return useColorScheme() === 'dark' ? stone : paper;
}
