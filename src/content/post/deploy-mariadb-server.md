---
title: "Deploy & Configure MariaDB Server"
publishDate: "21 January 2023"
description: "Deploy and Configure MariaDB Server in a Linux environments"
tags: ["RDBMS", "linux", "operations"]
---

in this guide, we are going to install & configure MariaDB server community edition on Linux server.

## MariaDB

> MariaDB Community Server is the open source relational database loved by developers all over the world. Created by MySQL’s original developers, MariaDB is compatible with MySQL and guaranteed to stay open source forever. MariaDB powers some of the world’s most popular websites such as Wikipedia and WordPress.com. It is also the core engine behind banking, social media, mobile and e-commerce sites worldwide.
>
> ~ MariaDB Website

MariaDB Server is a great RDBM for running production & Dev/Test OLTP workloads like , CRM, E-Commerce, ERP Systems, in this guide we are installing MariaDB on a Linux server.

In this Guide I have prepared a VM with specs below, Depending on your environment and your application data access pattern replace these resources to meet your application demand.

| CPU     | Memory | Distro    |
| ------- | ------ | --------- |
| 2 Cores | 2 GiB  | Debian 10 |

Make sure you have access to your server and have administrative privileges to run sudo command.

## Setup & Configuration

First thing is to update package repositories to get the latest version of packages. if your system is already update feel free to skip two next steps

```shell
$ sudo apt update
```

If you just provisioned the server, it would likely be outdated , runa full system upgrade to install security patches.

```shell
$ sudo apt upgrade
```

Next we are installing the MariaDB server and client and mycli utility which is a great utility that provide command and SQL completion and suggestion to simplify database administration tasks.

```shell
$ sudo apt install mycli mariadb-client mariadb-server`
```

After the instaltion is done, we have to run the MySQL secure installation command, it is an interactive script that guides you through some security messures to harden your database server, it resets insecure default configurations and removes default users & databases.

```shell
$ sudo mysql_secure_installation`
```

The output :

```shell
...
Enter current password for root (enter for none):
...
Change the root password? [Y/n] Y
New password:
Re-enter new password:
Password updated successfully!
...
Remove anonymous users? [Y/n] y
...
Disallow root login remotely? [Y/n] y
...
Remove test database and access to it? [Y/n] y
...
Reload privilege tables now? [Y/n] y
 ... Success!
All done! If you ve completed all of the above steps, your MariaDB
installation should now be secure.
```

After running secure installation script you can go and test connection between your client and server, but by default majority of MariaDB server packages or the script we just ran bind the server to localhost or even go further and disable networking.
To check if your installation has the same behavior you can run the command below

```shell
$ grep 'bind-address' /etc/mysql/mariadb.conf.d/50-server.cnf
bind-address		= 127.0.0.1
```

To configure the server to allow remote connection there, but first let's backup the configuration file.

```shell
$ cp /etc/mysql/mariadb.conf.d/50-server.cnf /etc/mysql/mariadb.conf.d/50-server-$(date +"%F")-backup.cnf
```

To allow access to a static IP you can run this one-liner.

```shell
$ sed -i 's/127.0.0.1/<ip-addr>/g' /etc/mysql/mariadb.conf.d/50-server.cnf
```

Or if you want the database to be publicly available.

```shell
$ sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/mariadb.conf.d/50-server.cnf
```

Restart mariadb-server service.

```shell
$ sudo systemctl restart mariadb-server
```

Now you should be able to to see mysql port open for remote connections.

## Creating Databases and Users

```shell
$ sudo mysql
```

Create Database for your application

```sql
CREATE DATABASE <DB_NAME>;
```

Create application database user

```sql
CREATE USER <USERNAME> on <DB_NAME>@<HOST> IDENTIFIED BY 'password';
```

Grant all application database privileges for the application user from a host you can specify:

- ''\*'' : from anywhere
- "192.168.1.%" : from network subnet
- "mydomain" : for a domain name
- "1.1.1.1" : for a static IP address

```sql
GRANT ALL PRIVILEGES ON <DB_NAME>.* TO <DB_NAME>@<HOST>;
```

```sql
FLUSH PRIVILEGES;
```

To debug user access you can run the following commands

```sql
USE mysql;
```

```sql
SELECT User,Host FROM user;
```

```sql
+--------+------------+
| User   | Host       |
+--------+------------+
| mehdi  | 192.168.1.%|
| root   | 127.0.0.1  |
| root   | ::1        |
+--------+------------+
4 rows in set (0.00 sec)
```

## Resources

- [Linuxhint Grant Privileges to users MySQL](https://linuxhint.com/grant-all-privileges-to-user-mysql/)
- [MariaDB Documentation](https://mariadb.com/kb/en/)
- [Configuring MariaDB for Remote Client Access](https://mariadb.com/kb/en/configuring-mariadb-for-remote-client-access/)
- [MyCLI Project](https://mycli.net)

## Conclusion

We saw how to install and configure a MariaDB instance, ext we troubleshooted remote connection, in this guide we covered some basic configuration steps to secure and operate the database, there are some advanced steps that needs to be done like installing TLS certifications and configuring backups. Thank you for reading this guide and stay tuned for more tutorials in future.
