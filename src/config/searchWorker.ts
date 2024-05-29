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

    function getFilteredList({ searchText, list }) {
        const searchTextLowerCased = searchText.toLowerCase()
        if (searchTextLowerCased === '' || !list?.length) {
            self.postMessage(list)
            return
        }
        self.postMessage(
            list.filter((item) =>
                Object.entries(item).some(
                    ([key, value]) => key !== 'id' && String(value).toLowerCase().includes(searchTextLowerCased),
                ),
            ),
        )
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
