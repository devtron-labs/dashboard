export function isEmpty(obj): boolean {
    if (obj === null || obj === undefined || obj === '' || obj === '{}') {
        return true
    } else {
        return false
    }
}
