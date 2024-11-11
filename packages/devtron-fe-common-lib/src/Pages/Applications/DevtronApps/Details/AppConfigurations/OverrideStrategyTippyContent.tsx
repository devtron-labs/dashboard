const OverrideStrategyTippyContent = () => (
    <div className="p-12 flexbox-col dc__gap-20">
        <p className="m-0 fs-13 lh-20 cn-9 fw-4">
            Merge strategy determines how environment configurations are combined with inherited configurations
            configurations. Choose the strategy that best suits your needs:
        </p>

        <ul className="pl-12 m-0-imp">
            <li className="m-0 fs-13 lh-20 cn-9 fw-4">
                <strong className="m-0 fw-6">Replace:</strong>&nbsp;Overwrites inherited values with
                environment-specific ones. Use when you want to completely change inherited settings.
            </li>
        </ul>
    </div>
)

export default OverrideStrategyTippyContent
