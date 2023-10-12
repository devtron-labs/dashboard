import React, { useEffect } from 'react'

export const useClickOutside = (ref: any, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (ref?.current && !ref.current.contains(e.target)) {
                callback()
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [ref, callback])
}
