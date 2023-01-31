import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'
export const Modal = ({ style = {}, children, modal = false, rootClassName = "", onClick = null, callbackRef = null, preventWheelDisable = false }) => {
    const innerRef = React.useRef(null)
    function handleClick(e) {
        if (typeof onClick !== 'function') return
        if (innerRef && innerRef.current?.contains(e.target)) {
            onClick(e, 'in')
        }
        else {
            onClick(e, 'out')
        }
    }

    function disableWheel(e) {
      if(!e.target.classList?.contains('dc__resizable-textarea')){
        if (innerRef && innerRef.current.contains(e.target)) {
          if (innerRef.current.clientHeight === innerRef.current.scrollHeight) {
              e.preventDefault();
          }
      }
      else {
          e.preventDefault();
      }
      }

    }
    useEffect(() => {
        document.addEventListener('click', handleClick)
        let modal = document.getElementById("visible-modal");
        if (modal) modal.classList.add("show")
        if (!preventWheelDisable) document.body.addEventListener('wheel', disableWheel, { passive: false })
        return () => {
          if (!preventWheelDisable) document.body.removeEventListener('wheel', disableWheel)
          document.removeEventListener('click', handleClick)
          if (modal) modal.classList.remove('show')

        }
    }, []
    )
    return ReactDOM.createPortal(
        <div tabIndex={0} onClick={onClick}
            ref={
                el => {
                    if (typeof callbackRef === 'function') {
                        callbackRef(el);
                    }
                    innerRef.current = el;
                }
            }
            id="popup"
            className={`${rootClassName} popup ${modal ? 'modal' : ''}`}
            style={{ ...style }}>
            {children}
        </div>, document.getElementById('visible-modal'));
}