import React from 'react'
import { useRef } from 'react'
import { useIntersection } from '../helpers/Helpers'

const LazyImage: React.FC<React.ComponentProps<'img'>> = (props) => {
    const target = useRef<HTMLSpanElement>(null)
    const intersected = useIntersection(target, {
        rootMargin: '250px',
        once: true,
    })

    return <span ref={target}>{intersected && <img {...props} alt="" />}</span>
}

export default LazyImage
