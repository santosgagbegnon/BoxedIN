
///Module imports

import Canvas from "./canvas.js";

/*
Variables from the DOM.

Variables from the DOM are given the name NAME_item-type for clear distinction between variables representing items from the DOM and regular variables.
*/
//To run locally: python3 -m http.server 8001

const container_div = document.getElementById("container")
const imageTitle_h3 = document.getElementById("image-title")
const undo_button = document.getElementById("undo-button")
const redo_button = document.getElementById("redo-button")
const labels_list = document.getElementById("labels-list")
const export_button = document.getElementById("export-button")
const next_butotn = document.getElementById("next-button")
const previous_button = document.getElementById("previous-button")
let canvas = null


//Adding event listeners
container_div.addEventListener("mousedown", function(e){
    if(canvas == null){return}
    canvas.createRectangle()
})

container_div.addEventListener("mousemove", function(e){
    if(canvas == null){return}
    canvas.updateRectangle(e)
})

container_div.addEventListener('mouseup', function(e){
   console.log(canvas.finishCurrentRectangle())
})

const imageObject = new Image()
imageObject.src = "assets/default.jpg" 
imageObject.onload = imageLoaded


function imageLoaded(){
    canvas = new Canvas(container_div.offsetWidth,container_div.offsetHeight,imageObject)
}