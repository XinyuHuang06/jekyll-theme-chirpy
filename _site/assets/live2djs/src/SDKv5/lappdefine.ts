/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

// 导入LogLevel枚举，用于设置日志级别
import { LogLevel } from '@framework/live2dcubismframework';

/**
 * Sample Appで使用する定数
 * 示例应用中使用的常量
 */

// Canvas width and height pixel values, or dynamic screen size ('auto').
// 画布宽度和高度像素值，或动态屏幕尺寸（'auto'）
export const CanvasSize: { width: number; height: number } | 'auto' = 'auto';

// キャンバスの数
// 画布数量
export const CanvasNum = 1;

// 画面
// 视图缩放相关设置
export const ViewScale = 1.0;         // 默认视图缩放比例
export const ViewMaxScale = 2.0;      // 最大视图缩放比例
export const ViewMinScale = 0.8;      // 最小视图缩放比例

// 逻辑视图坐标范围（默认范围）
export const ViewLogicalLeft = -1.0;    // 视图逻辑左边界
export const ViewLogicalRight = 1.0;    // 视图逻辑右边界
export const ViewLogicalBottom = -1.0;  // 视图逻辑底部边界
export const ViewLogicalTop = 1.0;      // 视图逻辑顶部边界

// 逻辑视图坐标范围（最大范围）
export const ViewLogicalMaxLeft = -2.0;    // 视图逻辑最大左边界
export const ViewLogicalMaxRight = 2.0;    // 视图逻辑最大右边界
export const ViewLogicalMaxBottom = -2.0;  // 视图逻辑最大底部边界
export const ViewLogicalMaxTop = 2.0;      // 视图逻辑最大顶部边界

// 相対パス
// 资源文件的相对路径
export const ResourcesPath = './Resources/';

// モデルの後ろにある背景の画像ファイル
// 模型背后的背景图片文件名 - 设置为null以禁用背景
export const BackImageName = null; // 'back_class_normal.png';

// 歯車
// 齿轮图标文件名（用于设置按钮）- 设置为null以禁用齿轮图标
export const GearImageName = null; // 'icon_gear.png';

// 終了ボタン
// 关闭按钮图片文件名
export const PowerImageName = 'CloseNormal.png';

// モデル定義---------------------------------------------
// 模型定义---------------------------------------------

// モデルを配置したディレクトリ名の配列
// ディレクトリ名とmodel3.jsonの名前を一致させておくこと
// 模型目录名称数组，目录名应与model3.json的名称保持一致
export const ModelDir: string[] = [
  'Haru',
  'Hiyori',
  'Mark',
  'Natori',
  'Rice',
  'Mao',
  'Wanko',
  '黍',
];
// 模型目录的数量
export const ModelDirSize: number = ModelDir.length;

// 外部定義ファイル（json）と合わせる
// 与外部定义文件(json)匹配的动作组名称
export const MotionGroupIdle = 'Idle';        // 空闲状态动作组
export const MotionGroupTapBody = 'TapBody';  // 点击身体时的动作组

// 外部定義ファイル（json）と合わせる
// 与外部定义文件(json)匹配的点击区域名称
export const HitAreaNameHead = 'Head';  // 头部点击区域
export const HitAreaNameBody = 'Body';  // 身体点击区域

// モーションの優先度定数
// 动作优先级常量
export const PriorityNone = 0;     // 无优先级
export const PriorityIdle = 1;     // 空闲状态优先级
export const PriorityNormal = 2;   // 普通优先级
export const PriorityForce = 3;    // 强制优先级

// MOC3の一貫性検証オプション
// MOC3一致性验证选项
export const MOCConsistencyValidationEnable = true;

// デバッグ用ログの表示オプション
// 调试日志显示选项
export let DebugLogEnable = false;  // 将这里改为变量，而不是只读属性
export let DebugTouchLogEnable = false;  // 将这里改为变量，而不是只读属性

// Frameworkから出力するログのレベル設定
// 从Framework输出的日志级别设置
export const CubismLoggingLevel: LogLevel = LogLevel.LogLevel_Verbose;

// デフォルトのレンダーターゲットサイズ
// 默认渲染目标大小
export const RenderTargetWidth = 1900;    // 渲染目标宽度
export const RenderTargetHeight = 1000;   // 渲染目标高度

// 自定义模型加载和切换的配置
export interface CustomModelConfig {
  canvasId: string;
  modelPath: string;
  modelJsonName: string;
}

// 用于保存当前的模型配置
export let currentCustomModel: CustomModelConfig = null;

// 其他变量，用于存储额外状态
let captureCanvas = false;
let modelPath = '';
let modelJsonName = '';
let preLoadMotion = true;

// 补充定义函数
export const setCaptureCanvas = function(capture: boolean): void {
  captureCanvas = capture;
};

export const defineModelPath = function(path: string, jsonName: string): void {
  modelPath = path;
  modelJsonName = jsonName;
};

export const defineDebug = function(debug: boolean, debugMouse: boolean): void {
  // 直接设置变量，而不是尝试使用this
  DebugLogEnable = debug;
  DebugTouchLogEnable = debugMouse;
};

export const setPreLoadMotion = function(motion: boolean): void {
  preLoadMotion = motion;
};

/**
 * 自定义模型加载配置
 * @param canvasId 要使用的Canvas元素ID
 * @param modelPath 模型文件夹路径
 * @param modelJsonName 模型JSON文件名
 */
export const customizeModelLoad = function(canvasId: string, modelPath: string, modelJsonName: string): void {
  // 确保模型路径以斜杠结尾
  const normalizedPath = modelPath.endsWith('/') ? modelPath : modelPath + '/';
  
  // 保存自定义模型配置
  currentCustomModel = {
    canvasId: canvasId,
    modelPath: normalizedPath,
    modelJsonName: modelJsonName
  };
  
  // 同时更新模型路径和JSON名称
  defineModelPath(normalizedPath, modelJsonName);
  
  if (DebugLogEnable) {
    console.log(`[LAppDefine] Customizing model load: canvas=${canvasId}, path=${normalizedPath}, json=${modelJsonName}`);
  }
};

/**
 * 自定义模型切换配置
 * @param canvasId 要使用的Canvas元素ID
 * @param modelPath 模型文件夹路径
 * @param modelJsonName 模型JSON文件名
 */
export const customizeModelChange = function(canvasId: string, modelPath: string, modelJsonName: string): void {
  // 确保模型路径以斜杠结尾
  const normalizedPath = modelPath.endsWith('/') ? modelPath : modelPath + '/';
  
  // 保存自定义模型配置
  currentCustomModel = {
    canvasId: canvasId,
    modelPath: normalizedPath,
    modelJsonName: modelJsonName
  };
  
  // 同时更新模型路径和JSON名称
  defineModelPath(normalizedPath, modelJsonName);
  
  if (DebugLogEnable) {
    console.log(`[LAppDefine] Customizing model change: canvas=${canvasId}, path=${normalizedPath}, json=${modelJsonName}`);
  }
};