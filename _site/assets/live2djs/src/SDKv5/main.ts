/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

// 导入核心脚本
import coreScript from '../SDKv5/Core/live2dcubismcore.min.js';

// 执行核心脚本
const script = document.createElement('script');
script.textContent = coreScript;
document.head.appendChild(script);

// 导入LAppDelegate类，这是应用程序的主要类，负责初始化和运行整个应用
import { LAppDelegate } from './lappdelegate';
// 导入所有LAppDefine中定义的常量，这些常量用于配置应用程序
import * as LAppDefine from './lappdefine';
import {LAppLive2DManager} from "./lapplive2dmanager";
/**
 * ブラウザロード後の処理
 * 浏览器加载后的处理
 */
declare global {
  interface Window {
      live2dv5: any;
      downloadCap: any;
      webpReady: any;
  }
}
window.live2dv5 = window.live2dv5 || {};
//  
window.live2dv5.CaptureCanvas = (): void => {
  LAppDefine.setCaptureCanvas(true);
};

/**
 * 加载模型
 * @param canvasId 要使用的Canvas元素ID
 * @param modelPath 模型文件夹路径
 * @param modelJsonName 模型JSON文件名
 */
window.live2dv5.load = (canvasId: string, modelPath: string, modelJsonName: string): void => {
  // 设置调试选项
  LAppDefine.defineDebug(window.live2dv5.debug ? true : false, window.live2dv5.debugMousemove ? true : false);
  
  // 创建一个自定义的模型加载配置
  LAppDefine.customizeModelLoad(canvasId, modelPath, modelJsonName);
  
  // 初始化LAppDelegate
  if (!LAppDelegate.getInstance().initialize()) {
    console.error("Failed to initialize LAppDelegate");
    return;
  }
  
  // 运行主循环
  LAppDelegate.getInstance().run();
};

/**
 * 切换模型
 * @param canvasId 要使用的Canvas元素ID
 * @param modelPath 模型文件夹路径
 * @param modelJsonName 模型JSON文件名
 */
window.live2dv5.change = (canvasId: string, modelPath: string, modelJsonName: string): void => {
  // 创建一个自定义的模型切换配置
  LAppDefine.customizeModelChange(canvasId, modelPath, modelJsonName);
  
  // 获取LAppDelegate实例
  const delegate = LAppDelegate.getInstance();
  
  // 只重新加载指定的canvas上的模型
  if (delegate.reloadCanvasById(canvasId)) {
    console.log(`Successfully changed model on canvas ${canvasId}`);
  } else {
    console.error(`Failed to change model on canvas ${canvasId}`);
  }
};

// 释放模型
window.live2dv5.release = ():void => {
  LAppDelegate.releaseInstance();
};

// 调试
// window.live2dv5.debugMousemove();
// window.live2dv5.debug();

// 预载动作数据
window.live2dv5.setPreLoadMotion = (preLoadMotion: boolean): void => {
  LAppDefine.setPreLoadMotion(preLoadMotion);
};

// 释放资源
window.addEventListener(
  'beforeunload',
  (): void => LAppDelegate.releaseInstance(), // 释放LAppDelegate的实例，进行资源清理
  { passive: true } // 使用被动事件监听器，提高性能
);