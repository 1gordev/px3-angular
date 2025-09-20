import {inject, Injectable, Injector} from '@angular/core';
import {MessageService} from "primeng/api";
import {SafeTranslate} from "../util/safe-translate";

@Injectable({providedIn: 'root'})
export class PxMessageService {

    private readonly messageService = inject(MessageService);
    private readonly safeTranslate = inject(SafeTranslate);


    async add(msg: WrappedMessage) {
        this.messageService.add({
            ...msg,
            summary: await this.safeTranslate.get(msg.summary),
            detail: await this.safeTranslate.get(msg.detail)
        });
    }

    async info(summary: string, detail: string) {
        await this.add(new WrappedMessage({severity: 'info', summary, detail}));
    }

    async warn(summary: string, detail: string) {
        await this.add(new WrappedMessage({severity: 'warn', summary, detail}));
    }

    async error(summary: string, detail: string) {
        await this.add(new WrappedMessage({severity: 'error', summary, detail}));
    }
}

export class WrappedMessage {
    severity: string;
    summary: string;
    detail: string;
    key: string | undefined;

    constructor(src: Partial<WrappedMessage>) {
        this.severity = src.severity || 'info';
        this.summary = src.summary || '';
        this.detail = src.detail || '';
        this.key = src.key;
    }
}
