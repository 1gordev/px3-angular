import {FormGroup} from "@angular/forms";

export class FormUtils {
    static anyError(form: FormGroup, fieldName: string): boolean {
        return !!(form?.get(fieldName)?.touched && form?.get(fieldName)?.invalid);
    }

    static hasError(form: FormGroup, fieldName: string, error: string): boolean {
        return !!(form?.get(fieldName)?.errors?.[error]);
    }
}
