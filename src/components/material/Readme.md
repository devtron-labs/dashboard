## Routes
- app/`${appId}`/edit/materials

## Components 

##### MaterialList 
- Root Component
- API calls -> GET List of materials and GET List of providers
- State is set only once in componentDidMount
- Handles validation of checkout path; required by CreateMaterial and UpdateMaterial
- Renders a CreateMaterial and UpdateMaterial for each saved material

##### CreateMaterial
- Creates new material
- Stateful component
- API calls -> POST Create material
- Manages all interactions of create material

##### UpdateMaterial
- Updates saved material
- Stateful component
- API calls -> POST update material
- Manages all interactions of update material

##### MaterialView
- Stateless component
- Used by CreateMaterial & UpdateMaterial
