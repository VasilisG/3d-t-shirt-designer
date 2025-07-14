/* Third party CSS imports. */
import '@simonwep/pickr/dist/themes/monolith.min.css';

/* Library imports. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Item from './src/items/item';
import ItemManager from './src/items/itemManager';
import ColorPicker from './src/ui/color-picker';
import { 
  ACTION_IMAGE, 
  ACTION_SELECT, 
  ACTION_TEXT, 
  ITEM_IMAGE, 
  ITEM_TEXT, 
  MODE_CREATE, 
  STATES, 
  ITEM_LIST_TAB_IDS 
} from './src/constants';
import TextItemEditor from './src/ui/item-editors/text-item-editor';
import ImageItemEditor from './src/ui/item-editors/image-item-editor';
import ActionMenu from './src/ui/actions/actions-menu';
import Action from './src/ui/actions/action';
import ItemsTabContainer from './src/ui/items-tab-container';
import FontLoader from './src/fonts/loader';

/* Variable declarations. */

let currentState = STATES.SELECT;

let windowOpen = false;

let canvas = document.getElementById('render-area');

let renderer, scene, camera, controls;

let itemManager = new ItemManager();
let moved = false;
let raycaster;

let model3D;
let model3DMesh;

let colorPicker;
let textItemEditor;
let imageItemEditor;
let itemsTabContainer;

let line;

let intersection = {
  intersects: false,
  object: new THREE.Object3D(),
  point: new THREE.Vector3(),
  normal: new THREE.Vector3()
};

/* TextItem object. */
let item = null;

const mouse = new THREE.Vector2();
let intersects = [];

// Initialize camera.
const initializeCamera = () => {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 0, 1);
  camera.lookAt(0, 0, 0);
  scene.add(camera);
}

// Add light to scene.
const addLight = (showLight, color, intensity) => {
  if(showLight) {
    const light = new THREE.DirectionalLight(color, intensity);
    camera.add(light);
  }  
}

// Initialize controls.
const initializeControls = () => {
  controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 0, 0);
  controls.minDistance = 1;
  controls.maxDistance = 1;
	controls.update();
}

// Show axes helper.
const showAxesHelper = (show, size) => {
  if(show) {
    const axesHelper = new THREE.AxesHelper(size);
    scene.add(axesHelper);
  }
}

// Initialize renderer.
const initializeRenderer = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Enable tone mapping and gamma correction (for realistic lighting)
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xC0C0C0);
  renderer.setAnimationLoop(animate);
}

// Render the scene.
const animate = () => {
  renderer.render(scene, camera);
}

// Resize function.
const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Event to apply raycast on mesh.
const onPointerMove = (event) => {
  if(currentState === STATES.PLACE){
    if (event.isPrimary) {
      checkIntersection(event.clientX, event.clientY);
    }
  }
}

const updatePreviewTextItem = (intersection) => {
  if(item !== null) {
    item.updatePosition(intersection);
  }
}

