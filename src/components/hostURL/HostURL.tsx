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
    handleChange(event){
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
                        <div className= "flex left">
                            <Info className="icon-dim-20 mr-8 " />
                            <div>Host URL is the domain address at which your devtron dashboard can be reached.</div>
                        </div>
                        <div className="ml-30">It is used to reach your devtron dashboard from external sources like configured webhooks, e-mail or slack notifications, grafana dashboard, etc.</div>
                   </div>
                </div>
                <div className="pl-20 pr-20">
                    <div className="flex column left top ">
                        <div className="gitops__id fw-5 fs-13 mb-8">Name*</div>
                        <input value={""} type="text" name="name" className="form__input" placeholder={ "Enter Host URL"}
                        onChange={(event) => this.handleChange(event)} />
                   </div>
                   <div className="hosturl__autodetection flex left pt-4">
                       <Info className="icon-dim-16  mr-8 "/>
                        Auto-detected from your browser: &nbsp;
                        <div className="hosturl__url"> http://cd.devtron.ai:32080/</div>
                   </div>
                </div>
           </div>
           
        </section>
    )
}
}
