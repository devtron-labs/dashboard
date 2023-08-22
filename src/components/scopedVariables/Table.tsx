import React from 'react'
import { TableItemI, TableListI } from './types'

export const TableList = ({ children, width, headings }: TableListI) => {
    return (
        <div className={`scoped-variables-list-container`}>
            <div className="scoped-variables-list-header">
                {headings?.map((heading, index) => (
                    <div style={{ width: width[index] }} key={heading}>
                        <div className="scoped-variables-list-item__heading">{heading}</div>
                    </div>
                ))}
            </div>

            {children}
        </div>
    )
}

export const TableItem = ({ columnsData, width }: TableItemI) => {
    return (
        <div className="scoped-variables-list-item">
            {columnsData?.map((item, index) => (
                <div style={{ width: width[index] }} key={`${item}-${width}`}>
                    <div className="scoped-variables-list-item__data">{item}</div>
                </div>
            ))}
        </div>
    )
}
