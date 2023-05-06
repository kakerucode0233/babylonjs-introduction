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
    const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this.scene);

  }

  CreateGizmos(customLight: Light): void {
    const lightGizmo = new LightGizmo();
    lightGizmo.scaleRatio = 2;
    lightGizmo.light = customLight;

    const gizmoManager = new GizmoManager(this.scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.usePointerToAttachGizmos = true;
    gizmoManager.attachToMesh(lightGizmo.attachedMesh);
  }

}