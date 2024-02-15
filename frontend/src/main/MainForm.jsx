import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'; // 명암과 선명도 향상에 도움을 줄 수 있습니다.

// 상대 경로에 따라 조정

function MainForm() {
    const canvasRef = useRef();
    

    useEffect(() => {
        const scene = new THREE.Scene();
        const canvas = canvasRef.current;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        //renderer.outputColorSpace = THREE.ColorSpace.sRGB;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 90);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;

        scene.background = new THREE.Color('#191919');
        const group = new THREE.Group();

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const unrealBloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 1, 0.85);
        composer.addPass(unrealBloom);

        // 환경 조명 추가
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // 방향 조명 추가
        const directionalLight = new THREE.DirectionalLight(0xE75690, 3);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xE75690, 0x080820, 2);
        scene.add(hemisphereLight);

        // GLTFLoader를 사용하여 모델 로드
        const loader = new GLTFLoader();
        loader.load(
            process.env.PUBLIC_URL + '/model/littlePrince/scene.gltf',
            (gltf) => {
                gltf.scene.traverse((object) => {
                    if (object.isMesh && object.material) {
                        object.material.transparent = false;
                        object.material.opacity = 1.0;
                    }
                });
                gltf.scene.rotation.x = Math.PI / 8;
                gltf.scene.rotation.y -= Math.PI / 4;
                gltf.scene.position.y -= 70.5;
                gltf.scene.position.z -= 100;
                //scene.add(gltf.scene);
                group.add(gltf.scene);
            },
            undefined,
            (error) => {
              console.error('An error happened', error);
            }
        );
        group.position.set(0, 6, 60);
        scene.add(group);

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            // 그룹의 Z축을 중심으로 회전
            //group.rotation.z += 0.001;
            composer.render();
        }

        animate();

        // 컴포넌트 언마운트 시 정리
        return () => {
            scene.clear();
            renderer.dispose();
        };
    }, []);

    return (
        <div className='main-container'>
            <canvas ref={canvasRef} />
            <div className='rendered-name'>
                <p className='mongle'>Mongle</p>
                <p className='para'>다른 학교에서 새로운 친구를 만나보세요</p>
            </div>
        </div>
    );
}

export default MainForm;
