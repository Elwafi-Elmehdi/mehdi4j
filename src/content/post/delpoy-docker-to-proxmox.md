---
title: "Deploy Docker in Proxmox"
publishDate: "26 January 2023"
description: "Breif guide on deploying Docker in Proxmox VE Server"
tags: ["docker", "proxmox", "containers", "virtualization"]
---

## Rancher OS

> RancherOS is not actively maintened anymore and receives only critical security patches, it's not suitable for production workloads and lake documentation resources.

RancherOS is the smallest docker distribution suitable for running docker engines, it's light weighted way to have docker containers running. You can download the iso for Proxmox VE, the iso file is just under `170MB`, you can download it from download page in [resources section](#resources).

## Infrastructure Provisioning

After downloading the ISO file, create a virtual machine and attach the ISO file with your preferred configuration (CPU, RAM, Disks), you can refer to RancherOS Hardware Requirements in [Resources Section](#resources).

It's recommended to run docker in a virtual machine as stated in Proxmox Wiki, you can also deploy Docker in LXC containers, I prefer to run it as a VM because it offers better isolation and security, plus RancherOS is not like a full functioning operating system. It's very optimized to run docker.

in this guide, I am using a virtual machine with following configuration:

| CPU | RAM | Storage |
| --- | --- | ------- |
| 1   | 2GB | 10GB    |

## Configuration

After creating and booting to the rancheros vm, switch to your machine and create a config file `<cloud-config>.yml`.

RancherOS is not yet installed on the VM, it uses a yaml configuration , I included below an example, you can change properties to your referrals.

Make sure to include your SSH public keys so you can ssh from your machine to the VM.

If you like to enable DHCP just remove the `interfaces` property

```yaml
#cloud-config
hostname: docker
ssh_authorized_keys:
  - <public ssh key 1>
  - <public ssh key 2>
rancher:
  network:
    interfaces:
      eth0:
        address: 192.168.1.29/24
        gateway: 192.168.1.1
        dhcp: false
    dns:
      nameservers:
        - 192.168.1.200
        - 192.168.1.1
        - 8.8.8.8
```

After editing the config file, let's share it with a web server, I am quite confident that your machine has python installed if not you can check Python Documentation or use what you already have.

Make sure you are in the same directory where you saved your config file

```shell
$ python3 -m http.server
```

Copy your network IP address, you will need it in the next step.

## Instaling RancherOS

Switch back to your proxmox Rancher VM Shell Window and download the config file with `wget` command

```shell
$ wget http://<your_machine_ip>:8000/config.yml
```

Validate the config file.

```shell
$ sudo ros config validate -i <config.yml>
```

Install RancherOS on a primary disk generally its `sda` , but you double check device names with `sudo fdisk -l`

```shell
$ sudo ros install -c <config.yml> -d /dev/<device-id>
```

After installing Rancher you will be prompted to restart the VM, restart it

Go back too your machine and SSH into the VM.

```shell
$ ssh -i <private_key> rancher@<ip>
```

Once you are in, you can do maintenance, configurations and upgrades in the next section we will see how to upgrade the OS and Docker engine.

## Upgrading RancherOS and Docker Engine

Once in a while, you will have to upgrade and patch your docker engine and OS, you can perform these tasks easly with RancherOs CLI command.

### RancherOS

List all availble RancherOS versions

```shell
$ sudo ros os list
```

Upgrade to the last version

```shell
$ sudo ros os upgrade
```

### Docker Engine

List all docker engine versions

```shell
$ sudo ros engine list
```

Download and switch to a docker version

```shell
$ sudo ros engine switch docker-1.11.2
```

You can persist your docker engine version with `enable` sub command

```shell
$ sudo ros engine enable docker-1.11.2
```

## Running Containers

Portainer is a great GUI Web Management for Docker

```shell
$ #create a portainer volume for data persistence
$ docker volume create portainer_data

$ #run latest community edition of portainer
$ docker run -d -p 8000:8000 -p 9443:9443\
	--name portainer\
	--restart=always\
	-v /var/run/docker.sock:/var/run/docker.sock\
	-v portainer_data:/data\
	portainer/portainer-ce:latest
```

you can manage docker through the web with portainer `https://<rancher_ip>:9443/` or with docker CLI.

## Resources

- [RancherOS Documantation]()
- [Proxmox Wiki]()
- [RancherOS ISO Download Page](https://rancher.com/docs/os/v1.x/en/installation/workstation/boot-from-iso/)
- [Hardware Requirements](https://rancher.com/docs/os/v1.x/en/#hardware-requirements)
- [Portainer Documentation](https://docs.portainer.io/start/install/server/docker/linux)

## Conclusion

Rancher OS is great OS to run docker because of it is lightweight and optimized to run docker workloads. although is not maintained any more but it's a decent option when you just want to run docker containers efficiently on your Proxmox Server.
