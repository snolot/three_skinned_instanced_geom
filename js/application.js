const Application = config => {
	const win = {
		w:window.innerWidth,
		h:window.innerHeight
	}

	const modelsURLS = config.modelsURLS

	const vUP = new THREE.Vector3(0,1,0);
	const _clock = new THREE.Clock();

	
	const _dracoLoader = new THREE.DRACOLoader();
	_dracoLoader.setDecoderPath( '../three.js/examples/js/libs/draco/' );
	_dracoLoader.setDecoderConfig( { type: 'js' } );
	_dracoLoader.preload()
	
	const _loader = new THREE.GLTFLoader();
	_loader.setDRACOLoader( _dracoLoader );

	const _target = new THREE.Vector3(0,5,0);
	const _scale = new THREE.Vector3( .1, .1, .1 );
	const _scale2 = new THREE.Vector3( .005, .005, .005 );
	const initialPositions = []
	const initialRotations = []
	const initialScales = []
	const touch = !!('ontouchstart' in window)

	let _afterimagePass, _composer;
	let instanceCount;

	let _models = [], _mesh
	let _camera, _scene, _renderer
	let _mixer, _controls
	let _skeleton, _skinnedMesh, _boneContainer

	let ray = new THREE.Ray()
    let mouse3d = ray.origin
    let mouse = new THREE.Vector2()
    let touched = false

	let dummy = new THREE.Object3D()

	const _initLights = _ => {
	
		//_scene.add( new THREE.AmbientLight( 0x4375BC ) );
		lightMesh = new THREE.Object3D();
		lightMesh.position.set( 0, 50, 0 );

		light = new THREE.HemisphereLight( 0x88ffff, 0xFF0088, 0.5 );
		_scene.add( light );

		const ambient = new THREE.AmbientLight( 0x333333, 1.6 );
		lightMesh.add( ambient );

	    var blue = new THREE.SpotLight( 0x0066FF, 2, 500 );
	    blue.castShadow = true;
	    blue.position.set( -50, 50, -50 );
	    blue.shadow.mapSize.width = 512;
	    blue.shadow.mapSize.height = 512;
	    blue.shadow.camera.near = 0.5;
	    lightMesh.add( blue );
			
		var yellow = new THREE.SpotLight( 0xFFCC00, 1.5, 500 );
	    yellow.castShadow = true;
	    yellow.position.set( 50, 50, 0 );
	    yellow.shadow.mapSize.width = 512;
	    yellow.shadow.mapSize.height = 512;
	    yellow.shadow.camera.near = 0.5;
	    lightMesh.add( yellow );


		_scene.add(lightMesh);
	}

	const random = (min, max) => {
	    if (max === undefined) {
	      max = min; min = 0;
	    }
	    return min + (max - min) * Math.random()
	}

	const createStar = () => {
	    stars = new THREE.Object3D();

	    let starShape = new THREE.Shape();
	    
	    /*for(let i=0; i< pos.length; i+=2){
	    	if(i==0){
	    		starShape.moveTo(pos[i], pos[i+1]);
	    		console.log(`starShape.moveTo(${pos[i]}, ${pos[i+1]});`)
	    	}else if(i == pos.length - 2){
	    		starShape.moveTo(pos[i], pos[i+1]);
	    		console.log(`starShape.moveTo(${pos[i]}, ${pos[i+1]});`)
	    	}else{
	    		starShape.lineTo(pos[i], pos[i+1]);
	    		console.log(`starShape.lineTo(${pos[i]}, ${pos[i+1]});`)
	    	}
	    }*/
	    const pos = [
	    	1.12, .40,
	    	1.3034, .6573,
	    	1.6145, .7455,
	    	1.4167, .9927,
	    	1.4256, 1.3045,
	    	1.12, 1.20,
	    	.8144, 1.3045,
	    	.8233, .9927,
	    	.6255, .7455, 
	    	.9366, .6573,
	    	0, 0]

	    for(let i=0; i<pos.length; i++){
	    	pos[i] *= .35
	    }

	    console.log(pos)

	    starShape.moveTo(pos[0], pos[1]);
	    starShape.lineTo(pos[2], pos[3]);
	    starShape.lineTo(pos[4], pos[5]);
	    starShape.lineTo(pos[6], pos[7]);
	    starShape.lineTo(pos[8], pos[9]);
	    starShape.lineTo(pos[10], pos[11]);
	    starShape.lineTo(pos[12], pos[13]);
	    starShape.lineTo(pos[14], pos[15]);
	    starShape.lineTo(pos[16], pos[17]);
	    starShape.lineTo(pos[18], pos[19]);
	    starShape.moveTo(pos[20], pos[21]);

	    let extrudeSettings = { bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .01, bevelThickness: .01, depth: 0.1 }; //making object 3d actually
	    let starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

	    return starGeometry;
	}
	const _initInstancedBufferGeometry = _ => {
		const geometry = new THREE.TetrahedronBufferGeometry(0.25)//new THREE.BoxBufferGeometry(.3, .3, .3)
	
		const uniforms = [
	        { time : { type:"f", value: 0 } },
	        { mouse3d : { type:"v3", value: mouse3d } }
	    ];

	    const shader = [
	        {
	          needle:'#include <clipping_planes_pars_vertex>', 
	          vertex:`#include <clipping_planes_pars_vertex>

				${ShaderChunks.CurlNoise}

	            varying vec4 vWorldPosition;
	            varying vec4 vPosition;
	            varying vec3 N;
		      	varying vec3 I;

				vec2 rotate(vec2 v, float a) {
					float s = sin(a);
					float c = cos(a);
					mat2 m = mat2(c, -s, s, c);
					return m * v;
				}`
	        },
	        { 
	          needle:'#include <project_vertex>', 
	          vertex:`
	          	vPosition = vec4(position, 1.);
	            vWorldPosition = instanceMatrix * vec4(position, 1.);
	           
				vec4 mvPosition = vec4(position.xyz, 1.0);//vec4( position, 1.0 );

				vec3 md =vec3(mouse3d.xy, position.z); 
				float dist = length(vWorldPosition.xyz - md);

				

                if(dist < 3.){
                	vec3 pos = position.xyz;

                	vec2 dir = pos.xz;
					dir      = rotate(dir, PI * 0.26);
					pos.xz   += dir ;

                	vec3 c = curl(pos.xyz * .025 , 1.4, .05).xyz * 1.35;
					mvPosition.xyz +=  vec4(c, 1.0).rgb * 2.;
					mvPosition.xyz *= .8;
                }

				
				#ifdef USE_INSTANCING
					mvPosition = instanceMatrix * mvPosition ;
				#endif

				mvPosition = modelViewMatrix * mvPosition;

				gl_Position = projectionMatrix * mvPosition;
	          `
	        },
	        { 
	          needle:'#include <common>', 
	          fragment:`
	          	
				varying vec4 vWorldPosition;
				varying vec4 vPosition;

				uniform vec3 mouse3d;

            	#include <common>
	          `
	        },
	        { 
	          needle:'#include <color_pars_fragment>', 
	          fragment:''
	      	},
	        { 
	          needle:'#include <color_fragment>', 
	          fragment:''
	      	},
	      	{
	      		needle:'#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );',
	      		fragment:`
	      			#include <clipping_planes_fragment>

	            	vec4 diffuseColor = vec4( diffuse, opacity );

					vec3 md =vec3(mouse3d.xy, vPosition.z); 
	                float dist = length(vWorldPosition.xyz - md);

	                if(dist < 3.){
	                	diffuseColor = vec4( mix(vec3(.8, .5, .6), vec3(.5, .3, .8) * .8, vWorldPosition.y / 6.), opacity );//outgoingLight = vec3(1.) - outgoingLight;// mix(vec3(1.) - outgoingLight, outgoingLight, dist/5.);
	                	//diffuseColor.a = .4;
	                }
	      		`
	      	}

	    ];

   	 	var mat = new THREE.ExtendedMaterial(_renderer, new THREE.MeshStandardMaterial({
   	 		color:0xFFCC00, 
   	 		emissive:0x310000, 
   	 		transparent:false, 
   	 		opacity:1.,
   	 		roughness:1.,
   	 		wireframe:false
   	   	}), uniforms, shader, false );
			
		allocateAnimations(geometry)

		geometry.computeBoundingSphere();
    	geometry.boundingSphere.radius = 100;

		_mesh = new THREE.InstancedMesh( geometry, mat, instanceCount )
		
		_mesh.frustumCulled = false
		_mesh.castShadow = true
		_mesh.receiveShadow = true
		_mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

		_mesh.customDepthMaterial = new THREE.ExtendedMaterial(_renderer, new THREE.ShaderMaterial( {
	        vertexShader: THREE.ShaderLib.depth.vertexShader,
	        fragmentShader:"#define DEPTH_PACKING 3201\n" + THREE.ShaderLib.depth.fragmentShader,
	        side: THREE.DoubleSide
	    } ), uniforms, shader, false);

	
		const SIZE = 10

		for (let i = 0; i < instanceCount; i++) {
			// position the element
			dummy.position.x = random(-SIZE / 2, SIZE / 2)
			dummy.position.y = random(-SIZE / 2, SIZE / 2)
			dummy.rotation.x = random(0, Math.PI * 2)
			dummy.rotation.y = random(0, Math.PI * 2)
			dummy.rotation.z = random(0, Math.PI * 2)

			const  rnd = random(0, 1)
			dummy.scale.x = rnd
			dummy.scale.y = rnd
			dummy.scale.z = rnd

			dummy.updateMatrix()
			_mesh.setMatrixAt(i, dummy.matrix)

			dummy.updateMatrixWorld()
			
			dummy.rotateX(-.001)
			dummy.updateMatrix()
			_mesh.setMatrixAt(i, dummy.matrix)

			initialPositions.push(dummy.position.clone())
			initialRotations.push(dummy.rotation.clone())
			initialScales.push(dummy.scale.clone())
		}

		_mesh.instanceMatrix.needsUpdate = true;

		_scene.add(_mesh)
	}



	const _initModel = url => {
		console.log('_initModel')
		return new Promise(resolve => {
			_loader.load(url, gltf => {
				_models.push(gltf.scene)
				const _model = _models[_models.length-1];

				_model.scale.set(10, 10,  10)

				const isMain = (_models.length == 1)

				_model.traverse(child => {
					
					if(child.isBone && isMain){
						if(child.name == 'mixamorigSpine'){
							_spine = child;
						}
					}

					if(child.isSkinnedMesh){
						const animations = gltf.animations

						instanceCount = child.geometry.attributes.position.count
						_skinnedMesh = child
						console.log(_skinnedMesh)

						_skeleton = _skinnedMesh.skeleton
						bindMatrix = _skinnedMesh.bindMatrix
						bindMatrixInverse = _skinnedMesh.bindMatrixInverse
						pa = _skinnedMesh.geometry.attributes.position.array
						skinIndex = _skinnedMesh.geometry.attributes.skinIndex;
						skinWeights  = _skinnedMesh.geometry.attributes.skinWeight;

						_initInstancedBufferGeometry()

						_scene.add(_model)
						_camera.lookAt(_initModel)

						const geometryp = new THREE.PlaneGeometry( 4000, 4000, 10, 10 );
						const _material = new THREE.MeshStandardMaterial( {
							roughness: 0.7,
							metalness: 1.0,
							dithering: true,
							color: 0x1b2738,
							emissive: 0x000000
						} );

						const planeMesh = new THREE.Mesh( geometryp, _material );
						planeMesh.rotation.x = - 1.57;
						planeMesh.receiveShadow = true;

						_scene.add(planeMesh);
						
						_model.visible = false;

						_mixer = new THREE.AnimationMixer(_skinnedMesh)
						const clip = animations[0]
						const action = _mixer.clipAction( clip )
						
						action.play()
						update()
						resolve(true)
					}
				});			
			})
		})
	}

		const _init3D = _ => {
			_scene = new THREE.Scene();
			_scene.background = new THREE.Color( 0x000000 );
			_scene.fog = new THREE.FogExp2( 0x020406, 0.01 );
			
			_camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
			_camera.position.set(0, 10, 22);
			

			_renderer = new THREE.WebGLRenderer( {
				antialias: true,
	      		alpha: false
	  		} );

			_renderer.setPixelRatio( window.devicePixelRatio );
			_renderer.setSize( window.innerWidth, window.innerHeight );
			console.log(`devicePixelRatio:${window.devicePixelRatio}`)
			_renderer.setPixelRatio(window.devicePixelRatio);
			_renderer.shadowMap.enabled = true;
    		_renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			document.body.appendChild(_renderer.domElement);

			_controls = new THREE.OrbitControls( _camera, _renderer.domElement );
	    	_controls.minDistance = 1;
	    	_controls.maxDistance = 140;
	    	_controls.target = _target;

		}

		const position = new THREE.Vector3()
		const transformed = new THREE.Vector3()
		const temp1 = new THREE.Vector3()
		const tempBoneMatrix = new THREE.Matrix4()
		const tempSkinnedVertex = new THREE.Vector3()
		const tempSkinned = new THREE.Vector3()
		const currentM = new THREE.Matrix4()
		let bindMatrix
		let bindMatrixInverse
		let pa
		let skinIndex
		let skinWeights

		const updatePositions = () => {
			let time = _clock.getElapsedTime()
			
			_scene.updateMatrixWorld()
			_skeleton.update()
			
			var rotationMatrix = new THREE.Matrix4().makeRotationX( 0.3 ).makeRotationY( 0.1 );

			for (let vndx = 0; vndx < _skinnedMesh.geometry.attributes.position.count; ++vndx) {
				position.set(pa[(3 * vndx) + 0], pa[(3 * vndx) + 1], pa[(3 * vndx) + 2]);
				transformed.copy(position);
				
				tempSkinnedVertex.copy(transformed).applyMatrix4(bindMatrix);
				tempSkinned.set(0, 0, 0);


				for (let i = 0; i < 4; ++i) {
				  	const boneNdx = skinIndex.array[(4 * vndx) + i];
				  	const weight = skinWeights.array[(4 * vndx) + i];
				  	tempBoneMatrix.fromArray(_skeleton.boneMatrices, boneNdx * 16);
				  	temp1.copy(tempSkinnedVertex);
				  	tempSkinned.add(temp1.applyMatrix4(tempBoneMatrix).multiplyScalar(weight));
				}

				transformed.copy(tempSkinned).applyMatrix4(bindMatrixInverse);
				transformed.applyMatrix4(_skinnedMesh.matrixWorld);

				dummy.position.copy(transformed)
			    dummy.rotation.copy(initialRotations[vndx])
			    dummy.rotateX(time * 6.1)
			    dummy.rotateZ(time * 3.1)
			    dummy.scale.copy(initialScales[vndx])

			    dummy.updateMatrix()
			    
			    //_mesh.getMatrixAt( vndx, currentM );
				//currentM.copy(dummy.matrix)
				_mesh.setMatrixAt( vndx, dummy.matrix);
			}

			_mesh.instanceMatrix.needsUpdate = true;
		}

		const updateMouse3D = _ => {
			_camera.updateMatrixWorld()
	    	ray.origin.setFromMatrixPosition(_camera.matrixWorld)
	    	ray.direction.set(mouse.x, mouse.y, 0.5).unproject(_camera).sub(ray.origin).normalize()
	    	const distance = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
	    	ray.origin.add(ray.direction.multiplyScalar(distance * 1.0))
		
			if(_mesh.material.uniforms){
				_mesh.material.uniforms.mouse3d.value = mouse3d
			}

			/*if(_mesh.customDepthMaterial.uniforms){
	       		_mesh.customDepthMaterial.uniforms.mouse3d.value = mouse3d;	
			}*/
		}


    let followPointTime = 0;

	const update = time => {
		requestAnimationFrame(update)
		const delta = _clock.getDelta()
		
		_controls.target = new THREE.Vector3().setFromMatrixPosition(_spine.matrixWorld)//.add(_spine.position);
		_controls.update()

		if(_mixer)
			_mixer.update(delta)
		
		updateMouse3D()

		updatePositions()

		if( _mesh.material.uniforms ){

        	_mesh.material.uniforms.time.value =  time / 1000
        	//_mesh.customDepthMaterial.uniforms.time.value =  time / 1000
    	}
		
		_renderer.render(_scene, _camera);
		
	}

	const allocateAnimations = geometry => {
		
		var duration = 1.0;
  		var maxPrefabDelay = 0.5;

  		_totalDuration = duration + maxPrefabDelay;

 		const aDelayDuration = []

  		for (i = 0, offset = 0; i < instanceCount; i++) {
    		var delay = Math.random() * maxPrefabDelay;
    
    		for (j = 0; j < 4; j++) {
      			aDelayDuration[offset] = delay;
      			aDelayDuration[offset + 1] = duration;

      			offset += 2;
    		}

    		//geometry.setAttribute('aDelayDuration', new THREE.InstancedBufferAttribute('aDelayDuration', new Float32Array(instanceCount * 4 *2)), 2);
  		}
	}

	
	const _bindEvents = _ => {
	    const touchBegan = touch ? 'touchstart' : 'mousedown'
	    const touchMoved = touch ? 'touchmove' : 'mousemove'
	    const touchEnded = touch ? 'touchend' : 'mouseup'
	    document.addEventListener(touchBegan, onTouchBegan)
	    window.addEventListener(touchMoved, onTouchMoved)
	    document.addEventListener(touchEnded, onTouchEnded)
	    window.addEventListener('resize', setSize, false)
	  }

	const onTouchBegan = e => { }

	const onTouchMoved = e => {
	    const x = touch ? e.changedTouches[0].pageX : e.pageX
	    const y = touch ? e.changedTouches[0].pageY : e.pageY
	    mouse.x = (x / win.w) * 2 - 1
	    mouse.y = -(y / win.h) * 2 + 1
	}

	const onTouchEnded = e => { }

	const setSize = _ => {
	    win.w = window.innerWidth
	    win.h = window.innerHeight
	    _renderer.setSize(win.w, win.h)
	    _camera.aspect = win.w / win.h
	    _camera.updateProjectionMatrix()
	}

	const _exports = {
		init: async _ => {
			return new Promise(async resolve => {
				_init3D()
				_initLights()
				_bindEvents()

				await _initModel(modelsURLS[0])
				//await _initModel(1)
				
				resolve(true)
			})
		}
	}

	Object.defineProperty(_exports, 'renderer', {
		get:_ => {
			return _renderer
		},
		set:value => {
			_renderer = value
		}
	})

	Object.defineProperty(_exports, 'camera', {
		get:_ => {
			return _camera
		},
		set:value => {
			_camera = value
		}
	})


	return _exports;
} 