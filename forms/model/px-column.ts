import {PxColumnFamily} from "@px/forms/model/px-column-family";
import {PxColumnTextKind} from "@px/forms/model/px-column-text-kind";
import {PxColumnListKind} from "@px/forms/model/px-column-list-kind";
import {PxColumnOptions} from "@px/forms/model/px-column-options";
import {PxColumnBooleanKind} from "@px/forms/model/px-column-boolean-kind";

export interface PxColumn {
    id: string;
    family: PxColumnFamily;
    kind?: PxColumnBooleanKind | PxColumnTextKind | PxColumnListKind;
    label?: string;
    globalFilter?: boolean;
    tooltip?: string;
    width?: string;
    template?: any;
    options?: PxColumnOptions;
}
