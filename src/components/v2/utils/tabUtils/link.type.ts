export interface iLink {
    id?: number
    name?: string;
    icon?: string;
    className?: string;
    isSelected: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    status?: string;
    count?: number;
    url?: string;
}

export interface iLinks extends Array<iLink> { }



