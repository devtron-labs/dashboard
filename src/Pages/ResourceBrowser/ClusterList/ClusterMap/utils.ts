const createMeasurementSvg = (fontSize: number, fontWeight: number) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    // Hide it from view
    svg.style.position = 'absolute'

    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textElement.setAttribute('x', '0')
    textElement.setAttribute('y', '0')
    textElement.setAttribute('font-size', `${fontSize}px`)
    textElement.setAttribute('font-weight', `${fontWeight}`)
    textElement.setAttribute(
        'font-family',
        "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
    )

    svg.appendChild(textElement)
    document.body.appendChild(svg)

    return { svg, textElement }
}

export const getVisibleSvgTextWithEllipsis = (() => {
    let svgInstance: SVGSVGElement | null = null
    let textElementInstance: SVGTextElement | null = null

    return ({ text = '', maxWidth = 0, fontSize = 16, fontWeight = 400 }) => {
        if (!svgInstance || !textElementInstance) {
            const { svg, textElement } = createMeasurementSvg(fontSize, fontWeight)
            svgInstance = svg
            textElementInstance = textElement
        }

        const textElement = textElementInstance
        textElement.textContent = '...'
        const ellipsisWidth = textElement.getBBox().width

        let start = 0
        let end = text.length

        while (start < end) {
            const mid = Math.floor((start + end) / 2)
            textElement.textContent = text.slice(0, mid + 1)

            const currentWidth = textElement.getBBox().width
            if (currentWidth + ellipsisWidth > maxWidth - 8) {
                end = mid
            } else {
                start = mid + 1
            }
        }

        const visibleText = text.slice(0, start) + (start < text.length ? '...' : '')

        return visibleText
    }
})()
