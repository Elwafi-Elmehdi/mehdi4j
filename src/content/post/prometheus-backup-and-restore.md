---
title: "Prometheus Backup & Restore"
publishDate: "10 October 2024"
description: "a step by step guide to show you how to backup/restore Prometheus."
tags: ["prometheus", "monitoring"]
---
## Backup
Make sure prometheus is running with the flag
```shell
$ curl http://<prometheus-url>:9090/api/v1/status/flags | jq .data | grep web.enable-admin-api
```
If not edit the prometheus server entrypoint and add this flag `--web.enable-admin-api`. 

Then take a snapshot
```shell
$ curl -X POST http://<prometheus-url>:9090/api/v1/admin/tsdb/snapshot
```

Then under prometheus data path defined using `--storage.tsdb.path` usually it's under `/var/lib/prometheus`, You will file a directory named `snapshots`
```shell
root@prometheus:/var/lib/prometheus# ll snapshots/
total 8
drwxr-xr-x  2 prometheus prometheus 4096 Aug 25 21:13 ./
drwxr-xr-x 54 prometheus prometheus 4096 Aug 27 07:00 ../
```
Mine is empty but you will find a dirs which are hard links to all data blocks dirs.

Backup the dir as tarball, this can take time so it's better to executed under a terminal screen.

Before you backup make sure that you have enough space to avoid filling up the machine root fs. 

```shell
$ tar -zcvf /var/lib/prometheus/snapshots/* prom-bak-.tar.gz 
```
Save the `prom-bak-.tar.gz` to some reliable storage like S3 or to your local NAS servers.

You can save space after you pushed the archive by deleting the `snapshots` directory, and the archive.

## Restore
After archiving and transferring the snapshot to the new prometheus, the restore is simple as :

Stopping prometheus service.
```shell
$ systemctl stop prometheus 
```
Back up old data dir
```shell
$ mv /var/lib/prometheus/* /opt/prom-old-data
```
Extract the content of snapshot to prometheus data dir
```shell
$ tar -zxvf prom-bak.tar.gz -C /var/lib/prometheus/
```
Reload prometheus 
```shell
$ curl -x POST <prometheus-url>:9090/-/reload
```
Or restart prometheus service
```shell
$ systemctl restart prometheus.service
```