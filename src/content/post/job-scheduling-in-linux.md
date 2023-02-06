---
title: "Job Scheduling in Linux"
publishDate: "06 february 2023"
description: "Automation is considered a best practice in IT, it reduces operational overhead, reduces/cut human errors, and save us time."
tags: ["bash", "automation", "linux"]
---

Automation is not a stop shot solution to problems instead, its an on going process that involves innovation, maintenance and more.

In this post, we are taking a look on different scheduling techniques in Linux to achieve automation.

In Linux there are many ways to schedule & automate tasks, but the 2 most famous ones are `One time scheduling` & `periodic scheduling`.

## One time Scheduling

One time scheduling is great for tasks are performed only once, and cannot be reproduced, take for example creating a user for a trainee joining the team next week, or downloading a file when the network bandwidth allows it.

To start scheduling one time scheduling, `at` is program that allows us to run tasks at a specified time and date and exactly once.

we start off by cheeking if your system already has at installed, you can run:

```shell
$ which at
```

if you system is setup with at you will get the path for the binary command,if you at is installed you can skips to **Working with at Job scheduler**

### Installing at

For Debian oriented Linux distributions you can use:

```shell
$ sudo apt install at
```

For Red Hat oriented Linux distributions you can use:

```shell
$ sudo dnf install at
```

To check of the at daemon is running you can use the `systemctl` command

```shell
$ systemctl status atd
```

Make sure that the daemon is enabled and running.

```shell
$ systemctl enable atd
$ systemctl start atd
```

### Working with at Job scheduler

at accepts a lot of date and time formats,in this demo I will share just a few, but you can check on available formats that might fit your liking in at's manual pages `man at`.

By default apt is programmed to read the script to run from standard input but you can pass your scripts, using the `-f /path/my/script.sh`.

Scheduling a backup to run today at 20:15 in the night. Note that if the time is passed the script will be scheduled for tomorrow at the same time in this case `20:15`.

```shell
$ at -f myscript.sh 20:15
```

Another useful time format is the `now`, now represent the current date and time, you can add another time unit `now + 3 days`,`now + 2 hours`,`now + 1 weeks`.

Running a backup after 15 minutes from current time.

```shell
$ at -f backup.sh now + 15 minutes
```

Running a database backup at 2 in the morning.

```shell
$ at -f db_backup.sh  2:00 AM
```

Don't forget that If you scheduled a passed time, the script will run next day in the same time.

You can see the all scheduled jobs in job queue:

```shell
$ atq
```

Every job is associate with an ID, ID is a simple integer that identifies the job, atq produces an input similar to the one bellow

```
6	Mon Feb  6 16:33:00 2023 a mehdi
```

You can remove jobs from the queue by their respective IDs.

```shell
$ atrm 6
```

One scheduling is great for one time tasks that are needed to bring the server configuration and packages to a desired state, think for example about, bootstrapping, configuring users and other use cases.

## Periodic Scheduling

One time scheduling is not interesting as mush as periodic scheduling, because for sysadmins or infrastructure engineers, a lot of tasks are performed regularly, whether its for maintenance,compliance or other use cases.

### Installing Cron Scheduler

There is a handful packages for periodic scheduling like `crond` or `cronie`, you can install what ever you like the process below works for them.

### Working with cron Job scheduler

Each user has his/her crontab, a crontab is a special file that the cron daemon reads to identify jobs that should be scheduled, its not recommended to edit the global file, instead edit your crontab:

```shell
$ crontab -e
```

In your favorite editor, you can edit the crontab, by adding the schedule and the script, the example below explains the crontab format.

```bash
15 22 * * 6 /home/user/script.sh
|   | | | |------------------------- Week Day[0-7]
|   | | |--------------------------- Months [1-12]
|   | |----------------------------- Month Day [0-31]
|   |------------------------------- Hour [0-23]
|----------------------------------- Minutes [00-59]
```

In this example we are running `/home/user/script.sh` script at `22:15 each Saturday`.

Let's discuss some important key points about cron scheduling:

- Make sure your scripts have the right persimmons (executable)
- Always refer to your scripts with absolute paths
- scripts are executed generally the root user or by a system user created when you installed the package. you can check out the `/etc/passwd` file to see this is the case.
- you can refer to Sunday either by 0 or 7.
- Cron Daemon will only reports if your script had failed, it up to you to setup the proper logging mechanisms.

There is a lot to discover about crontab, you can check [Crontab Guru](https://crontab.guru/) or manual pages for more details.

You can check your scheduled scripts using:

```shell
$ crontab -l
15 22 * * 6 /home/user/script.sh
```

another useful trick is to edit other users crontab, if you are a system admin and you write scripts administrated users you can schedule them, in this example we are editing Alice's crontab, this task requires admin privileges make sure your user has them or run it with the root user, otherwise you will get a permission denied.

```shell
$ sudo crontab -u alice -e
```

Same thing is true when listing other users crontab

```shell
$ sudo crontab -u alice -l
```

There is more to crontab, that is not covered in the simple guide, you can read all about advanced usage and configuration in the user manuals, simply run `man crontab`.

## Conclusion

In practice you will be working a lot with periodic scheduling than one time scheduling,each scheduling strategy has its benefits and use cases, how ever running a lot of scripts in a server can downgrade the performance of the server. `crontab` and `at` are used heavily in automation for Unix/Linux systems, there are other sophisticated solutions like agent-based automation with control tower, like Ansible,Chef,Salt just to name a few.
