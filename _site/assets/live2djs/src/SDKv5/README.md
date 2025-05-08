# Cubism SDK Web 示例应用 - 源码文件结构说明

本文档提供了Cubism SDK for Web示例应用程序源代码结构的详细说明，包括每个文件的功能和主要函数定义。

## 文件功能概述

### 核心文件

| 文件名 | 功能描述 |
|--------|--------|
| **main.ts** | 应用程序入口点，负责初始化和启动应用 |
| **lappdefine.ts** | 定义应用程序常量和配置参数 |
| **lappdelegate.ts** | 应用程序主类，管理Cubism SDK和应用生命周期 |
| **lappsubdelegate.ts** | 子代理类，管理画布和相关操作 |

### 模型相关

| 文件名 | 功能描述 |
|--------|--------|
| **lappmodel.ts** | 处理Live2D模型的加载、管理和动画 |
| **lapplive2dmanager.ts** | 管理多个Live2D模型，处理场景切换 |

### 渲染相关

| 文件名 | 功能描述 |
|--------|--------|
| **lappview.ts** | 视图类，负责渲染处理和坐标转换 |
| **lappsprite.ts** | 精灵实现类，用于处理背景和UI元素 |
| **lappglmanager.ts** | 管理WebGL上下文和初始化 |
| **lapptexturemanager.ts** | 管理纹理资源的加载和释放 |

### 辅助工具

| 文件名 | 功能描述 |
|--------|--------|
| **lapppal.ts** | 平台抽象层，处理文件加载和时间管理 |
| **touchmanager.ts** | 触摸管理器，处理用户输入 |
| **lappwavfilehandler.ts** | WAV音频文件处理器，用于音频同步 |

## 文件详细说明

### main.ts

入口点文件，负责初始化和启动应用程序。

**主要函数**：
- `window.addEventListener('load', ...)` - 页面加载完成后初始化应用
- `window.addEventListener('beforeunload', ...)` - 页面关闭前清理资源

### lappdefine.ts

定义应用程序常量和配置参数的文件。

**主要常量**：
- `CanvasSize` - 画布尺寸配置
- `ModelDir` - 模型目录数组
- `ResourcesPath` - 资源文件路径
- 视图和渲染相关的各种常量

### lappdelegate.ts

应用程序主类，管理Cubism SDK和应用生命周期。

**主要函数**：
- `getInstance()` - 获取单例实例
- `releaseInstance()` - 释放单例实例
- `initialize()` - 初始化应用程序
- `run()` - 启动应用主循环
- `onResize()` - 处理窗口大小变化
- 各种事件处理函数和资源管理函数

### lappsubdelegate.ts

负责管理canvas和相关操作的子代理类。

**主要函数**：
- `initialize(canvas)` - 初始化子代理
- `update()` - 更新画布内容
- `createShader()` - 创建WebGL着色器
- `onPointBegan/Moved/Ended()` - 处理指针事件
- 各种获取器函数和资源管理函数

### lappmodel.ts

处理Live2D模型的加载、管理和动画的类。

**主要函数**：
- `loadAssets(dir, fileName)` - 加载模型资源
- `setupModel(setting)` - 设置模型
- `update()` - 更新模型状态
- `draw(matrix)` - 绘制模型
- `startMotion/startRandomMotion` - 启动动作
- `setExpression/setRandomExpression` - 设置表情
- `hitTest(hitArenaName, x, y)` - 检测点击区域

### lapplive2dmanager.ts

管理多个Live2D模型，处理场景切换。

**主要函数**：
- `initialize(subdelegate)` - 初始化管理器
- `onUpdate()` - 更新所有模型
- `onTap(x, y)` - 处理屏幕点击
- `onDrag(x, y)` - 处理屏幕拖动
- `nextScene()` - 切换到下一个场景
- `changeScene(index)` - 切换到指定场景

### lappview.ts

视图类，负责渲染处理和坐标转换。

