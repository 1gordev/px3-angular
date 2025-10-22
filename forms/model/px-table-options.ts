import { PxTableActionColumn } from '@px/forms/model/px-table-action-column';
import { PxTableSort } from '@px/forms/model/px-table-sort';
import { Subject } from 'rxjs';

export class PxTableOptions {
    paginator = true;
    rows = 10;
    rowsPerPageOptions: number[] = [5, 10, 20, 50];
    tableClasses: string[] = [];
    tableStyle = { 'min-width': '50rem' };
    globalFilter = false;
    actionColumns: PxTableActionColumn[] = [];
    fetchOnInit = true;
    emptyMessage = 'common.empty-table-message';
    downloadable = false;
    defaultSort: PxTableSort = { fieldId: '', order: 1 };
    stripedRows = true;
    smallRows = false;
    reorder = false;
    onRowReorder?: (event: any) => void;
    onRowClick?: (event: MouseEvent, row: any) => void;

    // Selection options (disabled by default)
    enableMultiSelect = false;
    // Observable where the table will emit the selected rows array when selection changes.
    // It will be instantiated by the table component when enableMultiSelect is true.
    selectionChanges$ = new Subject<any[]>();

    constructor(src?: Partial<PxTableOptions>) {
        this.paginator = src?.paginator ?? this.paginator;
        this.rows = src?.rows || this.rows;
        this.rowsPerPageOptions = [...(src?.rowsPerPageOptions || this.rowsPerPageOptions)];
        this.tableStyle = { ...(src?.tableStyle || this.tableStyle) };
        this.globalFilter = src?.globalFilter ?? this.globalFilter;
        this.actionColumns = (src?.actionColumns || []).map((ac) => ({ ...ac }) as PxTableActionColumn);
        this.fetchOnInit = src?.fetchOnInit ?? this.fetchOnInit;
        this.emptyMessage = src?.emptyMessage || this.emptyMessage;
        this.downloadable = src?.downloadable ?? this.downloadable;
        this.defaultSort = src?.defaultSort || this.defaultSort;
        this.enableMultiSelect = src?.enableMultiSelect ?? this.enableMultiSelect;
        this.selectionChanges$ = src?.selectionChanges$ ?? this.selectionChanges$;
        this.stripedRows = src?.stripedRows ?? this.stripedRows;
        this.smallRows = src?.smallRows ?? this.smallRows;
        this.reorder = src?.reorder ?? this.reorder;
        this.onRowReorder = src?.onRowReorder ?? this.onRowReorder;
        this.onRowClick = src?.onRowClick ?? this.onRowClick;
    }
}
