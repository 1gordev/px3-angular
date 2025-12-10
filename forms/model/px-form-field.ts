import {PxFormFieldFamily} from "./px-form-field-family";
import {PxFormFieldInputKind} from "./px-form-field-input-kind";
import {PxFormFieldDropdownKind} from "./px-form-field-dropdown-kind";
import {PxFormFieldRules} from "./px-form-field-rules";
import {PxFormFieldError} from "./px-form-field-error";
import {signal, Signal, TemplateRef} from "@angular/core";
import {PxFormFieldBinaryKind} from "@px/forms/model/px-form-field-binary-kind";
import {MenuItem, SelectItem} from "primeng/api";
import {PxFormFieldButtonKind} from "@px/forms/model/px-form-field-button-kind";
import {PxFormSeverity} from "@px/forms/model/px-form-severity";
import {PxGroupButton} from "@px/forms/model/px-group-button";

export class PxFormField {

    id = '';
    family = PxFormFieldFamily.INPUT;
    kind?: (PxFormFieldInputKind | PxFormFieldDropdownKind | PxFormFieldBinaryKind | PxFormFieldButtonKind) = PxFormFieldInputKind.TEXT;
    readOnly?: boolean = false;
    label?: string = '';
    groupButtons?: PxGroupButton[] = [];
    placeholder?: string = '';
    tooltip?: string = '';
    icon?: string = '';
    rules?: PxFormFieldRules = {};
    cssClass?: string = 'sm:col-12 md:col-4';
    items? = signal<(SelectItem[] | any[])>([]);
    errors?: PxFormFieldError[] = [];
    rows?: number = 5;
    severity?: PxFormSeverity = PxFormSeverity.INFO;
    embeddedRef?: Signal<TemplateRef<any>>;
    changeValue?: ((value: any) => void) | null = null;
    visible?: (Signal<boolean> | null) = null;
    disabled?: (Signal<boolean> | null) = null;
    convertToDisplay?: ((value: any) => any) | null = null;

    constructor(src?: Partial<PxFormField>) {
        this.id = src?.id || this.id;
        this.family = src?.family || this.family;
        this.kind = src?.kind || this.kind;
        this.readOnly = src?.readOnly || this.readOnly;
        this.label = src?.label || this.label;
        this.groupButtons = [...(src?.groupButtons || [])];
        this.placeholder = src?.placeholder || this.placeholder;
        this.tooltip = src?.tooltip || this.tooltip;
        this.icon = src?.icon || this.icon;
        this.rules = src?.rules || this.rules;
        this.cssClass = src?.cssClass || this.cssClass;
        this.items = src?.items || this.items;
        this.errors = [...src?.errors || []];
        this.rows = src?.rows || this.rows;
        this.severity = src?.severity || this.severity;
        this.embeddedRef = src?.embeddedRef || this.embeddedRef;
        this.changeValue = src?.changeValue || this.changeValue;
        this.visible = src?.visible || this.visible;
        this.disabled = src?.disabled || this.disabled;
        this.convertToDisplay = src?.convertToDisplay || this.convertToDisplay;

        // Layout-only row: default to full-width unless caller overrides cssClass.
        if (this.family === PxFormFieldFamily.ROW && !src?.cssClass) {
            this.cssClass = 'col-12';
        }
    }

}
