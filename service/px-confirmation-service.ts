import {Injectable, Injector} from "@angular/core";
import {Confirmation, ConfirmationService} from "primeng/api";
import {SafeTranslate} from "../util/safe-translate";

@Injectable({providedIn: 'root'})
export class PxConfirmationService {

    constructor(private injector: Injector, private safeTranslate: SafeTranslate) {
    }

    async confirm(param: Confirmation): Promise<boolean> {
        // Translate message and header
        const message = await this.safeTranslate.get(param.message || '');
        const header = await this.safeTranslate.get(param.header || '');

        return new Promise<boolean>(
            (res) => {
                // Show confirmation dialog
                this.injector.get(ConfirmationService).confirm({
                    ...param,
                    message,
                    header,
                    accept: () => {
                        res(true);
                    },
                    reject: () => {
                        res(false);
                    }
                });
            });

    }
}
