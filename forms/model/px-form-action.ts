import {PxFormSeverity} from "./px-form-severity";
import {PxFormActionPlacement} from "./px-form-action-placement";

export class PxFormAction {
    id = '';
    icon?: string = '';
    label?: string = '';
    textButton?: boolean = false;
    severity?: PxFormSeverity = PxFormSeverity.PRIMARY;
    placement?: PxFormActionPlacement = PxFormActionPlacement.BOTTOM_RIGHT;
    touchAllFields?: boolean = false;
    command?: () => void = () => {}

    constructor(src?:Partial<PxFormAction>) {
        this.id = src?.id || this.id;
        this.icon = src?.icon || this.icon;
        this.label = src?.label || this.label;
        this.textButton = src?.textButton || this.textButton;
        this.severity = src?.severity || this.severity;
        this.placement = src?.placement || this.placement;
        this.command = src?.command || this.command;
    }
}
