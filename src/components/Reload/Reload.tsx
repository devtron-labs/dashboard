import React from 'react'
import loadingFailure from '../../assets/img/ic-loading-failure.png';

export default function Reload({ reload = null }) {
    function refresh(e){
        window.location.reload();
    }
    return (
        <article className="flex" style={{ width: '100%', height: '100%' }}>
            <div className="flex column" style={{ width: '250px', textAlign: 'center' }}>
                <img src={loadingFailure} style={{ width: '100%', height: 'auto', marginBottom: '12px' }} alt="load-error" />
                <h3 className="title dc__bold">Failed to load</h3>
                <div className="empty__subtitle" style={{ marginBottom: '20px' }}>We could not load this page. Please give us another try.</div>
                <button type="button" className="cta ghosted" onClick={typeof reload === 'function' ? reload : refresh}>Retry</button>
            </div>
        </article>
    )
}