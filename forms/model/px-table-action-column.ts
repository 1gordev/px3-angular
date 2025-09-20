import {PxTableButton} from "@px/forms/model/px-table-button";

export interface PxTableActionColumn {
    headerBtns?: PxTableButton[];
    actionBtns?: PxTableButton[];
    width?: string;
}
