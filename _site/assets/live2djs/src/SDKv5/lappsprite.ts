/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppSubdelegate } from './lappsubdelegate';

/**
 * スプライトを実装するクラス
 * 实现精灵的类
 *
 * テクスチャＩＤ、Rectの管理
 * 管理纹理ID和矩形区域
 */
export class LAppSprite {
  /**
   * コンストラクタ
   * 构造函数
   * @param x            x座標 - x坐标
   * @param y            y座標 - y坐标
   * @param width        横幅 - 宽度
   * @param height       高さ - 高度
   * @param textureId    テクスチャ - 纹理
   */
  public constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    textureId: WebGLTexture
  ) {
    this._rect = new Rect(); // 创建矩形对象
    this._rect.left = x - width * 0.5;  // 计算左边界（中心点x减去宽度的一半）
    this._rect.right = x + width * 0.5; // 计算右边界（中心点x加上宽度的一半）
    this._rect.up = y + height * 0.5;   // 计算上边界（中心点y加上高度的一半）
    this._rect.down = y - height * 0.5; // 计算下边界（中心点y减去高度的一半）
    this._texture = textureId; // 设置纹理ID

    // 初始化各种缓冲区和位置
    this._vertexBuffer = null;
    this._uvBuffer = null;
    this._indexBuffer = null;

    this._positionLocation = null;
    this._uvLocation = null;
    this._textureLocation = null;

    this._positionArray = null;
    this._uvArray = null;
    this._indexArray = null;

    this._firstDraw = true; // 标记为首次绘制
  }

  /**
   * 解放する。
   * 释放资源
   */
  public release(): void {
    this._rect = null; // 释放矩形对象

    const gl = this._subdelegate.getGlManager().getGl(); // 获取WebGL上下文

    gl.deleteTexture(this._texture); // 删除纹理
    this._texture = null;

    gl.deleteBuffer(this._uvBuffer); // 删除UV缓冲区
    this._uvBuffer = null;

    gl.deleteBuffer(this._vertexBuffer); // 删除顶点缓冲区
    this._vertexBuffer = null;

    gl.deleteBuffer(this._indexBuffer); // 删除索引缓冲区
    this._indexBuffer = null;
  }

  /**
   * テクスチャを返す
   * 返回纹理
   */
  public getTexture(): WebGLTexture {
    return this._texture;
  }

  /**
   * 描画する。
   * 绘制
   * @param programId シェーダープログラム - 着色器程序
   * @param canvas 描画するキャンパス情報 - 绘制的画布信息
   */
  public render(programId: WebGLProgram): void {
    if (this._texture == null) {
      // ロードが完了していない
      // 加载未完成
      return;
    }

    const gl = this._subdelegate.getGlManager().getGl(); // 获取WebGL上下文

    // 初回描画時
    // 首次绘制时
    if (this._firstDraw) {
      // 何番目のattribute変数か取得
      // 获取attribute变量的位置
      this._positionLocation = gl.getAttribLocation(programId, 'position'); // 获取位置属性的位置
      gl.enableVertexAttribArray(this._positionLocation); // 启用顶点属性数组

      this._uvLocation = gl.getAttribLocation(programId, 'uv'); // 获取UV属性的位置
      gl.enableVertexAttribArray(this._uvLocation); // 启用UV属性数组

      // 何番目のuniform変数か取得
      // 获取uniform变量的位置
      this._textureLocation = gl.getUniformLocation(programId, 'texture'); // 获取纹理uniform的位置

      // uniform属性の登録
      // 注册uniform属性
      gl.uniform1i(this._textureLocation, 0); // 设置纹理单元为0

      // uvバッファ、座標初期化
      // 初始化UV缓冲区和坐标
      {
        this._uvArray = new Float32Array([
          1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0
        ]); // 创建UV坐标数组

        // uvバッファを作成
        // 创建UV缓冲区
        this._uvBuffer = gl.createBuffer(); // 创建UV缓冲区
      }

      // 頂点バッファ、座標初期化
      // 初始化顶点缓冲区和坐标
      {
        const maxWidth = this._subdelegate.getCanvas().width;   // 获取画布宽度
        const maxHeight = this._subdelegate.getCanvas().height; // 获取画布高度

        // 頂点データ
        // 顶点数据
        this._positionArray = new Float32Array([
          (this._rect.right - maxWidth * 0.5) / (maxWidth * 0.5),
          (this._rect.up - maxHeight * 0.5) / (maxHeight * 0.5),
          (this._rect.left - maxWidth * 0.5) / (maxWidth * 0.5),
          (this._rect.up - maxHeight * 0.5) / (maxHeight * 0.5),
          (this._rect.left - maxWidth * 0.5) / (maxWidth * 0.5),
          (this._rect.down - maxHeight * 0.5) / (maxHeight * 0.5),
          (this._rect.right - maxWidth * 0.5) / (maxWidth * 0.5),
          (this._rect.down - maxHeight * 0.5) / (maxHeight * 0.5)
        ]); // 计算归一化的顶点坐标

        // 頂点バッファを作成
        // 创建顶点缓冲区
        this._vertexBuffer = gl.createBuffer(); // 创建顶点缓冲区
      }

      // 頂点インデックスバッファ、初期化
      // 初始化顶点索引缓冲区
      {
        // インデックスデータ
        // 索引数据
        this._indexArray = new Uint16Array([0, 1, 2, 3, 2, 0]); // 创建索引数组，定义两个三角形组成的矩形

        // インデックスバッファを作成
        // 创建索引缓冲区
        this._indexBuffer = gl.createBuffer(); // 创建索引缓冲区
      }

      this._firstDraw = false; // 标记首次绘制已完成
    }

    // UV座標登録
    // 注册UV坐标
    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuffer); // 绑定UV缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, this._uvArray, gl.STATIC_DRAW); // 将UV数据写入缓冲区

    // attribute属性を登録
    // 注册attribute属性
    gl.vertexAttribPointer(this._uvLocation, 2, gl.FLOAT, false, 0, 0); // 指定UV属性如何从缓冲区读取数据

    // 頂点座標を登録
    // 注册顶点坐标
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer); // 绑定顶点缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, this._positionArray, gl.STATIC_DRAW); // 将顶点数据写入缓冲区

    // attribute属性を登録
    // 注册attribute属性
    gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, 0, 0); // 指定位置属性如何从缓冲区读取数据

    // 頂点インデックスを作成
    // 创建顶点索引
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer); // 绑定索引缓冲区
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexArray, gl.DYNAMIC_DRAW); // 将索引数据写入缓冲区

    // モデルの描画
    // 绘制模型
    gl.bindTexture(gl.TEXTURE_2D, this._texture); // 绑定纹理
    gl.drawElements(
      gl.TRIANGLES,
      this._indexArray.length,
      gl.UNSIGNED_SHORT,
      0
    ); // 使用索引绘制三角形
  }

  /**
   * 当たり判定
   * 碰撞检测
   * @param pointX x座標 - x坐标
   * @param pointY y座標 - y坐标
   */
  public isHit(pointX: number, pointY: number): boolean {
    // 画面サイズを取得する。
    // 获取画面尺寸
    const { height } = this._subdelegate.getCanvas(); // 获取画布高度

    // Y座標は変換する必要あり
    // Y坐标需要转换
    const y = height - pointY; // 将屏幕坐标系转换为OpenGL坐标系

    return (
      pointX >= this._rect.left &&
      pointX <= this._rect.right &&
      y <= this._rect.up &&
      y >= this._rect.down
    ); // 检查点是否在矩形区域内
  }

  /**
   * setter
   * @param subdelegate 子代理
   */
  public setSubdelegate(subdelegate: LAppSubdelegate): void {
    this._subdelegate = subdelegate; // 设置子代理
  }

  _texture: WebGLTexture; // テクスチャ - 纹理
  _vertexBuffer: WebGLBuffer; // 頂点バッファ - 顶点缓冲区
  _uvBuffer: WebGLBuffer; // uv頂点バッファ - UV顶点缓冲区
  _indexBuffer: WebGLBuffer; // 頂点インデックスバッファ - 顶点索引缓冲区
  _rect: Rect; // 矩形 - 矩形区域

  _positionLocation: number; // 位置属性的位置
  _uvLocation: number; // UV属性的位置
  _textureLocation: WebGLUniformLocation; // 纹理uniform的位置

  _positionArray: Float32Array; // 位置数组
  _uvArray: Float32Array; // UV数组
  _indexArray: Uint16Array; // 索引数组

  _firstDraw: boolean; // 是否首次绘制

  private _subdelegate: LAppSubdelegate; // 子代理
}

/**
 * 矩形类
 */
export class Rect {
  public left: number; // 左辺 - 左边界
  public right: number; // 右辺 - 右边界
  public up: number; // 上辺 - 上边界
  public down: number; // 下辺 - 下边界
}
