import React from 'react'
import Tippy from '@tippyjs/react'
import { VariableListItemI } from './types'
import { TABLE_LIST_HEADINGS } from './constants'

const VariablesListItem = ({ data, className }: { data: string; className: string }) => (
    <div className={className}>
        <Tippy content={data} className="default-tt" placement="top">
            <p className="scoped-variables-list-item__data">{data}</p>
        </Tippy>
    </div>
)

const VariablesList = ({ variablesList }: { variablesList: VariableListItemI[] }) => {
    return (
        <div className="scoped-variables-list-container flex column dc__content-start dc__align-start bcn-0 dc__align-self-stretch">
            <div className="flex center dc__gap-32 bcn-0 dc__align-self-stretch pt-8 pb-8 pl-20 pr-20">
                <div className="variable-item-sm">
                    <p className="scoped-variables-list-item__heading">{TABLE_LIST_HEADINGS[0]}</p>
                </div>
                <div className="variable-item-lg">
                    <p className="scoped-variables-list-item__heading">{TABLE_LIST_HEADINGS[1]}</p>
                </div>
            </div>

            {variablesList?.map((variable) => (
                <div
                    className="scoped-variables-list-item flex center dc__align-self-stretch dc__gap-32 pt-12 pb-12 pl-20 pr-20"
                    key={variable.name}
                >
                    <VariablesListItem data={variable.name} className="variable-item-sm" />
                    <VariablesListItem data={variable.description} className="variable-item-lg" />
                </div>
            ))}
        </div>
    )
}

export default VariablesList
