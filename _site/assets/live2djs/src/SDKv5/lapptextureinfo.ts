/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * 纹理信息类
 */
export class TextureInfo {
  /**
   * 文件名
   */
  public fileName: string;

  /**
   * 宽度
   */
  public width: number;

  /**
   * 高度
   */
  public height: number;

  /**
   * 纹理ID
   */
  public id: WebGLTexture | null;

  /**
   * 是否使用预乘α
   */
  public usePremultply: boolean;

  /**
   * 构造函数
   */
  constructor() {
    this.fileName = '';
    this.width = 0;
    this.height = 0;
    this.id = null;
    this.usePremultply = false;
  }
} 