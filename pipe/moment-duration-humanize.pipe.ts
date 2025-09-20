import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'momentDurationHumanize'
})
export class MomentDurationHumanizePipe implements PipeTransform {

    transform(value: number, unit: moment.unitOfTime.DurationConstructor = 'milliseconds'): string {
        const duration = moment.duration(value, unit);

        if (duration.asMilliseconds() < 1000) {
            return duration.asMilliseconds() + ' millis';
        } else if (duration.asSeconds() < 60) {
            return duration.asSeconds() + ' seconds';
        } else if (duration.asMinutes() < 60) {
            return duration.asMinutes() + ' minutes';
        } else {
            return duration.humanize();
        }
    }

}
