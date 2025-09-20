import {firstValueFrom} from "rxjs";
import {Injectable, Injector} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: 'root'})
export class SafeTranslate {

    constructor(private injector: Injector) {
    }

    async get(key: string): Promise<string> {
        let translated = '';
        try {
            translated = await firstValueFrom(this.injector.get(TranslateService).get(key || '__**MISSING**__'));
        } catch (e) {
            console.error(`Error while translating key ${key}`, e);
            translated = '';
        }

        if (translated === '__**MISSING**__') {
            return '';
        } else {
            return translated;
        }
    }
}
