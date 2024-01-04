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
