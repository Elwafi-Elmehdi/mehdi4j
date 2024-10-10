---
title: "Prometheus file logging"
publishDate: "19 september 2024"
description: "Prometheus by defaults uses syslog to log its tasks."
tags: ["prometheus", "monitoring"]
---

## Logging
By default prometheus logs to syslog, and it doesn't have an option to set a logging to a file in this runbook we cover prometheus file logging

Prometheus can be configured to log different levels by default the level of log is `info`
```shell
$ prometheus --log.level="warn"
```
and you can also control the log format, prometheus supports two formats
```shell
$ prometheus --log.format="logfmt|json"
```
Many companies use some sort of log agent that collect logs from different services and send them to a indexing platform, like `filebeat` for example, hence the need for prometheus to log in a file.

You can enable file logging using rsyslog configs
## Rsyslog config
Create a config  under `/etc/rsyslog.d/10-prometheus.conf` 

```file
if $programname contains 'prometheus' then /var/log/prometheus/prometheus.log
& stop
```
This config tells rsyslog to redirect every log entry containing prometheus in the service name to a file ``/var/log/prometheus/prometheus.log`

Be careful not to ship logs for another service named prometheus e.g prometheus-exporter
```shell
$ systemctl restart rsyslogd
$ chmod 0660 /var/log/prometheus/prometheus.log
$ chown prometheus:syslog /var/log/prometheus/prometheus.log
```
## Debug rsyslog

You can mimic logs being produced to syslog using logger and tailing the prometheus file, and/or check logs for rsyslog.

```shell
$ logger -t prometheus "Hello, World! This is prometheus logging tutorial"
$ tail -n 100 -f /var/log/prometheus/prometheus.log
$ journalctl -u rsyslogd
```