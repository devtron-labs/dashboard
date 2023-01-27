export interface PageSizeOption {
    value: number
    selected: boolean
}
export interface PaginationProps {
    size: number
    pageSize: number
    offset: number
    changePage: (pageNo: number) => void
    changePageSize?: (pageSize: number) => void
    isPageSizeFix?: boolean
    pageSizeOptions?: PageSizeOption[]
    rootClassName?: string
}

export interface PaginationState {
    show: boolean
    options: PageSizeOption[]
    pages: Page[]
}

export interface Page {
    value: number
    selected: boolean
    isVisible: boolean
}
