import React, { Component } from 'react';
import {ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-info-error.svg';
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
           value: window.location.hostname,
           saveLoading: false,
           hostStoreName: "",
        })
    }

    handleChange(event){
     let newURL = event.target.value
     this.setState({
         hostStoreName: newURL
     })
    }

    onSave(){
      this.setState({
         // saveLoading: true
      })
    }
    handleHostURLLocation(value:string):void{
        this.setState({hostStoreName: value})
    }

    renderHostErrorMessage(){
        return<div className="hosturl__error ml-20 mr-20 mb-16 flex left">
        <Error className= "icon-dim-20 mr-8"/>
        <div>Saved host URL doesn’t match the domain address in your browser.</div>
       </div>
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
                
                { (this.state.value == this.state.hostStoreName) ? '' : this.renderHostErrorMessage()  }
                <div className="pl-20 pr-20">
                    <div className="flex column left top ">
                        <div className="gitops__id fw-5 fs-13 mb-8">Host URL*</div>
                        <input id="host" value={this.state.hostStoreName}  type="text" className="form__input" placeholder={ "Enter Host URL"}
                        onChange={(event) => this.handleChange(event)} />
                   </div>
                   <div className="hosturl__autodetection flex left pt-4">
                        <Warn className="icon-dim-16 mr-8 "/>
                        Auto-detected from your browser: &nbsp;
                        <button onClick={(e)=>this.handleHostURLLocation(this.state.value)} className="hosturl__url"> {window.location.hostname}</button>
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
