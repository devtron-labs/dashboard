import React, { Component } from 'react';
import {ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';
import { HostURLState, HostURLProps } from './hosturl.type';
import './hosturl.css';
import { Progressing, showError } from '../common';
import { ViewType } from '../../config';


export default class HostURL extends Component <HostURLProps, HostURLState> {
    constructor(props){
        super(props)
        this.state= ({
           view: ViewType.LOADING,
           statusCode: 0,
           value: "",
           saveLoading: false,
        })
    }

    handleChange(event){
     let newURL = event.target.value
    }

    onSave(){
      this.setState({
         // saveLoading: true
      })
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
                        <Warn className="icon-dim-16 mr-8 "/>
                        Auto-detected from your browser: &nbsp;
                        <button  className="hosturl__url"> http://cd.devtron.ai:32080/</button>
                   </div>
                   <div className="form__buttons pt-20">
                        <button type="submit" disabled={this.state.saveLoading} onClick={(e) => { e.preventDefault(); this.onSave() }} tabIndex={5} className="cta">
                            {this.state.saveLoading ? <Progressing /> : "Save"}
                        </button>
                </div>
           </div>
        </div>
        </section>
    )
}
}
