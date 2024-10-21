import { ReactNode, TransitionEvent } from 'react'

export interface CollapseProps {
    expand: boolean
    children: ReactNode
    onTransitionEnd?: (e: TransitionEvent<HTMLDivElement>) => void
}
