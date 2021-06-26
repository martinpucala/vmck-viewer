import React, { useEffect, useRef, useState } from 'react'
import WebCam from 'react-webcam'
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'


const API_PREFIX = 'http://vmck.sic.cz:3000'
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjOTQ3NjhkNS0yYmVlLTQ5YTctYmUzYS05MzM3OTE4MGFjNDYiLCJpYXQiOjE2MTU5MDA4MDl9.OHRHhHLmtpEhUt5eFaAmvShWM_DFYpWWXjFeW0CctHk'
const authHeader = { headers: { Authorization: authToken } }
// const structureId = '831f3368-ec67-4eab-ba92-1c2da01eb966';
const PROGRESS_BAR_TIMEOUT = 1000

// const response = await fetch(`${API_PREFIX}/structures/${structureId}`, { headers: { Authorization: authToken } });

// if (response.status === 200) {
//   const obj = await response.json();
//   console.log(obj);
// } else if (response.status === 401) {
//   alert('authentication error');
// } else {
//   alert('unknown error');
// }

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'environment'
}



const ProgressBar = ({ progress }) => (
  <div className='progress-bar'>
    <div className='groove'>
      <div className='indicator' style={{ width: (100 * (progress || 0)) + '%' }} />
    </div>
  </div>
)


export default function App() {
  const mount = useRef(null)
  const containerRef = useRef(null)
  const [scene,] = useState(new THREE.Scene())
  const [aspectRatio, setAspectRatio] = useState(window.innerWidth / window.innerHeight)
  const [camera,] = useState(new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000))
  const [renderer,] = useState(new THREE.WebGLRenderer({ alpha: true }))
  const [controls, setControls] = useState(null)
  const [cube, setCube] = useState(null)
  const fullscreenHandle = useFullScreenHandle()
  // const [loader,] = useState(new GLTFLoader())
  const [loader,] = useState(new OBJLoader())
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    let handle = null;

    if (progress === 1) {
      handle && clearTimeout(handle)
      handle = setTimeout(() => setProgress(null), PROGRESS_BAR_TIMEOUT)
    } else {
      handle && clearTimeout(handle)
    }

    return () => {
      if (handle) {
        clearTimeout(handle)
        handle = null
      }
    }
  }, [progress])


  useEffect(() => {
    fetch(`${API_PREFIX}/structures`, authHeader)
      .then(response => response.json())
      .then(structures => {
        const blobURLs = []
        const modelId = structures[structures.length - 1].allVariants[0].modelId
        console.log('modelId', modelId)
        const modelURL = `${API_PREFIX}/models/${modelId}`

        fetch(modelURL, authHeader)
          .then(response => response.blob())
          .then(objBlob => {
            // objBlob.text().then(console.log)
            const blobURL = window.URL.createObjectURL(objBlob)

            // blobURLs.push(blobURL)

            loader.load(blobURL, obj => {
              const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
              // console.log(obj.up)
              obj.traverse(child => {
                if (child instanceof THREE.Mesh) {
                  child.material = material
                }
              })
              scene.add(obj)
              // console.log(obj, obj.mesh)
              window.URL.revokeObjectURL(blobURL)
            }, e => {
              if (e.lengthComputable) {
                const progress = e.loaded / e.total
                console.log('progress', progress);
                setProgress(progress)
              }
            })
          })
      })
  }, [])

  const handleEnterFullscreen = e => {
    fullscreenHandle.enter(e)
  }

  useEffect(() => {
    const geometry = new THREE.BoxGeometry(3, 3, 3)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)

    camera.position.z = 5
    // scene.add(cube)

    setCube(cube)

    const handleWindowResize = e => {
      const width = (mount && mount.current && !fullscreenHandle.active) ? mount.current.offsetWidth : window.innerWidth
      const height = (mount && mount.current && !fullscreenHandle.active) ? mount.current.offsetHeight : window.innerHeight
  
      renderer.setSize(width, height)
      setAspectRatio(width / height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleWindowResize)
    
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  useEffect(() => {
    if (mount.current && renderer.domElement.parentElement !== mount.current) {
      mount.current.appendChild(renderer.domElement)
    }

    if (cube) {
      const animate = function () {        
        renderer.render(scene, camera);

        if (fullscreenHandle.active) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
    if (!controls && mount.current) {
      const element = mount.current
      setControls(new OrbitControls(camera, element))
    }
  }, [mount, cube, fullscreenHandle.active])

  useEffect(() => {
    const width = mount && mount.current ? mount.current.offsetWidth : window.innerWidth
    const height = mount && mount.current ? mount.current.offsetHeight : window.innerHeight

    renderer.setSize(width, height)
    setAspectRatio(width / height)
  }, [window.innerWidth, window.innerHeight, fullscreenHandle.active])

  return (
    <>
      <div className='container' ref={containerRef}>
        <h1>Welcome, tourist! :)</h1>
        <p>This is an augmented reality-enabled sightseeing site. Tap on the placeholder
        below to see the structure that stood here several centuries ago.</p>
        <FullScreen handle={fullscreenHandle}>
          {fullscreenHandle.active
            ? (
              <div className='screen'>
                <WebCam
                  audio={false}
                  videoConstraints={videoConstraints}
                  className='webcam'
                />
                <div ref={mount} className='three-container' />
              </div>
            )
            : (
              <div onClick={handleEnterFullscreen} className='placeholder'>
                <span>Enable AR</span>
              </div>
            )}
            {progress !== null && (
              <ProgressBar progress={progress} />
            )}
        </FullScreen>
      </div>
    </>
  )
}
