/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

// 导入csmVector类，用于创建向量（数组）容器
import { csmVector } from '@framework/type/csmvector';
// 导入CubismFramework和Option，用于初始化和配置Cubism SDK
import { CubismFramework, Option } from '@framework/live2dcubismframework';
// 导入应用程序定义的常量
import * as LAppDefine from './lappdefine';
// 导入平台抽象层，提供时间管理和文件加载等功能
import { LAppPal } from './lapppal';
// 导入子代理类，负责管理各个画布和模型的渲染
import { LAppSubdelegate } from './lappsubdelegate';
// 导入日志错误函数
import { CubismLogError } from '@framework/utils/cubismdebug';

// 全局单例实例
export let s_instance: LAppDelegate = null;

/**
 * アプリケーションクラス。
 * Cubism SDKの管理を行う。
 * 应用程序类。
 * 管理Cubism SDK。
 */
export class LAppDelegate {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   * 返回类的实例（单例）。
   * 如果实例尚未创建，则在内部创建实例。
   *
   * @return クラスのインスタンス - 类的实例
   */
  public static getInstance(): LAppDelegate {
    if (s_instance == null) {
      s_instance = new LAppDelegate(); // 如果实例不存在，创建一个新实例
    }

    return s_instance; // 返回单例实例
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   * 释放类的实例（单例）。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance.release(); // 如果实例存在，释放资源
    }

