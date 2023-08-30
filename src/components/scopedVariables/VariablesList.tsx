import React from 'react'
import Tippy from '@tippyjs/react'
import Grid from './Grid'
import { VariableListItemI } from './types'
import { TABLE_LIST_HEADINGS } from './constants'

const VariablesListItem = ({ data, classes, tooltip }: { data: string; classes: string; tooltip?: boolean }) => (
    <div className={classes}>
        {tooltip ? (
            <Tippy content={data} className="default-tt" placement="top">
                <p className="dc__ellipsis-right cn-9 ">{data}</p>
            </Tippy>
        ) : (
            <p className="dc__ellipsis-right cn-7">{data}</p>
        )}
    </div>
)

const VariablesList = ({ variablesList }: { variablesList: VariableListItemI[] }) => {
    return (
        <div className="scoped-variables-list-container flex column dc__content-start dc__align-start bcn-0 dc__align-self-stretch">
            <Grid container spacing={0} containerClass="w-100">
                <Grid item xs={2}>
                    <VariablesListItem
                        data={TABLE_LIST_HEADINGS[0]}
                        classes="pt-8 pb-8 pl-20 pr-20 flexbox dc__align-items-center"
                    />
                </Grid>

                <Grid item xs={9}>
                    <VariablesListItem
                        data={TABLE_LIST_HEADINGS[1]}
                        classes="pt-8 pb-8 pl-20 pr-20 flexbox dc__align-items-center"
                    />
                </Grid>

                {variablesList?.map((variable) => (
                    <Grid
                        container
                        spacing={0}
                        containerClass="w-100 scoped-variables-list-item dc__overflow-hidden"
                        key={variable.name}
                    >
                        <Grid item xs={3} itemClass="dc__ellipsis-right">
                            <VariablesListItem
                                data={variable.name}
                                classes="pt-12 pb-12 pl-20 pr-20 flexbox dc__align-items-center dc__border-bottom-n1"
                                tooltip
                            />
                        </Grid>

                        <Grid item xs={9} itemClass="dc__ellipsis-right">
                            <VariablesListItem
                                data={variable.description}
                                classes="pt-12 pb-12 pl-20 pr-20 flexbox dc__align-items-center dc__border-bottom-n1"
                                tooltip
                            />
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default VariablesList
