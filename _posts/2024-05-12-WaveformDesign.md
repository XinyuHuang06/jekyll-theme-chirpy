---
title: 
author: xinyu
date: 2024-05-12 16:18:22 +0800
math: false
categories: [学习记录]
tags: [WaveformDesign]
---

本文为《Radar Waveform Design Based On Optimization Theory》一书Chapter 4-Constrained radar code design for spectrally congested enviroments via quadratic optimization的学习总结。

## 0. 波形设计常用约束

- 检测概率约束
$$
\left\{
\begin{array}{l}
H_0: \boldsymbol{v} = \boldsymbol{n} \\
H_1: \boldsymbol{v} = \alpha_T \boldsymbol{c}+\boldsymbol{n}
\end{array}
\right.
$$

其中$\boldsymbol{n}$为复、零均值、圆对称高斯随机向量且有协方差矩阵$\mathbb{E}[\boldsymbol{n}\boldsymbol{n}^\dagger]=\boldsymbol{M}$，