---
title: Ubuntu BUG记录
author: xinyu
date: 2024-05-24 14:31:18 +0800
math: false
categories: [Other]
tags: [Ubuntu]
---

## 0. 网卡Debug

系统: Ubuntu 20.04
内核版本： 6.5.0-35-generic
主板：MSI MOTORA B760M WIFI DDR5 II

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

## 1. 风扇控制

系统: Ubuntu 20.04
内核版本： 6.5.0-35-generic
主板：MSI MOTORA B760M WIFI DDR5 II

因使用分体式水冷，水冷风扇、水泵是与显卡独立的，因此尝试改变其风扇控制策略。网上常见的风扇控制策略为使用`lm-control`检测传感器并使用`fancontrol`软件进行控制；这两个库ubuntu均没有预装，使用如下指令安装。

```shell
sudo apt-get install lm-sensors # Install lm-sensors
sudo apt-get install fancontrol # Install fancontrol
```

安装完后使用`sudo sensors-detect`进行传感器匹配配置，在我所使用的主板上，主板控制芯片并没有安装，在匹配过程中看到如下提示：

```shell
Some Super I/O chips contain embedded sensors. We have to write to
standard I/O ports to probe them. This is usually safe.
Do you want to scan for Super I/O sensors? (YES/no): yes
Probing for Super-I/O at 0x2e/0x2f
Trying family `National Semiconductor/ITE'...               No
Trying family `SMSC'...                                     No
Trying family `VIA/Winbond/Nuvoton/Fintek'...               No
Trying family `ITE'...                                      No
Probing for Super-I/O at 0x4e/0x4f
Trying family `National Semiconductor/ITE'...               No
Trying family `SMSC'...                                     No
Trying family `VIA/Winbond/Nuvoton/Fintek'...               Yes
Found unknown chip with ID 0xd592
```

这说明对应的驱动我们并没有安装，但是可以看到使用的主板控制器芯片为Nuvoton，经查阅后发现MSI主板常使用`nct6683`与`nct6687`型号的控制器芯片，尝试安装：

```shell
sudo modprobe nct6687
modprobe: FATAL: Module nct6687 not found in directory /lib/modules/6.5.0-41-generic
sudo modprobe nct6683
```

`sudo modprobe nct6683`时没有报错返回，说明本主板使用的是这一款控制器，此时再使用`sensors`查看传感器，已经可以看到风扇等其它传感器的信息。

```shell
fan1:            870 RPM  (min =    0 RPM)
fan2:              0 RPM  (min =    0 RPM)
fan3:              0 RPM  (min =    0 RPM)
fan4:            996 RPM  (min =    0 RPM)
fan5:           1016 RPM  (min =    0 RPM)
fan6:              0 RPM  (min =    0 RPM)
fan7:              0 RPM  (min =    0 RPM)
fan8:              0 RPM  (min =    0 RPM)
fan9:              0 RPM  (min =    0 RPM)
fan10:             0 RPM  (min =    0 RPM)
```

返回如下，说明当前使用的是1、4、5号三个接口，fan的编号通常与pwm编号相同，具体的fan对应于主板上的接口可能需要手动调节观察以确定。

下一步需要确定pwm配置文件的路径。使用`ls /sys/class/hwmon/hwmon*/`可以查看系统硬件情况，可以看到含有pwm的文件，该文件即为对应风扇的配置文件。我这里在`/sys/class/hwmon/hwmon6/pwm*`路径下看到了一系列pwm配置文件。尝试对其进行更改，但是返回信息提示

```shell
/usr/sbin/pwmconfig: line 180: hwmon6/pwm2: Permission denied
```

即便使用`sudo`权限执行该指令仍然会出现这一个问题。