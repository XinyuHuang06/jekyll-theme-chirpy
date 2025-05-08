/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * プラットフォーム依存機能を抽象化する Cubism Platform Abstraction Layer.
 * 抽象化平台依赖功能的Cubism平台抽象层。
 *
 * ファイル読み込みや時刻取得等のプラットフォームに依存する関数をまとめる。
 * 汇总了文件读取和时间获取等依赖于平台的函数。
 */
export class LAppPal {
  /**
   * ファイルをバイトデータとして読みこむ
   * 将文件作为字节数据读取
   *
   * @param filePath 読み込み対象ファイルのパス - 要读取文件的路径
   * @return
   * {
   *      buffer,   読み込んだバイトデータ - 读取的字节数据
   *      size        ファイルサイズ - 文件大小
   * }
   */
  public static loadFileAsBytes(
    filePath: string,
    callback: (arrayBuffer: ArrayBuffer, size: number) => void
  ): void {
    // 使用fetch API加载文件
    fetch(filePath)
      .then(response => response.arrayBuffer()) // 将响应转换为ArrayBuffer
      .then(arrayBuffer => callback(arrayBuffer, arrayBuffer.byteLength)); // 回调函数传递数据和大小
  }

  /**
   * デルタ時間（前回フレームとの差分）を取得する
   * 获取增量时间（与前一帧的时间差）
   * @return デルタ時間[ms] - 增量时间[秒]
   */
  public static getDeltaTime(): number {
    return this.deltaTime; // 返回计算好的增量时间
  }

  /**
   * 更新时间信息
   */
  public static updateTime(): void {
    this.currentFrame = Date.now(); // 获取当前时间戳
    this.deltaTime = (this.currentFrame - this.lastFrame) / 1000; // 计算与上一帧的时间差（转换为秒）
    this.lastFrame = this.currentFrame; // 更新上一帧的时间戳
  }

  /**
   * メッセージを出力する
   * 输出消息
   * @param message 文字列 - 要输出的字符串
   */
  public static printMessage(message: string): void {
    console.log(message); // 使用控制台输出消息
  }

  // 上次更新的时间戳
  static lastUpdate = Date.now();

  // 当前帧的时间戳
  static currentFrame = 0.0;
  // 上一帧的时间戳
  static lastFrame = 0.0;
  // 帧间增量时间（单位：秒）
  static deltaTime = 0.0;
}
