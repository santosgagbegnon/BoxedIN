from flask import Flask,render_template
app = Flask(__name__)

@app.route("/app")
def appIndex():
    return render_template("app.html")


if __name__ == '__main__':
     app.run(host ='127.0.0.1', port = 8001, debug = True)

