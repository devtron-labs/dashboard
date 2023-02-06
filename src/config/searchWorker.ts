/* eslint-disable no-restricted-globals */
export default () => {
    self.addEventListener('message', (e) => {
        const { searchText, list, searchInKeys } = e.data.payload
        switch (e.data.type) {
            case 'start':
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
