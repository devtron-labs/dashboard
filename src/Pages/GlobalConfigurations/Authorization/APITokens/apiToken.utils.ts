export function getOptions(customDate) {
    return [
        { value: 7, label: '7 days' },
        { value: 30, label: '30 days' },
        { value: 60, label: '60 days' },
        { value: 90, label: '90 days' },
        { value: customDate, label: 'Custom' },
        { value: 0, label: 'No expiration' },
    ]
}

const millisecondsInDay = 86400000

export const getDateInMilliseconds = (days) => {
    return 1 + new Date().valueOf() + (days ?? 0) * millisecondsInDay
}

export const isTokenExpired = (expiredDate: number): boolean => {
    if (expiredDate === 0) {
        return false
    }

    return getDateInMilliseconds(new Date().valueOf()) > getDateInMilliseconds(expiredDate)
}
