import {PxFormAction} from "./px-form-action";

export class PxFormOptions {
    autoSave?: boolean = false;
    autoSaveDebounce?: number = 10;
    autoSaveWhenValid?: () => void = () => {
    }
    actions?: PxFormAction[] = [];

    constructor(src?: Partial<PxFormOptions>) {
        this.autoSave = src?.autoSave || false;
        this.autoSaveDebounce = src?.autoSaveDebounce || this.autoSaveDebounce;
        this.autoSaveWhenValid = src?.autoSaveWhenValid || this.autoSaveWhenValid;
        this.actions = (src?.actions || []).map(a => new PxFormAction(a));
    }
}
