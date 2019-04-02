
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

let tool = 0 //Represebts which tool is active, 0: Draw, 1: Move, 2: Resizing
//Temporary: Allows user to toggle between the 3 options 
export_button.addEventListener("click", function(){
    tool = (tool + 1) % 2
    if(tool == 1){
        canvas.editable(true)
    }
})

//Adding event listeners
container_div.addEventListener("mousedown", function(e){
    if(canvas == null){return}
    switch(tool){
        case 0:
            canvas.editable(false)
            canvas.createRectangle()
            break

        case 1:
            canvas.editable(true)
            break

        default:
            break
    }
})

container_div.addEventListener("mousemove", function(e){
    if(canvas == null){return}
    switch(tool){
        case 0:
            canvas.updateRectangle(e)
            break;

        case 1:
            break
        
        default:
            break
    }
})

container_div.addEventListener('mouseup', function(e){
    switch(tool){
        case 0:
            canvas.finishCurrentRectangle()
            break;

        case 1:
            break
    
        default:
            break
    }
})

const imageObject = new Image()
imageObject.src = "assets/default.jpg" 
imageObject.onload = imageLoaded


function imageLoaded(){
    canvas = new Canvas(container_div.offsetWidth,container_div.offsetHeight,imageObject)
    canvas.stage.on('click tap', function (e) {
        console.log("Click tap")
        canvas.clickTap(e)
    })
    
    
}