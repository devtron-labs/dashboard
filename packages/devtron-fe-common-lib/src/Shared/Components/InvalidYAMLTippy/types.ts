import { TooltipProps } from '@Common/Tooltip/types'

export interface InvalidYAMLTippyWrapperProps {
    parsingError: string
    restoreLastSavedYAML?: () => void
    children: TooltipProps['children']
}
