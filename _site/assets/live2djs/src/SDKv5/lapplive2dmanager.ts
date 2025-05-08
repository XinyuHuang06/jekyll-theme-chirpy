/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

// 导入CubismMatrix44类，用于处理4x4矩阵变换
import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
// 导入ACubismMotion类，用于处理Cubism动作
import { ACubismMotion } from '@framework/motion/acubismmotion';
// 导入csmVector类，用于创建向量容器
import { csmVector } from '@framework/type/csmvector';

// 导入应用程序定义的常量
import * as LAppDefine from './lappdefine';
// 导入LAppModel类，用于管理Live2D模型
import { LAppModel } from './lappmodel';
// 导入平台抽象层
import { LAppPal } from './lapppal';
// 导入子代理类
import { LAppSubdelegate } from './lappsubdelegate';

/**
 * サンプルアプリケーションにおいてCubismModelを管理するクラス
 * モデル生成と破棄、タップイベントの処理、モデル切り替えを行う。
 * 在示例应用程序中管理Cubism模型的类
 * 执行模型生成和销毁、触摸事件处理、模型切换。
 */
export class LAppLive2DManager {
  /**
   * 現在のシーンで保持しているすべてのモデルを解放する
   * 释放当前场景中保存的所有模型
   */
  public releaseAllModel(): void {
    this._models.clear(); // 清除所有模型
  }

  /**
   * 画面をドラッグした時の処理
   * 屏幕拖动时的处理
   *
   * @param x 画面のX座標 - 屏幕的X坐标
   * @param y 画面のY座標 - 屏幕的Y坐标
   */
  public onDrag(x: number, y: number): void {
    const model: LAppModel = this._models.at(0); // 获取第一个模型
    if (model) {
      model.setDragging(x, y); // 设置模型的拖动状态
    }
  }

  /**
   * 画面をタップした時の処理
   * 屏幕点击时的处理
   *
   * @param x 画面のX座標 - 屏幕的X坐标
   * @param y 画面のY座標 - 屏幕的Y坐标
   */
  public onTap(x: number, y: number): void {
    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(
        `[APP]tap point: {x: ${x.toFixed(2)} y: ${y.toFixed(2)}}`
      ); // 打印点击位置的坐标
    }

    const model: LAppModel = this._models.at(0); // 获取第一个模型

    // 获取模型中所有可点击区域并检测
    const hitAreaNames = model.getHitAreaNames();
    let hitFound = false;

