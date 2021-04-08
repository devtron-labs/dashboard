import React, { useRef, useEffect } from 'react'
import { VisibleModal } from '../modals/VisibleModal'
import './Drawer.scss'

interface drawerInterface {
    position: 'left' | 'right' | 'bottom' | 'top';
    children?: any;
    backdrop?: boolean;
    onClose?: (e: any) => void;
    width?: string;
    height?: string;
}

const Drawer: React.FC<drawerInterface> = ({ children, position, height, width, onClose }) => {
    const drawerRef = useRef(null)
    useEffect(() => {
        setTimeout(() => drawerRef.current?.classList?.add('show'), 1)
        return () => { setTimeout(() => { console.log(1); drawerRef.current?.classList?.remove('show') }, 1) }
    }, [])
    const style = {}
    if (position === 'left' || position === 'right') {
        style['--width'] = width
    }
    if (position === 'top' || position === 'bottom') {
        style['--height'] = height
    }
    return (
        <VisibleModal className="drawer--container" close={onClose}>
            <aside style={style} ref={drawerRef} className={`drawer ${position}`}>
                {children}
            </aside>
        </VisibleModal>
    )
}

export default Drawer