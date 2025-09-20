export function makeExternalUrl(path: string, hash: boolean = false): string {
    // 1. Get the base href from the DOM or fallback to '/'
    const baseEl = document.querySelector('base[href]');
    let baseHref = baseEl ? baseEl.getAttribute('href')! : '/';

    // 2. Normalize baseHref to ensure it ends with '/'
    if (!baseHref.endsWith('/')) {
        baseHref += '/';
    }

    // 3. Remove leading slash from path (to avoid double slashes)
    if (path.startsWith('/')) {
        path = path.slice(1);
    }

    // 4. Build the URL according to the routing strategy
    let url: string;
    if (hash) {
        // HashLocationStrategy: /base/#/path
        url = `${baseHref}#/${path}`;
    } else {
        // PathLocationStrategy: /base/path
        url = `${baseHref}${path}`;
    }

    // 5. Add protocol and host to form absolute URL
    const {protocol, host} = window.location;
    return `${protocol}//${host}${url.startsWith('/') ? '' : '/'}${url}`;
}
