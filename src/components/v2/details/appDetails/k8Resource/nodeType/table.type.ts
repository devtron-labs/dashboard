export interface Cell {
    value: string
    icon: string
    position: string
    link: string
    tooltip: string
    className: string
}

export interface Table {
   tHead: Cell[]
   tBody: Cell[][]
}