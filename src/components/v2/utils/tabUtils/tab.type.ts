export interface iLink {
    id?: number
    name?: string;
    icon?: string;
    className?: string;
    isSelected: boolean;
    isHidden?: boolean;
    status?: string;
    count?: number;
}

export interface iLinks extends Array<iLink> { }



