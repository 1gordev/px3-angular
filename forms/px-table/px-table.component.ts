import {Component, computed, DestroyRef, effect, Injector, input, output, viewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Button} from 'primeng/button';
import {v4 as uuidv4} from 'uuid';
import {Tooltip} from 'primeng/tooltip';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {PxColumn} from '@px/forms/model/px-column';
import {PxTableOptions} from '@px/forms/model/px-table-options';
import {Table, TableModule} from 'primeng/table';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {PxColumnFamily} from '@px/forms/model/px-column-family';
import {PxTableButton} from '@px/forms/model/px-table-button';
import {DurationParser} from '@px/util/duration-parser';
import {Tag} from 'primeng/tag';
import {MomentToTimePipe} from '@px/pipe/moment-pipe.ts.pipe';
import {MultiSelect} from 'primeng/multiselect';
import {FilterService} from 'primeng/api';
import {Subject} from 'rxjs';
import {Checkbox} from "primeng/checkbox";

@Component({
    standalone: true,
    selector: 'app-px-table',
    imports: [InputText, TranslatePipe, Button, ReactiveFormsModule, FormsModule, Tooltip, NgTemplateOutlet, TableModule, IconField, InputIcon, Tag, MomentToTimePipe, MultiSelect, Checkbox, NgClass],
    templateUrl: './px-table.component.html'
})
export class PxTableComponent {
    items = input.required<any[]>({alias: 'items'});

    inputColumns = input.required<PxColumn[]>({alias: 'columns'});
    inputOptions = input.required<PxTableOptions>({alias: 'options'});

    actionFetch = output<void>({alias: 'actionFetch'});

    protected keyColumn = computed(
        () =>
            this.inputColumns().filter((c) => c.family === PxColumnFamily.KEY)[0] ||
            ({
                id: 'id',
                family: PxColumnFamily.KEY
            } as PxColumn)
    );
    protected displayColumns = computed(() =>
        this.inputColumns()
            .filter((c) => c.family !== PxColumnFamily.KEY)
            .map((c) => ({...c}) as PxColumn)
    );
    protected globalFilterColumns = computed(() =>
        this.displayColumns()
            .filter((c) => !!c.globalFilter)
            .map((c) => c.id)
    );
    protected anyFilterEnabled = computed(() =>
        (this.displayColumns() || []).some((c) => c?.options?.enableFilter === true)
    );
    protected options = computed(() => ({...this.inputOptions()}) as PxTableOptions);
    protected pxTable = viewChild(Table);

    protected tableUUID = `px-table-${uuidv4()}`;

    // Selection state (active only when enableMultiSelect is true)
    protected selectedRows: any[] = [];

    // UI state for column filters (e.g., MultiSelect selections)
    protected filterValues: Record<string, any[]> = {};

    private appliedDefaultSort = false;

    constructor(
        private readonly destroyRef: DestroyRef,
        private readonly injector: Injector,
        private readonly translateService: TranslateService,
        private readonly filterService: FilterService
    ) {
        // Register custom filter function for chip arrays
        this.filterService.register('chipArrayFilter', (value: any, filter: any[]): boolean => {
            if (filter === undefined || filter === null || filter.length === 0) {
                return true;
            }

            if (value === undefined || value === null) {
                return false;
            }

            // If value is an array of SelectItem objects
            if (Array.isArray(value)) {
                // Check if any of the SelectItem values in the cell match any of the filter values
                return value.some((item) => filter.includes(item.value));
            }

            return false;
        });

        // Fetch on init if configured
        effect(() => {
            if (this.options && this.options()) {
                if (this.options().fetchOnInit) {
                    this.actionFetch.emit();
                }
            }
        });

        effect(() => {
            if (this.items() && this.displayColumns()) {
                this.executeConversions(this.items(), this.displayColumns());
            }
        });

        // Apply default sort once, on initialization, when table + data are ready
        effect(() => {
            const tableReady = !!(this.pxTable && this.pxTable());
            const items = this.items();
            const cols = this.displayColumns();
            const ds = this.options()?.defaultSort;

            if (!tableReady) return;
            if (!items || items.length === 0) return;
            if (!cols || cols.length === 0) return;
            if (!ds || !ds.fieldId) return;
            if (this.appliedDefaultSort) return;

            this.tryApplyDefaultSort();
        });

        // Initialize selection observable when multi-select is enabled
        effect(() => {
            const opts = this.inputOptions();
            if (opts && this.options()?.enableMultiSelect) {
                if (!opts.selectionChanges$) {
                    opts.selectionChanges$ = new Subject<any[]>();
                }
            }
        });

        // Keep selection consistent with current items and emit changes
        effect(() => {
            const items = this.items() || [];
            const enableSel = this.options()?.enableMultiSelect === true;
            if (!enableSel) {
                if (this.selectedRows.length) {
                    this.selectedRows = [];
                    const opts = this.inputOptions();
                    opts?.selectionChanges$?.next([]);
                }
                return;
            }
            // If items changed, prune selection to existing items by key
            const keyId = this.keyColumn()?.id;
            if (!keyId) return;
            const itemKeySet = new Set(items.map((it: any) => this.getByPath(it, keyId)));
            const newSelection = this.selectedRows.filter((r) => itemKeySet.has(this.getByPath(r, keyId)));
            if (newSelection.length !== this.selectedRows.length) {
                this.selectedRows = newSelection;
                const opts = this.inputOptions();
                opts?.selectionChanges$?.next([...this.selectedRows]);
            }
        });
    }

