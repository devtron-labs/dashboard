import React from 'react';
import { ReactComponent as Info } from '../../../assets/icons/appstatus/info-filled.svg';

export function NoEvents({ title = "Events not available" }) {
    return <div style={{ width: '100%', textAlign: 'center' }}>
        <Info className="" />
        <div style={{ marginTop: '20px', color: 'rgb(156, 148, 148)' }}>{title}</div>
    </div>
}

export function NoContainer({ selectMessage = "Select a container to view events", style = {} }) {
    return <div className="no-pod no-pod--container" style={{ ...style }}>
        <div className="no-pod__container-icon">
            {Array(6).fill(0).map((z, idx) => <span key={idx} className="no-pod__container-sub-icon"></span>)}
        </div>
        <p>{selectMessage}</p>
    </div>
}