export class CoordsUtils {
    static toDMS(coordinate: number | null | undefined, isLongitude: boolean): string {

        if (coordinate === null || coordinate === undefined) {
            return '';
        } else {
            const absolute = Math.abs(coordinate);
            const degrees = Math.floor(absolute);
            const minutesFloat = (absolute - degrees) * 60;
            const minutes = Math.floor(minutesFloat);
            const seconds = Math.round((minutesFloat - minutes) * 60);

            // Determine the direction based on whether it's a longitude or latitude
            const direction = isLongitude
                ? (coordinate >= 0 ? 'E' : 'W')
                : (coordinate >= 0 ? 'N' : 'S');

            return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
        }

    }
}
