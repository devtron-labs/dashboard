export interface PaginationProps {
    size: number
    pageSize: number
    offset: number
    changePage: (pageNo) => void
    changePageSize?: (pageSize) => void
    isPageSizeFix?: boolean
}

export interface PaginationState {
    show: boolean
    options: { value: number; selected: boolean }[]
    pages: Page[]
}

export interface Page {
    value: number
    selected: boolean
    isVisible: boolean
}
