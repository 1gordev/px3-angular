export class PxFormFieldButtonEvent {

    event?: Event;
    fieldId: string;

    constructor(src?: Partial<PxFormFieldButtonEvent>) {
        this.event = src?.event;
        this.fieldId = src?.fieldId || '';
    }

}
