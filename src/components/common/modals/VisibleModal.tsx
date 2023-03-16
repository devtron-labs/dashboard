import React from 'react'
import ReactDOM from 'react-dom'

export class VisibleModal extends React.Component<{
    className: string
    parentClassName?: string
    noBackground?: boolean
    close?: (e) => void
    onEscape?: (e) => void
}> {
    modalRef = document.getElementById('visible-modal')
    constructor(props) {
        super(props)
        this.escFunction = this.escFunction.bind(this)

    }

    escFunction(event) {
        if (event.keyCode === 27 || event.key === 'Escape') {
            if (this.props.onEscape) {
                this.props.onEscape(event)
            } else if (this.props.close) {
                this.props.close(event)
            }
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunction)
        this.modalRef.classList.add(this.props.noBackground ? 'show' : 'show-with-bg')

        if (this.props.parentClassName) {
            this.modalRef.classList.add(this.props.parentClassName)
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunction)
        this.modalRef.classList.remove('show')
        this.modalRef.classList.remove('show-with-bg')

        if (this.props.parentClassName) {
            this.modalRef.classList.remove(this.props.parentClassName)
        }
    }

    render() {
        return ReactDOM.createPortal(
            <div className={`visible-modal__body ${this.props.className}`} onClick={this.props?.close}>
                {this.props.children}
            </div>,
            document.getElementById('visible-modal'),
        )
    }
}
