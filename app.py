import csv
import tempfile
import turicreate as tc
from PIL import Image
from io import BytesIO
import base64
from flask import Flask,render_template,request,send_file
app = Flask(__name__)

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
        sFrame['image_with_ground_truth'] = tc.object_detector.util.draw_bounding_boxes(sFrame["image"], sFrame["annotations"])
        sFrame.explore()

#create images
def createImage(data):
    with tempfile.TemporaryDirectory() as tmpdirname:
        image = Image.open(BytesIO(base64.b64decode(data)))
        image.convert('RGB').save(tmpdirname + "/test.jpg", 'JPEG')
        
        #load images and do the turic reate stuff
        # image.save(tmpdirname + "/test.jpg", 'JPEG')
        newImage = Image.open(tmpdirname+"/test.jpg")

        tcImage = tc.Image(tmpdirname+"/test.jpg")
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
    print("Number of images: " + str(len(results)))
    createSFrame(results)
    return "ok"

if __name__ == '__main__':
     app.run(host ='127.0.0.1', port = 8001, debug = True)

