/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * 触摸管理器类，用于处理触摸事件和手势
 */
export class TouchManager {
  /**
   * コンストラクタ
   * 构造函数
   */
  constructor() {
    this._startX = 0.0;            // 初始化触摸开始位置的X坐标
    this._startY = 0.0;            // 初始化触摸开始位置的Y坐标
    this._lastX = 0.0;             // 初始化上次触摸的X坐标
    this._lastY = 0.0;             // 初始化上次触摸的Y坐标
    this._lastX1 = 0.0;            // 初始化双指触摸第一个触点的X坐标
    this._lastY1 = 0.0;            // 初始化双指触摸第一个触点的Y坐标
    this._lastX2 = 0.0;            // 初始化双指触摸第二个触点的X坐标
    this._lastY2 = 0.0;            // 初始化双指触摸第二个触点的Y坐标
    this._lastTouchDistance = 0.0; // 初始化上次双指触摸的距离
    this._deltaX = 0.0;            // 初始化X方向的移动距离
    this._deltaY = 0.0;            // 初始化Y方向的移动距离
    this._scale = 1.0;             // 初始化缩放比例
    this._touchSingle = false;     // 初始化单指触摸状态
    this._flipAvailable = false;   // 初始化滑动可用状态
  }

  /**
   * 获取触摸中心点的X坐标
   */
  public getCenterX(): number {
    return this._lastX;
  }

  /**
   * 获取触摸中心点的Y坐标
   */
  public getCenterY(): number {
    return this._lastY;
  }

  /**
   * 获取X方向的移动距离
   */
  public getDeltaX(): number {
    return this._deltaX;
  }

  /**
   * 获取Y方向的移动距离
   */
  public getDeltaY(): number {
    return this._deltaY;
  }

  /**
   * 获取触摸开始位置的X坐标
   */
  public getStartX(): number {
    return this._startX;
  }

  /**
   * 获取触摸开始位置的Y坐标
   */
  public getStartY(): number {
    return this._startY;
  }

  /**
   * 获取缩放比例
   */
  public getScale(): number {
    return this._scale;
  }

  /**
   * 获取当前触摸位置的X坐标
   */
  public getX(): number {
    return this._lastX;
  }

  /**
   * 获取当前触摸位置的Y坐标
   */
  public getY(): number {
    return this._lastY;
  }

  /**
   * 获取双指触摸第一个触点的X坐标
   */
  public getX1(): number {
    return this._lastX1;
  }

  /**
   * 获取双指触摸第一个触点的Y坐标
   */
  public getY1(): number {
    return this._lastY1;
  }

  /**
   * 获取双指触摸第二个触点的X坐标
   */
  public getX2(): number {
    return this._lastX2;
  }

  /**
   * 获取双指触摸第二个触点的Y坐标
   */
  public getY2(): number {
    return this._lastY2;
  }

  /**
   * 是否为单指触摸
   */
  public isSingleTouch(): boolean {
    return this._touchSingle;
  }

  /**
   * 滑动是否可用
   */
  public isFlickAvailable(): boolean {
    return this._flipAvailable;
  }

  /**
   * 禁用滑动
   */
  public disableFlick(): void {
    this._flipAvailable = false;
  }

  /**
   * タッチ開始時イベント
   * 触摸开始事件处理
   * @param deviceX タッチした画面のxの値 - 触摸屏幕的X坐标
   * @param deviceY タッチした画面のyの値 - 触摸屏幕的Y坐标
   */
  public touchesBegan(deviceX: number, deviceY: number): void {
    this._lastX = deviceX;           // 记录当前触摸的X坐标
    this._lastY = deviceY;           // 记录当前触摸的Y坐标
    this._startX = deviceX;          // 记录触摸开始位置的X坐标
    this._startY = deviceY;          // 记录触摸开始位置的Y坐标
    this._lastTouchDistance = -1.0;  // 重置触摸距离
    this._flipAvailable = true;      // 启用滑动功能
    this._touchSingle = true;        // 设置为单指触摸状态
  }

