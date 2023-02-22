---
title: "What is Dockerfile?"
publishDate: "22 february 2023"
description: "Docker is one of the leaders in container technologies,in this post we  see what is a Dockerfile? and how we can use it."
tags: ["docker", "containers", "linux"]
---

## Introduction

A container is a Linux process, what was special about Docker and it did not catch eyes with other technologies like Linux Containers (LXC) was that Docker made a whole ecosystem around container thus making working and producing containers really easy, and removed the complexity of building artifacts and running apps, a container is a running process, process is a program with configurations, runtime and so one, these build specs and artifacts are stored in a Docker image, a docker image is a tar file that containers everything your app needs to run properly, like the runtime, dependencies config files..., an image is a blueprint for your containers. and to build a Docker image we need a Dockerfile.

## What is Dockerfile?

Dockerfile is a special text file, it defines in step by step the runtime and its corresponding configuration and finally it stores application code & packages, it is the recipe for your docker containers it is used by docker engine to figure out how to build the image. Like the Docker image is blueprint for containers, the Dockerfile is a blueprint for your docker image, it describe exactly how the image will be built and configured.

## Why Dockerfile?

Docker images are considered as build specs, they are managed and stored as artifacts in remote or local repositories, you can build on top of other image it's what's called a base image, every Dockerfile must have a base image,

Dockerfiles are really crucial because they are the only document that describe how your apps are configured, built, and ran, from the security perspective you dockerfiles should follow security best practices by Docker Inc and the community, so before thinking about Docker clusters and running production workload, we need to focus on writhing `Golden Dockerfiles`, as this statement seems too perfect to be true but still it emphasize on a important point which is to prioritize building secure,minimal and efficient images over configuring runtime for production workload.

## Dockerfile Instructions

in this section, we explore all practical Dockerfile instruction that you will use when dockerizing your apps, the list of instructions is exhaustive and gets updated every now and than, in this post we are exploring the most used ones.

### FROM

FROM defines the base image,that your image will build on top of, FROM is a required instruction and every Dockerfile should start with it. It's recommended to use optimized image, for Linux system images you better use the distribution that you are working with. and to use versions instead of tags like `latest` `dev`... , after producing the fully functional docker image you can pass to storage optimization by adopting Linux distributions like `Alpine Linux`.

```docker
FROM ubuntu:latest
```

in this example we are using the latest version of ubuntu image as the base image.

### COPY

copy files from your local file system to the image file system. this is handy if you have applications artifacts like jar files, executable files or entire application projects to include in the image file system.

```docker
COPY ./app.jar /app/app.jar
```

in this example we are copying a jar file to the container file system.

### ADD

Its an advanced version of COPY, with ADD You can copy local files and download files from internet and include them in the image file system,

```docker
ADD ./config.yaml /app/config/
ADD https://raw.githubusercontent.com/Elwafi-Elmehdi/bash-scripting/main/sysadmin/ncores.sh /script.sh
```

However, it's not recommend to use ADD unless you know what you're doing, use COPY instead.

### WORKDIR

Changes the working directory, very handy Instruction that let you define the working directory for your next instructions, every instruction that comes after this one, will have the directory defined in,if the directory does not exists the build process will fail.

```docker
WORKDIR /app
```

we are using `/app` as the working directory.

### RUN

Probably the most important instruction, it lets you run commands during the build time of your image, and configure your runtime, RUN saves changes as image layers, its recommended to use minimal number of RUN commands and to chain commands with `&& or ; or ||` because each RUN will create its own image layer

```docker
RUN apt update -y &&\
    apt install -y git nodejs  &&\
    apt autoremove
```

in this example we are updating the system and installing `git` and `nodejs`, the update and packages instalations will generate log files and cache data that we don't need to include in the image because it will make it bloated that's why we used autoremove at the end.

### CMD

Defines the default command to run when you run containers from the image,

```docker
CMD ["java","-jar","./app.jar"]
```

the CMD command can be overwritten, by the end user, in this example we are accessing the bash shell in thr python image , the entry commandis `/bin/env bash` instead of `/bin/python`

```shell
$ docker run -it python /bin/env bash
```

in this example we are override the default command which is `/bin/python` with `/bin/bash`

### ENTRYPOINT

Similar to CMD instruction, but can not overwritten by arguments passed to docker container and each argument passed to the run command with be passed as arguments to the ENTRYPOINT program.

```shell
$ docker run app:1.2 --file-path=/bla/foo.txt
```

in this scenario the argument passed to the container, will be passed to script as an argument `--file-path`.

```docker
ENTRYPOINT ["python","script.py"]
```

very handy to docker images that do not include any added functionalities like runtime...

### EXPOSE

Defines the ports for your container,instructs the docker runtime about the container ports,the instruction does not expose the port, instead it acts as documentation between the person who build the image the user using the image to run containers.

The syntax

```docker
EXPOSE <port>/[tcp-udp]
```

In this example we are define `3000` as the management port for the application

```docker
EXPOSE 3000
```

### ARG

Arguments are special variables there are accessible in the build process and let you customize the build process, for example building images for different application environment(dev,stagging and prod), or for different regions (US,China,EU)

```docker
ARG environment=dev
```

You can pass argument when building the image using

```shell
$ docker build --arg-build environment=prod . -t app:prod
```

### ENV

ENV is great to use if you want to mention special environment variables for configuring you application in the Dockerfile this is great way to document you application configuration and requirements, another thing is you can pass default environment variables to containers that will be provisioned from image.

```docker
ENV DB_URL=localhost:3306
ENV DB_USER=root
ENV CONFIG=
```

or you can pass/override the environment variable when instantiating a container.

```shell
$ docker run -e DB_URL="jdbc://myhost.org:port/" app:2.6
```

The main difference between ARG and ENV is the scope, environment variable are used to configure you running containers , ARG is used to configure the way your images are built, and they have no use case when you already have an image.

### VOLUME

Container data is ephemeral, when you delete a container all of data in it's file system is gone,

VOLUME defines what are impotent paths that should be mounted as volumes,there is nothing special about VOLUME, it's just a docummentation and its a best practice to always use it whenever you have persistent that should be sotred in host machine.

```docker
VOLUME /var/lib/mysql/data/
```

You can bind mount machine directories to your containers using:

```shell
$ docker run -v /local/path:/container/path
```

Or use the recommend way which is defining docker volume and attaching it to the container.

```shell
$ docker volume create app_data
$ docker run -v app_data:/container/path
```

### LABEL

Meta-data about your docker image. Labels are great way to provider additional information about your images, the example below is just one of ways to use labels, some advanced usages of Labels are auto configuration or container placements using Docker labels.

```docker
LABEL email="email@example.com"
LABEL maintainer="Snake from MSG"
```

You can view the history of your image lables using:

```shell
$ docker history <image:tag>
```

## Putting it All Together

in this section we will summerize what we saw before and demonstrate how to use dockerfiles to build your containers image. We

```docker
# Use a lightweight Node.js image as a base
FROM node:lts-alpine

# Use labels to give metadata about your containers
LABEL email="mehdi@mehdi4j.com"
LABEL maintainer="Mehdi"

# Create a working directory for the app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy the rest of the app source code to the working directory
COPY . .

# Expose the port on which the app will listen
EXPOSE 3000

# Set the default command to start the app
CMD ["npm", "start"]
```

To build an image from the dockerfile make sure you are in the same directory as your Dockerfile and run the command bellow.

```shell
$ docker build -t node-app:1.0.0 .
```

## Resources

- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)

## Conclusion

In this post, we say what is Dockerfile? why it's important? and the most used Dockerfile instructions.
