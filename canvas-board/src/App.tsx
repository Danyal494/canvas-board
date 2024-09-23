

import { useEffect, useState } from 'react';
import './App.css'
import { useDraw } from './hooks/useDraw';
import {ChromePicker} from 'react-color'
import { drawLine } from './utils/drawLine';
import { io } from 'socket.io-client'; 
const socket = io('http://localhost:30001');


// interface pageProps{}

type DrawLineProps= {
prevPoint: Point|null
currentPoint:Point
color:string
}

function App() {
  const [color, setColor] = useState<string>('#000')
 
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    socket.emit('client-ready')

    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return
      console.log('sending canvas state')
      socket.emit('canvas-state', canvasRef.current.toDataURL())
    })

    socket.on('canvas-state-from-server', (state: string) => {
      console.log('I received the state')
      const img = new Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return console.log('no ctx here')
      drawLine({ prevPoint, currentPoint, ctx, color })
    })

    socket.on('clear', clear)

    return () => {
      socket.off('draw-line')
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('clear')
    }
  }, [canvasRef])

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color })
    drawLine({ prevPoint, currentPoint, ctx, color })
  }

  return (
    <div className=" bg-white flex justify-center  items-center">
      <div className='flex-col m-5'>
      <ChromePicker className='my-7' color={color} onChange={(e) => setColor(e.hex)}/>
        <button className= 'shadow-md p-4 rounded-lg bg-slate-500  text-white' type='button' onClick={()=> socket.emit('clear')}>Clear Canvas</button>
      </div>
    <canvas
onMouseDown={onMouseDown}
      ref={canvasRef}
      width={"750px"}
      height={"550px"}
      className="border border-black rounded-xl"
    />
    
  </div>
  )
}

export default App
