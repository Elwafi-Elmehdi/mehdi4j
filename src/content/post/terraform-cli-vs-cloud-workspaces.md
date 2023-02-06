---
title: "Terraform : CLI Workspaces vs Cloud Workspaces"
publishDate: "25 January 2023"
description: "What's the difference between CLI Workspaces & Cloud Workspaces"
tags: ["terraform", "infrastructureascode", "automation", "cloud"]
---

I remember when I was learning Terraform, I came across Terraform CLI workspaces and and Cloud workspaces, it was confusing for me the difference between the two, in this post we are exploring both. and by the end of this post you will understand and differentiate between the two.

In this post I am refering to **CLI Worspaces** as **Workspaces** and **Terraform Cloud Workspaces** as **Cloud Workspaces**

## Terraform CLI Workspaces

Terraform uses state , state files are stored in a location, Terraform backends defines how and where the state is stored. a workspace is a distinct state file of the same configuration files. By default Terraform start with a default workspace that you cannot delete named `default`.

To get the current workspace in HCL configurations you can use the variable `terraform.workspace`.

When you run a `terraform plan` on a freshly created workspace, you will be prompted to recreate whole infrastructure.

Terraform local backend, stores each workspace's state file on a folder called `terraform.tfstate.d`

```bash
.
├── main.tf
├── outputs.tf
├── providers.tf
├── terraform.tf
├── terraform.tfstate #default's state file
├── terraform.tfstate.d
│   └── dev # stores dev workspace state
└── variables.tf

```

### Use Cases

You can use workspace to deploy the same infrastructure to a different region

```hcl
provider "aws" {
    ....
	region = "${terraform.workspace == "prod" ? "eu-west-3" : "us-east-1"}"
}
```

Use workspaces to reduce the cost of your infrastructure based on environments

```hcl
resource "aws_instance" "web_server" {
	instance_type ="${terraform.workspace == "prod" ? "m5.large" : "t2.micro"}"
	....
}
```

Tag your resources with theirs respective workspace

```hcl
resource "aws_db_instance" "primary_db" {
    ....
    tags = {
      Name = "primary_db"
      Envirement = "${terraform.workspace}"
    }
}
```

### Management

Create new workspace, the name is recommended to be based on apps, departments, environments...

```shell
$ terraform workspace new <name>
```

View the current selected workspace

```shell
$ terraform workspace show
```

List all workspaces in a project

```shell
$ terraform workspace list
```

Switch between workspaces

```shell
$ terraform workspace select <name>
```

Delete a workspace, note that you can not delete the default workspace

```shell
$ terraform workspace delete <name>
```

Terraform Workspaces are great for managing the same infrastructure with slight changes for example given a project that require different resource capacities for each environment that shares the same system architecture, but its not good for systems decomposition or for environments that has different access control and security mechanisms.

## Terraform Cloud Workspaces

When we work with Terraform locally we manage different infrastructures & projects in different directories.

Projects grow in size and we start collaborating on infrastructure, in this multi user environment, organisations needs mechanisms to grantee consistency access control to the state.

Terraform cloud manages infrastructures with workspaces instead of directories, Workspace have what terraform needs to do it's job, Cloud workspaces are capable of executing Terraform jobs,Storing and Versioning state files, Securing access to credentials and state, and auditing.

They are great for system decomposition, storing state in a reliable location, and governance for organisations like having separate Collections of infrastructures based on roles like networking, Apps, Storage and so on.

Now that we saw both workspaces let's discuss there main difference

## CLI vs Cloud Workspaces

- Cloud workspaces are IaC projects and collections of infrastructures made for storing state and executing terraform in the cloud, and for large scale organisations with multiple Terraform developers.
- CLI workspaces are distinct states of a single IaC project in a directory, and they are suitable for deploying same infrastructures with slight changes.

## Resources

- [Terraform CLI Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces)
- [Terraform Cloud Workspaces](https://developer.hashicorp.com/terraform/cloud-docs/workspaces)
- [Terraform Cloud](https://app.terraform.io)

## Conclusion

Both workspaces are great in given situations, it's up to developers and organisations to know when and how to use them efficiently.
