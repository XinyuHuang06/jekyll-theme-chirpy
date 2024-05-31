---
title: 
author: xinyu
date: 2024-05-24 14:31:18 +0800
math: false
categories: [Other]
tags: [Ubuntu]
---

## 0. 问题描述

系统: Ubuntu 20.04
内核版本： 6.5.0-35-generic

近期在主机上新增了一块nvme固态硬盘，新装上之后有线网卡不能正常使用，wifi可以正常使用。但是一旦移除新增的硬盘，网络又可以正常使用了。下附个人解决思路与方案。

先说结论：该问题疑似由ubuntu的udev规则机制引起，即在增加了新的固态硬盘之后，系统会重新分配网卡的名称，导致在网络配置文件中的网卡名称与实际网卡名称并不匹配，因此不能正确加载网卡配置。

解决思路：

1. 主机安装了双系统，切换到Windows后发现有线网络是可以正常使用的，排除硬件层面问题。
2. 重新安装网卡驱动，问题仍然存在，排除驱动问题。
3. 在不断重启中发现，有时会直接不显示网卡。

对于3.中问题，解决方案如下:
```shell
# 查看启用的网卡
ifconfig
# 查看所有网卡
ifconfig -a

```
可以看到设备存在但是没有被挂载。使用`sudo vim /etc/NetworkManager/NetworkManager.conf`查看文件内容，并修改`managed=true`,修改完毕后重启，网卡可以正常显示。

```shell
[main]                                                                      
plugins=ifupdown,keyfile
dns = default
[ifupdown]
managed=false
[device]
wifi.scan-rand-mac-address=no
```

解决了网卡显示的问题之后，网络问题仍然存在。

4. 经过多次重启测试后发现，一旦新加上该硬盘，网卡名称将由`enp4s0`变为`enp5s0`，且在NetworkManager中二者的配置文件也并不通用。

对于4.中现象，怀疑是由于网卡名称改变导致网络并不能正常加载，因此尝试使得网卡名称不变，方案如下：

使用`sudo vim /etc/default/grub`打开配置文件，将`GRUB_CMDLINE_LINUX=""`修改为`GRUB_CMDLINE_LINUX="net.ifnames=0 biosdevname=0"`，保存并关闭后输入`sudo update-grub`。之后重启。
该参数用于修改GRUB配置中网络接口的命名规则，`net.ifnames=0`参数会禁用Predictable Network Interface即可预测的网络接口的命名行为，`biosdevname`提供了一种网络设备命名机制，当`biosdevname=0`时，该工具将不会被使用。

至此，重启后问题解决。