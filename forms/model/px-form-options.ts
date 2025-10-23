import {PxFormAction} from "./px-form-action";
import {signal} from "@angular/core";

export class PxFormOptions {
    autoSave?: boolean = false;
    autoSaveDebounce?: number = 10;
    autoSaveWhenValid?: () => void = () => {
    }
    actions?: PxFormAction[] = [];
    showForm? = signal<boolean>(true);

    constructor(src?: Partial<PxFormOptions>) {
        this.autoSave = src?.autoSave || false;
        this.autoSaveDebounce = src?.autoSaveDebounce || this.autoSaveDebounce;
        this.autoSaveWhenValid = src?.autoSaveWhenValid || this.autoSaveWhenValid;
        this.actions = (src?.actions || []).map(a => new PxFormAction(a));
        this.showForm = src?.showForm ?? this.showForm;
    }
}
