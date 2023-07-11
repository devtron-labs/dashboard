export const getLabel = (isOverrideView, defaultData, data): string => {
    if (isOverrideView) {
        if (defaultData) {
            return data ? 'Overridden' : 'Inheriting'
        } else {
            return 'env'
        }
    }
    return ''
}
