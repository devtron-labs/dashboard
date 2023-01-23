import React, { useEffect, useRef } from 'react'
import { useIntersection } from './helpers/Helpers'

export default function DetectBottom({ callback }: { callback: () => void }) {
    const target = useRef<HTMLSpanElement>(null)
    const intersected = useIntersection(target, {
        rootMargin: '0px',
        once: false,
    })

    useEffect(() => {
        if (intersected) {
            callback()
        }
    }, [intersected])

    return <span className="pb-5" ref={target}></span>
}
