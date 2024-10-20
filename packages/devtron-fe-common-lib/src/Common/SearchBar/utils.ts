import { ComponentSizeType } from '@Shared/constants'
import { SearchBarProps } from './types'

export const getSearchBarHeightFromSize = (size: SearchBarProps['size']): string => {
    switch (size) {
        case ComponentSizeType.large:
            return 'h-36'
        default:
            return 'h-32'
    }
}
