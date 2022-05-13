const { contextBridge, ipcRenderer } = require("electron");
import { container, DockerFile, image } from './types';


contextBridge.exposeInMainWorld("selectorModule", {
  openFile: async () => {
    console.log("hello!")
    const response = await ipcRenderer.invoke("open");
    return response;
  },

  openDir: async ()=> {
    
    const response = await ipcRenderer.invoke("dir");
    return response;
  },

  setProjectRoot: async (rootdir: string)=> {
    return await ipcRenderer.invoke("setProjectRoot", rootdir);
  },

});

contextBridge.exposeInMainWorld("dockController", {
  createDockerfile: async (dockerfile:DockerFile) => {
    return await ipcRenderer.invoke('createDockerfile', dockerfile);
  },
  buildImage: async(imageName:string) => {
    return await ipcRenderer.invoke('buildImage', imageName);
  },
  runContainer: async(imageName: string, containerName:string, port:string) => {
    return await ipcRenderer.invoke('runContainer', imageName, containerName, port)
  }, 
  startContainer: async (containerId:string):Promise<void> => {
    return await ipcRenderer.invoke('startContainer', containerId)
  },
  stopContainer: async (containerId:string):Promise<void> => {
    return await ipcRenderer.invoke('stopContainer', containerId)
  },
  removeContainer: async (containerId:string):Promise<void> => {
    console.log('remove preload')
    return await ipcRenderer.invoke('removeContainer', containerId)
  },
  getContainersList: async ():Promise<container[]>  => {
    return await ipcRenderer.invoke('getContainers')
  },
  getImagesList: async ():Promise<image[]> => {
    return await ipcRenderer.invoke('getImages')
  },
  
  runNewResult: (callback:Function) => {
    ipcRenderer.once('runResult', ( _event: Event, arg: boolean|string) => {
      console.log('listening')
      callback(arg)
  })
  },

  buildImageResult: (callback:Function) => {
    ipcRenderer.once('buildImageResult', (_event: Event, arg: boolean|string) => {
    console.log('received buildImageResult', arg)
    callback(arg)
  })
  },

  startContainerResult: (callback:Function) => {
    ipcRenderer.once('startContainerResult', (_event: Event, arg: boolean|string) => {
      callback(arg)
      console.log('received startContainerResult', arg)
    })
  },


  stopContainerResult: (callback:Function) => {
    ipcRenderer.once('stopContainerResult', (_event: Event, arg: boolean|string) => {
      console.log('received stopContainerResult', arg)
      callback(arg)
    })
  },

  removeContainerResult:(callback:Function)=>{
    ipcRenderer.once('removeContainerResult', (_event: Event, arg: boolean|string) => {
        console.log('received removeContainerResult', arg)
        callback(arg)
    })
  }
})

contextBridge.exposeInMainWorld("psUploadData", {
  uploadData: async (table:string,sqlSchema:string) => {
    const response = await ipcRenderer.invoke("uploadData", table, sqlSchema);
    return response;
  },

  DatabaseResult: async (callback:Function) => {
    ipcRenderer.once('DatabaseResult', (_event: Event, arg: boolean|string) => {
      console.log('received Database Result', arg)
      callback(arg)
    })
  },

   
  
})







// ipcRenderer.on('removeContainerResult', (_event, arg) => {
//   //buildImageResult(arg);
//   console.log('received removeContainerResult', arg)
// })
