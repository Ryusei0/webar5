import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sendButton').addEventListener('click', sendInput);
    document.getElementById('toggleResponse').addEventListener('click', toggleResponse);
    // 他のイベントリスナーも同様に設定
  });

// ビューポートをリセットする関数
function resetViewport() {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) {
        viewportMeta = document.createElement("meta");
        viewportMeta.name = "viewport";
        document.getElementsByTagName("head")[0].appendChild(viewportMeta);
    }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 8);
camera.lookAt(new THREE.Vector3(0, 8, 0)); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 0.5;
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(0, 4, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

let mixer;

loader.load('https://s3.ap-northeast-3.amazonaws.com/testunity1.0/webar/nMstandbaked.gltf', function (gltf) {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.05, 0.05, 0.05);
    gltf.scene.traverse(function (node) {
        if (node.isMesh) { node.castShadow = true; }
    });
    mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations.length) {
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    }
}, undefined, function (error) {
    console.error(error);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const videos = [
            { name: "ビデオ1", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/1.mp4" },
            { name: "ビデオ2", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/2.mp4" },
            { name: "ビデオ0", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/0.mp4" },
            { name: "ビデオ3", url: "https://s3.ap-northeast-3.amazonaws.com/testunity1.0/videos/3.mp4" },
            // 他の動画をここに追加
        ];

        var videoContainer = document.getElementById('videoButtons');

        videos.forEach(function(video, index) {
            var button = document.createElement('button');
            button.textContent = video.name; // ボタンに動画の名前を設定
            button.onclick = function() {
                changeVideo(video.url); // ボタンをクリックした時に動画を変更
            };
            videoContainer.appendChild(button); // 生成したボタンをコンテナに追加
        });

// ここからイベントリスナーを登録するためのDOMContentLoadedイベント

function changeVideo(url) {
            var video = document.getElementById('my-video');
            video.src = url; // 動画ソースを更新
            video.load(); // 新しいソースで動画を再読み込み
            video.play(); // 自動再生
            document.getElementById('closeVideo').style.display = 'block'; // 動画を閉じるボタンを表示
}

// 動画再生時と終了時のレイアウトのリセットを行う関数
        function resetLayout() {
            resetViewport(); // ビューポートのリセット

            const video = document.getElementById('my-video');
            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.maxHeight = '100vh';
        }

        // 動画を閉じた時にレイアウトをリセットする
        function closeVideo() {
            var video = document.getElementById('my-video');
            video.pause();
            video.currentTime = 0;
            video.style.display = 'none';
            document.getElementById('closeVideo').style.display = 'none';

            resetLayout();
        }

        // 動画が終了した時にもレイアウトをリセットする
        document.getElementById('my-video').addEventListener('ended', function() {
            closeVideo();
            resetLayout();
        });

        function sendInput() {
            var userInput = document.getElementById('userInput').value;
            var responseContainer = document.getElementById('responseContainer');

            fetch('https://webchat-yghl.onrender.com/submit-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({input_text: userInput})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                responseContainer.textContent = '応答: ' + data.response; // 応答をページに表示
            })
            .catch((error) => {
                console.error('Error:', error);
                responseContainer.textContent = 'エラーが発生しました。';  // エラーをページに表示
        })
        .finally(() => {
        // フォーカスを外して画面のズームをリセットする
             document.getElementById('userInput').blur();

        // 必要に応じてビューポートをリセットする
              resetViewport();
        });
}


        function toggleResponse() {
           var responseContainer = document.getElementById('responseContainer');
           var toggleButton = document.getElementById('toggleResponse');
           if (responseContainer.style.display === 'none') {
            responseContainer.style.display = 'block';
            toggleButton.textContent = '返答を隠す';
           } else {
            responseContainer.style.display = 'none';
            toggleButton.textContent = '返答を表示';
           }
        }
