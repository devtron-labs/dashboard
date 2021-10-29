export interface iTab {
    id?: number
    name: string;
    icon: string;
    className?: string;
    isSelected: boolean;
}

export interface iTabs extends Array<iTab> { }
