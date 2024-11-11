export const setItemInLocalStorageIfKeyExists = (localStorageKey: string, value: string) => {
    if (localStorageKey) {
        localStorage.setItem(localStorageKey, value)
    }
}
