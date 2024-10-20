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

/* eslint-disable no-fallthrough */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */

export function murmurhash3_32_gc(key, seed) {
    let remainder
    let bytes
    let h1
    let h1b
    let c1
    let c1b
    let c2
    let c2b
    let k1
    let i

    remainder = key.length & 3 // key.length % 4
    bytes = key.length - remainder
    h1 = seed
    c1 = 0xcc9e2d51
    c2 = 0x1b873593
    i = 0

    while (i < bytes) {
        k1 =
            (key.charCodeAt(i) & 0xff) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24)
        ++i

        k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
        k1 = (k1 << 15) | (k1 >>> 17)
        k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff

        h1 ^= k1
        h1 = (h1 << 13) | (h1 >>> 19)
        h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff
        h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16)
    }

    k1 = 0

    switch (remainder) {
        // @ts-expect-error
        case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16
        // @ts-expect-error
        case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8
        case 1:
            k1 ^= key.charCodeAt(i) & 0xff

            k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
            k1 = (k1 << 15) | (k1 >>> 17)
            k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
            h1 ^= k1
    }

    h1 ^= key.length

    h1 ^= h1 >>> 16
    h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
    h1 ^= h1 >>> 13
    h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff
    h1 ^= h1 >>> 16

    return h1 >>> 0
}
