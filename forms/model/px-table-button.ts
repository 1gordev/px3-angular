export interface PxTableButton {
    icon?: string;
    tooltip?: string;
    label?: string;
    variant?: 'text' | 'outlined';
    severity?: 'success' | 'info' | 'warn' | 'danger';
    command?: (event: any, rowItem: any) => void;
}
