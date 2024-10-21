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

import { murmurhash3_32_gc } from './MurmurHash3'

export class Subject<T> {
    private observers: Map<number, (t: T) => void> = new Map()

    private name: string

    constructor() {
        this.name = Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, 5)
    }

    public subscribe(observer: (t: T) => void): [boolean, () => boolean] {
        const hash = murmurhash3_32_gc(observer.toString(), 0)
        if (this.observers.has(hash)) {
            return [
                false,
                () => {
                    return false
                },
            ]
        }
        this.observers.set(hash, observer)
        return [
            true,
            (): boolean => {
                return this.observers.delete(hash)
            },
        ]
    }

    public publish(topic: T) {
        const keys = Array.from(this.observers.keys())
        keys.forEach((key) => {
            this.observers.get(key)(topic)
        })
    }

    public unsubscribeAll() {
        const keys = Array.from(this.observers.keys())
        keys.forEach((key) => {
            this.observers.delete(key)
        })
    }

    public size(): number {
        return this.observers.size
    }
}
