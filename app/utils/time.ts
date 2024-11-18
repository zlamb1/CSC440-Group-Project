export const MS_SECOND = 1000;
export const MS_MINUTE = MS_SECOND * 60;
export const MS_HOUR = MS_MINUTE * 60;
export const MS_DAY = MS_HOUR * 24;

function isPlural(unit: number) {
    if (unit !== 1) return 's';
    return '';
}

export function formatPastDate(date: string | Date, suffix?: string) {
    if (!date) return '';

    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (suffix == null) {
        suffix = 'ago';
    }

    const now = new Date();
    const epochDiff = now.getTime() - date.getTime();

    if (epochDiff < MS_MINUTE) {
        const seconds = Math.floor(epochDiff / MS_SECOND);
        return `${seconds} second${isPlural(seconds)} ${suffix}`;
    }

    if (epochDiff < MS_HOUR) {
        const minutes = Math.floor(epochDiff / MS_MINUTE);
        return `${minutes} minute${isPlural(minutes)} ${suffix}`;
    }

    if (epochDiff < MS_DAY) {
        const hours = Math.floor(epochDiff / MS_HOUR);
        return `${hours} hour${isPlural(hours)} ${suffix}`;
    }

    const years = now.getFullYear() - date.getFullYear();
    if (years > 0) {
        return `${years} year${isPlural(years)} ${suffix}`;
    }

    const months = now.getMonth() - date.getMonth();
    if (months > 0) {
        return `${months} month${isPlural(months)} ${suffix}`;
    }

    const days = Math.floor(epochDiff / MS_DAY);
    return `${days} day${isPlural(days)} ${suffix}`;
}

export function formatFutureDate(date: string | Date, suffix?: string) {
    if (!date) return '';

    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (!suffix) {
        suffix = '';
    }

    const now = new Date();
    const msDiff = date.getTime() - now.getTime();

    if (msDiff < MS_MINUTE) {
        const seconds = Math.floor(msDiff / MS_SECOND);
        return `${seconds} second${isPlural(seconds)} ${suffix}`;
    }

    if (msDiff < MS_HOUR) {
        const minutes = Math.floor(msDiff / MS_MINUTE);
        return `${minutes} minute${isPlural(minutes)} ${suffix}`;
    }

    if (msDiff < MS_DAY) {
        const hours = Math.floor(msDiff / MS_HOUR);
        return `${hours} hour${isPlural(hours)} ${suffix}`;
    }

    const years = date.getFullYear() - now.getFullYear();
    if (years > 0) {
        return `${years} year${isPlural(years)} ${suffix}`;
    }

    const months = date.getMonth() - now.getMonth();
    if (months > 0) {
        return `${months} month${isPlural(months)} ${suffix}`;
    }

    const days = Math.floor(msDiff / MS_DAY);
    return `${days} day${isPlural(days)} ${suffix}`;
}