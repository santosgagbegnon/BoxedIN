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
var timestamp = new Date().getTime();

const imageObject = new Image()
imageObject.src = "assets/default.jpg" 
// imageObject.setAttribute('crossOrigin', 'anonymous');

imageObject.onload = imageLoaded

function imageLoaded(){
    console.log("image loaded")
    console.log(imageObject.width)
    const image = new Konva.Image({
        image: imageObject,
        x: stage.width()/2,
        y: 0,
        width: imageObject.width,
        height: imageObject.height,
    })
    // const image = new Konva.Image(scaleSize(stage,imageObject))
    image.offsetX(image.width()/2)
    // stage.size({
    //     width: image.width(),
    //     height: image.height()
    // })
    console.log("image width:",image.width())
    const scale = scaleSize(stage, imageObject)
    image.scale({
        x: scale,
        y: scale
    })

    imageLayer.add(image)
    stage.add(imageLayer)
}

function scaleSize(stage, imageObject){
    const widthRatio = stage.width() / imageObject.width
    const heightRatio = stage.height() / imageObject.height
    // const config = {
    //     image: imageObject,
    //     x: 0,
    //     y: 0,
    //     width: imageObject.width,
    //     height: imageObject.height,
    // }

    // if(widthRatio > heightRatio){
    //     config.y = stage.width()/2
    //     config.width = config.width * widthRatio
    //     config.height = config.height * widthRatio
    // }
    // else if(widthRatio < heightRatio){
    //     config.x = stage.width()/2
    //     config.width = config.width * heightRatio
    //     config.height = config.height * heightRatio
    // }

    return Math.max(widthRatio, heightRatio)
}