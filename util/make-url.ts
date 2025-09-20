export class MakeUrl {
    public static build(baseUrl: string, segments: string[], params: any): string {

        // Trim and remove trailing slashes from baseUrl
        let url = baseUrl.trim().replace(/\/+$/, '');

        // Process and clean up segments
        if (segments && segments.length > 0) {
            url += '/' + segments
                .filter(s => s) // Ignore null or empty segments
                .map(s => s.trim().replace(/^\/+|\/+$/g, '')) // Trim and strip leading/trailing slashes
                .join('/');
        }

        // Process and clean up params
        if (params) {
            const queryString = Object.keys(params)
                .filter(key => params[key] !== null && params[key] !== undefined) // Ignore null or undefined params
                .map(key => `${encodeURIComponent(key.trim())}=${encodeURIComponent(String(params[key]).trim())}`) // Trim keys and values
                .join('&');
            url += queryString ? `?${queryString}` : '';
        }

        return url;
    }
}
