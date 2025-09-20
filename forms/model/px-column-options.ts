import {MenuItem, SelectItem} from "primeng/api";

export interface PxColumnOptions {
    subItems?: MenuItem[];
    enableSort?: boolean;
    enableFilter?: boolean;
    filterOptions?: SelectItem[];
}
