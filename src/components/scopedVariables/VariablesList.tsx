import React from 'react'
import Tippy from '@tippyjs/react'
import { VariableListItemI } from './types'
import { TABLE_LIST_HEADINGS } from './constants'

const VariablesListItem = ({data, className}: {data: string, className: string}) => (
    <div className={className}>
        <Tippy content={data} className="default-tt" placement="top">
            <p className="scoped-variables-list-item__data">{data}</p>
        </Tippy>
    </div>
)

const VariablesList = ({ variablesList }: { variablesList: VariableListItemI[] }) => {
    return (
        <div className="scoped-variables-list-container">
            <div className="scoped-variables-list-header">
                <div className="variable-item-sm">
                    <p className="scoped-variables-list-item__heading">{TABLE_LIST_HEADINGS[0]}</p>
                </div>
                <div className="variable-item-lg">
                    <p className="scoped-variables-list-item__heading">{TABLE_LIST_HEADINGS[1]}</p>
                </div>
            </div>

            {variablesList?.map((variable) => (
                <div className="scoped-variables-list-item" key={variable.name}>
                    <VariablesListItem data={variable.name} className="variable-item-sm" />
                    <VariablesListItem data={variable.description} className="variable-item-lg" />
                </div>
            ))}
        </div>
    )
}

export default VariablesList
