import React, {useRef, useEffect} from 'react'
import {VisibleModal} from '../modals/VisibleModal'
import './Drawer.scss'

interface drawerInterface{
    position : 'left' | 'right' | 'bottom' | 'top';
    children ?: any;
    backdrop ?: boolean;
    onClose ?: (e:any)=>void;
    width?: string;
    height?: string;
}

const Drawer:React.FC<drawerInterface> = ({children, position, height, width})=>{
    const drawerRef = useRef(null)
    useEffect(()=>{
        setTimeout(()=>drawerRef.current?.classList?.add('show'), 1)
        return ()=>drawerRef.current?.classList?.remove('show')
    },[])
    const style={}
    if(position === 'left' || position === 'right'){
        style['--width'] = width
    }
    if (position === 'top' || position === 'bottom') {
        style['--height'] = height
    }
    return (
        <VisibleModal className="drawer--container">
            <aside  style={style} ref={drawerRef} className={`drawer ${position}`}>
                {children}
            </aside>
        </VisibleModal>
    )
}

export default Drawer