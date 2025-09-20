import {PxFormSeverity} from "@px/forms/model/px-form-severity";
import {FormGroup} from "@angular/forms";

export interface PxGroupButton {
    icon?: string;
    tooltip?: string;
    label?: string;
    severity?: PxFormSeverity;
    command?: (event: any, btn: PxGroupButton, field: any, form: FormGroup) => void;
    position?: ('left' | 'right');
}
