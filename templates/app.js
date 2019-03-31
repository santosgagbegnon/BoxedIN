/*
Variables from the DOM.

Variables from the DOM are given the name NAME_item-type for clear distinction between variables representing items from the DOM and regular variables.
*/
const canvas_canvas = document.getElementById("image-canvas")
const imageTitle_h3 = document.getElementById("image-title")
const undo_button = document.getElementById("undo-button")
const redo_button = document.getElementById("redo-button")
const labels_list = document.getElementById("labels-list")
const export_button = document.getElementById("export-button")
const next_butotn = document.getElementById("next-button")
const previous_button = document.getElementById("previous-button")

//Rectangle class
class Rectangle {
    constructor(startX, startY){
        this.startX = startX
        this.startY = startY
        this.width = 0
        this.height = 0
    }
}
//Regular Variables
const image = new Image()
image.src = "assets/default.jpg"
image.onload = imageLoaded
const rectangle = new Rectangle(0,0)
const context = canvas_canvas.getContext('2d');
//Add event listeners
canvas_canvas.addEventListener("mousedown",function(e){
    beginDrawing(e)
})
canvas_canvas.addEventListener("mousemove", function(e){
    increaseRectangleSize(e)
})
function beginDrawing(event){
    console.log(event.clientX)
    rectangle.startX = event.clientX
    rectangle.startY = event.clientY
}

function increaseRectangleSize(event){
    if(event.which != 1){return}
    console.log(event.clientX, event.clientY)
    rectangle.width = (rectangle.startX - event.clientX) * -1
    rectangle.height = (rectangle.startY - event.clientY) * -1
    context.strokeStyle = "red";
    context.rect(rectangle.startX, rectangle.startY, rectangle.width, rectangle.height)
    context.stroke()

}
function imageLoaded(){
    console.log("image loaded")
    const context = canvas_canvas.getContext("2d")
    canvas_canvas.width = image.width
    canvas_canvas.height = image.height
    context.drawImage(image,0,0);
}

function drawRectangle(){
    if(!image.complete){return}
    context.rect(0,0,100,100)
    context.strokeStyle = "red";
    context.stroke()
}