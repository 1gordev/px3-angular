import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'momentToTime',
    standalone: true
})
export class MomentToTimePipe implements PipeTransform {

    transform(value: number, format?: string, timezone?: string): string | null {
        // Handle invalid or missing input
        if (!value) {
            return '';
        }

        // Create a Moment object from the input value
        const momentDate = moment.utc(value);

        // Check if the date is valid
        if (!momentDate.isValid()) {
            return '---';
        }

        // Default to UTC if no timezone is specified
        const dateInTimezone = momentDate.utc();

        // Default format if none provided: 'YYYY-MM-DD HH:mm:ss' (24-hour UTC time)
        const outputFormat = format || 'YYYY-MM-DD HH:mm:ss';

        // Return the formatted date string
        return dateInTimezone.format(outputFormat);
    }

}
