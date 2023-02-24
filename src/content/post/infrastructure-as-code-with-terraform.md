---
title: "Infrastructure as Code with Terraform"
publishDate: "24 february 2023"
description: "What is Infrastructure as Code? What's difference between Declarative and imperative IaC Tools? What is Terraform? How to get started with Terraform?"
tags: ["terraform", "infrastructureascode", "automation"]
---

## What is Infrastructure as Code?

Infrastructure as code is form of automation, through which you can manage & provision IT infrastructure through code instead of manual processes.

Infrastructure as code or IaC helps engineers in codifying application infrastructure,configuration, and dependencies.

All of the infrastructure specification & configuration is defined as configurations files, these files can be version controlled and shared with other team members, defining infrastructures as code in config files enable code re-usability, thus leading to faster deployments which contribute in the agility of your teams.

There are two approaches to achieve Infrastructure as code, `declarative` and `imperative`.

### Declarative and Imperative approaches

Declarative IaC tools enable us to write the desired state of resources, and that's it!, the tool handles configuration for you, these tools also tend to cache the state of your infrastructure to insure a consistent view of the system and to properly destroy the resources in order.

In the other side Imperative IaC tools give u the freedom to define how you want the system to look, but through steps you define, instead of declaring the desired state you define the steps needed to achieve the desired state.

## What is Terraform?