const checkIntersection = (x, y) => {

  if (model3DMesh === undefined) return;

  // mouse.x = (x / window.innerWidth) * 2 - 1;
  // mouse.y = - (y / window.innerHeight) * 2 + 1;

  mouse.x = (x / canvas.clientWidth) * 2 - 1;
  mouse.y = - (y / canvas.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObject(model3DMesh, false);

  if (intersects.length > 0) {

    const p = intersects[0].point;

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(model3DMesh.matrixWorld);

    const n = intersects[0].face.normal.clone();
    n.applyNormalMatrix(normalMatrix);
    n.add(intersects[0].point);

    intersection.object = intersects[0].object;
    intersection.point = intersects[0].point;
    intersection.normal = intersects[0].face.normal;
    intersection.intersects = true;

    if(line) {
      const positions = line.geometry.attributes.position;
      positions.setXYZ(0, p.x, p.y, p.z);
      positions.setXYZ(1, n.x, n.y, n.z);
      positions.needsUpdate = true;
    }

    updatePreviewTextItem(intersection);

    intersects.length = 0;

  } else {
    intersection.intersects = false;
  }
}

const placeItem = () => {
  if(item !== null) {
    item.textureMaterial.opacity = 1;
    itemManager.addItem(item);
    scene.add(item.textureMesh);
    itemsTabContainer.updateTabItems(itemManager.getItems());
    item = null;
  }
}

const runApp = async () => {

  // Initialize Three.js
  scene = new THREE.Scene();

  /* Add camera. */
  initializeCamera();

  /* Add orbit controls. */
  initializeControls();

  /* Add WebGL renderer. */
  initializeRenderer();

  /* Add axes helper. */
  showAxesHelper(false, 5);

  /* Add light. */  
  addLight(true, 0xffffff, 1);

  /* Add fonts. */
  const fontLoader = new FontLoader();
  fontLoader.onFontLoaded((fontItem) => {
    //console.log(`Font loaded: ${fontItem.name}`);
  });
  fontLoader.onFontError((fontItem) => {
    console.error(`Error loading font: ${fontItem.name}`);
  });
  await fontLoader.loadFonts();

  /* Load model */
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./assets/models/t-shirt.glb', (gltf) => {
     model3D = gltf.scene;

    let bbox = new THREE.Box3().setFromObject(gltf.scene);
    let measure = new THREE.Vector3();
    let modelSize = bbox.getSize(measure);

     model3D.traverse((child) => {
      if (child.type === 'Mesh') {
        model3DMesh = child;
      }
    });
    scene.add(model3D);

    colorPicker = new ColorPicker(model3DMesh);
    
    intersection.object = model3D.children[0];

  }, (error) => {
    // console.log(error);
  });

  /* Add line. */
  const lineGeometry = new THREE.BufferGeometry();
	lineGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  // line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial());
	// scene.add(line);

  /* Create new raycaster. */
  raycaster = new THREE.Raycaster();

  /* Create new text item editor. */
  textItemEditor = new TextItemEditor();
  textItemEditor.onDialogSuccess((options) => {
    if(textItemEditor.getMode() === MODE_CREATE){
      currentState = STATES.PLACE;
      item = new Item(intersection, options, true, ITEM_TEXT);
      scene.add(item.textureMesh);
      windowOpen = false;
      actionsMenu.updateMenuItemStatus(currentState);
      itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[0]);
    }
    else {
      currentState = STATES.SELECT;
      let itemId = textItemEditor.getItem().getId();
      item = itemManager.getItem(itemId);
      item.update(options);
      itemsTabContainer.updateTabItems(itemManager.getItems());
      itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[0]);
      item = null;
      textItemEditor.setItem(null);
      windowOpen = false;
      actionsMenu.updateMenuItemStatus(currentState);
    }
  });

  textItemEditor.onDialogClose(() => {
    currentState = STATES.SELECT;
    textItemEditor.setItem(null);
    actionsMenu.updateMenuItemStatus(currentState);
    windowOpen = false;
  });

  textItemEditor.onDialogCancel(() => {
    currentState = STATES.SELECT;
    textItemEditor.setItem(null);
    actionsMenu.updateMenuItemStatus(currentState);
    windowOpen = false;
  });

  /* Create new image item editor. */
  imageItemEditor = new ImageItemEditor();
  imageItemEditor.onDialogSuccess((options) => {
    if(imageItemEditor.getMode() === MODE_CREATE){
      currentState = STATES.PLACE;
      item = new Item(intersection, options, true, ITEM_IMAGE);
      scene.add(item.textureMesh);
      windowOpen = false;
      actionsMenu.updateMenuItemStatus(currentState);
      itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[1]);
    }
    else {
      currentState = STATES.SELECT;
      let itemId = imageItemEditor.getItem().getId();
      item = itemManager.getItem(itemId);
      item.update(options);
      itemsTabContainer.updateTabItems(itemManager.getItems());
      itemsTabContainer.switchToTab(ITEM_LIST_TAB_IDS[1]);
      item = null;
      imageItemEditor.setItem(null);
      windowOpen = false;
      actionsMenu.updateMenuItemStatus(currentState);
    }
  });

  imageItemEditor.onDialogClose(() => {
    currentState = STATES.SELECT;
    imageItemEditor.setItem(null);
    actionsMenu.updateMenuItemStatus(currentState);
    windowOpen = false;
  });

  imageItemEditor.onDialogCancel(() => {
    currentState = STATES.SELECT;
    imageItemEditor.setItem(null);
    actionsMenu.updateMenuItemStatus(currentState);
    windowOpen = false;
  });

  /* Create new items tab container. */
  itemsTabContainer = new ItemsTabContainer();

  itemsTabContainer.onItemEdit((item) => {
    const itemType = item.getType();
    switch(itemType) {
      case ITEM_TEXT:
        currentState = STATES.TEXT_EDIT;
        textItemEditor.setItem(item);
        textItemEditor.open();
        actionsMenu.updateMenuItemStatus(currentState);
        break;
      case ITEM_IMAGE:
        currentState = STATES.IMAGE_EDIT;
        imageItemEditor.setItem(item);
        imageItemEditor.open();
        actionsMenu.updateMenuItemStatus(currentState);
        break;
      default:
        break;
    }
    actionsMenu.updateMenuItemStatus(currentState);
    windowOpen = true;
  });

  itemsTabContainer.onItemDelete((item) => {
    currentState = STATES.SELECT;
    scene.remove(item.textureMesh);
    itemManager.removeItem(item);
    itemsTabContainer.updateTabItems(itemManager.getItems());
  });

  /* Initialize actions menu. */
  const actionsMenu = new ActionMenu();

  const selectAction = new Action(ACTION_SELECT, [STATES.SELECT]);
  selectAction.onClick(() => {
    console.log('Select action clicked.');
  });

  const addTextAction = new Action(ACTION_TEXT, [STATES.TEXT_CREATE, STATES.TEXT_EDIT]);
  addTextAction.onClick(() => {
    if(!windowOpen) {
      textItemEditor.open();
      currentState = STATES.TEXT_CREATE;
      actionsMenu.updateMenuItemStatus(currentState);
      windowOpen = true;
    }
  });

  const addImageAction = new Action(ACTION_IMAGE, [STATES.IMAGE_CREATE, STATES.IMAGE_EDIT]);
  addImageAction.onClick(() => {
    if(!windowOpen) {
      imageItemEditor.open();
      currentState = STATES.IMAGE_CREATE;
      actionsMenu.updateMenuItemStatus(currentState);
      windowOpen = true;
    }
  });

  actionsMenu.addAction(selectAction);
  actionsMenu.addAction(addTextAction);
  actionsMenu.addAction(addImageAction);
  actionsMenu.updateMenuItemStatus(currentState);

  /* Listeners. */
  window.addEventListener('resize', resize);

  window.addEventListener('pointerdown', () => {
    moved = false;
  });

  controls.addEventListener('change', () => {
    moved = true;
  });

  window.addEventListener('pointerup', (event) => {
    if (moved === false) {
      if(currentState === STATES.PLACE){
        checkIntersection(event.clientX, event.clientY);
        if (intersection.intersects){
          placeItem();
          currentState = STATES.SELECT;
          actionsMenu.updateMenuItemStatus(currentState);
        }
      }
    }
  });

  window.addEventListener('pointermove', onPointerMove);
}

await runApp();