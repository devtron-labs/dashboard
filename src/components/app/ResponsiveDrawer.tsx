import { useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib';
import React, {useEffect} from 'react'
import { useWindowSize } from '../common';

export default function ResponsiveDrawer({ initialHeight = 36, minHeight = 100, defaultHeight = 500, minimumTopMargin = 100, isDetailedView, onHeightChange = null, className = "", children, anchor=null }) {
    let dimensions = useWindowSize()
    const { height: windowHeight, width } = dimensions || { height: 0, width: 0 }
    const [height, setHeight] = React.useState(initialHeight)
    const maxHeight = windowHeight - minimumTopMargin
    let timeout;
    const resize = e => {
        e.stopPropagation();
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(function () {
            const height2 = window.innerHeight - e.clientY
            if (height2 < minHeight) {
                setHeight(minHeight)
            } else if (height2 > maxHeight) {
                setHeight(maxHeight)
            }
            else setHeight(height2)
        });
    }

    useEffect(() => {
        if (isDetailedView) {
            setHeight(defaultHeight)
        }
        else {
            setHeight(initialHeight)
        }
    }, [isDetailedView])

    useEffectAfterMount(() => {
        const maximumAllowedHeight = windowHeight - 200;
        if (height > maximumAllowedHeight && maximumAllowedHeight > minHeight) setHeight(maximumAllowedHeight);
    }, [windowHeight])

    useEffectAfterMount(() => {
        if (typeof onHeightChange === 'function') {
            onHeightChange(height);
        }
    }, [height])

    const stopResize = (e) => {
        window.removeEventListener('mousemove', resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }

    const initResize = (e) => {
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    return (
        <section className={`${className} ${isDetailedView ? 'detailed' : ''}`} style={{ height: `${height}px` }}>
            {React.Children.map(anchor, (child) => {
                return React.cloneElement(child, {
                    onMouseDown: isDetailedView ? initResize : null,
                });
            })}
            {children}
        </section>
    );
}