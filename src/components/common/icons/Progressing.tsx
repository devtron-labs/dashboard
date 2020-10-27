import React from 'react';

export function Progressing({ pageLoader = false }) {
    const height = pageLoader ? '48px' : '20px';
    return (
        <div className="loader">
            <div style={{ width: height, height: height }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="loader__svg">
                    <g fill="none" fillRule="evenodd" strokeLinecap="round">
                        <animateTransform attributeName="transform" attributeType="XML" dur="0.5s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate" />
                        <path fill="#06C" fillRule="nonzero" d="M12 2.5A9.5 9.5 0 1 1 2.5 12a1.5 1.5 0 0 1 3 0A6.5 6.5 0 1 0 12 5.5a1.5 1.5 0 0 1 0-3z" />
                    </g>
                </svg>
            </div>
        </div>
    )
}