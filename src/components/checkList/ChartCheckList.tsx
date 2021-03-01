import React, { Component } from 'react';
import { ViewType } from '../../config';
//import { renderSampleApplication } from './AppCheckList'
const DefaultAppCheckList = {
    gitOps: false,
    project: false,
    git: false,
    environment: false,
    docker: false,
    hostUrl: false,
}

const DefaultChartCheckList = {
    gitOps: false,
    project: false,
    environment: false,
}

export class ChartCheckList extends Component{
    constructor(props){
        super(props)
        this.state = ({
            view: ViewType.LOADING,
            statusCode: 0,
            isAppCollapsed: true,
            isChartCollapsed: false,
            saveLoading: false,
            form: {
                appChecklist: {
                    ...DefaultAppCheckList
                },
                chartChecklist: {
                    ...DefaultChartCheckList
                }
            }
        })
    }
    render(){
        return(<>
          //  renderSampleApplication
          </>
        )
    }
}