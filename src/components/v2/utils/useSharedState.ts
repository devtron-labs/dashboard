import React, { useEffect, useState } from 'react'
import { Observable } from 'rxjs';

export const useSharedState = function <T>(data: T, observable: Observable<T>): [T] {

    const [value, setValue] = useState<T>(data)

    useEffect(() => {
        const sub = observable.subscribe((s: T) => {
            setValue(s)
        });

        return () => {
            sub.unsubscribe()
        }
    },[observable])

    return [value]
}