/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

// 导入csmVector和iterator类型，用于创建向量容器和迭代器
import { csmVector, iterator } from '@framework/type/csmvector';
// 导入GL管理器类
import { LAppGlManager } from './lappglmanager';

/**
 * テクスチャ管理クラス
 * 画像読み込み、管理を行うクラス。
 * 纹理管理类
 * 负责图像加载和管理的类。
 */
export class LAppTextureManager {
  /**
   * コンストラクタ
   * 构造函数
   */
  public constructor() {
    this._textures = new csmVector<TextureInfo>(); // 创建纹理信息向量容器
  }

  /**
   * 解放する。
   * 释放资源
   */
  public release(): void {
    // 遍历所有纹理并删除
    for (
      let ite: iterator<TextureInfo> = this._textures.begin(); // 获取纹理容器的迭代器
      ite.notEqual(this._textures.end()); // 检查是否到达容器末尾
      ite.preIncrement() // 迭代器前进
    ) {
      this._glManager.getGl().deleteTexture(ite.ptr().id); // 删除WebGL纹理
    }
    this._textures = null; // 释放纹理容器
  }

  /**
   * 画像読み込み
   * 图像加载
   *
   * @param fileName 読み込む画像ファイルパス名 - 要加载的图像文件路径名
   * @param usePremultiply Premult処理を有効にするか - 是否启用预乘alpha处理
   * @return 画像情報、読み込み失敗時はnullを返す - 图像信息，加载失败时返回null
   */
  public createTextureFromPngFile(
    fileName: string,
    usePremultiply: boolean,
    callback: (textureInfo: TextureInfo) => void
  ): void {
    // search loaded texture already
    // 搜索已加载的纹理
    for (
      let ite: iterator<TextureInfo> = this._textures.begin(); // 获取纹理容器的迭代器
      ite.notEqual(this._textures.end()); // 检查是否到达容器末尾
      ite.preIncrement() // 迭代器前进
    ) {
      if (
        ite.ptr().fileName == fileName &&
        ite.ptr().usePremultply == usePremultiply
      ) {
        // 2回目以降はキャッシュが使用される(待ち時間なし)
        // WebKitでは同じImageのonloadを再度呼ぶには再インスタンスが必要
        // 詳細：https://stackoverflow.com/a/5024181
        // 第二次及以后使用缓存（无等待时间）
        // 在WebKit中，要再次调用同一Image的onload，需要重新创建实例
        // 详情：https://stackoverflow.com/a/5024181
        ite.ptr().img = new Image(); // 创建新的图像实例
        ite
          .ptr()
          .img.addEventListener('load', (): void => callback(ite.ptr()), {
            passive: true
          }); // 添加加载完成事件监听器
        ite.ptr().img.src = fileName; // 设置图像源
        return;
      }
    }

    // データのオンロードをトリガーにする
    // 以数据加载完成为触发器
    const img = new Image(); // 创建新图像实例
    img.addEventListener(
      'load',
      (): void => {
        // テクスチャオブジェクトの作成
        // 创建纹理对象
        const tex: WebGLTexture = this._glManager.getGl().createTexture(); // 创建WebGL纹理

        // テクスチャを選択
        // 选择纹理
        this._glManager
          .getGl()
          .bindTexture(this._glManager.getGl().TEXTURE_2D, tex); // 绑定纹理到目标

        // テクスチャにピクセルを書き込む
        // 设置纹理参数
        this._glManager
          .getGl()
          .texParameteri(
            this._glManager.getGl().TEXTURE_2D,
            this._glManager.getGl().TEXTURE_MIN_FILTER,
            this._glManager.getGl().LINEAR_MIPMAP_LINEAR
          ); // 设置缩小过滤器为线性MIP映射线性
        this._glManager
          .getGl()
          .texParameteri(
            this._glManager.getGl().TEXTURE_2D,
            this._glManager.getGl().TEXTURE_MAG_FILTER,
            this._glManager.getGl().LINEAR
          ); // 设置放大过滤器为线性

        // Premult処理を行わせる
        // 执行预乘alpha处理
        if (usePremultiply) {
          this._glManager
            .getGl()
            .pixelStorei(
              this._glManager.getGl().UNPACK_PREMULTIPLY_ALPHA_WEBGL,
              1
            ); // 启用预乘alpha
        }

        // テクスチャにピクセルを書き込む
        // 将像素写入纹理
        this._glManager
          .getGl()
          .texImage2D(
            this._glManager.getGl().TEXTURE_2D,
            0,
            this._glManager.getGl().RGBA,
            this._glManager.getGl().RGBA,
            this._glManager.getGl().UNSIGNED_BYTE,
            img
          ); // 将图像数据写入纹理

        // ミップマップを生成
        // 生成MIP贴图
        this._glManager
          .getGl()
          .generateMipmap(this._glManager.getGl().TEXTURE_2D); // 生成MIP贴图

        // テクスチャをバインド
        // 解绑纹理
        this._glManager
          .getGl()
          .bindTexture(this._glManager.getGl().TEXTURE_2D, null); // 解除纹理绑定

        const textureInfo: TextureInfo = new TextureInfo(); // 创建纹理信息对象
        if (textureInfo != null) {
          textureInfo.fileName = fileName; // 设置文件名
          textureInfo.width = img.width; // 设置宽度
          textureInfo.height = img.height; // 设置高度
          textureInfo.id = tex; // 设置纹理ID
          textureInfo.img = img; // 设置图像对象
          textureInfo.usePremultply = usePremultiply; // 设置是否使用预乘alpha
          if (this._textures != null) {
            this._textures.pushBack(textureInfo); // 将纹理信息添加到容器中
          }
        }

        callback(textureInfo); // 调用回调函数，传递纹理信息
      },
      { passive: true }
    ); // 添加加载完成事件监听器
    img.src = fileName; // 设置图像源，开始加载
  }

