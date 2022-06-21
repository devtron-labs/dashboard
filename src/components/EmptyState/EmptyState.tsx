import React from 'react'
import './emptyState.scss';
import { ReactComponent as Progressing } from '../../assets/icons/ic-progressing.svg';

function EmptyState({ children }) {
    return (
        <div className="flex column empty-state" style={{ width: '100%', height: '100%' }}>
            {children}
        </div>
    )
}

function Image({ children }) {
    return children
}

function Title({ children }) {
    return children
}

function Subtitle({ children, className }:{children: any, className?: string}) {
    return <p className={`subtitle ${className}`}>{children}</p>
}

function Button({ children }) {
    return children
}

const Loading: React.FC<{ text: string }> = function (props) {
    return <>
        <Progressing className="block empty-state__loader" />
        <p className="empty-state__loading-text">{props.text}</p>
    </>
}

EmptyState.Image = Image
EmptyState.Title = Title
EmptyState.Subtitle = Subtitle
EmptyState.Button = Button
EmptyState.Loading = Loading

export default EmptyState