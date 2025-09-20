import {Component, computed, DestroyRef, effect, Injector, input} from '@angular/core';
import {
    AbstractControl, AsyncValidatorFn,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {PxFormField} from "../model/px-form-field";
import {Fluid} from "primeng/fluid";
import {PxFormOptions} from "../model/px-form-options";
import {PxFormFieldFamily} from "../model/px-form-field-family";
import {takeUntilDestroyed, toObservable} from "@angular/core/rxjs-interop";
import {InputText} from "primeng/inputtext";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {Message} from "primeng/message";
import {Button} from "primeng/button";
import {v4 as uuidv4} from 'uuid';
import {PxFormAction} from "../model/px-form-action";
import {PxFormSeverity} from "../model/px-form-severity";
import {DropdownModule} from "primeng/dropdown";
import {Tooltip} from "primeng/tooltip";
import {Textarea} from "primeng/textarea";
import {NgTemplateOutlet} from "@angular/common";
import {debounceTime, firstValueFrom, Observable, of} from "rxjs";
import {Select} from "primeng/select";
import {Checkbox} from "primeng/checkbox";
import {PxFormFieldInputKind} from "@px/forms/model/px-form-field-input-kind";
import {MultiSelect} from "primeng/multiselect";
import {PxFormFieldButtonEvent} from "@px/forms/model/px-form-field-button-event";
import {InputGroup} from "primeng/inputgroup";
import {PxGroupButton} from "@px/forms/model/px-group-button";
import {catchError, switchMap} from "rxjs/operators";

@Component({
    standalone: true,
    selector: 'app-px-form',
    imports: [
        Fluid,
        InputText,
        TranslatePipe,
        Message,
        Button,
        ReactiveFormsModule,
        DropdownModule,
        Tooltip,
        Textarea,
        NgTemplateOutlet,
        Select,
        Checkbox,
        MultiSelect,
        InputGroup
    ],
    templateUrl: './px-form.component.html',
    styleUrl: './px-form.component.scss'
})
export class PxFormComponent {

    form = input.required<FormGroup>();

    inputFields = input.required<PxFormField[]>({alias: 'fields'});
    protected internalFields = computed(() => this.inputFields().map(f => new PxFormField(f)));

    model = input.required<any>();

    inputOptions = input.required<PxFormOptions>({alias: 'options'});
    protected internalOptions = computed(() => new PxFormOptions(this.inputOptions()));

    protected formUUID = `px-form-${uuidv4()}`;

    constructor(private readonly destroyRef: DestroyRef,
                private readonly injector: Injector,
                private readonly translateService: TranslateService) {
        // Sanitize and init form fields
        effect(() => {
            this.internalFields().forEach(f => this.initField(this.form(), f));

            if (this.internalOptions().autoSave) {
                this.initAutoSave();
            }
        });

        // Sanitize actions
        effect(() => this.internalOptions().actions = this.internalOptions().actions?.map(a => new PxFormAction(a)) || []);
    }

    public insertAtCursor(fieldId: string, text: string) {
        if (!text || !fieldId) {
            return;
        }
        const formControl = this.form().get(fieldId);
        if (!formControl) {
            console.warn(`Form control with id "${fieldId}" not found.`);
            return;
        }

        // Find the input element by fieldId
        const inputId = `${this.formUUID}-${fieldId}`
        const inputEl = document.getElementById(inputId) as HTMLInputElement | null;
        if (inputEl) {
            const value = inputEl.value;
            const start = inputEl.selectionStart ?? value.length;
            const end = inputEl.selectionEnd ?? value.length;

            // Insert the string at the cursor position
            const newValue = value.slice(0, start) + text + value.slice(end);
            formControl.setValue(newValue);

            // Restore focus and cursor after inserted text
            setTimeout(() => {
                inputEl.focus();
                const cursorPosition = start + text.length;
                inputEl.setSelectionRange(cursorPosition, cursorPosition);
            });
        }
    }

    private initAutoSave() {
        this.form().valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef),
            debounceTime(this.internalOptions().autoSaveDebounce || 10)
        ).subscribe(() => {
            this.form().markAllAsTouched();
            if (this.form().valid && this.internalOptions().autoSaveWhenValid) {
                this.internalOptions().autoSaveWhenValid!();
            }
        });
    }

    private initField(formGroup: FormGroup, field: PxFormField) {
        // Remove the control if it exists
        if (formGroup.get(field.id)) {
            formGroup.removeControl(field.id);
        }

        // Get the initial value from model, handling nested objects and null model
        let initialValue = null;
        if (this.model()) {
            if (field.id.includes('.')) {
                // Handle nested object path
                initialValue = field.id.split('.').reduce((obj, key) =>
                        obj && obj[key] !== undefined ? obj[key] : null,
                    this.model()
                );
            } else {
                initialValue = this.model()[field.id];
            }
        }

        // Handle initialValue conversion
        if (field.convertToDisplay) {
            initialValue = field.convertToDisplay(initialValue);
        }

        // Add new control with initial value (could be null if model is null or path doesn't exist)
        const [validators, asyncValidators] = this.makeControlValidators(field);
        formGroup.addControl(
            field.id,
            new FormControl(
                initialValue,
                {
                    validators: validators,
                    asyncValidators: asyncValidators,
                    updateOn: 'blur'
                }
            )
        );

        // Handle trim rule
        this.initTrimRule(formGroup, field);

        // Handle readOnly flag
        if (field.readOnly) {
            formGroup.controls[field.id].disable();
        }

        // Handle changeValue function.
        if (field.family != PxFormFieldFamily.BUTTON && field.changeValue) {
            formGroup.controls[field.id].valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                field.changeValue!(value);
            });

            // Call changeValue function with the initial value
            if (initialValue !== null && initialValue !== undefined) {
                field.changeValue!(initialValue);
            }
        }

        if (field.disabled) {
            // Manage disabled state outside the reactive context
            Promise.resolve().then(() => {
                toObservable(field.disabled!, {injector: this.injector})
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(disabled => {
                        disabled
                            ? formGroup.controls[field.id].disable()
                            : formGroup.controls[field.id].enable();
                    });
            });
        }

        // Handle field items label translation
        if (field.family === PxFormFieldFamily.DROPDOWN && field.items) {
            field.items.forEach(item => {
                if (item.label && typeof item.label === 'string') {
                    item.label = this.translateService.instant(item.label);
                }
            });
        }

        if(field.visible) {
            // Manage visibility state outside the reactive context
            Promise.resolve().then(() => {
                toObservable(field.visible!, {injector: this.injector})
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe(visible => {
                        console.log(`Field ${field.id} visibility changed: ${visible}`);
                    });
            });
        }
    }

    private initTrimRule(formGroup: FormGroup, field: PxFormField) {
        if (field.rules?.trim && field.family === PxFormFieldFamily.INPUT) {
            const control = formGroup.get(field.id);
            if (control) {
                control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
                    if (value !== null && value !== undefined) {
                        control.setValue(value.trim(), {emitEvent: false});
                    }
                });
            }
        }
    }

    private makeControlValidators(field: PxFormField): [ValidatorFn[], AsyncValidatorFn[]] {
        field.errors = field.errors || [];
        const validators: ValidatorFn[] = [];
        const asyncValidators: AsyncValidatorFn[] = [];

        if (field.rules?.required) {
            validators.push(Validators.required);
            if (!field.errors.find(err => err.name === 'required')) {
                field.errors.push({name: 'required', message: 'px.errors.required'});
            }
        }
        if (field.rules?.pattern) {
            validators.push(Validators.pattern(field.rules?.pattern));
            if (!field.errors.find(err => err.name === 'pattern')) {
                field.errors.push({name: 'pattern', message: 'px.errors.pattern'});
            }
        }
        if (field.rules?.minLength) {
            validators.push(Validators.minLength(field.rules?.minLength));
            if (!field.errors.find(err => err.name === 'minlength')) {
                field.errors.push({name: 'minlength', message: 'px.errors.minLength'});
            }
        }
        if (field.rules?.maxLength) {
            validators.push(Validators.maxLength(field.rules?.maxLength));
            if (!field.errors.find(err => err.name === 'maxlength')) {
                field.errors.push({name: 'maxlength', message: 'px.errors.maxLength'});
            }
        }
        if (field.rules?.minValue && typeof field.rules?.minValue === 'number') {
            validators.push(Validators.min(field.rules?.minValue));
            if (!field.errors.find(err => err.name === 'min')) {
                field.errors.push({name: 'min', message: 'px.errors.minValue'});
            }
        }
        if (field.rules?.maxValue && typeof field.rules?.maxValue === 'number') {
            validators.push(Validators.max(field.rules?.maxValue));
            if (!field.errors.find(err => err.name === 'max')) {
                field.errors.push({name: 'max', message: 'px.errors.maxValue'});
            }
        }

        if (field.rules?.isUniqueFn) {
            asyncValidators.push(uniquenessValidator(field));

            if (!field.errors.find(err => err.name === 'uniqueness')) {
                field.errors.push({name: 'uniqueness', message: 'px.errors.uniqueness'});
            }
        }

        if (field.family === PxFormFieldFamily.INPUT && field.kind === PxFormFieldInputKind.DURATION) {
            // use our custom validator instead of Validators.pattern
            validators.push(durationPatternValidator());

            // ensure we only add this error descriptor once
            if (!field.errors.find(err => err.name === 'duration-pattern')) {
                field.errors.push({
                    name: 'duration-pattern',
                    message: 'px.errors.duration-pattern'
                });
            }

            if (!field.tooltip || field.tooltip === '') {
                field.tooltip = 'px.tooltips.duration';
            }
        }

        return [validators, asyncValidators];
    }

    protected getButtonSeverity(pxSeverity?: PxFormSeverity) {
        if (!pxSeverity) {
            return 'primary';
        }

        switch (pxSeverity) {
            case PxFormSeverity.PRIMARY:
                return 'primary';
            case PxFormSeverity.SECONDARY:
                return 'secondary';
            case PxFormSeverity.SUCCESS:
                return 'success';
            case PxFormSeverity.INFO:
                return 'info';
            case PxFormSeverity.WARN:
                return 'warn';
            case PxFormSeverity.DANGER:
                return 'danger';
            case PxFormSeverity.HELP:
                return 'help';
            case PxFormSeverity.CONTRAST:
                return 'contrast';
            default:
                return 'primary';
        }
    }

    protected onActionClick(action: PxFormAction) {
        if (action.touchAllFields) {
            this.form().markAllAsTouched();
        }

        if (action.command) {
            action.command();
        }
    }

    protected onButtonFieldClick($event: Event, field: PxFormField) {
        if (!!field.changeValue) {
            field.changeValue!(new PxFormFieldButtonEvent({
                event: $event,
                fieldId: field.id
            }));
        }
    }

    getGroupButtons(field: PxFormField, position: string): PxGroupButton[] {
        if (!field) {
            return [];
        }
        if (!position || position !== 'left' && position !== 'right') {
            return [];
        }

        return field.groupButtons?.filter(btn => btn.position === position) || [];
    }

    onGroupButtonClick(event: MouseEvent, btn: any, field: PxFormField, form: FormGroup) {
        if (!event) {
            return;
        }
        if (!btn || !btn.command) {
            return;
        }
        btn.command(event, btn, field, form);
    }
}

