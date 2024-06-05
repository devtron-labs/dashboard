/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-restricted-globals */
export default () => {
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
                getFilteredList(e.data.payload)
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
