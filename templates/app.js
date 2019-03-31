/*
Variables from the DOM.

Variables from the DOM are given the name NAME_item-type for clear distinction between variables representing items from the DOM and regular variables.
*/
const container_div = document.getElementById("container")
const imageTitle_h3 = document.getElementById("image-title")
const undo_button = document.getElementById("undo-button")
const redo_button = document.getElementById("redo-button")
const labels_list = document.getElementById("labels-list")
const export_button = document.getElementById("export-button")
const next_butotn = document.getElementById("next-button")
const previous_button = document.getElementById("previous-button")

//Adding event listeners
container_div.addEventListener("mousedown", function(e){
    createRectangle(e)
})

container_div.addEventListener("mousemove", function(e){
    updateRectangle(e)
})
//Stage where image and shapes will be drawn
const stage = new Konva.Stage({
    container: "container",
    width: container_div.offsetWidth,
    height: container_div.offsetHeight,
})

//layer that only contains the image
const imageLayer = new Konva.Layer()

const imageObject = new Image()
imageObject.src = "assets/default.jpg" 
imageObject.onload = imageLoaded

function imageLoaded(){
    const image = new Konva.Image({
        image: imageObject,
        x: stage.width()/2,
        y: 0,
        width: imageObject.width,
        height: imageObject.height,
    })
    image.offsetX(image.width()/2)
   
    const scale = scaleSize(stage, imageObject)
    image.scale({
        x: scale,
        y: scale
    })
    console.log("first")
    imageLayer.add(image)
    stage.add(imageLayer)
}

function scaleSize(stage, imageObject){
    const widthRatio = stage.width() / imageObject.width
    const heightRatio = stage.height() / imageObject.height
    return Math.max(widthRatio, heightRatio)
}

const rectangeLayer = new Konva.Layer()

var rectangle = new Konva.Rect({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    stroke: 'red',
    strokeWidth: 2
  });

const shouldAdd = true

/// Event Listener Handlers
function createRectangle(event){
    if(!shouldAdd){return}
    console.log("second")

    console.log(event.clientX)
    rectangle.position({
        x: stage.getPointerPosition().x,
        y: stage.getPointerPosition().y,
    })
    stage.add(rectangeLayer)
    rectangeLayer.add(rectangle)
    rectangeLayer.draw()
}

function updateRectangle(event){
    if(event.which != 1){return}
    
     // now we find relative point
     var pos = stage.getPointerPosition();

    const width = (pos.x - rectangle.x()) 
    const height = ( pos.y - rectangle.y())

    rectangle.size({
        width: width,
        height: height
    });
    rectangeLayer.draw()
}
