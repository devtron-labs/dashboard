## Routes

## Components 

##### CommandErrorBoundary 
`Root Component of Command. 
 Renders page header and routes`
##### Command
`Main Command bar component`

###### Props
| Props              | Description                 |
| ------------------ | --------------------------- |
| isCommandBarActive | Shows or hides command bar  |
| toggleCommandBar   | Function to close the Modal |

###### State
| State                 | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| isLoading             | loading suggestions                                        |
| focussedArgument      | index of the focussed argument in suggestedArguments array |
| argumentInput         | argument input text |
| isSuggestionError     | Shows/hides error on selection on invalid argument |
| arguments             | Save CVE Callback from parent |
| tab                   | 'this-app' or 'jump-to' |
| command               | Array of first arguments |
| allSuggestedArguments | array of all suggested arguments |
| suggestedArguments    | Save CVE Callback from parent |
| groupName             | Save CVE Callback from parent |

