# three_skinned_instanced_geom
Three.js experiment for skinnedmesh with particles

## Description
This project show how to setup a particle system using [three.js](https://threejs.org/).

it use a [THREE.InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh) with a [THREE.SkinnedMesh](https://threejs.org/docs/#api/en/objects/SkinnedMesh) to spawn the particles. 

Material use a THREE.MeshStandardMaterial shader with the [onBeforeCompile](https://threejs.org/docs/#api/en/materials/Material) method to inject custom code in vertex an fragment shader.

![preview](./images/preview.jpg)

## Todo Items

- Write particles positions in a THREE.DataTexture to make particles easier to animate.

