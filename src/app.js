/* Third party CSS imports. */
import '@simonwep/pickr/dist/themes/monolith.min.css';

/* Library imports. */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import ItemManager from './items/itemManager';
import ActionMenu from './ui/actions/actions-menu';
import Action from './ui/actions/action';
import TextItemEditor from './ui/item-editors/text-item-editor';
import ImageItemEditor from './ui/item-editors/image-item-editor';
import ItemsTabContainer from './ui/items-tab-container';
import ColorPicker from './ui/color-picker';
import FontLoader from './fonts/loader';
import Item from './items/item';
import { 
  STATES, 
  MODE_CREATE, 
  ITEM_TEXT, 
  ITEM_IMAGE, 
  ITEM_LIST_TAB_IDS,
  ACTION_SELECT,
  ACTION_TEXT,
  ACTION_IMAGE
} from './constants';
import LoadingBar from './ui/loading-bar';

class App {

  /* App state variables. */
  currentState = STATES.SELECT;
  windowOpen = false;

  /* Three.js scene setup variables. */
  canvas = document.getElementById('render-area');
  renderer = null;
  scene = null;
  camera = null;
  controls = null;

  /* 3D model variables. */
  model3D = null;
  model3DMesh = null;

  /* Item management initialization. */
  itemManager = new ItemManager();

  /* Action menu UI elements. */
  actionsMenu = null;
  colorPicker = null;
  textItemEditor = null;
  imageItemEditor = null;
  itemsTabContainer = null;

  /* Loading bar UI elements. */
  loadingBar = new LoadingBar();

  /* Selection variables. */
  line = null;
  moved = false;
  raycaster = null;

  intersection = {
    intersects: false,
    object: new THREE.Object3D(),
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
  };

  intersects = [];

  mouse = new THREE.Vector2();

  /* Item being added or edited. */
  item = null;

  constructor() {
    this._init();
  }

  async _init() {

    /* Show Loading bar. */
    this.loadingBar.show();

    this._initializeRenderer();
    this._initializeControls();
    this._showAxesHelper(false, 5);
    this._initializeLighting(true, 0xffffff, 0.1);
    
    this._load3DModel('./assets/models/t-shirt.glb');
    await this._loadFonts();
    
    this._initializeRaycaster();
    this._initializeTextItemEditor();
    this._initializeImageItemEditor();
    this._initializeItemsTabContainer();
    this._initializeActionsMenu();
    this._initializeListeners();
    
    // Initialize line geometry (from main.js)
    this._initializeLineGeometry();

    /* Hide loading bar. */
    this.loadingBar.hide();
  }

  _initializeScene() {
    this.scene = new THREE.Scene();
  }

  _initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  _initializeLighting(showLight, color, intensity) {
    if(showLight) {

      /* Adding scene light. */
      const sceneLight = new THREE.HemisphereLight(color, color, intensity);
      this.scene.add(sceneLight);
      /* Adding scene light end. */

      /* Adding ambient light. */
      const ambientLight = new THREE.AmbientLight(color, intensity);
      this.camera.add(ambientLight);
      /* Adding ambient light end. */

      /* Adding directional light. */
      const directionalLight = new THREE.DirectionalLight(color, intensity);
      directionalLight.position.set(0.5, 0, 0.866);
      directionalLight.castShadow = true;
      this.camera.add(directionalLight);
      /* Adding directional light end. */
    }  
  }

