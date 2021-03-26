import React, { Component } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';

interface CDHeaderProps {
    close: () => void;
}

export default class CDHeader extends Component<CDHeaderProps, {}>{
    render() {
        return (
            <div>
                <div className="flex left mt-20">
                    <div className="fs-16 fw-6 pl-20 ">Create deployment pipeline</div>
                    <button type="button" className="transparent m-auto-mr-20" onClick={this.props.close}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <hr className="divider" />
            </div>
        )
    }
}
