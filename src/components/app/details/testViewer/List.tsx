import React, { useState } from 'react'
import { ReactComponent as Sort } from '../../../../assets/icons/misc/sort-up.svg'
import { not } from '@devtron-labs/devtron-fe-common-lib'

interface ListInterface {
    collapsible?: boolean;
    children?: any;
    className?: string;
}

interface ListComposition {
    Icon?: React.FC<any>;
    Body?: React.FC<any>;
    Detail?:React.FC<any>;
}

const ListContext = React.createContext(null)

function useListContext() {
    const context = React.useContext(ListContext)
    if (!context) {
        throw new Error(
            `List compound components cannot be rendered outside the List component`,
        )
    }
    return context
}

const List: React.FC<ListInterface> & ListComposition = ({ children, collapsible = false, ...props }) => {
    const [collapsed, toggleCollapsed] = useState(true)
    function handleClick(e){
        e.stopPropagation();
        if(collapsible){
            toggleCollapsed(not)
        }
    }
    return (
        <ListContext.Provider value={{ collapsed }}>
            <article {...props} onClick={handleClick} className={`${props.className || ''} ${collapsible ? 'collapsible' : 'not-collapsible'}`}>
                {collapsible && <Sort className="rotate" style={{ ['--rotateBy' as any]: collapsed ? '90deg' : '180deg' }} />}
                {children}
            </article>
        </ListContext.Provider>
    )
}
List.Icon = function ({ src = null, children = null, ...props }){
    return (
        <>
            {src && <img src={src} {...props} />}
            {children}
        </>
    )
}

List.Body = function({children=null}){
    return children
}

function Detail({children=null}){
    const {collapsed } = useListContext()
    return collapsed ? null : children
}

List.Detail = Detail
export default List