  _initializeControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = 1;
    this.controls.maxDistance = 1;
    this.controls.update();
  }

  _showAxesHelper(show, size) {
    if(show) {
      const axesHelper = new THREE.AxesHelper(size);
      this.scene.add(axesHelper);
    }
  }

  _initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // this.renderer.setClearColor(0xC0C0C0);

    /* Initialize scene. */
    const environment = new RoomEnvironment(this.renderer);
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);
    this.scene.environment = pmremGenerator.fromScene(environment).texture;
    environment.dispose();
    /* Scene initialization ends. */

    /* Initialize camera. */
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
    /* Initialize camera ends. */

    this.renderer.setAnimationLoop(() => this._animate());
  }

  _animate() {
    this.renderer.render(this.scene, this.camera);
  }

  _resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  _onPointerUp(event) {
    if (this.moved === false) {
      if(this.currentState === STATES.PLACE){
        this.checkIntersection(event.clientX, event.clientY);
        if (this.intersection.intersects){
          this.placeItem();
          this.currentState = STATES.SELECT;
          this.actionsMenu.updateMenuItemStatus(this.currentState);
        }
      }
    }
  }

  _onPointerDown() {
    this.moved = false;
  }

  _onPointerMove(event) {
    if(this.currentState === STATES.PLACE){
      if (event.isPrimary) {
        this.checkIntersection(event.clientX, event.clientY);
      }
    }
  }

  _initializeRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  _initializeLineGeometry() {
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    // this.line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial());
    // this.scene.add(this.line);
  }

  updatePreviewTextItem(intersection) {
    if(this.item !== null) {
      this.item.updatePosition(intersection);
    }
  }

  checkIntersection(x, y) {

    if (this.model3DMesh === undefined) return;

    this.mouse.x = (x / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = - (y / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersects = this.raycaster.intersectObject(this.model3DMesh, false);

    if (this.intersects.length > 0) {

      const p = this.intersects[0].point;

      const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.model3DMesh.matrixWorld);

      const n = this.intersects[0].face.normal.clone();
      n.applyNormalMatrix(normalMatrix);
      n.add(this.intersects[0].point);

      this.intersection.object = this.intersects[0].object;
      this.intersection.point = this.intersects[0].point;
      this.intersection.normal = this.intersects[0].face.normal;
      this.intersection.intersects = true;

      if(this.line) {
        const positions = this.line.geometry.attributes.position;
        positions.setXYZ(0, p.x, p.y, p.z);
        positions.setXYZ(1, n.x, n.y, n.z);
        positions.needsUpdate = true;
      }

      this.updatePreviewTextItem(this.intersection);

      this.intersects.length = 0;

    } else {
      this.intersection.intersects = false;
    }
  }

  placeItem() {
    if(this.item !== null) {
      this.item.textureMaterial.opacity = 1;
      this.itemManager.addItem(this.item);
      this.scene.add(this.item.textureMesh);
      this.itemsTabContainer.updateTabItems(this.itemManager.getItems());
      this.item = null;
  }
}

  async _loadFonts() {
    const fontLoader = new FontLoader();
    const availableFonts = fontLoader.getAvailableFonts();
    let currentFontIndex = 0;

    fontLoader.onFontLoaded((fontItem) => {
      currentFontIndex++;
      this.loadingBar.updateProgress(
        currentFontIndex, 
        availableFonts.length, 
        `Loading Font ${currentFontIndex} of ${availableFonts.length}`
      );
    });
    fontLoader.onFontError((fontItem) => {
      console.error(`Error loading font: ${fontItem.name}`);
    });
    await fontLoader.loadFonts();
  }

  async _load3DModel(path) {

    /* Update loading bar. */
    this.loadingBar.updateProgress(0, 100, 'Loading 3D Model');

    /* Load model. */
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(path, (gltf) => {
      this.model3D = gltf.scene;
      this.model3D.traverse((child) => {
        if (child.type === 'Mesh') {
          this.model3DMesh = child;

          if (child.material) {
            // Reduce lighting impact while keeping some shading.
            child.material.roughness = 1.0; 
            child.material.metalness = 0.0;
            child.material.envMapIntensity = 0.2;
          }
        }
      });
      this.scene.add(this.model3D);
      this.colorPicker = new ColorPicker(this.model3DMesh);
      this.intersection.object = this.model3D.children[0];

    }, (status) => {
      /* Update loading bar progress. */
      this.loadingBar.updateProgress(status.loaded, status.total, 'Loading 3D Model');
    });
  }

  _initializeTextItemEditor() {
    this.textItemEditor = new TextItemEditor();
    this.textItemEditor.onDialogSuccess((options) => {
      if(this.textItemEditor.getMode() === MODE_CREATE){
        this._createTextItem(options);
      }
      else {
        this._updateTextItem(options);
      }
    });

    this.textItemEditor.onDialogClose(() => {
      this._textItemEditorAbortCallback();
    });

    this.textItemEditor.onDialogCancel(() => {
      this._textItemEditorAbortCallback();
    });
  }

  _createTextItem(options) {
    this.currentState = STATES.PLACE;
    this.item = new Item(this.intersection, options, true, ITEM_TEXT);
    this.scene.add(this.item.textureMesh);
    this.windowOpen = false;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[0]);
  }

  _updateTextItem(options) {
    this.currentState = STATES.SELECT;
    let itemId = this.textItemEditor.getItem().getId();
    this.item = this.itemManager.getItem(itemId);
    this.item.update(options);
    this.itemsTabContainer.updateTabItems(this.itemManager.getItems());
    this.itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[0]);
    this.item = null;
    this.textItemEditor.setItem(null);
    this.windowOpen = false;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
  }

  _textItemEditorAbortCallback() {
    this.currentState = STATES.SELECT;
    this.textItemEditor.setItem(null);
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.windowOpen = false;
  }

  _initializeImageItemEditor() {
    this.imageItemEditor = new ImageItemEditor();
    this.imageItemEditor.onDialogSuccess((options) => {
      if(this.imageItemEditor.getMode() === MODE_CREATE){
        this._createImageItem(options);
      }
      else {
        this._updateImageItem(options);
      }
    });

    this.imageItemEditor.onDialogClose(() => {
      this._imageItemEditorAbortCallback();
    });

    this.imageItemEditor.onDialogCancel(() => {
      this._imageItemEditorAbortCallback();
    });
  }

  _createImageItem(options) {
    this.currentState = STATES.PLACE;
    this.item = new Item(this.intersection, options, true, ITEM_IMAGE);
    this.scene.add(this.item.textureMesh);
    this.windowOpen = false;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[1]);
  }

  _updateImageItem(options) {
    this.currentState = STATES.SELECT;
    let itemId = this.imageItemEditor.getItem().getId();
    this.item = this.itemManager.getItem(itemId);
    this.item.update(options);
    this.itemsTabContainer.updateTabItems(this.itemManager.getItems());
    this.itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[1]);
    this.item = null;
    this.imageItemEditor.setItem(null);
    this.windowOpen = false;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
  }

  _imageItemEditorAbortCallback() {
    this.currentState = STATES.SELECT;
    this.imageItemEditor.setItem(null);
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.windowOpen = false;
  }

  _initializeItemsTabContainer() {
    this.itemsTabContainer = new ItemsTabContainer();

    this.itemsTabContainer.onItemEdit((item) => {
      const itemType = item.getType();
      switch(itemType) {
        case ITEM_TEXT:
          this._tabEditItem(item, STATES.TEXT_EDIT, this.textItemEditor);
          break;
        case ITEM_IMAGE:
          this._tabEditItem(item, STATES.IMAGE_EDIT, this.imageItemEditor);
          break;
        default:
          break;
      }
      this.actionsMenu.updateMenuItemStatus(this.currentState);
      this.windowOpen = true;
    });

    this.itemsTabContainer.onItemDelete((item) => {
      this._tabDeleteItem(item);
    });
  }

  _tabEditItem(item, newState, editor) {
    this.currentState = newState;
    editor.setItem(item);
    editor.open();
    this.actionsMenu.updateMenuItemStatus(this.currentState);
  }

  _tabDeleteItem(item) {
    this.currentState = STATES.SELECT;
    this.scene.remove(item.textureMesh);
    this.itemManager.removeItem(item);
    this.itemsTabContainer.updateTabItems(this.itemManager.getItems());
  }

  _initializeActionsMenu() {
    this.actionsMenu = new ActionMenu();

    const selectAction = new Action(ACTION_SELECT, [STATES.SELECT]);
    selectAction.onClick(() => {
      console.log('Select action clicked.');
    });

    const addTextAction = new Action(ACTION_TEXT, [STATES.TEXT_CREATE, STATES.TEXT_EDIT]);
    addTextAction.onClick(() => {
      if(!this.windowOpen) {
        this._itemAction(this.textItemEditor, STATES.TEXT_CREATE);
      }
    });

    const addImageAction = new Action(ACTION_IMAGE, [STATES.IMAGE_CREATE, STATES.IMAGE_EDIT]);
    addImageAction.onClick(() => {
      if(!this.windowOpen) {
        this._itemAction(this.imageItemEditor, STATES.IMAGE_CREATE);
      }
    });

    this.actionsMenu.addAction(selectAction);
    this.actionsMenu.addAction(addTextAction);
    this.actionsMenu.addAction(addImageAction);
    this.actionsMenu.updateMenuItemStatus(this.currentState);
  }

  _itemAction(editor, newState) {
    if(!this.windowOpen){
      this.currentState = newState;
      editor.open();
      this.actionsMenu.updateMenuItemStatus(this.currentState);
      this.windowOpen = true;
    }
  }

  _initializeListeners() {
    this._initializeWindowListeners();
    this._initializeControlListener();
  }

  _initializeWindowListeners() {
    window.addEventListener('resize', this._resize.bind(this));
    window.addEventListener('pointerdown', this._onPointerDown.bind(this));
    window.addEventListener('pointerup', this._onPointerUp.bind(this));
    window.addEventListener('pointermove', this._onPointerMove.bind(this));
  }

  _initializeControlListener() {
    this.controls.addEventListener('change', this._controlsAction.bind(this));
  }

  _controlsAction() {
    this.moved = true;
  }
}

export default App;