import React, { Component } from 'react'
import {ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import './hosturl.css'
import { CustomInput } from '../globalConfigurations/GlobalConfiguration'

interface HostURLState{
       value: string;
}

export default class HostURL extends Component<HostURLState> {
    constructor(props){
        super(props)
        this.state= ({
           value: ""
        })
    }
    handleOnChange(event){
     let newURL = event.target.value
    }

render(){
    return (
        <section className="git-page">
            <h2 className="form__title">Host URL</h2>
            <h5 className="form__subtitle">Host URL is the domain address at which your devtron dashboard can be reached. &nbsp; </h5>
            <div className="white-wrapper">
                <div className="hosturl__description">
                    <div>
                        <div className= "hosturl__icon">
                            <Info className="icon-dim-20 mr-8 " />
                            <div>Host URL is the domain address at which your devtron dashboard can be reached.</div>
                        </div>
                        <div className="ml-30">It is used to reach your devtron dashboard from external sources like configured webhooks, e-mail or slack notifications, grafana dashboard, etc.</div>
                   </div>
                </div>
                <div className="hosturl__container m-24">
                    <div className="form__row  ">
                            <CustomInput autoComplete="off" value={""} onChange={this.handleOnChange} error={"error"} name="name" label="Name*" />
                    </div>
                </div>
           </div>
           
        </section>
    )
}
}
