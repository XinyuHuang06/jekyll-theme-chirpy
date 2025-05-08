/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */
import {
  CubismLogError,
} from '@framework/utils/cubismdebug';
import {Live2DCubismFramework as cubismmatrix44} from '@framework/math/cubismmatrix44';
import {Live2DCubismFramework as csmvector} from '@framework/type/csmvector';
import {Live2DCubismFramework as acubismmotion} from '@framework/motion/acubismmotion';
import Csm_csmVector = csmvector.csmVector;
import Csm_CubismMatrix44 = cubismmatrix44.CubismMatrix44;
import ACubismMotion = acubismmotion.ACubismMotion;

import {LAppModel} from './lappmodel';
import {LAppPal} from './lapppal';
import {canvas} from './lappdelegate';
import * as LAppDefine from './lappdefine';
export let s_instance: LAppGlManager = null;

/**
 * Cubism SDKのサンプルで使用するWebGLを管理するクラス
 */
export class LAppGlManager {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return クラスのインスタンス
   */
  public static getInstance(): LAppGlManager {
    if (s_instance == null) {
      s_instance = new LAppGlManager();
    }

    return s_instance;
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance.release();
    }

    s_instance = null;
  }
      /**
     * Release all the models you hold in the current scene
     */
      public releaseAllModel(): void {
        for (let i = 0; i < this._models.getSize(); i++) {
            this._models.at(i).release();
            this._models.set(i, null);
        }

        this._models.clear();
    }
    /**
     * Change scenes
     * The sample application switches the model set.
     */
    public changeScene(modelPath: string, modelJsonName: string): void {
      if (LAppDefine.DebugLogEnable) {
          LAppPal.printMessage(`[Live2Dv4] load model: ${modelJsonName}`);
      }

      this.releaseAllModel();
      this._models.pushBack(new LAppModel(LAppDefine.DebugLogEnable));
      this._models.at(0).loadAssets(modelPath, modelJsonName);
  }
    /**
     * constructor
     */
    constructor() {
      this._viewMatrix = new Csm_CubismMatrix44();
      this._models = new Csm_csmVector<LAppModel>();
      this.changeScene(LAppDefine.modelPath, LAppDefine.modelJsonName);
  }
  _viewMatrix: Csm_CubismMatrix44; // View matrix for model drawing
  _models: Csm_csmVector<LAppModel>; // Container of model instances
  // Callback function to end motion playback
  _finishedMotion = (self: ACubismMotion): void => {
      LAppDefine.DebugLogEnable && LAppPal.printMessage('[Live2Dv4] Motion Finished');
  };
  /**
   * 解放する。
   */
  public release(): void {}
}
