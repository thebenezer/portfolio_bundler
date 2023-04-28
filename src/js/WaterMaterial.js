import * as THREE from 'three';
import * as dat from 'lil-gui';

export class WaterMaterial {
    renderTarget;
    scene;
    camera;
    waterProps = {
        waterColorShallow: 0x71d1bf,
        waterColorDeep: 0x1cafc9,
    };

    material;
    uniforms = {
        textureWidth: {value: window.innerWidth}, 
        textureHeight: {value: window.innerHeight},
        fogDensity: {value: 0.000},
        fogColor: {value: new THREE.Color(0xffffff)},
        waterColorShallowUniform: { value: new THREE.Color(0x71d1bf) },
        waterColorDeepUniform: { value: new THREE.Color(0x1cafc9) },
        depthSoftness: { value: 30 },
        foamSpeed: { value: 0.005 },
        foamScale: { value: 5.30 },
        foamSoftness: { value: 5.0 },
        waveFreq: { value: 250 },
        waveAmp: { value: 0.5 },
        waveSpeed: { value: 0.9 },
    };
    
    mergeUniforms(newUniforms) {
        if (!newUniforms) return;
        for (const [key, value] of Object.entries(newUniforms)) {
          if (value && this.uniforms.hasOwnProperty(key)) {
            this.uniforms[key].value = value;
          }
        }
    }
      
    
    constructor(noiseTexture,scene,camera,
        uniforms){

        this.mergeUniforms(uniforms)
        this.scene = scene;
        this.camera = camera;
        this.renderTarget = this.setupRenderTarget(this.uniforms.textureWidth.value,this.uniforms.textureHeight.value);

        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
              uTime: { value: 0 },
        
              tDepth: { value: null },
              tScreen: { value: null },
              tFoamNoise: { value: null },
        
              uCameraPosition: { value: this.camera.position },
              uCameraNear: { value: this.camera.near },
              uCameraFar: { value: this.camera.far },

              uFogDensity: { value: this.uniforms.fogDensity.value },
              uFogColor: { value: this.uniforms.fogColor.value },

              uFreq: this.uniforms.waveFreq,
              uAmp: this.uniforms.waveAmp,
              uSpeed: this.uniforms.waveSpeed,
        
              uDepthSoftness: this.uniforms.depthSoftness,
              uWaterShallowColor: this.uniforms.waterColorShallowUniform,
              uWaterDeepColor: this.uniforms.waterColorDeepUniform,
              uFoamSpeed: this.uniforms.foamSpeed,
              uFoamScale: this.uniforms.foamScale,
              uFoamSoftness: this.uniforms.foamSoftness,
            },
            vertexShader:  `
                uniform float uCameraNear;
                uniform float uCameraFar;
                uniform vec3 uCameraPosition;

                uniform float uFreq;
                uniform float uAmp;
                uniform float uSpeed;
                uniform float uTime;

                varying vec2 vUv;
                varying vec4 vClipSpace;
                varying float vDistanceFromCamera;

                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    float freq =uFreq/1000.;
                    
                        // Elevation
                        float elevation = sin(modelPosition.x * freq + uTime * uSpeed) 
                                            * sin(modelPosition.z * freq + uTime * uSpeed)
                                            * uAmp;

                        modelPosition.y += elevation;

                        vec4 viewPosition = viewMatrix * modelPosition;
                        vec4 projectedPosition = projectionMatrix * viewPosition;
                        gl_Position = projectedPosition;

                    // For fog calculation
                    vDistanceFromCamera = length( cameraPosition - modelPosition.xyz );

                    vClipSpace = gl_Position;
                    vUv = uv;
                }`,
            fragmentShader: `
                uniform sampler2D tDepth;
                uniform sampler2D tScreen;
                uniform sampler2D tFoamNoise;

                uniform float uTime;
                uniform float uCameraNear;
                uniform float uCameraFar;
                uniform vec3 uCameraPosition;
                uniform float uFogDensity;
                uniform vec3 uFogColor;

                uniform float uDepthSoftness;
                uniform vec3 uWaterShallowColor;
                uniform vec3 uWaterDeepColor;
                uniform float uFoamSpeed;
                uniform float uFoamScale;
                uniform float uFoamSoftness;

                varying vec2 vUv;
                varying vec4 vClipSpace;
                varying float vDistanceFromCamera;

                vec2 clipSpaceToTexCoords(vec4 clipSpace){
                    vec2 ndc = (clipSpace.xy/clipSpace.w);
                    vec2 textCoords = ndc/2.0+0.50;
                    return textCoords;
                }
                float toLinearDepth (float zDepth) {
                    float near = uCameraNear;
                    float far = uCameraFar;
                    return (2.0 * near * far / (far + near - (2.0 * zDepth - 1.0) * (far - near)));
                }
                float calculateWaterDepth (vec2 texCoords) {
                    float depth = texture2D (tDepth, texCoords).r;
                    float floorDistance = toLinearDepth (depth);
                    depth = gl_FragCoord.z;
                    float waterDistance = toLinearDepth (depth);
                    return floorDistance - waterDistance;
                }

                void main() {

                    float foamAlpha = 0.5;
                    float shallowAlpha = 0.3;
                    float deepAlpha = 0.7;
                    vec2 realCoords = clipSpaceToTexCoords(vClipSpace);

                    float waterDepth = calculateWaterDepth(realCoords);


                    // ************ FOAM ***************

                    vec4 foamNoise = texture2D(tFoamNoise, vUv*uFoamScale+uFoamSpeed*uTime);
                    float sum = foamNoise.r + waterDepth;

                    float foamDiv = clamp( sum/uFoamSoftness, 0.0, 1.0);
                    vec4 foamStep = step(vec4(foamDiv),vec4(foamNoise.r));

                    float colorDiv = clamp( waterDepth/uDepthSoftness, 0.0, 1.0);
                    vec4 shallowDeepLerp = vec4(mix(vec4(uWaterShallowColor,shallowAlpha),vec4(uWaterDeepColor,deepAlpha),colorDiv));

                    vec4 foamLerp = mix(shallowDeepLerp, vec4(foamStep.rgb,foamAlpha), foamStep.r);
                    gl_FragColor = vec4(foamLerp);

                    // Visualize depth
                    // gl_FragColor = vec4(vec3(waterDepth/20.),1.0);

                    // FOG
                    float distance = vDistanceFromCamera;
                    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * distance * distance);
                    vec4 finalColor = mix(gl_FragColor,vec4(uFogColor,1.0),fogFactor);

                    gl_FragColor = vec4(finalColor);
                }`,
          });
          this.material.uniforms.tDepth.value = this.renderTarget.depthTexture;
          this.material.uniforms.tScreen.value = this.renderTarget.texture;
          this.material.uniforms.tFoamNoise.value = noiseTexture;
    }

    update(waterMesh,delta,renderer){
        this.material.uniforms.uTime.value = delta;
        waterMesh.visible = false;
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, this.camera);
        waterMesh.visible = true;
        renderer.setRenderTarget(null);
    }

    setupRenderTarget(textureWidth, textureHeight){
        const renderTarget = new THREE.WebGLRenderTarget(textureWidth, textureHeight);
        renderTarget.texture.minFilter = THREE.NearestFilter;
        renderTarget.texture.magFilter = THREE.NearestFilter;
        renderTarget.stencilBuffer = false;
        renderTarget.depthTexture = new THREE.DepthTexture(textureWidth, textureHeight);
        renderTarget.depthTexture.format = THREE.DepthStencilFormat;//THREE.DepthFormat,THREE.DepthStencilFormat
        renderTarget.depthTexture.type = THREE.UnsignedInt248Type;//THREE.UnsignedShortType, THREE.UnsignedIntType, THREE.UnsignedInt248Type };
        return renderTarget;
    }

    addGUI(gui) {
        // gui.addColor(props, "baseColor").name('baseColor').onChange((v) => (UNIFORMS.uBaseColor.value.set(v)));
        gui.addColor(this.waterProps, "waterColorShallow").name('waterColorShallow').onChange((v) => {this.material.uniforms.uWaterShallowColor.value.set(v)});
        gui.addColor(this.waterProps, "waterColorDeep").name('waterColorDeep').onChange((v) => {this.material.uniforms.uWaterDeepColor.value.set(v)});
        gui.add(this.uniforms.depthSoftness, 'value', 0, 200, 0.1).name("depthSoftness");
        gui.add(this.uniforms.foamSoftness, 'value', 0, 100, 0.1).name("foamSoftness");
        gui.add(this.uniforms.foamScale, 'value', 0, 10, 0.1).name("foamScale");
        gui.add(this.uniforms.foamSpeed, 'value', 0, 0.2, 0.001).name("foamSpeed");  
        gui.add(this.uniforms.waveAmp, 'value', 0, 20, 0.001).name("waveAmp");  
        gui.add(this.uniforms.waveFreq, 'value', 0, 100, 0.01).name("waveFreq");  
        gui.add(this.uniforms.waveSpeed, 'value', 0, 10, 0.001).name("waveSpeed");  
    }
}

// **************** USAGE ******************
/* 
 // Ocean
    const noiseTexture = textureLoader.load(require('../assets/textures/noise.png'));
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;
    // noiseTexture.repeat.set(5, 5);

    const textureWidth = window.innerWidth*2;
    const textureHeight = window.innerHeight*2;

    waterMaterial = new WaterMaterial(noiseTexture,scene,camera,{
    textureWidth:textureWidth,
    textureHeight:textureHeight,
    fogDensity: fogDensity,
    fogColor: scene.fog.color
    });
    waterMaterial.addGUI(gui.addFolder("waterProps"));
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    const geometry = new THREE.PlaneGeometry( 2000, 2000 );
    
    water = new THREE.Mesh( planeGeometry, waterMaterial.material );
    water.rotation.x=-Math.PI/2
    water.position.y=1
    scene.add( water )
*/