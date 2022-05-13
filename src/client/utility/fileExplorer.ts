import { container, DockerFile, EnvConfig, LoadTable, StartUpObj ,image} from "../../types";


/**
 * Action helpers moved here for time being...
 */
 export const selectFile = async () :Promise<void> => {
  const response = await selectorModule.openFile();
  return response;
};

export const selectProjectRootDirectory = async () :Promise<void>=> {
  const response = await selectorModule.openDir();
  return response;
};


export const uploadTableData = async (values:LoadTable) :Promise<string>  => {
  const tablePath= values.tablePath
  const tableName=values.tableName
  let ext:string =""
  for(let i=tablePath.length-4;i<tablePath.length;i++){
    console.log(tablePath[i])
    ext += tablePath[i]
    console.log(ext)
  }
  if(ext!=='.csv') {
    return 'Please provide a .csv file'
  } 

  const response = await psUploadData.uploadData(tableName,tablePath)
  return response;



}



/**
 * Call electron to create a DockerFile with given details
 * @param {DockerFile} values
 * @returns {boolean}
 */
export const setDockerFile = async (values: DockerFile): Promise<boolean> => {
  return await dockController.createDockerfile(values);
}

/**
 * call electron to set rootDir env variable
 * @param {EnvConfig} values 
 * @returns {object}
 */
export const setProjectDirectory = async (values: EnvConfig): Promise<object> => {
  return await selectorModule.setProjectRoot(values.rootDir);
}

export const destructureImageList = (arr:image[]): string[] => {
  const newImageList :string[] = ['']
  arr.forEach((ele)=>{
    const curTag: string[] = ele['repoTags']
    if(curTag!==null){
    const string: string = curTag[0].substring(0,curTag[0].lastIndexOf(":"));
    newImageList.push(string);
  }
  })
  
  return newImageList
}


export const destructureContainerList = (arr:container[]):string[] => {
  
  const newContainerList:string[] = ['']
  arr.forEach((ele)=>{
    const curContainer: string = ele['names'][0]
    const containerName: string = curContainer.substring(curContainer.indexOf("/")+1);
    newContainerList.push(containerName);
  }
  )
  
  return newContainerList
}

export const destructureContainerId = (arr:container[]) => {
  
  const containerIdObj = {}

  arr.forEach((ele)=>{
    const curContainer: string = ele['names'][0]
    const containerName: string = curContainer.substring(curContainer.indexOf("/")+1);
    const curId: string = ele['id']
    containerIdObj[containerName] = curId
  }
  )
  
  return containerIdObj
}

export const runNewContainer = async (values:StartUpObj): Promise<string> => {
  const imageValue = values.selectedImage
  const containerName = values.container
  const port = values.port+'' 
  const response = await dockController.runContainer(imageValue,containerName,port)
  return response
   
}
export const buildImage = async (image:string):Promise<void> => {
  return await dockController.buildImage(image);
}
 

export const startContainer = async(containerId:string): Promise<boolean| string > => {
 
if(containerId===undefined){
    return false;
}
const response = await dockController.startContainer(containerId)
return response
}

export const stopContainer = async(containerId:string):Promise<boolean> => {
if(containerId===undefined){
    return false;
}
const response = await dockController.stopContainer(containerId)
return response
 
}

export const removeContainer = async(containerId: string): Promise<boolean> => {
  if(containerId ===undefined){
    return false;
  }
  console.log('remove file explorer')
  const response = await dockController.removeContainer(containerId)
  return response
}