    onFilterGlobal($event: any) {
        if (this.pxTable && this.pxTable()) {
            this.pxTable()!.filterGlobal($event?.target?.value, 'contains');
        }
    }

    onFilterText(event: Event, column: string) {
        if (this.pxTable && this.pxTable()) {
            this.pxTable()!.filter((event.target as HTMLInputElement).value, column, 'contains');
        }
    }

    onFilterChips(event: any, column: string) {
        if (this.pxTable && this.pxTable()) {
            const values = Array.isArray(event?.value) ? [...event.value] : [];
            // Keep UI selection in sync
            this.filterValues[column] = values;
            // Use the registered custom filter for arrays of SelectItem objects
            this.pxTable()!.filter(this.filterValues[column], column, 'chipArrayFilter');
        }
    }

   setChipFilter(column: string, values: any[]) {
        const v = Array.isArray(values) ? [...values] : [];
        this.filterValues[column] = v;
        this.onFilterChips({value: v}, column);
    }

    clearFilter(column: string) {
        if (this.pxTable && this.pxTable()) {
            this.filterValues[column] = [];
            this.pxTable()!.filter(null, column, 'equals');
        }
    }

    protected onButtonClick($event: MouseEvent, btn: PxTableButton, rowItem: any) {
        if (!btn) {
            return;
        }
        if (!btn.command) {
            return;
        }

        btn.command!($event, rowItem);
    }

    protected onSelectionChange(sel: any[]) {
        this.selectedRows = Array.isArray(sel) ? sel : [];
        const opts = this.inputOptions();
        opts?.selectionChanges$?.next([...this.selectedRows]);
    }

    protected onRowReorder(event: any) {
        const opts = this.inputOptions();
        if (opts?.onRowReorder) {
            opts.onRowReorder(event);
        }
        this.clearSortState();
    }

    protected onRowClick(event: MouseEvent, rowItem: any) {
        const opts = this.inputOptions();
        if (!opts?.onRowClick) return;
        const target = event.target as HTMLElement | null;
        // Ignore clicks originating from buttons or elements marked to prevent row click
        if (target && target.closest('button, .p-button, [data-prevent-row-click]')) {
            return;
        }
        opts.onRowClick(event, rowItem);
    }

    private tryApplyDefaultSort(): void {
        const table = this.pxTable && this.pxTable();
        const opts = this.options && this.options();
        if (!table || !opts) return;

        const ds = opts.defaultSort;
        if (!ds || !ds.fieldId) return;

        // Validate against visible & sortable columns only
        const targetCol = this.displayColumns().find((c) => c.id === ds.fieldId && c?.options?.enableSort === true);
        if (!targetCol) return;

        // Apply programmatic sort once
        (table as any).sortField = ds.fieldId;
        (table as any).sortOrder = ds.order; // 1 asc, -1 desc
        if ((table as any).sortSingle) {
            (table as any).sortSingle();
        } else if ((table as any).sort) {
            (table as any).sort({field: ds.fieldId, order: ds.order});
        }

        this.appliedDefaultSort = true;
    }

    private getByPath(obj: any, path: string) {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), obj);
    }

    private executeConversions(items: any[], cols: PxColumn[]) {
        items.forEach((item) => {
            cols.forEach((col) => {
                const source = this.getByPath(item, col.id);
                // Expose a synthetic flat property for dot-path ids to enable sorting/filtering/template access
                if (col.id && (col.id.includes('.') || (item as any)[col.id] === undefined)) {
                    (item as any)[col.id] = source;
                }
                (item as any).converted = {
                    ...(item as any).converted,
                    [col.id]: this.provideConversion(source, col)
                };
            });
        });
    }

    private convertDuration(source: any, col: PxColumn): string {
        if (source && typeof source === 'number') {
            return DurationParser.convertFromMs(source, true);
        }
        return '';
    }

    private provideConversion(source: any, col: PxColumn) {
        switch (col.family) {
            case PxColumnFamily.DURATION:
                return this.convertDuration(source, col);
            case PxColumnFamily.KEY:
            case PxColumnFamily.TEXT:
            case PxColumnFamily.LIST:
            case PxColumnFamily.CHIPS:
            default:
                return source;
        }
    }

    public clearSortState(): void {
        const table = this.pxTable && this.pxTable();
        if (!table) return;
        const anyTable = table as any;
        const hasSort =
            !!anyTable.sortField ||
            (Array.isArray(anyTable.multiSortMeta) && anyTable.multiSortMeta.length > 0);
        if (!hasSort) return;

        anyTable.sortField = null;
        anyTable.sortOrder = typeof anyTable.defaultSortOrder === 'number' ? anyTable.defaultSortOrder : 1;
        anyTable.multiSortMeta = null;
        if (anyTable.tableService && typeof anyTable.tableService.onSort === 'function') {
            anyTable.tableService.onSort(null);
        }
    }
}