  /**
   * 画像の解放
   * 释放图像
   *
   * 配列に存在する画像全てを解放する。
   * 释放数组中存在的所有图像。
   */
  public releaseTextures(): void {
    // 遍历所有纹理并删除
    for (let i = 0; i < this._textures.getSize(); i++) {
      this._glManager.getGl().deleteTexture(this._textures.at(i).id); // 删除WebGL纹理
      this._textures.set(i, null); // 清空纹理信息
    }

    this._textures.clear(); // 清空纹理容器
  }

  /**
   * 画像の解放
   * 释放图像
   *
   * 指定したテクスチャの画像を解放する。
   * 释放指定纹理的图像。
   * @param texture 解放するテクスチャ - 要释放的纹理
   */
  public releaseTextureByTexture(texture: WebGLTexture): void {
    // 查找并删除指定纹理
    for (let i = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).id != texture) {
        continue; // 如果不是目标纹理，继续查找
      }

      this._glManager.getGl().deleteTexture(this._textures.at(i).id); // 删除WebGL纹理
      this._textures.set(i, null); // 清空纹理信息
      this._textures.remove(i); // 从容器中移除
      break;
    }
  }

  /**
   * 画像の解放
   * 释放图像
   *
   * 指定した名前の画像を解放する。
   * 释放指定名称的图像。
   * @param fileName 解放する画像ファイルパス名 - 要释放的图像文件路径名
   */
  public releaseTextureByFilePath(fileName: string): void {
    // 查找并删除指定文件名的纹理
    for (let i = 0; i < this._textures.getSize(); i++) {
      if (this._textures.at(i).fileName == fileName) {
        this._glManager.getGl().deleteTexture(this._textures.at(i).id); // 删除WebGL纹理
        this._textures.set(i, null); // 清空纹理信息
        this._textures.remove(i); // 从容器中移除
        break;
      }
    }
  }

  /**
   * setter
   * @param glManager GL管理器
   */
  public setGlManager(glManager: LAppGlManager): void {
    this._glManager = glManager; // 设置GL管理器
  }

  _textures: csmVector<TextureInfo>; // 纹理信息容器
  private _glManager: LAppGlManager; // GL管理器
}

/**
 * 画像情報構造体
 * 图像信息结构体
 */
export class TextureInfo {
  img: HTMLImageElement; // 画像 - 图像
  id: WebGLTexture = null; // テクスチャ - 纹理
  width = 0; // 横幅 - 宽度
  height = 0; // 高さ - 高度
  usePremultply: boolean; // Premult処理を有効にするか - 是否启用预乘alpha处理
  fileName: string; // ファイル名 - 文件名
}
