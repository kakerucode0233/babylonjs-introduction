import { Scene, Engine, FreeCamera, Vector3, MeshBuilder, CubeTexture, PBRMaterial, Texture, SceneLoader } from "@babylonjs/core"
import "@babylonjs/loaders"

export class CustomMultiplyModels{
  scene: Scene;
  engine: Engine;

  constructor(private canvas:HTMLCanvasElement){
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateScene();
    this.CreateCampfire();

    this.engine.runRenderLoop(()=>{
      this.scene.render();
    })
  }

  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    const camera = new FreeCamera("camera", new Vector3(0, 2, -8), this.scene);
    camera.attachControl();
    camera.speed = 0.25;

    const envTex = CubeTexture.CreateFromPrefilteredData("./environment/sky.env", scene);

    scene.environmentTexture = envTex;
    scene.createDefaultSkybox(envTex, true);
    scene.environmentIntensity = 0.5;

    return scene;
  }

  async CreateCampfire(): Promise<void> {
    const models = await SceneLoader.ImportMeshAsync("", "./models/", "campfire.glb");

    // meshes[0]はrootなので、複数モデルの親となっており、これの位置を移動させることで全てのオブジェクトが一斉に動かせる
    models.meshes[0].position = new Vector3(-3, 0, 0);

    console.log('models', models)
  }
}