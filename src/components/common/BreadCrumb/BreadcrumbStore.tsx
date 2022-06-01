import React, { createContext, useState } from 'react'

const initialState = {
    alias: {},
}

const Store = ({ children }) => {
    const [state, setState] = useState(initialState)
    return <BreadcrumbContext.Provider value={{ state, setState }}>{children}</BreadcrumbContext.Provider>
}

export const BreadcrumbContext = createContext({
    state: { alias: {} },
    setState: null,
})

export function useBreadcrumbContext() {
    const context = React.useContext(BreadcrumbContext)
    if (!context) {
        throw new Error(`breadcrumb components cannot be used outside Breadcrumb context`)
    }
    return context
}

export default Store
