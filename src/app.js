/* Third party CSS imports. */
import '@simonwep/pickr/dist/themes/monolith.min.css';

/* Library imports. */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
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
  ACTION_IMAGE,
  CURSOR_STATES,
  ACTION_EXPORT,
  ACTION_SHOW_LIST
} from './constants';
import LoadingBar from './ui/loading-bar';
import ItemSelector from './ui/item-selector';
import ModelExporter from './ui/model-exporter';
import { isMobileSize } from './utils/mobile';

/**
 * Main application class for 3D T-Shirt Designer
 * Manages the 3D scene, UI components, and item interactions
 */
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

  /* Item selector initialization. */
  itemSelector = new ItemSelector();

  /* Action menu UI elements. */
  actionsMenu = null;
  colorPicker = null;
  textItemEditor = null;
  imageItemEditor = null;
  itemsTabContainer = null;
  modelExporter = null;

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
  focusedItem = null;

  /**
   * Creates a new App instance and initializes the application
   */
  constructor() {
    this._init();
  }

  /**
   * Initializes the application components and loads resources
   * @private
   * @async
   */
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
    this._initializeModelExporter();
    this._initializeActionsMenu();
    this._initializeListeners();
    
    // Initialize line geometry (from main.js)
    this._initializeLineGeometry();

    this._resize();

    /* Hide loading bar. */
    this.loadingBar.hide();
  }

  /**
   * Initializes scene lighting
   * @param {boolean} showLight - Whether to show lighting
   * @param {number} color - Light color in hex format
   * @param {number} intensity - Light intensity
   * @private
   */
  _initializeLighting(showLight, color, intensity) {
    if(showLight) {

      /* Adding scene light. */
      // const sceneLight = new THREE.HemisphereLight(color, color, intensity);
      // this.scene.add(sceneLight);
      /* Adding scene light end. */

      /* Adding directional light. */
      const directionalLight = new THREE.DirectionalLight(color, 1.2);
      // directionalLight.position.set(0.5, 0, 0.866);
      directionalLight.position.set(5, 10, 7.5);
      directionalLight.castShadow = true;
      this.camera.add(directionalLight);
      /* Adding directional light end. */

      /* Adding ambient light. */
      const ambientLight = new THREE.AmbientLight(color, 1.5);
      this.camera.add(ambientLight);
      /* Adding ambient light end. */
    }  
  }

  /**
   * Initializes orbit controls for camera manipulation
   * @private
   */
  _initializeControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = 1;
    this.controls.maxDistance = 1;
    this.controls.update();
  }

  /**
   * Shows or hides the axes helper in the scene
   * @param {boolean} show - Whether to show the axes helper
   * @param {number} size - Size of the axes helper
   * @private
   */
  _showAxesHelper(show, size) {
    if(show) {
      const axesHelper = new THREE.AxesHelper(size);
      this.scene.add(axesHelper);
    }
  }

  /**
   * Initializes the WebGL renderer and sets up the rendering environment
   * @private
   */
  _initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    THREE.ColorManagement.legacyMode = false;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMapping = THREE.NoToneMapping;
    // this.renderer.toneMappingExposure = 1.0;
    // this.renderer.physicallyCorrectLights = true;

    // this.renderer.setClearColor(0xC0C0C0);

    /* Initialize scene. */
    // const environment = new RoomEnvironment(this.renderer);
    // const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8C8C8C);
    // this.scene.environment = pmremGenerator.fromScene(environment).texture;
    this.scene.environment = null;
    // environment.dispose();
    /* Scene initialization ends. */

    /* Initialize camera. */
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
    /* Initialize camera ends. */

    this.renderer.setAnimationLoop(() => this._animate());
  }

  /**
   * Animation loop callback for rendering the scene
   * @private
   */
  _animate() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handles window resize events
   * @private
   */
  _resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Handles pointer up events
   * @param {PointerEvent} event - The pointer event
   * @private
   */
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

  /**
   * Handles pointer down events
   * @private
   */
  _onPointerDown() {
    this.moved = false;
  }

  /**
   * Handles pointer move events for item placement and selection
   * @param {PointerEvent} event - The pointer event
   * @private
   */
  _onPointerMove(event) {
    if(this.currentState === STATES.PLACE){
      if (event.isPrimary) {
        this.checkIntersection(event.clientX, event.clientY);
      }
    }
    if(this.currentState === STATES.SELECT){
      this.mouse.x = event.clientX / this.canvas.clientWidth * 2 - 1;
      this.mouse.y = - (event.clientY / this.canvas.clientHeight) * 2 + 1;
      this.focusedItem = this.itemSelector.getFocusedItem( this.itemManager, this.mouse, this.camera);
      if(this.focusedItem) {
        this.focusedItem.textureMaterial.opacity = 0.5;
        this._setCursor(CURSOR_STATES.POINTER);
      }
      else {
        this.itemManager.getItems().forEach(item => {
          item.textureMaterial.opacity = 1.0;
        });
        this._setCursor(CURSOR_STATES.AUTO);
      }
      /* Add select logic. */
    }
  }

  /**
   * Handles pointer click events
   * @param {PointerEvent} event - The pointer event
   * @private
   */
  _onPointerClick(event) {
    if(event.target.id === 'render-area'){
      if(this.currentState === STATES.SELECT){
        if(this.focusedItem) {
          this._editItem(this.focusedItem);
        }
      }
    }
  }

  /**
   * Initializes the raycaster for 3D object intersection testing
   * @private
   */
  _initializeRaycaster() {
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Initializes line geometry for visual helpers
   * @private
   */
  _initializeLineGeometry() {
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    // this.line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial());
    // this.scene.add(this.line);
  }

  /**
   * Updates the preview item position based on intersection
   * @param {Object} intersection - The intersection data
   */
  updatePreviewTextItem(intersection) {
    if(this.item !== null) {
      this.item.updatePosition(intersection);
    }
  }

  /**
   * Checks for intersection between mouse pointer and 3D model
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   */
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

  /**
   * Places the current item on the 3D model
   */
  placeItem() {
    if(this.item !== null) {
      this.item.textureMaterial.opacity = 1;
      this.itemManager.addItem(this.item);
      this.scene.add(this.item.textureMesh);
      this.itemsTabContainer.updateTabItems(this.itemManager.getItems());
      this.item = null;
  }
}

  /**
   * Loads all required fonts with progress tracking
   * @private
   * @async
   */
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

  /**
   * Loads the 3D model with progress tracking
   * @param {string} path - Path to the 3D model file
   * @private
   * @async
   */
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
            child.material.colorSpace = THREE.SRGBColorSpace;
            child.material.color = new THREE.Color(0xffffff);
            child.material.roughness = 1.0; 
            child.material.metalness = 0.0;
            child.material.envMapIntensity = 0.2;
            child.material.needsUpdate = true;
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

  /**
   * Initializes the text item editor with event callbacks
   * @private
   */
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

  /**
   * Creates a new text item with the provided options
   * @param {Object} options - Text item options
   * @private
   */
  _createTextItem(options) {
    this.currentState = STATES.PLACE;
    this.item = new Item(this.intersection, options, true, ITEM_TEXT);
    this.scene.add(this.item.textureMesh);
    this.windowOpen = false;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[0]);
  }

  /**
   * Updates an existing text item with new options
   * @param {Object} options - Updated text item options
   * @private
   */
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

  /**
   * Handles text item editor abort/cancel actions
   * @private
   */
  _textItemEditorAbortCallback() {
    this.currentState = STATES.SELECT;
    this.textItemEditor.setItem(null);
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.windowOpen = false;
  }

  /**
   * Initializes the image item editor with event callbacks
   * @private
   */
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

  /**
   * Creates a new image item with the provided options
   * @param {Object} options - Image item options
   * @private
   */
  _createImageItem(options) {
    this.currentState = STATES.PLACE;
    this.item = new Item(this.intersection, options, true, ITEM_IMAGE);
    this.scene.add(this.item.textureMesh);
    this.windowOpen = false;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[1]);
  }

  /**
   * Updates an existing image item with new options
   * @param {Object} options - Updated image item options
   * @private
   */
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

  /**
   * Handles image item editor abort/cancel actions
   * @private
   */
  _imageItemEditorAbortCallback() {
    this.currentState = STATES.SELECT;
    this.imageItemEditor.setItem(null);
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.windowOpen = false;
  }

  /**
   * Initializes the items tab container with event callbacks
   * @private
   */
  _initializeItemsTabContainer() {
    this.itemsTabContainer = new ItemsTabContainer();

    this.itemsTabContainer.onItemEdit((item) => {
      this._editItem(item);
    });

    this.itemsTabContainer.onItemDelete((item) => {
      this._tabDeleteItem(item);
    });

    if(isMobileSize()){
      this.itemsTabContainer.hide();
    }
  }

  /**
   * Opens the appropriate editor for an item
   * @param {Item} item - The item to edit
   * @private
   */
  _editItem(item) {
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
  }

  /**
   * Opens an item editor from the tabs interface
   * @param {Item} item - The item to edit
   * @param {string} newState - The new state for the editor
   * @param {AbstractItemEditor} editor - The editor to use
   * @private
   */
  _tabEditItem(item, newState, editor) {
    this.currentState = newState;
    editor.setItem(item);
    editor.open();
    this.actionsMenu.updateMenuItemStatus(this.currentState);
  }

  /**
   * Deletes an item from the tabs interface
   * @param {Item} item - The item to delete
   * @private
   */
  _tabDeleteItem(item) {
    this.currentState = STATES.SELECT;
    this.scene.remove(item.textureMesh);
    this.itemManager.removeItem(item);
    this.itemsTabContainer.updateTabItems(this.itemManager.getItems());
  }

  /**
   * Initializes the model exporter with event callbacks
   * @private
   */
  _initializeModelExporter() {
    this.modelExporter = new ModelExporter();

    this.modelExporter.onDialogSuccess(() => {
      this.modelExporter.exportScene(this.scene);
      this._backToSelect();
    });

    this.modelExporter.onDialogClose(() => {
      this._backToSelect();
    });

    this.modelExporter.onDialogCancel(() => {
      this._backToSelect();
    });
  }

  /**
   * Returns the application to the select state
   * @private
   */
  _backToSelect() {
    this.currentState = STATES.SELECT;
    this.actionsMenu.updateMenuItemStatus(this.currentState);
    this.windowOpen = false;
  }

  /**
   * Initializes the actions menu with all available actions
   * @private
   */
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

    const exportAction = new Action(ACTION_EXPORT, [STATES.EXPORT]);
    exportAction.onClick(() => {
      this.modelExporter.open();
      this.windowOpen = true;
      this.currentState = STATES.EXPORT;
      this.actionsMenu.updateMenuItemStatus(this.currentState);
    });

    const showListAction = new Action(ACTION_SHOW_LIST);
    if(isMobileSize()){
      showListAction.getElement().classList.add('inverted');
    }
    showListAction.onClick(() => {
      this.itemsTabContainer.toggleVisibility();
      showListAction.getElement().classList.toggle('inverted');
    });

    this.actionsMenu.addAction(selectAction);
    this.actionsMenu.addAction(addTextAction);
    this.actionsMenu.addAction(addImageAction);
    this.actionsMenu.addAction(exportAction);
    this.actionsMenu.updateMenuItemStatus(this.currentState);
  }

  /**
   * Opens an item editor and updates application state
   * @param {AbstractItemEditor} editor - The editor to open
   * @param {string} newState - The new application state
   * @private
   */
  _itemAction(editor, newState) {
    if(!this.windowOpen){
      this.currentState = newState;
      editor.open();
      this.actionsMenu.updateMenuItemStatus(this.currentState);
      this.windowOpen = true;
    }
  }

  /**
   * Initializes all event listeners
   * @private
   */
  _initializeListeners() {
    this._initializeWindowListeners();
    this._initializeControlListener();
  }

  /**
   * Initializes window event listeners
   * @private
   */
  _initializeWindowListeners() {
    window.addEventListener('resize', this._resize.bind(this));
    window.addEventListener('pointerdown', this._onPointerDown.bind(this));
    window.addEventListener('pointerup', this._onPointerUp.bind(this));
    window.addEventListener('pointermove', this._onPointerMove.bind(this));
    window.addEventListener('click', this._onPointerClick.bind(this));
  }

  /**
   * Initializes orbit control event listeners
   * @private
   */
  _initializeControlListener() {
    this.controls.addEventListener('change', this._controlsAction.bind(this));
  }

  /**
   * Handles orbit control change events
   * @private
   */
  _controlsAction() {
    this.moved = true;
  }

  /**
   * Sets the mouse cursor style
   * @param {string} cursor - The cursor style to set
   * @private
   */
  _setCursor(cursor) {
    document.body.style.cursor = cursor;
  }
}

export default App;