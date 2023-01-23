---
title: "Terraform S3 Backend with Encryption and State-Locking"
publishDate: "23 January 2023"
description: "Storing Terraform State on S3, with versioning,encryption and state locking"
tags: ["terraform", "s3", "iac", "aws", "state"]
---

### Terraform State

Terraform state is single source of truth for your infrastructure as code, it defines and maps real resources like **VMs,Apps,shares**.... to **Terraform resources**, thus it is essential to store the state file in a reliable and durable storage.

Another aspect is security because Terraform is statefull (uses state) the state file will always end up storing sensitive data, like crypto keys, leaked data, That's why it's important to treat it as any other secret data and must be stored in a secured place.

By default Terraform stores state file and previous version of file in the file system, where you first ran **terraform init**. local file systems are not reliable and secure to store such files. Terraform in this case uses default enhanced local backend, so what is a backend?

### Terraform Backend

A backend defines where and how Terraform stores its state data files.
Terraform supports a variety of backends like **Terraform Cloud**, **Local**, **HTTP**, **S3** and many more you can check all available backend on [Terraform Docs](https://developer.hashicorp.com/terraform/language/settings/backends/).

### AWS S3

Amazon S3 is a object storage, its storage that offers high availability and durability,performance and security, it scales to petabytes of data and beyond. all these features makes S3 a great place for terraform state files.

Amazon S3 has alot of features, in our case we are intrested in S3 versioning, you can enable versioning on the target S3 bucket to store all previously created Terraform state versions.

Another feature is encryption, by default as of 2023-01 S3 uses a service key to encrypt data at rest. you can change this behivior to your liking by generating a new key or providing your own key to AWS KMS which is a service for managing crypto keys in AWS.

For in flight encryption, S3 uses HTTPS endpoints which means all data flowing between Terraform machines and S3 is encrypted.

### Terraform State Locking

State locking is a mechanism to control and manage change to the state file in a multi user environment.

Terraform uses state locking to prevent inconsistencies in state file, by default Terraform local backend handles state locking by writhing to a special file during execution of any state altering command like **plan** or **apply**. This procedure is not recommended to implement the same procedure with S3, instead S3 backend leverages DynamoDB for caching lock-data.

### AWS IAM Permissions.

S3 uses AWS IAM to manage access to buckets and objects, and IAM relies on policies to define access to resources, before configuring Terraform, make sure your AWS user has the appropriate permissions that Terraform requires to to manage state and locking.

All permissions required by Terraform are defined below as IAM Policies Documents, it's recommanded to to create IAM user with these permissions following the Least Privilege Principle.

JSON Policy granting full read write access to S3 Bucket **mehdi4j-state** on **terraform** prefix (directory).

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": "s3:ListBucket",
			"Resource": "arn:aws:s3:::mehdi4j-state"
		},
		{
			"Effect": "Allow",
			"Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
			"Resource": "arn:aws:s3:::mehdi4j-state/terraform/"
		}
	]
}
```

and same thing for DynamoDB, below is a IAM policy granting full access to **terraform** DynamoDB table.

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"dynamodb:DescribeTable",
				"dynamodb:GetItem",
				"dynamodb:PutItem",
				"dynamodb:DeleteItem"
			],
			"Resource": "arn:aws:dynamodb:*:*:table/terraform"
		}
	]
}
```

Generating access keys for IAM users is not covered by this guide and assumed to be done.

> **Never store secret tokens or sensitive data on HCL Configuration files, instead pass them as environment variables.**

### Configurng S3 Backend

After successfully connecting Terraform with AWS IAM user with the propitiate permissions. we can configure terraform backend.

```hcl
terraform {
  backend "s3" {
    bucket         = "mehdi4j-state"
    key            = "terraform/state"
    region         = "eu-west-3"
    dynamodb_table = "terraform"
  }
}
```

The `backend` block configures Terraform to store state file on S3 bucket `mehdi4j-state` and to use DynamoDB table `terraform` as cache to lock state.
Now we can tell terraform to migrate state from default Local Backend to the new S3 Backend with the command below.

```shell
$ terraform init -migrate-state
```

Sometimes, Terraform keeps the lock date after altering state, you can manually unlock it with the command below, however be careful and use the command with caution because it can cause unconsistant state if another user is altering the same state file.

```shell
$ terraform force-unlock
```

### Resources

- [S3 FAQs](https://aws.amazon.com/s3/faqs/)
- [IAM FAQs](https://aws.amazon.com/iam/faqs/)
- [DynamoDB FAQs](https://aws.amazon.com/dynamodb/faqs/)
- [Terraform Backend Documentation](https://developer.hashicorp.com/terraform/language/settings/backends/configuration)
- [Terraform State Documentation](https://developer.hashicorp.com/terraform/language/state)
- [Terraform State Locking Documentation](https://developer.hashicorp.com/terraform/language/state/locking)

### Conclusion

we have covered how to store state files on AWS S3, and how to securely connect to AWS S3, we also saw state mechanism using AWS DynamoDB. finally we configure Terraform to use S3 and Dynamo, and migrated state from local to S3.
