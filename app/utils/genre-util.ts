export const GenreThemes: { [key: string]: string } = {
    'COMEDY': '#c39424',
    'SCI_FI': '#579a30',
    'THRILLER': '#6b259a',
    'ROMANCE': '#a81d1d',
    'FANTASY': '#3b60b3'
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