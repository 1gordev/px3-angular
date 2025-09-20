import * as moment from 'moment';

export class DurationParser {
    /**
     * Parse a duration string into a moment.Duration.
     * Supported formats: '5s','10m','2h','1d','1y','500ms'
     */
    public static parse(inputStr: string): moment.Duration {
        if(!inputStr || !inputStr.trim().length) {
            return moment.duration(0);
        }

        const regex = /^(\d+)(ms|[ydhms])$/;
        const match = regex.exec(inputStr.trim());

        if (!match) {
            throw new Error(
                `Invalid duration format: "${inputStr}". Use e.g. "5s","10m","2h","1d","1y","500ms".`
            );
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 'ms':
                return moment.duration(value, 'milliseconds');
            case 's':
                return moment.duration(value, 'seconds');
            case 'm':
                return moment.duration(value, 'minutes');
            case 'h':
                return moment.duration(value, 'hours');
            case 'd':
                return moment.duration(value, 'days');
            case 'y':
                return moment.duration(value, 'years');
            default:
                return moment.duration(0); // Fallback (should never hit)
        }
    }

    /**
     * Convert a moment.Duration back into a single-unit string
     * using the largest unit that divides evenly.
     */
    public static convert(momentDuration: moment.Duration, blankIfZero: boolean): string {
        const ms = momentDuration.asMilliseconds();
        if (blankIfZero && ms === 0) {
            return '';
        }
        const units: { unit: string; factor: number }[] = [
            {unit: 'y', factor: 365 * 24 * 60 * 60 * 1000},
            {unit: 'd', factor: 24 * 60 * 60 * 1000},
            {unit: 'h', factor: 60 * 60 * 1000},
            {unit: 'm', factor: 60 * 1000},
            {unit: 's', factor: 1000},
            {unit: 'ms', factor: 1},
        ];

        for (const {unit, factor} of units) {
            if (ms % factor === 0) {
                const value = ms / factor;
                return `${value}${unit}`;
            }
        }

        // Fallback (should never hit): return raw ms
        return `${ms}ms`;
    }

    /**
     * Convert milliseconds to a single-unit string
     *
     * @param ms milliseconds
     * @param blankIfZero if true, return empty string if ms is 0
     */
    public static convertFromMs(ms: number, blankIfZero: boolean): string {
        return this.convert(moment.duration(ms, 'milliseconds'), blankIfZero);
    }
}
