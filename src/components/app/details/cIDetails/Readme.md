### Usage of dependencyState of useAsync hook in CIDetails.tsx and CDDetails.tsx

`BuildDetails` component shows list of `BuildCard`s in left column which are paginated 20 a time. As soon as `cIPipelineId` is changed from pipeline dropdown state; data inside `useAsync` hook becomes stale and hook gets to know about this change in next render.
For corrupted render we check if `dependencyState[0] === pipelineId` because ciPileineId is first dependency in `useAsync` hook.

Same happens in CDDetails as well.

### Detect bottom

Is a normal span element using `useIntersectionObserver` hook. As soon as span element comes into view, callback given to hook fires, and we increment the pagination. This pagination change effect is propagated to `useAsync` and new data is fetched.
