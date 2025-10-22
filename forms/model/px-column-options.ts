import {MenuItem, SelectItem} from "primeng/api";

export interface PxColumnOptions {
    subItems?: MenuItem[];
    enableSort?: boolean;
    enableFilter?: boolean;
    filterOptions?: SelectItem[];
    // Enables inline editing for this column when supported by the column family/editor
    editable?: boolean;
}
