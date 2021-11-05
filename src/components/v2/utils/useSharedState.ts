import React, { useEffect, useState } from 'react'

export const useSharedState = function <T>(data: T, observable: any): [T] {

    const [value, setValue] = useState<T>(data)

    useEffect(() => {
        const sub = observable.subscribe((s: any) => {
            setValue(s)
        });

        return () => {
            sub.unsubscribe()
        }
    })

    return [value]
}
