export class PxUser {
    id: string = '';
    username: string = '';

    roles: string[] = [];

    details: any = {};
    config: any = {};

    constructor(src?: Partial<PxUser>) {
        this.id = src?.id || '';
        this.username = src?.username?.trim() || '';
        this.roles = [...(src?.roles || [])];
        this.details = Object.assign(src?.details || {});
        this.config = Object.assign(src?.config || {});
    }
}
