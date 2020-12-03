import { useEffect } from "react"

export default function Hotjar() {
    useEffect(() => {
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments) };
            h._hjSettings = { hjid: 1625078, hjsv: 6 };
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script'); r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
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