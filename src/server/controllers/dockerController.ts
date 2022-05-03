
const lfs = require('fs');
const lpath = require('path');
const Docker = require('dockerode');

//rootDir is the project directory of the user. We will also create the Jugglr folder in rootDir
//the following variables will have to be updated w data coming in from the frontend:

////frontend:: 
////frontend:: user selecting a project directory (rootDir) will invoke file.mkJugglr function. 
//For e.g., invoke file.mkJugglr() when passing path data to rootDir variable?
const rootDir = lpath.join(process.env.ROOTDIR);
  //users will select their own sql schema file
  //note: can't use abs path for sql file in Dockerfile
  //for our team: after creating Jugglr folder, drag and drop starwars_postgres_create.sql into it

const pathDockerfile =  process.env.DOCKDIR;
const dockerfileContents = 
`FROM postgres:latest 
ENV POSTGRES_USER ${process.env.PGUSER} 
ENV POSTGRES_PASSWORD ${process.env.PGPASSWORD} 
ENV POSTGRES_DB ${process.env.PGDATABASE} 
WORKDIR ${rootDir}
COPY starwars_postgres_create.sql /docker-entrypoint-initdb.d/ `




const file = {
  //Creates Jugglr folder inside rootDir. Also checks if Jugglr already exists in rootDir
  mkJugglr: function () {
    fs.mkdir(lpath.join(rootDir, 'jugglr'), (err) => {
      if (err) {
        return console.log('jugglr folder already exists', err); 
      }
      console.log('jugglr folder created successfully!');
    });
  },
    
};

const dockerController = {
  ////frontend:: user clicks 'Generate Docker File' button. 
    //onClick(?) calls the dockerController.createDockerfile function, passing in pathDockerfile and dockerfileContents
  createDockerfile: async function (filePath, fileContent) {
    const result = await fs.writeFile(filePath, fileContent, { flag: "wx" }, (err) => {
      if (err) { console.log(err);}
      else { console.log('Dockerfile created successfully')}
      //will error out if any Dockerfile already present in folder
    });
    return result;
  }, 
  
  //// frontend:: user enters container name and port, and clicks 'Run New Container' button
    //onClick: transfer input field info to variables containerName and containerPort 
    //AND then trigger dockerController.runNewContainer function 

  // runNewContainer: 
  // port hardcoded atm
  createContainer: async  (image, containerName) => {
    const docker = new Docker({socketPath: '/var/run/docker.sock'});
    const result = await docker.createContainer({ 
      Image: `${image}`, 
      Tty: false, 
      name: `${containerName}`, 
      PortBindings: { "5432/tcp": [{ "HostPort": "5432" }] } }, 
      function (err,container){
        console.log(err);
        container.start();
        //will error if a container w the same name exists
    })
    return result;
  },

  //frontend:: user clicks stop/delete/start container buttons. 
  //onClick(?) triggers dockerController.stopContainer/.deleteContainer/.startContainer function(s)
    
  startContainer: async function (containerId) {
    const docker = await new Docker({socketPath: '/var/run/docker.sock'});
    const selectedContainer = await docker.getContainer(containerId);
    await selectedContainer.start(function (err, data) {
      console.log('err', err, 'data', data);
    });
  },



  stopContainer: async function (containerId) {
    const docker = await new Docker({socketPath: '/var/run/docker.sock'});
    const selectedContainer = await docker.getContainer(`${containerId}`);
    await selectedContainer.stop(function (err, data) {
      console.log('err', err, 'data', data);
    });
  },

  
  removeContainer: async function (containerId) {
    const docker = await new Docker({socketPath: '/var/run/docker.sock'});
    const selectedContainer = await docker.getContainer(`${containerId}`);    
    const result = await selectedContainer.remove();
    return result;
  },

  getImagesList: async () => {
    console.log('images dockController')
    const docker = await new Docker({socketPath: '/var/run/docker.sock'})
    const list = await docker.listImages()
    .then(list => {  return list })
    console.log('outer',list)
    return list;
   
  },

  getContainersList: async () => {
    const docker = await new Docker({socketPath: '/var/run/docker.sock'})
    const list = await docker.listContainers()
    .then(list => { return list })
    return list;
   
  },

  stopAllContainers: async ()=> {
    const docker = await new Docker({socketPath: '/var/run/docker.sock'});
    await docker.listContainers(function (_err, containers) {
      containers.forEach(function (containerInfo) {
        docker.getContainer(containerInfo.Id).stop();
      });
    });
  },


  // getImages: function () {},
  // getVolumes: function () {},
  // getRunCommand: function (rootDir, imageName, containerName) {}

  buildImage:  async (image, schema, dirname) => {
    try {
      const dockerode = await  new Docker();
      const result = await dockerode.buildImage({
          context: dirname,
          src: ['Dockerfile', schema]
        }, {t: image} )
      return "success";
    }
    catch (err) {
      console.log(err); 
      return err;
    }
  },
  
  
  run: async (image, containerName, port="5432") => {
    console.log('Starting Postgres container...');
    const streams = [
      process.stdout,
      process.stderr
    ];
    port = `${port}/tcp`
    const docker = await  new Docker();
    const result = await docker.run(image, ['postgres'], streams, {
      Env: [`POSTGRES_PASSWORD=${process.env.PGPASSWORD}`], WorkingDir: process.env.ROOTDIR, name: containerName, PortBindings: {
        "5432/tcp" : [ { "HostPort": "5432" } ]}, Tty: false}, (err, _data, _rawContainer) => {
          if (err) { console.log("err", err)} })
      .on('container', async function (container) {
        console.log('Postgres started');
        const containerId = await docker.getContainer(container.id);
        console.log(containerId.id)
        lfs.writeFileSync(`${process.env.DOCKDIR}/container.txt`, containerId.id, "utf8")
        return containerId.id;
    })
    return result;
    },

    formatOutput: async(list) => {
      try{
        console.log(list, typeof list)
        const formatted = list.map(object => {
          console.log(object)
          const id = object.Id;
          const containers = object.Containers;
          const repoTags = object.RepoTags;
          return { id: id, containers: containers, repoTags: repoTags}
        })
        console.log(formatted)
        return formatted;
      }
      catch (err) {
        console.log(err);
        return err;
      }
    }
}

module.exports = dockerController;
