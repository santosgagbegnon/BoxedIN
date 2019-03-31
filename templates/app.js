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

//Stage where image and shapes will be drawn
console.log(container_div.offsetHeight)

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
    console.log("image loaded")
    console.log(stage.getAttr("height")/2)
    const image = new Konva.Image({
        image: imageObject,
        x: stage.width()/2,
        y: 0,
        width: imageObject.width,
        height: imageObject.height,
    })
    image.offsetX(imageObject.width/2)
    const scale = scaleSize(stage, imageObject)
    console.log(scale)
    image.scale({
        x: scale,
        y: scale
    })
    imageLayer.add(image)
    stage.add(imageLayer)
}

function scaleSize(stage, imageObject){
    let widthRatio = stage.getAttr("width") / imageObject.width
    let heightRatio = stage.getAttr("height") / imageObject.height
    console.log(widthRatio)
    return Math.min(widthRatio,heightRatio)
}