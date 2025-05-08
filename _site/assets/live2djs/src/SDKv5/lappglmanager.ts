/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * Cubism SDKのサンプルで使用するWebGLを管理するクラス
 * 用于管理Cubism SDK示例中使用的WebGL的类
 */
export class LAppGlManager {
  /**
   * 构造函数
   */
  public constructor() {
    this._gl = null; // 初始化WebGL上下文为null
  }

  /**
   * 初始化WebGL
   * @param canvas HTML画布元素
   * @return 初始化是否成功
   */
  public initialize(canvas: HTMLCanvasElement): boolean {
    // glコンテキストを初期化
    // 初始化WebGL上下文，优先使用WebGL2
    this._gl = canvas.getContext('webgl2');

    if (!this._gl) {
      // gl初期化失敗
      // WebGL初始化失败
      alert('Cannot initialize WebGL. This browser does not support.');
      this._gl = null;
      // 以下注释掉的代码是一种替代方式，用于在文档中显示不支持提示
      // document.body.innerHTML =
      //   'This browser does not support the <code>&lt;canvas&gt;</code> element.';
      return false;
    }
    return true;
  }

  /**
   * 解放する。
   * 释放资源
   */
  public release(): void {}

  /**
   * 获取WebGL上下文
   * @return WebGL渲染上下文
   */
  public getGl(): WebGLRenderingContext | WebGL2RenderingContext {
    return this._gl;
  }

  /**
   * WebGL渲染上下文
   */
  private _gl: WebGLRenderingContext | WebGL2RenderingContext = null;
}