  /**
   * ドラッグ時のイベント
   * 拖动事件处理
   * @param deviceX タッチした画面のxの値 - 触摸屏幕的X坐标
   * @param deviceY タッチした画面のyの値 - 触摸屏幕的Y坐标
   */
  public touchesMoved(deviceX: number, deviceY: number): void {
    this._lastX = deviceX;           // 更新当前触摸的X坐标
    this._lastY = deviceY;           // 更新当前触摸的Y坐标
    this._lastTouchDistance = -1.0;  // 重置触摸距离
    this._touchSingle = true;        // 保持单指触摸状态
  }

  /**
   * フリックの距離測定
   * 测量滑动距离
   * @return フリック距離 - 滑动距离
   */
  public getFlickDistance(): number {
    return this.calculateDistance(
      this._startX,
      this._startY,
      this._lastX,
      this._lastY
    );
  }

  /**
   * 点１から点２への距離を求める
   * 计算两点之间的距离
   *
   * @param x1 １つ目のタッチした画面のxの値 - 第一个触摸点的X坐标
   * @param y1 １つ目のタッチした画面のyの値 - 第一个触摸点的Y坐标
   * @param x2 ２つ目のタッチした画面のxの値 - 第二个触摸点的X坐标
   * @param y2 ２つ目のタッチした画面のyの値 - 第二个触摸点的Y坐标
   */
  public calculateDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)); // 使用勾股定理计算两点距离
  }

  /**
   * ２つ目の値から、移動量を求める。
   * 根据两个值计算移动量。
   * 違う方向の場合は移動量０。同じ方向の場合は、絶対値が小さい方の値を参照する。
   * 不同方向时移动量为0。相同方向时，参考绝对值较小的值。
   *
   * @param v1 １つ目の移動量 - 第一个移动量
   * @param v2 ２つ目の移動量 - 第二个移动量
   *
   * @return 小さい方の移動量 - 较小的移动量
   */
  public calculateMovingAmount(v1: number, v2: number): number {
    if (v1 > 0.0 != v2 > 0.0) {
      return 0.0; // 如果两个值的方向不同，返回0
    }

    const sign: number = v1 > 0.0 ? 1.0 : -1.0; // 确定符号
    const absoluteValue1 = Math.abs(v1); // 计算第一个值的绝对值
    const absoluteValue2 = Math.abs(v2); // 计算第二个值的绝对值
    return (
      sign * (absoluteValue1 < absoluteValue2 ? absoluteValue1 : absoluteValue2) // 返回带有原始符号的较小绝对值
    );
  }

  _startY: number;           // タッチを開始した時のxの値 - 触摸开始时的Y坐标
  _startX: number;           // タッチを開始した時のyの値 - 触摸开始时的X坐标
  _lastX: number;            // シングルタッチ時のxの値 - 单指触摸时的X坐标
  _lastY: number;            // シングルタッチ時のyの値 - 单指触摸时的Y坐标
  _lastX1: number;           // ダブルタッチ時の一つ目のxの値 - 双指触摸时第一个触点的X坐标
  _lastY1: number;           // ダブルタッチ時の一つ目のyの値 - 双指触摸时第一个触点的Y坐标
  _lastX2: number;           // ダブルタッチ時の二つ目のxの値 - 双指触摸时第二个触点的X坐标
  _lastY2: number;           // ダブルタッチ時の二つ目のyの値 - 双指触摸时第二个触点的Y坐标
  _lastTouchDistance: number; // 2本以上でタッチしたときの指の距離 - 双指及以上触摸时手指之间的距离
  _deltaX: number;           // 前回の値から今回の値へのxの移動距離 - X方向上从上次位置到当前位置的移动距离
  _deltaY: number;           // 前回の値から今回の値へのyの移動距離 - Y方向上从上次位置到当前位置的移动距离
  _scale: number;            // このフレームで掛け合わせる拡大率。拡大操作中以外は1 - 此帧中的缩放比例，非缩放操作时为1
  _touchSingle: boolean;     // シングルタッチ時はtrue - 单指触摸时为true
  _flipAvailable: boolean;   // フリップが有効かどうか - 滑动是否可用
}
