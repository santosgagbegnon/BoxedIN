import csv
from flask import Flask,render_template,request,send_file
app = Flask(__name__)

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
    print("Got update")
    print(request.get_json())
    createCSV(request.get_json())
   
    return "ok"

if __name__ == '__main__':
     app.run(host ='127.0.0.1', port = 8001, debug = True)

