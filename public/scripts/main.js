import * as Three from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let blocks = [];
let coords = [];
let currentTarget = null;

async function load() {
    let result = await fetch("/Load");
    if (result.ok) {
        let messg = await result.json();
        blocks = [];
        scene.clear();
        coords = Array.from(messg);
        for (let i = 0; i < messg.length; i++) {
            makeBlock(messg[i][0],messg[i][1],messg[i][2])
        }
    } else {
        console.log("error with fetch");
    }
}

async function save() {
    let result = await fetch("/Save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(getData())
    });
    if (result.ok) {
        console.log("saved data");
    } else {
        console.log("error with save");
    }
}

function getData() {
    let out = {}
    out["data"] = coords;
    return out;
}

window.addEventListener("load", (event) => {
    load();
})

const renderer = new Three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new Three.Raycaster();
const pointer = new Three.Vector2();

const lineMaterial = new Three.LineBasicMaterial( {color: 0xffffff});

camera.position.z = 5;
controls.update();

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function makeBlock(x, y, z) {
    const newGeom = new Three.BoxGeometry(1,1,1);
    const newEdges = new Three.EdgesGeometry(newGeom);
    const newLine = new Three.LineSegments(newEdges, lineMaterial);
    const newMaterial = new Three.MeshBasicMaterial({color: 0x888888, opacity: .5, transparent: true});
    const newCube = new Three.Mesh(newGeom, newMaterial);
    newCube.add(newLine);
    scene.add(newCube);
    newCube.translateX(x);
    newCube.translateY(y);
    newCube.translateZ(z);
    blocks.push(newCube);
}

function animate() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(blocks, false);
    for (let i = 0; i < blocks.length; i++) {
        blocks[i].material.color.set(0x888888);
    }
    if (intersects.length > 0) {
        intersects[0].object.material.color.set(0xff0000);
        currentTarget = intersects[0];
    } else {
        currentTarget = null;
    }
    
    controls.update();
	renderer.render( scene, camera );
}

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mousedown', (e) => {
    if (currentTarget == null) return;
    switch (e.button) {
        case 0:
            if (blocks.length <= 1) break;
            let index = blocks.indexOf(currentTarget.object);
            if (index > -1) {
                blocks.splice(index, 1);
                coords.splice(index,1);
            }
            save();
            currentTarget.object.removeFromParent();
            break;
        case 2:
            let face = Math.floor(currentTarget.faceIndex / 2);
            let x = currentTarget.object.position.x;
            let y = currentTarget.object.position.y;
            let z = currentTarget.object.position.z;
            switch (face) {
                case 0:
                    x = x + 1;
                    break;
                case 1:
                    x = x - 1;
                    break;
                case 2:
                    y = y + 1;
                    break;
                case 3:
                    y = y - 1;
                    break;
                case 4:
                    z = z + 1;
                    break;
                case 5:
                    z = z - 1;
                    break;
            }
            makeBlock(x,y,z);
            coords.push([x,y,z]);
            save();
            break;
    }
});
renderer.setAnimationLoop( animate );