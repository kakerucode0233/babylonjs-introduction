import { Scene, Engine, FreeCamera, Vector3, PBRMaterial, Texture, BaseTexture, HemisphericLight, MeshBuilder, AbstractMesh, GlowLayer, SceneLoader, Light, Color3, LightGizmo, GizmoManager, DirectionalLight, PointLight, SpotLight, ShadowGenerator } from "@babylonjs/core"
import "@babylonjs/loaders"

export class LightShadow{
  scene: Scene;
  engine: Engine;
  lightTubes!: AbstractMesh[];
  models!: AbstractMesh[];
  ball!: AbstractMesh;

  constructor(private canvas:HTMLCanvasElement){
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateScene();
    this.CreateEnvironment();

    this.engine.runRenderLoop(()=>{
      this.scene.render();
    })
  }

  CreateScene(): Scene {
    const scene = new Scene(this.engine);
    const camera = new FreeCamera("camera", new Vector3(0, 1, -5), this.scene);
    camera.attachControl();
    camera.speed = 0.2;

    return scene;
  }

  async CreateEnvironment(): Promise<void> {
    const { meshes } = await SceneLoader.ImportMeshAsync("", "./models/", "LightingScene.glb");

    this.models = meshes;

    
    this.lightTubes = meshes.filter((mesh)=>
    mesh.name === "lightTube_left" || mesh.name === "lightTube_right"
    );
    
    this.ball = MeshBuilder.CreateSphere("ball", {diameter: 0.5}, this.scene);
    this.ball.position = new Vector3(0, 1, -1);
    
    const glowLayer = new GlowLayer("glowLayer", this.scene);
    glowLayer.intensity = 0.75;
    
    // TODO:壁と床について、Blenderで作成したモデルのマテリアルが上手く出力されなかったので、暫定的にBabylon.js側で作成
    this.CreateWall();
    this.CreateFloor();

    this.CreateLight();
  }

  CreateWall(): void {
    const walls = this.models.filter((model)=>
      !model.name.indexOf("wall")
    )
    const uvScale = 4; // テクスチャのUVスケール (大きい程テクスチャサイズが小さく・細かくなる)
    const texArray: Texture[] = [];

    const pbr = new PBRMaterial("pbr", this.scene);

    const difTex = new Texture("./textures/bricks/diff.jpg", this.scene);
    pbr.albedoTexture = difTex;
    texArray.push(difTex);

    const normalTex = new Texture("./textures/bricks/normal.jpg", this.scene);
    pbr.bumpTexture = normalTex;
    texArray.push(normalTex);

    pbr.invertNormalMapX = true;
    pbr.invertNormalMapY = true;

    pbr.useAmbientOcclusionFromMetallicTextureRed = true;
    pbr.useRoughnessFromMetallicTextureGreen = true;
    pbr.useMetallnessFromMetallicTextureBlue = true;

    const metallicTex = new Texture("./textures/bricks/ao_rough_metal.jpg", this.scene);
    pbr.metallicTexture = metallicTex;
    texArray.push(metallicTex);

    texArray.forEach((tex)=>{
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    })

    walls.forEach((wall)=>[
      wall.material = pbr
    ])
  }

  CreateFloor(): void {
    const floor = this.models.filter((model)=>
      model.name === "floor"
    )

    const uvScale = 4; // テクスチャのUVスケール (大きい程テクスチャサイズが小さく・細かくなる)
    const texArray: Texture[] = [];

    const pbr = new PBRMaterial("pbr", this.scene);

    const difTex = new Texture("./textures/soil/diff.jpg", this.scene);
    pbr.albedoTexture = difTex;
    texArray.push(difTex);

    const normalTex = new Texture("./textures/soil/normal.jpg", this.scene);
    pbr.bumpTexture = normalTex;
    texArray.push(normalTex);

    pbr.invertNormalMapX = true;
    pbr.invertNormalMapY = true;

    pbr.useAmbientOcclusionFromMetallicTextureRed = true;
    pbr.useRoughnessFromMetallicTextureGreen = true;
    pbr.useMetallnessFromMetallicTextureBlue = true;

    const metallicTex = new Texture("./textures/soil/ao_rough_metal.jpg", this.scene);
    pbr.metallicTexture = metallicTex;
    texArray.push(metallicTex);

    texArray.forEach((tex)=>{
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    })

    floor[0].material = pbr;
  }

  CreateLight(): void {
    // const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this.scene);

    // hemiLight.diffuse = new Color3(1, 0, 0);
    // hemiLight.groundColor = new Color3(0, 0, 1);
    // hemiLight.specular = new Color3(0, 1, 0);

    // const directionalLight = new DirectionalLight("directionalLight", new Vector3(0, -1, 0), this.scene);

    // const pointLight = new PointLight("pontLight", new Vector3(0, 1 ,0),this.scene);
    // pointLight.diffuse = new Color3(172/255, 246/255, 250/255);
    // pointLight.intensity = 0.25;

    // const pointClone = pointLight.clone("pointClone") as PointLight;

    // pointLight.parent = this.lightTubes[0];
    // pointClone.parent = this.lightTubes[1];

    const spotLight = new SpotLight("spotLight", new Vector3(0, 0.5, -3), new Vector3(0, 1, 3), Math.PI/2, 10, this.scene);
    spotLight.intensity = 10;

    // 影生成
    spotLight.shadowEnabled = true;
    spotLight.shadowMinZ = 1;
    spotLight.shadowMaxZ = 10;

    const shadowGen = new ShadowGenerator(1024, spotLight);
    // 影生成時にジャギーが発生しないようにする
    shadowGen.useBlurCloseExponentialShadowMap = true;

    // メッシュに影を有効化
    this.ball.receiveShadows = true;
    shadowGen.addShadowCaster(this.ball);
    this.models.map(mesh=>{
      mesh.receiveShadows = true;
      shadowGen.addShadowCaster(mesh);
    })

    // ライトを自由に動かせるようにギズモを付与
    this.CreateGizmos(spotLight);
  }

  CreateGizmos(customLight: Light): void {
    const lightGizmo = new LightGizmo();
    lightGizmo.scaleRatio = 2;
    lightGizmo.light = customLight;

    const gizmoManager = new GizmoManager(this.scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.usePointerToAttachGizmos = false;
    gizmoManager.attachToMesh(lightGizmo.attachedMesh);
  }

}