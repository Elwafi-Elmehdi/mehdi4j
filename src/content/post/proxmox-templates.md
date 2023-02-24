---
title: "How to create Proxmox  templates?"
publishDate: "23 february 2023"
description: "Linux Distributions often maintain images for cloud providers mainly for OpenStack, these images work in Proxmox too."
tags: ["proxmox", "virtualization", "automation"]
---

## Introduction

Cloud Init is the standard,when it comes to initialization and bootstrapping of new virtual machines, it is widely supported in mainstream distributions, and you can find packages for you favorite distribution, However it's better to use official cloud images because they have already Cloud Init backed and they are optimized for Openstack and Proxmox.

In this post we see how to build cloud images for Proxmox VE, the process is the same regardless of Linux flavor.

Before moving to next sections you need first to download your cloud image, you can find your preferred image by googling `distro cloud image`, for example **Ubuntu** **cloud images** are available [here](https://cloud-images.ubuntu.com)

## VM Provisioning

In this section, we start by creating a VM, then we configure it, feel free to tweak the configuration parameters to your linking, you can login to your PVE via SSH and execute following commands or use the web management interface instead. However be aware that there are some steps that are not supported by the web interface.

First thing is to create a VM with an large ID to make it appear isolated from you VM, this is not a requirement but a recommendation to separate visually you VM from your templates.

```shell
$ qm create 9004\
     --memory 1024\
     --name linux-cloud\
     --net0 virtio,bridge=vmbr0
```

In this example I am creating a VM following specs:

- RAM : **1G**
- NAME : **linux-cloud**
- Network Adapter : **vmbr0** (Use what you have available on your PVE)

IN this step we are importing the image we downloaded as a disk for the created VM .

```shell
$ qm importdisk 9004\
     <cloudinit-image>.[qcow2-img]\
     local-lvm
```

The images extension varies is either `.qcow2` or `img`, both are okay and there is no difference in build process, the imported disk volume will be stored in a target storage for me its `local-lvm`, change it to your target volumes storage.

Finally we attach the disk to the VM as a scsi drive.

```shell
$ qm set 9004\
     --scsihw virtio-scsi-pci\
     --scsi0 local-lvm:vm-9004-disk-0
```

Now that we created the VM and imported the cloud image as a attached volume disk, we move to cloud init setup & configuration.

## Cloud-Init Configuration

in this section we see how to setup Cloud Init for PVE VM and how to configure it, first we start with creating a CD-ROM drive for the VM, this drive will store all CLoud init configuration files `user`, `network`, and `meta`.

```shell
$ qm set 9004 --ide2 local-lvm:cloudinit
```

as I mentioned before you need to modify the command above to include the your target storage,after creating the cloud init drive, we can configure Cloud Init parameters .

```shell
$ qm set 9004\
     --ciuser admin
     --sshkey /path/public_key.pub\
     --ipconfig0 ip=dhcp,gw=10.0.10.1
```

in this example I am setting:

- Cloud Init Admin User : **admin**
- SSH Key : **/path/public.pub** or content of public file, the keys must be in SSH format.
- ipconfig0 is primary Network Configuration :
  - **ip**: `dhcp` by default if you don't provide an IP or dhcp, your cloned vms will have no network configuration when they start, make sure you use `dhcp` or `ip/cidr`.
  - **gw**: the internet gateway for your VM, use your gateway.

There are other parameters parameters you can explore in [Proxmox Docs : Cloud Init](https://pve.proxmox.com/pve-docs/chapter-qm.html#qm_cloud_init)

Make the process fast by setting the cloud image as the default drive to boot to, to restrict BIOS to boot from disk only.

```shell
$ qm set 9004\
     --boot c\
     --bootdisk scsi0
```

Many cloud images require you to configure a serial console and use it display.

```shell
$ qm set 9004\
     --serial0 socket\
     --vga serial0
```

It's recommended to convert the VM to a template, this will help you clone linked VMs from it and accelerate the VM provisioning process

```shell
$ qm template 9004
```

Another best practice is to backup template to a reliable target storage, this will

## Clone VMs from Template

You can clone VMs from your newly created template, in the process you can overwrite the default Cloud Init configuration in the template, or leave the defaults. Command bellow will create a linked VM clone from the template.

```shell
$ qm clone 9004 120\
     --name ubuntu-1\
     --ciuser mehdi\
     --sshkey /path/key.pub\
     --ipconfig0 ip=10.0.10.100/24,gw=10.0.10.1
```

in this example we created a linked clone from template with id `9004` with a name `ubuntu-1` and a VMID `120` with a static ip `10.0.10.100/24` and other parameters are the same

You can dump Cloud init configurations and redirect output to a file to persist them as snippets using pipes.

```shell
$ qm cloudinit dump <VMID> [user|network|meta]
```

as an example here is my cloudinit user configuration

```shell
$ qm cloudinit dump 9004 user
```

Output :

```yaml
#cloud-config
hostname: ubuntu-cloud
manage_etc_hosts: true
chpasswd:
  expire: False
users:
  - default
package_upgrade: true
```

## Resources

- [Proxmox Docs : Cloud Init](https://pve.proxmox.com/pve-docs/chapter-qm.html#qm_cloud_init)
- PVE QM User Manuals
- [Proxmox Wiki](https://pve.proxmox.com/wiki/Category:HOWTO)

## Conclusion

in this guide we saw how to create PVE templates from cloud images built for Openstack, the process is the same for all of linux images, and can be automated using bash scripting or Proxmox API.
