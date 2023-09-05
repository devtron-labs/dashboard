export interface DebouncedSearchInterface {
    onSearch: (query: string) => void
    icon?: string
    placeholder?: string
    inputClass?: string
    containerClass?: string
    iconClass?: string
    children?: React.ReactNode
    debounceTimeout?: number
}
