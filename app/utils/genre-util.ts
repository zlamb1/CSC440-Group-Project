export const GenreThemes: { [key: string]: string } = {
    'COMEDY':     '#c39424',
    'SCI_FI':     '#579a30',
    'THRILLER':   '#6b259a',
    'ROMANCE':    '#a81d1d',
    'FANTASY':    '#3b60b3',
    'SCARY':      '#700303',
    'ACTION':     '#0c2f81',
    'FICTION':    '#328f77',
    'MUSIC':      '#0847da',
    'TELEVISION': '#ba2aec',
    'ART':        '#387300',
    'POLITICAL':  '#df19d0'
};

export function formatGenre(genre: string) {
    // this is necessary because genres from the enum are fully capitalized
    let formattedGenre = '';
    const parts = genre.split('_');
    for (const part of parts) {
        formattedGenre += part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
    }
    return formattedGenre;
}