import {PxFormField} from "@px/forms/model/px-form-field";
import {Observable} from "rxjs";

export class PxFormFieldRules {
    required?: boolean = false;
    minLength?: number;
    maxLength?: number;
    minValue?: (number | Date);
    maxValue?: (number | Date);
    trim?: boolean = false;
    allowEmpty?: boolean = false;
    pattern?: string;
    isUniqueFn?: (field: PxFormField, value: any) => Observable<boolean>
}