Terraform is an open source declarative infrastructure as code tool, it relays on state file to determine what have change, and how the resources are interconnected, what is exiting about Terraform is that the tool is not that complex, instead Terraform relays on providers which are programs that handle the interaction with platform we wont to manage their infrastructure as code. any platform that support API's you can find a Terraform provider for it, if you didn't find it you can create one yourself, all these providers are available in the Terraform Registry, feel free to check [Resources Section](#resources) for links.

## Installing Terraform

There are many ways to install Terraform on you machine, I have included the documentation page in the [Resources](#resources) so you can go and chack the exact steps that match your setup

## Why Terraform?

Terraform adoption is growing, big companies, communities, startups, adopted, here are some benefits for adopting Terraform as you IaC provisioning technologies.

**1- Platform Agnostic**

You can manage any platform, Terraform can manage low level components like storage, virtual machines, volumes.,(IaaS) you can also manage development runtime ,container runtime (PaaS), and software features (SaaS).

**2- Abstraction & Standard Workflow**

Terraform uses providers, providers are monolithic programs that manage platform through API calls,and expose Terraform resources.

**3- Change drift Detection**

One of big concerns of managing IT resources, is knowing what changed?,when? and by who?, Terraform is great tool to detect if resources changed, a change that is not complaint with config files is often called change drift, it can detect and alert you, in the plan and apply phases. Terraform cannot be used to prevent changes or enforces compliance rules, the prevention is up to user and the platform on which Terraform automates.

**4- Parallel Provisioning**

Terraform detects resources dependencies from the code you write, and provision the independent resources in parallel to boost the initialization of the infrastructure, you can explicitly set dependencies between resources.

There are other benefits that are not mentioned here, nor the ordering here makes since this list is meant to give examples of what Terraform is capable of.

## How to get started with Terraform?

First of all create a directory for your project and create the standard files, we will talk later about each one and what it stores.

Your new files should look something like this:

```
/
├── main.tf
├── outputs.tf
├── terraform.tf
└── variables.tf
```

After creating temples files, open the current directory in your favorite editor.

### 1- Initialize a Terraform project

in this step we will initialize the directory, the Terraform initialization involves downloading provides and setting back-end, no need to worry about the process, as for providers we are working with the `local` provider, it enable as to write files to file system in declarative code, this provider is one of the simplest providers that's why we chose to work with.

in `terraform.tf` file add this configuration.

```hcl
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
      version = "2.3.0"
    }
  }
}
```

Now we initialize the working directory, Terraform will check the provider registry and download the ones that are mentioned in our code, in this case it will download the local provider and cached in `.terraform` hidden directory.

```shell
$ terraform init
```

`terraform.tf` is file where we store the `terraform` block, this block is used to configure the behavior of Terraform and all required providers by our project.

### 2- Define your resources as code

in a file called `main.tf` we define all the resources, all our infrastructure goes in this file. usually it stores `resource` and `data` blocks which are used to define resources and query metadata from managed platform.

```hcl
resource "local_file" "foo" {
  content  = "foo!"
  filename = "${path.module}/foo.bar"
}
```

Terraform uses a declarative language called `HCL`, it's a natural human readable language, it is composed of blocks, we already saw the `terraform` block which is responsible for setting the behavior of terraform and declaring the required providers. in this

- `resource` is block where you can define your resources configurations and state, in this case the resource block represent a file in current dir.
- `content` : defines the content of the file
- `filename` : defines the path and the name of the file.
- `path.module` : is a special variable it represent the full path to directory of the current Terraform project. `${}` is how we do string interpolation in HCL, for full details about HCL language please refer to the [Resources](#resources) section.

### 3- Syntax validation & type checking

One of the important steps that can help us catch errors and typos before provisioning resources.

Validation step is important, because it catches syntax errors, mismatch variable types, required arguments...., however it can not catch all problems, the majority of problems are presented in the plan or the apply phases.

```shell
$ terraform validate

```

the `fmt` command formats every file in current directory with `.tf` extension to the standard format defined by Hashicorp.

```shell
$ terraform fmt
```

it it will traverse the current directory and formats all files, and returns the names of the formatted files. you can format subdirectories by adding `-recursive`.

### 4- Generate a blueprint of resource changes

Plan phase is crucial step to have a overview of what is the changes that will be done to the infrastructure, this helpful for teams to discuss the changes and evaluates the risks involved in enrolling with these changes, plans are used also in collaborative CVS as document to track the evolution of the infrastructure.

```shell
$ terraform plan
```

Terraform will generate a a summery of all the changes that will be made to the system

```shell
....
Terraform will perform the following actions:

  # local_file.foo will be created
  + resource "local_file" "foo" {
      + content              = "foo!"
      + directory_permission = "0777"
      + file_permission      = "0777"
      + filename             = "./foo.bar"
      + id                   = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
....
```

in this plan, as you can see terraform will create a file with the specified name in configuration and with default permission, you can tweak all of these parameters.

### 5- Applying changes

in the phase, we proceed with the creation of the infrastructure, this phase introduce change to the system, that's why terraform regenerate execution plan and waits for the user confirmation.

Now we apply changes by running the command below.

```shell
$ terraform apply
```

After you confirmed Terraform proceeds and create the resource (file), you check the current directory you will file a file called `foo.bar`

```
/
├── main.tf
├── outputs.tf
├── terraform.tf
├── foo.bar
└── variables.tf
```

if we inspected the content of the file, we find the content that was defined in HCL configuration file `main.tf`

```shell
$ cat foo.bar
foo!
```

### 6- (Optional) Destroy resources

this step is optional and dangerous for production systems, so use it with precaution, because we are just managing files it's not a big deal.

When your infrastructure reached end of life and needs to be teared down, the great thing about using Terraform is that you will never bother about that are the resources that should be deleted and in what order they should be deleted, you just need to run the comment below and review and confirm the changes.

```shell
$ terraform destroy
```

this command generates the plan and show all the resources that will be effected.

## Terraform Variables

You can customize your infrastructure configuration by using variables, in the `variables.tf` file we define all the variables that we need, in this file copy and past the code snippet below

```hcl
variable "myvar" {
    description = "the name of terraform managed file"
    type = string
    default = "foo.bar"
}
```

Variables stores metadata about themselves like `type`, `description`,`condition` and so one, this is very helpful if we want to convert projects to Terraform modules. Modules are out of scope of this guide so we skip them for now.

Now go back to your `main.tf` file and instead of using a hard codded value use the variable we declared in the previous step, you can reference a variable by using `var.<variable_name>`.

```hcl
resource "local_file" "foo" {
    ....
    filename = var.myvar
}
```

Or you can pass variables values through all the phases of Terraform.

```shell
$ terraform -var 'myvar=foo.boo' [plan|apply|destroy]
```

if you did not provide a default value for your variable terraform will prompt you to enter them every time you run a command.

## Terraform Outputs

Terraform resources expose attributes, these attributes can be used as outputs, this is very interesting when we are running Terraform in a automated environment, like VCS Pipeline,

```hcl
output "myfile_content" {
    value = local_file.foo.content
}
```

Outputs defined in the project will appear after each successful apply phase, or you can view the last version of outputs by running the command below.

```shell
$ terraform output
```

Another handy command that is used a lot in automated Terraform workflows

```shell
$ terraform output -json
```

it produce a machine readable version of all defined outputs this is useful in integrating terraform with other systems via API's.

## Resources

- [Red Hat : What is Infrastructure as Code (IaC)?](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
- [Hashicorp : What is Terraform?](https://developer.hashicorp.com/terraform/intro)
- [Install Terraform](https://developer.hashicorp.com/terraform/downloads)
- [Terraform Registry : Local Provider](https://registry.terraform.io/providers/hashicorp/local)
- [Terraform Language Documentation](https://developer.hashicorp.com/terraform/language)

## Conclusion

in this guide we saw, what is Infrastructure as Code? and why it is impotent for Operation engineers, we explored a declarative IaC tool, Terraform is well known for managing cloud infrastructure, in this guide for learning purposes we worked with files how ever the same concepts and steps are applied to Cloud providers, we just scratched the surface of Terraform and there is a lot of things to explore, you can check out the documentation or check my other Terraform content.
