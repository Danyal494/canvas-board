

import { useEffect, useRef, useState } from "react";

export const useDraw = (onDraw: ({ctx,currentPoint,prevPoint}: Draw)=> void) => {

  const [mouseDown,setMouseDown] =useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prevPoint = useRef<null|Point>(null)
const onMouseDown = () => setMouseDown(true)

const clear = () =>{
  const canvas = canvasRef.current
  if(!canvas) return

  const ctx = canvas.getContext('2d')
  if(!ctx) return

  ctx.clearRect(0,0,canvas.width,canvas.height)
}

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // console.log({ x: e.clientX, y: e.clientY });
if (!mouseDown) return
      const currentPoint = computerPointInCanvas(e)

      const ctx = canvasRef.current?.getContext('2d')
      if(!ctx || !currentPoint) return

onDraw({ctx,currentPoint,prevPoint: prevPoint.current})
prevPoint.current = currentPoint
    };
 
    const computerPointInCanvas = (e: MouseEvent) =>{
        const canvas = canvasRef.current
        if(!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        return {x,y}
    }

    const mouseUpHandler = ()=>{
      setMouseDown(false)
      prevPoint.current = null
    }
    // Add event listener
    canvasRef.current?.addEventListener("mousemove", handler);
    canvasRef.current?.addEventListener("mouseup", mouseUpHandler);
    
    // Cleanup: remove event listener
    return () =>{
      canvasRef.current?.removeEventListener("mousemove", handler);
      canvasRef.current?.removeEventListener("mouseup", mouseUpHandler);

    }
  }, [ onDraw]);

  return { canvasRef,onMouseDown ,clear};
};
