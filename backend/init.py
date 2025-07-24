from fastapi import FastAPI
from pydantic import BaseModel
import cv2
import uvicorn
import numpy as np
from fastapi.responses import Response

app = FastAPI()

def generate_frames():

    frame = cv2.imread("images/plate_image.png")

    _, buffer = cv2.imencode('.png', frame)
    return buffer.tobytes()
    
@app.get('/image',
         responses={
             200: {
                 "content": {"image/png": {}}
             }
         },
         response_class=Response
         )
def image_feed():
    return Response(content=generate_frames(), media_type="image/png")
    
if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)