import moment from 'moment'

export function getOptions(customDate) {
    return [
        { value: 7, label: '7 days' },
        { value: 30, label: '30 days' },
        { value: 60, label: '60 days' },
        { value: 90, label: '90 days' },
        { value: customDate, label: 'Custom...' },
        { value: 0, label: 'No expiration' },
    ]
}

export const PermissionType = [
    { value: 'SPECIFIC', label: 'Specific permissions' },
    { value: 'SUPERADMIN', label: 'Superadmin permission' },
]

const millisecondsInDay = 86400000

export const getDateInMilliseconds = (days) => {
    let ms = 1 + new Date().valueOf() + days * millisecondsInDay
    return ms
}
