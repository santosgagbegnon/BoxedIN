import csv
import zipfile
import os
import tempfile
import turicreate as tc
from PIL import Image
from io import BytesIO
import base64
from flask import Flask,render_template,request,send_file
app = Flask(__name__)
PORT = 5000

def createSFrame(imagesData):
    with tempfile.TemporaryDirectory() as tmpdirname:
        imageCol = []
        labelCol = []
        annotationCol = []
        for index in range(0,len(imagesData)):
            data = imagesData[index]
            image = Image.open(BytesIO(base64.b64decode(data["base64"])))
            imagePath = tmpdirname + "/image"+str(index)+".jpg"
            image.convert('RGB').save(imagePath, 'JPEG')          
            savedImage = tc.Image(imagePath)
            imageCol.append(savedImage)
            labelCol.append(data["label"])
            annotationCol.append(data["annotation"])
        #Changing regular arrays in to turicreate SArrays.
        imageCol = tc.SArray(imageCol)
        labelCol= tc.SArray(labelCol)
        annotationCol= tc.SArray(annotationCol)
        sFrame = tc.SFrame()
        sFrame["image"] = imageCol
        sFrame["label"] = labelCol
        sFrame["annotations"] = annotationCol
        print(sFrame)
        return sFrame
        # sFrame['image_with_ground_truth'] = tc.object_detector.util.draw_bounding_boxes(sFrame["image"], sFrame["annotations"])
        # sFrame.explore()

#create images
def createImage(data):
    with tempfile.TemporaryDirectory() as tmpdirname:
        image = Image.open(BytesIO(base64.b64decode(data)))
        image.convert('RGB').save(tmpdirname + "/temp.jpg", 'JPEG')
        
        #load images and do the turic reate stuff
        newImage = Image.open(tmpdirname+"/temp.jpg")

        tcImage = tc.Image(tmpdirname+"/temp.jpg")
        sFrame = tc.SFrame()
        sFrame["image"] = tc.SArray([])


    

def createCSV(data):
    with open("out.csv","w",newline="") as file:
        firstRow = [data["image"],data["name"],data["annotation"]]
        writer = csv.writer(file)
        writer.writerow(firstRow)

@app.route("/app")
def appIndex():
    return render_template("app.html")

@app.route("/export", methods=["POST"])
def export():   
    print("Got Data")
    results = request.get_json()["results"]
    sFrame = createSFrame(results)
    memory_file = BytesIO()
    with tempfile.TemporaryDirectory() as tmpdirname:
        path = tmpdirname + "/santos.sframe"
        sFrame.save(path)
        with zipfile.ZipFile(memory_file, 'w') as zf:
            # zf.write(path)
            for dirname, subdirs, files in os.walk(path):
                zipPath = "training.sframe"
                zf.write(dirname, arcname=zipPath)
                for filename in files:
                    zf.write(os.path.join(dirname, filename),arcname=zipPath +"/"+ filename)
                    
        memory_file.seek(0)
        return send_file(memory_file, attachment_filename='dataset.zip', as_attachment=True)
    #return send_file(sFrame, as_attachment=True, attachment_filename="boxedin.sframe")

if __name__ == '__main__':
     app.run(host ='127.0.0.1', port = PORT, debug = False)

