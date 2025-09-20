import {inject, Injectable} from "@angular/core";
import {NgxSpinnerService} from "ngx-spinner";
import {PxMessageService} from "@px/service/px-message.service";
import {finalize, Observable, tap} from "rxjs";

@Injectable({providedIn: 'root'})
export class PxSpinnerService {

    private ngxSpinnerService = inject(NgxSpinnerService);
    private pxMessageService = inject(PxMessageService);

    wrap<T>(
        source: Observable<T>,
        successMessage: string,
        errorMessage: string
    ): Observable<T> {
        this.ngxSpinnerService.show();
        return source.pipe(
            tap({
                next: () => {
                    if (successMessage && successMessage.trim() !== '') {
                        this.pxMessageService.info('', successMessage)
                    }
                },
                error: () => {
                    if(errorMessage && errorMessage.trim() !== '') {
                        this.pxMessageService.error('', errorMessage)
                    }
                }
            }),
            finalize(() => this.ngxSpinnerService.hide())
        );
    }

}
