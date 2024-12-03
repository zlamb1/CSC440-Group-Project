export function capitalizeWord(word: string) {
  if (!word || typeof word !== 'string') {
    return '';
  }
  return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
}