**主要函数**：
- `initialize(subdelegate)` - 初始化视图
- `initializeSprite()` - 初始化精灵
- `render()` - 渲染视图
- `onTouchesBegan/Moved/Ended()` - 处理触摸事件
- `transformViewX/Y()` - 坐标转换函数

### lappsprite.ts

精灵实现类，用于处理背景和UI元素。

**主要函数**：
- `constructor(x, y, width, height, textureId)` - 构造函数
- `render(programId)` - 渲染精灵
- `isHit(pointX, pointY)` - 检测点击
- `release()` - 释放资源

### lappglmanager.ts

管理WebGL上下文和初始化。

**主要函数**：
- `initialize(canvas)` - 初始化WebGL
- `getGl()` - 获取WebGL上下文

### lapptexturemanager.ts

管理纹理资源的加载和释放。

**主要函数**：
- `createTextureFromPngFile(fileName, usePremultiply, callback)` - 创建纹理
- `releaseTextures()` - 释放所有纹理
- `releaseTextureByTexture(texture)` - 释放指定纹理
- `releaseTextureByFilePath(fileName)` - 通过文件路径释放纹理

### lapppal.ts

平台抽象层，处理文件加载和时间管理。

**主要函数**：
- `loadFileAsBytes(filePath, callback)` - 加载文件
- `updateTime()` - 更新时间
- `getDeltaTime()` - 获取增量时间
- `printMessage(message)` - 输出消息

### touchmanager.ts

触摸管理器，处理用户输入。

**主要函数**：
- `touchesBegan(deviceX, deviceY)` - 触摸开始
- `touchesMoved(deviceX, deviceY)` - 触摸移动
- `getFlickDistance()` - 获取滑动距离
- `calculateDistance(x1, y1, x2, y2)` - 计算两点距离

### lappwavfilehandler.ts

WAV音频文件处理器，用于音频同步。

**主要函数**：
- `loadWavFile(filePath)` - 加载WAV文件
- `start(filePath)` - 开始播放
- `getRms()` - 获取均方根值
- `update(deltaTimeSeconds)` - 更新音频状态

## 调用关系

1. **初始化流程**：
   - `main.ts` → `LAppDelegate.getInstance().initialize()` → 初始化子系统
   - `LAppDelegate` → 创建并初始化 `LAppSubdelegate`
   - `LAppSubdelegate` → 初始化 `LAppLive2DManager`、`LAppView`、`LAppTextureManager` 等

2. **渲染流程**：
   - `LAppDelegate.run()` → 主循环
   - → `LAppPal.updateTime()` → 更新时间
   - → `LAppSubdelegate.update()` → 清除画布
   - → `LAppView.render()` → 渲染背景和UI
   - → `LAppLive2DManager.onUpdate()` → 更新并绘制模型

3. **交互流程**：
   - 触摸/点击事件 → `LAppSubdelegate.onPointBegan/Moved/Ended()`
   - → `LAppView.onTouchesBegan/Moved/Ended()` → 处理触摸
   - → `TouchManager` 处理触摸数据
   - → `LAppLive2DManager.onTap()/onDrag()` → 模型交互
   - → `LAppModel` 触发动作或表情变化

## 项目架构

项目采用面向对象设计，具有以下特点：

1. **单例模式**：`LAppDelegate` 使用单例模式管理应用程序生命周期
2. **代理模式**：通过 `LAppSubdelegate` 管理各个画布和相关操作
3. **工厂模式**：`LAppLive2DManager` 和 `LAppTextureManager` 负责创建和管理资源
4. **观察者模式**：通过事件监听器处理用户输入和窗口变化
5. **分层架构**：
   - 表示层：`LAppView`、`LAppSprite`
   - 业务逻辑层：`LAppModel`、`LAppLive2DManager`
   - 数据访问层：`LAppTextureManager`、`LAppWavFileHandler`
   - 基础设施层：`LAppPal`、`LAppGlManager` 