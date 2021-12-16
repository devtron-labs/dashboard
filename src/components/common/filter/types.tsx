export interface FilterOption {
    key: number | string;
    label: string;
    isSaved: boolean;
    isChecked: boolean;
}

export interface FilterProps {
    list: FilterOption[];
    labelKey: string;
    placeholder: string;
    buttonText: string;
    type: string;
    searchable?: boolean;
    multi?: boolean;
    applyFilter: (type: string, list: FilterOption[]) => void;
    badgeCount?: number;
}

export interface FilterState {
    list: FilterOption[];
    filteredList: FilterOption[];
    searchStr: string;
    show: boolean;
}