    // 遍历所有可点击区域进行检测
    if (hitAreaNames) {
      for (let i = 0; i < hitAreaNames.length; i++) {
        const hitAreaName = hitAreaNames[i];
        
        if (model.hitTest(hitAreaName, x, y)) {
          hitFound = true;
          
          if (LAppDefine.DebugLogEnable) {
            LAppPal.printMessage(`[APP]hit area: [${hitAreaName}]`);
          }
          const motionGroupCount = model._modelSetting.getMotionGroupCount(); // 获取动作组数量
          for (let j = 0; j < motionGroupCount; j++) {
            const hitMotion = model._modelSetting.getMotionGroupName(j);
            // 如果点击区域对应的动作组存在，则执行随机动作
            if (hitMotion=='Tap'+hitAreaName) {
              if (LAppDefine.DebugLogEnable) {
                // 输出信息：点击区域和动作组
                LAppPal.printMessage(`[APP]hit motion: [${hitMotion}]`);
              }
              model.startRandomMotion(
                hitMotion,
                LAppDefine.PriorityNormal,
                this.finishedMotion,
                this.beganMotion
              );
              break;
            }
          }
          break; // 找到一个命中区域后退出循环
        }
      }
    }
    // 如果没有找到命中区域，则尝试检测默认的Head和Body区域
    if (!hitFound) {
      // 检测是否点击头部区域
      if (model.hitTest(LAppDefine.HitAreaNameHead, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(`[APP]hit area: [${LAppDefine.HitAreaNameHead}]`);
        }
        model.setRandomExpression(); // 随机设置表情
      } 
      // 检测是否点击身体区域
      else if (model.hitTest(LAppDefine.HitAreaNameBody, x, y)) {
        if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(`[APP]hit area: [${LAppDefine.HitAreaNameBody}]`);
        }
        model.startRandomMotion(
          LAppDefine.MotionGroupTapBody,  // 点击身体时的动作组
          LAppDefine.PriorityNormal,      // 普通优先级
          this.finishedMotion,            // 动作完成时的回调
          this.beganMotion                // 动作开始时的回调
        );
      }
    }
  }

  /**
   * 画面を更新するときの処理
   * モデルの更新処理及び描画処理を行う
   * 屏幕更新时的处理
   * 执行模型的更新处理和绘制处理
   */
  public onUpdate(): void {
    const { width, height } = this._subdelegate.getCanvas(); // 获取画布的宽高

    const projection: CubismMatrix44 = new CubismMatrix44(); // 创建投影矩阵
    const model: LAppModel = this._models.at(0); // 获取第一个模型

    if (model.getModel()) {
      // 根据模型和画布的尺寸调整缩放比例
      if (model.getModel().getCanvasWidth() > 1.0 && width < height) {
        // 横に長いモデルを縦長ウィンドウに表示する際モデルの横サイズでscaleを算出する
        // 在竖直窗口中显示横向长模型时，根据模型的横向尺寸计算缩放比例
        model.getModelMatrix().setWidth(2.0);
        projection.scale(1.0, width / height);
      } else {
        projection.scale(height / width, 1.0);
      }

      // 必要があればここで乗算
      // 如果需要，在此处进行乘法运算
      if (this._viewMatrix != null) {
        projection.multiplyByMatrix(this._viewMatrix); // 与视图矩阵相乘
      }
    }

    model.update(); // 更新模型
    model.draw(projection); // 绘制模型（引用传递，projection会被修改）
  }

  /**
   * 次のシーンに切りかえる
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   * 切换到下一个场景
   * 在示例应用程序中执行模型集合的切换。
   */
  public nextScene(): void {
    const no: number = (this._sceneIndex + 1) % LAppDefine.ModelDirSize; // 计算下一个场景索引
    this.changeScene(no); // 切换场景
  }

  /**
   * シーンを切り替える
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   * 切换场景
   * 在示例应用程序中执行模型集合的切换。
   * @param index 切换目标的索引值
   */
  private changeScene(index: number): void {
    this._sceneIndex = index; // 设置当前场景索引

    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(`[APP]model index: ${this._sceneIndex}`);
    }
    
    // 检查是否有自定义模型配置
    if (LAppDefine.currentCustomModel) {
      const customConfig = LAppDefine.currentCustomModel;
      let modelPath = customConfig.modelPath;
      const modelJsonName = customConfig.modelJsonName;
      
      // 确保模型路径以斜杠结尾
      if (!modelPath.endsWith('/')) {
        modelPath += '/';
      }
      
      if (LAppDefine.DebugLogEnable) {
        LAppPal.printMessage(`[APP]loading custom model: ${modelPath}${modelJsonName}`);
      }
      
      this.releaseAllModel(); // 释放所有当前模型
      const instance = new LAppModel(); // 创建新的模型实例
      instance.setSubdelegate(this._subdelegate); // 设置子代理
      
      // 修复路径格式，确保路径正确
      // 如果modelPath已经包含了模型名称目录，则直接使用
      // 如果modelJsonName不包含.model3.json后缀，则添加后缀
      let finalModelPath = modelPath;
      let finalModelJsonName = modelJsonName;
      
      // 确保modelJsonName有正确的扩展名
      if (!finalModelJsonName.endsWith('.model3.json')) {
        finalModelJsonName = finalModelJsonName.endsWith('.json') 
          ? finalModelJsonName 
          : `${finalModelJsonName}.model3.json`;
      }
      
      if (LAppDefine.DebugLogEnable) {
        LAppPal.printMessage(`[APP]final model path: ${finalModelPath}${finalModelJsonName}`);
      }
      
      instance.loadAssets(finalModelPath, finalModelJsonName); // 加载模型资源
      this._models.pushBack(instance); // 将模型添加到容器中
      
      return;
    }
    
    // 标准模型加载逻辑（当没有自定义配置时）
    // 从ModelDir[]中保存的目录名
    // 决定model3.json的路径。
    // 确保目录名和model3.json的名称一致。
    const model: string = LAppDefine.ModelDir[index]; // 获取模型目录名
    const modelPath: string = LAppDefine.ResourcesPath + model + '/'; // 构建模型路径，确保以/结尾
    let modelJsonName: string = LAppDefine.ModelDir[index]; // 获取模型JSON名称
    modelJsonName += '.model3.json'; // 添加.model3.json后缀

    this.releaseAllModel(); // 释放所有当前模型
    const instance = new LAppModel(); // 创建新的模型实例
    instance.setSubdelegate(this._subdelegate); // 设置子代理
    instance.loadAssets(modelPath, modelJsonName); // 加载模型资源
    this._models.pushBack(instance); // 将模型添加到容器中
  }
  

  /**
   * 设置视图矩阵
   * @param m 视图矩阵
   */
  public setViewMatrix(m: CubismMatrix44) {
    for (let i = 0; i < 16; i++) {
      this._viewMatrix.getArray()[i] = m.getArray()[i]; // 复制矩阵值
    }
  }

  /**
   * モデルの追加
   * 添加模型
   */
  public addModel(sceneIndex: number = 0): void {
    this._sceneIndex = sceneIndex; // 设置场景索引
    this.changeScene(this._sceneIndex); // 切换到指定场景
  }

  /**
   * コンストラクタ
   * 构造函数
   */
  public constructor() {
    this._subdelegate = null; // 初始化子代理为null
    this._viewMatrix = new CubismMatrix44(); // 创建视图矩阵
    this._models = new csmVector<LAppModel>(); // 创建模型容器
    this._sceneIndex = 0; // 初始化场景索引为0
  }

  /**
   * 解放する。
   * 释放资源
   */
  public release(): void {}

  /**
   * 初期化する。
   * 初始化
   * @param subdelegate 子代理
   */
  public initialize(subdelegate: LAppSubdelegate): void {
    this._subdelegate = subdelegate; // 设置子代理
    this.changeScene(this._sceneIndex); // 切换到初始场景
  }

  /**
   * 自身が所属するSubdelegate
   * 自身所属的子代理
   */
  private _subdelegate: LAppSubdelegate;

  _viewMatrix: CubismMatrix44; // モデル描画に用いるview行列 - 用于模型绘制的视图矩阵
  _models: csmVector<LAppModel>; // モデルインスタンスのコンテナ - 模型实例的容器
  private _sceneIndex: number; // 表示するシーンのインデックス値 - 要显示的场景的索引值

  // モーション再生開始のコールバック関数
  // 动作播放开始的回调函数
  beganMotion = (self: ACubismMotion): void => {
    LAppPal.printMessage('Motion Began:');
    console.log(self);
  };
  // モーション再生終了のコールバック関数
  // 动作播放结束的回调函数
  finishedMotion = (self: ACubismMotion): void => {
    LAppPal.printMessage('Motion Finished:');
    console.log(self);
    
    // 获取当前模型，让其回到初始状态
    const model = this._models.at(0);
    if (model) {
      // 使用轻微延迟确保动作完全结束
      setTimeout(() => {
        model.resetToInitialState(0.5); // 0.5秒内平滑过渡到初始状态
      }, 100);
    }
  };
}
