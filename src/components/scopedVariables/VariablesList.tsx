import React from 'react'
import Tippy from '@tippyjs/react'
import { VariableListItemI } from './types'
import { TABLE_LIST_HEADINGS } from './constants'

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
                    <div key={variable.name} className="variable-item-sm">
                        <Tippy content={variable.name} className="default-tt" placement="top">
                            <p className="scoped-variables-list-item__data">{variable.name}</p>
                        </Tippy>
                    </div>

                    <div key={variable.description} className="variable-item-lg">
                        <Tippy content={variable.name} className="default-tt" placement="top">
                            <p className="scoped-variables-list-item__data">{variable.description}</p>
                        </Tippy>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default VariablesList
