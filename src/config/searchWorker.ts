/* eslint-disable no-restricted-globals */
export default () => {
    function debounceSearch(callback: (...args: any[]) => void) {
        let timeout
        return (...args: any[]): void => {
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                callback.apply(self, args)
            }, 300)
        }
    }

    function getFilteredList({ searchText, list, searchInKeys }) {
        const searchTextLowerCased = searchText.toLowerCase()
        const filteredList = []
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < searchInKeys.length; j++) {
                if (list[i][searchInKeys[j]]?.toLowerCase().includes(searchTextLowerCased)) {
                    filteredList.push(list[i])
                    break
                }
            }
        }
        self.postMessage(filteredList)
    }

    self.addEventListener('message', (e) => {
        /**
         * Verifying the origin of the received message to be similar to 
         * from what our page is served on
         */
        if (e.data.payload?.origin !== self.location.origin) {
            return
        }

        switch (e.data.type) {
            case 'start':
                debounceSearch(getFilteredList)(e.data.payload)
                break
            case 'stop':
                self.postMessage([])
                self.close()
                break
            default:
                break
        }
    })
}
