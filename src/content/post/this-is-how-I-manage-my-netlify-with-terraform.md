---
title: "Manage Netlify with Terraform"
publishDate: "26 September 2024"
description: "This post aims to help you manage your Netlify resources declarativley"
tags: ["netlify", "infrastructureascode", "terraform", "cloud","iac"]
---
This post aims to help you manage your Netlify resources declarativley, using terraform you will be alble to declare and/or import Netlify dns records, this post is devided in three parts first, we will go through setting up the Netlify provider, then we see how to create records , and finally we see how to import existing records to terraform.
# Setup
 I assume you have terraform **v1.5 or above** installed, and you know basic terraform terminology and commands. 
 
First thing we do is specify the the provider name and version in the `terraform.tf` file.
## Provider initialization
It's best practice, to fix the version of providers, so that you have control over what changes can affect your terraform code base.
```hcl
# terraform.tf
terraform {
  required_version = ">= 1.5" # <- change this
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "0.1.1" # <- current version 
    }
  }
}
```
Make sure you are in the right folder (where your `.tf` files exist), run the command to initialize the project.
```shell
$ cd /path/to/netlify-project; terraform init
```
After we initialized the project, now we need to tell terraform where how to connect with Netlify APIs, we need to setup credentials.
## Credentials setup
Let's create first a variable that represent the api token make sure to flag it as sensitive so it doesn't appear in CD outputs, or specular plans. under `variables.tf`.
```hcl
# variables.tf
variable "netlify_api_token" {
  type        = string
  sensitive   = true
  description = "The API access key to your netlify account"
}
```
Go to your netlify account in the upper right corner, click on your **user avatar** then:
- Go to **User settings**
- Under **Applications** click on **OAuth**
- Click on **New access token**
- Give a description like (terraform api key) & set an exiration date (after 30days)
- Copy the api token

Set the token you copied, in your shell profile as an environment variable, Note that the naming of this variable should match the name of the terraform variable `TF_VAR_<name_of_terraform_variable>`. 
```shell
# ~/.bashrc or `~/.zshrc`
export TF_VAR_netlify_api_token="<your-secret-api-token>"
```

Source the profile file into the terminal you are working in, and test if the variable is populated using `echo` .
```shell
$ source ~/.bashrc # or ~/.zshrc
$ echo $TF_VAR_netlify_api_token
```

After you successfully generated the api key, now it's time to configure the provider to use it, under the `providers.tf` add this config:
```hcl
# providers.tf
provider "netlify" {
  token = var.netlify_api_token
}
```
Verify your permissions, using the plan command if there is any permissions issue it will appear in this phase.
```shell
$ terraform plan
```

# Manage netlify resources

## Project structure

```shell
.
├── import.tf
├── main.tf
├── providers.tf
├── terraform.tf
└── variables.tf
```

## Create DNS records
Creating dns records requires fist having the dns_zone id, simply write the 
```hcl
# main.tf
data "netlify_dns_zone" "example_com" {
  name = "example.com"
}

resource "netlify_dns_record" "www_example_com" {
  type     = "A"
  zone_id  = data.netlify_dns_zone.mehdij4_zone.id
  hostname = "www.example.com"
  value    = "1.1.1.1"
}
```


```shell
$ terraform plan
```


```shell
$ terraform apply
```

# Import existing dns records
To import dns records to Netlify we need the record id, from what I saw there is no UI to show the id of each record that's why I use this way to get them.
## Getting the zone id
We already retieved the zone id using `data "netlify_dns_zone"` we need to search for it in the terraform state, execute this command and identify the id.
```shell
$ terraform show -json | jq
```

## Getting the record id
Now we can have all records with their respective ids using Netlify API using this command will retieve all records for a givin zoneid, replace `<zone-id>` with what you found on terraform state.
```shell
$ curl -H "Authorization: Bearer $TF_VAR_netlify_api_token"\
https://api.netlify.com/api/v1/dns_zones/<zone_id>/dns_records | jq
```
After you found the record id, you can import the record using this block, create a file called `import.tf` and add this block, replace the `id` with the `zone-id:record-id`, do this to all records you want to import. 
```hcl
# import.tf
import {
  id = "<zone-id>:<record-id>"
  to = netlify_dns_record.dev_example_com
}
```
Once finished, you can apply/plan your changes, you will see that terrsform is telling about importing these resources.
```shell
$ terraform apply
```
## Resources
- [Netlify Terraform Registry](https://registry.terraform.io/providers/netlify/netlify/latest)