    s_instance = null; // 将全局实例设为null
  }

  /**
   * 根据Canvas ID查找对应的子代理
   * @param canvasId Canvas的DOM ID
   * @returns 找到的子代理，如果未找到则返回null
   */
  public findSubdelegateByCanvasId(canvasId: string): LAppSubdelegate | null {
    // 遍历所有canvas寻找匹配的ID
    for (let i = 0; i < this._canvases.getSize(); i++) {
      const canvas = this._canvases.at(i);
      if (canvas.id === canvasId) {
        // 找到了匹配ID的canvas，返回对应的子代理
        return this._subdelegates.at(i);
      }
    }
    
    // 未找到匹配的canvas
    console.error(`[ERROR] Cannot find canvas with id: ${canvasId}`);
    return null;
  }

  /**
   * 根据Canvas ID重新加载特定canvas上的模型
   * @param canvasId Canvas的DOM ID
   * @returns 是否成功重新加载
   */
  public reloadCanvasById(canvasId: string): boolean {
    // 确保有自定义模型配置
    if (!LAppDefine.currentCustomModel) {
      console.error("[ERROR] No custom model config found");
      return false;
    }
    
    // 先找到对应的子代理
    const subdelegate = this.findSubdelegateByCanvasId(canvasId);
    if (!subdelegate) {
      return false;
    }
    
    try {
      // 获取Live2D管理器
      const live2dManager = subdelegate.getLive2DManager();
      
      // 释放当前模型
      live2dManager.releaseAllModel();
      
      // 重新初始化子代理的Live2D管理器
      live2dManager.initialize(subdelegate);
      
      // 输出调试信息
      if (LAppDefine.DebugLogEnable) {
        console.log(`[INFO] Reloaded model on canvas: ${canvasId}`);
      }
      
      return true;
    } catch (error) {
      console.error("[ERROR] Failed to reload model:", error);
      return false;
    }
  }

  /**
   * ポインタがアクティブになるときに呼ばれる。
   * 指针变为活动状态时调用。
   */
  private onPointerBegan(e: PointerEvent): void {
    // 遍历所有子代理，通知指针开始事件
    for (
      let ite = this._subdelegates.begin(); // 获取子代理列表的迭代器
      ite.notEqual(this._subdelegates.end()); // 检查是否到达列表末尾
      ite.preIncrement() // 迭代器前进
    ) {
      ite.ptr().onPointBegan(e.pageX, e.pageY); // 调用子代理的指针开始事件处理函数
    }
  }

  /**
   * ポインタが動いたら呼ばれる。
   * 指针移动时调用。
   */
  private onPointerMoved(e: PointerEvent): void {
    // 遍历所有子代理，通知指针移动事件
    for (
      let ite = this._subdelegates.begin();
      ite.notEqual(this._subdelegates.end());
      ite.preIncrement()
    ) {
      ite.ptr().onPointMoved(e.pageX, e.pageY); // 调用子代理的指针移动事件处理函数
    }
  }

  /**
   * ポインタがアクティブでなくなったときに呼ばれる。
   * 指针不再活动时调用。
   */
  private onPointerEnded(e: PointerEvent): void {
    // 遍历所有子代理，通知指针结束事件
    for (
      let ite = this._subdelegates.begin();
      ite.notEqual(this._subdelegates.end());
      ite.preIncrement()
    ) {
      ite.ptr().onPointEnded(e.pageX, e.pageY); // 调用子代理的指针结束事件处理函数
    }
  }

  /**
   * ポインタがキャンセルされると呼ばれる。
   * 指针取消时调用。
   */
  private onPointerCancel(e: PointerEvent): void {
    // 遍历所有子代理，通知触摸取消事件
    for (
      let ite = this._subdelegates.begin();
      ite.notEqual(this._subdelegates.end());
      ite.preIncrement()
    ) {
      ite.ptr().onTouchCancel(e.pageX, e.pageY); // 调用子代理的触摸取消事件处理函数
    }
  }

  /**
   * Resize canvas and re-initialize view.
   * 调整画布大小并重新初始化视图。
   */
  public onResize(): void {
    // 遍历所有子代理，通知调整大小事件
    for (let i = 0; i < this._subdelegates.getSize(); i++) {
      this._subdelegates.at(i).onResize(); // 调用子代理的大小调整处理函数
    }
  }

  /**
   * 実行処理。
   * 执行处理。
   */
  public run(): void {
    // メインループ
    // 主循环
    const loop = (): void => {
      // インスタンスの有無の確認
      // 检查实例是否存在
      if (s_instance == null) {
        return; // 如果实例不存在，则退出循环
      }

      // 時間更新
      // 更新时间
      LAppPal.updateTime(); // 更新时间信息，计算帧间隔

      // 更新所有子代理
      for (let i = 0; i < this._subdelegates.getSize(); i++) {
        this._subdelegates.at(i).update(); // 调用子代理的更新函数
      }

      // ループのために再帰呼び出し
      // 递归调用以维持循环
      requestAnimationFrame(loop); // 请求下一帧动画
    };
    loop(); // 开始主循环
  }

  /**
   * 解放する。
   * 释放资源。
   */
  private release(): void {
    this.releaseEventListener(); // 释放事件监听器
    this.releaseSubdelegates(); // 释放子代理

    // Cubism SDKの解放
    // 释放Cubism SDK
    CubismFramework.dispose(); // 释放Cubism框架

    this._cubismOption = null; // 释放Cubism选项
  }

  /**
   * イベントリスナーを解除する。
   * 解除事件监听器。
   */
  private releaseEventListener(): void {
    // 移除指针事件监听器
    document.removeEventListener('pointerup', this.pointBeganEventListener);
    this.pointBeganEventListener = null;
    document.removeEventListener('pointermove', this.pointMovedEventListener);
    this.pointMovedEventListener = null;
    document.removeEventListener('pointerdown', this.pointEndedEventListener);
    this.pointEndedEventListener = null;
    document.removeEventListener('pointerdown', this.pointCancelEventListener);
    this.pointCancelEventListener = null;
  }

  /**
   * Subdelegate を解放する
   * 释放子代理
   */
  private releaseSubdelegates(): void {
    // 遍历所有子代理并释放资源
    for (
      let ite = this._subdelegates.begin();
      ite.notEqual(this._subdelegates.end());
      ite.preIncrement()
    ) {
      ite.ptr().release(); // 调用子代理的释放函数
    }

    this._subdelegates.clear(); // 清空子代理列表
    this._subdelegates = null; // 设置子代理列表为null
  }

  /**
   * APPに必要な物を初期化する。
   * 初始化应用程序所需的内容。
   */
  public initialize(): boolean {
    // Cubism SDKの初期化
    // 初始化Cubism SDK
    this.initializeCubism();

    // 初始化子代理和事件监听器
    this.initializeSubdelegates();
    this.initializeEventListener();

    return true; // 初始化成功
  }

  /**
   * イベントリスナーを設定する。
   * 设置事件监听器。
   */
  private initializeEventListener(): void {
    // 绑定事件处理函数
    this.pointBeganEventListener = this.onPointerBegan.bind(this);
    this.pointMovedEventListener = this.onPointerMoved.bind(this);
    this.pointEndedEventListener = this.onPointerEnded.bind(this);
    this.pointCancelEventListener = this.onPointerCancel.bind(this);

    // ポインタ関連コールバック関数登録
    // 注册指针相关回调函数
    document.addEventListener('pointerdown', this.pointBeganEventListener, {
      passive: true // 使用被动事件监听器提高性能
    });
    document.addEventListener('pointermove', this.pointMovedEventListener, {
      passive: true
    });
    document.addEventListener('pointerup', this.pointEndedEventListener, {
      passive: true
    });
    document.addEventListener('pointercancel', this.pointCancelEventListener, {
      passive: true
    });
  }

  /**
   * Cubism SDKの初期化
   * 初始化Cubism SDK
   */
  private initializeCubism(): void {
    LAppPal.updateTime(); // 更新时间信息

    // setup cubism
    // 设置Cubism
    this._cubismOption.logFunction = LAppPal.printMessage; // 设置日志输出函数
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel; // 设置日志级别
    CubismFramework.startUp(this._cubismOption); // 启动Cubism框架

    // initialize cubism
    // 初始化Cubism
    CubismFramework.initialize(); // 初始化Cubism框架
  }

  /**
   * Canvasを生成配置、Subdelegateを初期化する
   * 生成并布置Canvas，初始化子代理
   */
  private initializeSubdelegates(): void {
    let width: number = 100; // 初始宽度百分比
    let height: number = 100; // 初始高度百分比
    if (LAppDefine.CanvasNum > 3) {
      // 如果画布数量大于3，计算合适的布局
      const widthunit: number = Math.ceil(Math.sqrt(LAppDefine.CanvasNum)); // 计算宽度单位数
      const heightUnit = Math.ceil(LAppDefine.CanvasNum / widthunit); // 计算高度单位数
      width = 100.0 / widthunit; // 计算每个画布的宽度百分比
      height = 100.0 / heightUnit; // 计算每个画布的高度百分比
    } else {
      // 如果画布数量小于等于3，水平排列
      width = 100.0 / LAppDefine.CanvasNum; // 计算每个画布的宽度百分比
    }

    // 准备存储画布和子代理的容器
    this._canvases.prepareCapacity(LAppDefine.CanvasNum); // 预分配画布容器容量
    this._subdelegates.prepareCapacity(LAppDefine.CanvasNum); // 预分配子代理容器容量
    
    // 检查是否有自定义模型配置
    const hasCustomConfig = LAppDefine.currentCustomModel !== null;
    
    // 创建画布元素
    for (let i = 0; i < LAppDefine.CanvasNum; i++) {
      let canvas: HTMLCanvasElement;
      
      // 如果有自定义配置且这是第一个canvas，尝试查找现有的canvas
      if (hasCustomConfig && i === 0) {
        const customCanvasId = LAppDefine.currentCustomModel.canvasId;
        canvas = document.getElementById(customCanvasId) as HTMLCanvasElement;
        
        // 如果没有找到指定ID的canvas，创建一个新的
        if (!canvas) {
          console.warn(`[WARN] Canvas with id ${customCanvasId} not found, creating a new one`);
          canvas = document.createElement('canvas');
          canvas.id = customCanvasId;
          document.body.appendChild(canvas);
        }
      } else {
        // 为其他canvas创建新元素
        canvas = document.createElement('canvas');
        canvas.id = `live2d-${i}`;
        document.body.appendChild(canvas);
      }
      
      // 设置canvas样式
      canvas.style.width = `${width}vw`;
      canvas.style.height = `${height}vh`;
      
      // 添加到容器
      this._canvases.pushBack(canvas);
    }

    // 初始化所有子代理
    for (let i = 0; i < this._canvases.getSize(); i++) {
      const subdelegate = new LAppSubdelegate(); // 创建新的子代理实例
      subdelegate.initialize(this._canvases.at(i)); // 初始化子代理，绑定画布
      this._subdelegates.pushBack(subdelegate); // 将子代理添加到容器中
    }

    // 检查所有画布的上下文是否丢失
    for (let i = 0; i < LAppDefine.CanvasNum; i++) {
      if (this._subdelegates.at(i).isContextLost()) {
        CubismLogError(
          `The context for Canvas at index ${i} was lost, possibly because the acquisition limit for WebGLRenderingContext was reached.`
        ); // 记录错误：可能是因为达到WebGL渲染上下文的获取限制
      }
    }
  }

  /**
   * Privateなコンストラクタ
   * 私有构造函数
   */
  private constructor() {
    this._cubismOption = new Option(); // 创建Cubism选项
    this._subdelegates = new csmVector<LAppSubdelegate>(); // 创建子代理容器
    this._canvases = new csmVector<HTMLCanvasElement>(); // 创建画布容器
  }

  /**
   * Cubism SDK Option
   * Cubism SDK选项
   */
  private _cubismOption: Option;

  /**
   * 操作対象のcanvas要素
   * 操作对象的canvas元素
   */
  private _canvases: csmVector<HTMLCanvasElement>;

  /**
   * Subdelegate
   * 子代理
   */
  private _subdelegates: csmVector<LAppSubdelegate>;

  /**
   * 登録済みイベントリスナー 関数オブジェクト
   * 已注册的事件监听器函数对象 - 指针开始
   */
  private pointBeganEventListener: (this: Document, ev: PointerEvent) => void;

  /**
   * 登録済みイベントリスナー 関数オブジェクト
   * 已注册的事件监听器函数对象 - 指针移动
   */
  private pointMovedEventListener: (this: Document, ev: PointerEvent) => void;

  /**
   * 登録済みイベントリスナー 関数オブジェクト
   * 已注册的事件监听器函数对象 - 指针结束
   */
  private pointEndedEventListener: (this: Document, ev: PointerEvent) => void;

  /**
   * 登録済みイベントリスナー 関数オブジェクト
   * 已注册的事件监听器函数对象 - 指针取消
   */
  private pointCancelEventListener: (this: Document, ev: PointerEvent) => void;
}
