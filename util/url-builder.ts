export class UrlBuilder {
    private baseUrl: string = '';
    private pathSegments: string[] = [];
    private queryParams: Map<string, string | number> = new Map();

    constructor(baseUrl: string) {
        //  normalize the base URL to remove any trailing slashes
        this.baseUrl = baseUrl.replace(/\/+$/, '');
    }

    append(segment: string): UrlBuilder {
        if (segment) {
            //  trim leading and trailing slashes from the segment to avoid double slashes
            this.pathSegments.push(segment.replace(/^\/+|\/+$/g, ''));
        }
        return this;
    }

    param(key: string, value: string | number): UrlBuilder {
        if (key && value !== undefined && value !== null) {
            this.queryParams.set(key, value);
        }
        return this;
    }

    build(): string {
        //  join the path segments with slashes, ensuring no double slashes
        let path = this.pathSegments.join('/');
        //  construct the query string from query parameters
        let queryString = Array.from(this.queryParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        return `${this.baseUrl}/${path}${queryString ? `?${queryString}` : ''}`;
    }
}


