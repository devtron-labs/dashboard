export interface iTab {
    id?: number
    name?: string;
    icon?: string;
    className?: string;
    isSelected: boolean;
    isHidden?: boolean;
    status?: string;
    count?: number;
}

export interface iTabs extends Array<iTab> { }



