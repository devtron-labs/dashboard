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

import { useEffect } from 'react'

export default function Hotjar() {
    useEffect(() => {
        ;(function (h, o, t, j, a, r) {
            h.hj =
                h.hj ||
                function () {
                    ;(h.hj.q = h.hj.q || []).push(arguments)
                }
            h._hjSettings = { hjid: 1625078, hjsv: 6 }
            a = o.getElementsByTagName('head')[0]
            r = o.createElement('script')
            r.async = 1
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
            a.appendChild(r)
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
    }, [])
    return null
}

// demo cluster
// export default function Hotjar() {
//     useEffect(() => {
//         (function (h, o, t, j, a, r) {
//             h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments) };
//             h._hjSettings = { hjid: 2115797, hjsv: 6 };
//             a = o.getElementsByTagName('head')[0];
//             r = o.createElement('script'); r.async = 1;
//             r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
//             a.appendChild(r);
//         })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
//     }, [])
//     return null
// }
