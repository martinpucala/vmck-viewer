import React, { useEffect, useRef, useState } from 'react'
import WebCam from 'react-webcam'
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import * as THREE from 'three'

// const API_PREFIX = 'http://vmck.sic.cz:3000';

// const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjOTQ3NjhkNS0yYmVlLTQ5YTctYmUzYS05MzM3OTE4MGFjNDYiLCJpYXQiOjE2MTU5MDA4MDl9.OHRHhHLmtpEhUt5eFaAmvShWM_DFYpWWXjFeW0CctHk';

// const structureId = '831f3368-ec67-4eab-ba92-1c2da01eb966';


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

export default function App() {
  const mount = useRef(null)
  const [scene,] = useState(new THREE.Scene())
  const [aspectRatio, setAspectRatio] = useState(window.innerWidth / window.innerHeight)
  const [camera,] = useState(new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000))
  const [renderer,] = useState(new THREE.WebGLRenderer({ alpha: true }))
  const [cube, setCube] = useState(null)
  const fullscreenHandle = useFullScreenHandle()
  
  const handleClick = e => {
    fullscreenHandle.enter(e)
  }

  useEffect(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)

    camera.position.z = 5
    scene.add(cube)

    setCube(cube)
  }, [])

  useEffect(() => {
    if (mount.current) {
      mount.current.appendChild(renderer.domElement)
    }

    if (cube) {
      const animate = function () {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        renderer.render(scene, camera);

        if (fullscreenHandle.active) {
          requestAnimationFrame(animate);
        }
      };
      animate();
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
      <div className='container'>
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
              <div onClick={handleClick} className='placeholder'>
                <span>Enable AR</span>
              </div>
            )}
        </FullScreen>
      </div>
    </>
  )
}
