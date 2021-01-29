On entering the tests tab the TestRunList component is rendered.

In the initial time the loading phase is rendered, when pipelines are loading.
When loading is complete and there's no pipeline the text "Reports for executed test..."is rendered.

An API call to /app/appID/ci-pipeline/min is made to fetch the results of the available pipelines through getCIPipeline method. This is the last case in the Routes.

When any pipeline is selected, route is changed to /tests/pipelineId and testsfilter is rendered (contains triggerlist) along with CI selector and datepicker.

Triggerlist in testsfilter calls gettriggerlist

On clicking any particular row in the table we get redirected to 

/appid/tests/pipelineid/triggerid. Here again testsfilter is called and it comprises of testrundetails.

Testrundetails make an API call through getTestSuites and fetches all the details.

PieCharts and TestsChart are rendered through the testsChart and testsDuration component respectively

TestSuites and TestSuite are part of the TestSuite component>

Drawer is rendered through the Drawer component.

getTestCase fetches the data through /test/cases/testcaseID
