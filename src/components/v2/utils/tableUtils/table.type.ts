export interface tCell {
    value: string
    icon: string
    position: string
    link: string
    tooltip: string
    className: string
}

export interface Table {
   tHead: tCell[]
   tBody: tCell[][]
}