/**
 * Validates that a duration string consists of:
 *   • a number (no explicit limit), followed by exactly one unit:
 *     - 'y'  (years)
 *     - 'd'  (days)
 *     - 'h'  (hours)
 *     - 'm'  (minutes)
 *     - 's'  (seconds)
 *     - 'ms' (milliseconds)
 *
 * Examples of valid inputs: '1s', '200ms', '4000m', '5h', '10d', '2y'
 */
export function durationPatternValidator(): ValidatorFn {
    const regex = /^\d+(?:ms|y|d|h|m|s)$/;

    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string | null;
        if (!value) {
            return null;
        }
        return regex.test(value)
            ? null
            : {'duration-pattern': true};
    };
}

/**
 * Asynchronous validator to check the uniqueness of a field value.
 *
 * @param field
 */
export function uniquenessValidator(field: PxFormField): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }
        if (field?.rules?.isUniqueFn) {
            return of(control.value).pipe(
                switchMap(value =>
                    field!.rules!.isUniqueFn!(field, value).pipe(
                        switchMap(isUnique =>
                            isUnique ? of(null) : of({'uniqueness': true})
                        ),
                        catchError(err => {
                            console.error(err);
                            return of({'uniquenessCheckFailed': true});
                        })
                    )
                )
            );
        }
        return of(null);
    };
}
