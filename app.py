from flask import Flask,render_template,request,send_file
app = Flask(__name__)

@app.route("/app")
def appIndex():
    return render_template("app.html")

@app.route("/export", methods=["POST"])
def export():   
    print("Got info")
    print(request.form["csv-data"])
    return "ok"

if __name__ == '__main__':
     app.run(host ='127.0.0.1', port = 8001, debug = True)

