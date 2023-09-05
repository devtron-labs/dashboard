export interface DebouncedSearchProps {
    onSearch: (query: string) => void
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    placeholder?: string
    inputClass?: string
    containerClass?: string
    iconClass?: string
    children?: React.ReactNode
    debounceTimeout?: number
}
