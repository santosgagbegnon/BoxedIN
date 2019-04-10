
///Module imports

import Canvas from "./canvas.js";
import Label from "./canvas.js";

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
const previous_button = document.getElementById("previous-button")
const next_button = document.getElementById("next-button")
const toolToggle_checkbox = document.getElementById("tool-toggle")
const imagesInput = document.getElementById('file');
let files = imagesInput.files

let currentCanvas = null
let tool = 0 //Represents which tool is active, 0: Draw, 1: Move/Resizing
let imageNumber = 0
let canvases = []
next_button.addEventListener("mousedown", function(e){
    console.log("Move to next image")
    imageNumber ++
    console.log(files.length)
    if(imageNumber >= files.length){
        console.log("End of images, please export.")
        imageNumber --
        return
    }
    detachCanvas()
    handle(files[imageNumber])
})

imagesInput.onchange = function(e) {
    files = Array.from(this.files).filter( function(s){ 
        return s.type.includes("image") ;
    });
    console.log(files, "Found files")
    handle(files[0])
}


function detachCanvas(){
    currentCanvas.stage.removeChildren()
}

window.addEventListener("resize",function(e){
    currentCanvas.updateStage(window.innerWidth,window.innerHeight - 50)
})

document.addEventListener("keypress", function(e){
    const unicode = e.which 
    switch (unicode) {
        //Pressed D/d
        case 68,100:
            if(toolToggle_checkbox.checked){
                toolToggle_checkbox.checked = false
                tool = 0
                currentCanvas.editable(false)
            }
            break
        //Pressed R/r
        case 82,114:
            if(!toolToggle_checkbox.checked){
                toolToggle_checkbox.checked = true
                console.log("r")
                tool = 1
                currentCanvas.editable(true)
            }
            break
        default:
            break
    }
})

toolToggle_checkbox.addEventListener("change", function(e){
    console.log("changed")
    if(e.target.checked){
        tool = 1
        currentCanvas.editable(true)
    }
    else{
        tool = 0
        currentCanvas.editable(false)
    }
})


//Adding event listeners
container_div.addEventListener("mousedown", function(e){
    e.preventDefault()
    if(currentCanvas == null){return}
    switch(tool){
        case 0:
            currentCanvas.editable(false)
            currentCanvas.createRectangle()
            break

        case 1:
            currentCanvas.editable(true)
            break

        default:
            break
    }
})

container_div.addEventListener("mousemove", function(e){
    if(currentCanvas == null){return}
    switch(tool){
        case 0:
            currentCanvas.updateRectangle(e)
            break;

        case 1:
            break
        
        default:
            break
    }
})

$("#container").on('mouseup mouseleave', function(e){
    switch(tool){
        case 0:
            const label = currentCanvas.finishCurrentRectangle()
            //Creates a new UI label if a rectangle was added to the canvas
            if(label != null){
                //Creates a list item 
                const label_listItem = document.createElement("LI")

                //Creates an input element (used for the list item's text)
                const labelName_input = document.createElement("input")

                const trash_button = document.createElement("input")
                trash_button.className = "trash-button"
                trash_button.type = "image"
                trash_button.src = "https://findicons.com/files/icons/1580/devine_icons_part_2/128/trash_recyclebin_empty_closed.png"
                trash_button.addEventListener("click",function(e){
                    const labelID = e.target.parentNode.querySelector(".label-input").id
                    currentCanvas.destroyRectangle(labelID)
                    e.target.parentNode.remove()
                })

                //Setting attributes of the input and combining the DOM elements
                labelName_input.className = "label-input"
                labelName_input.value = "Unnamed"
                labelName_input.id = label.id //Label's ID matches the corresponding rectangle's name
                label_listItem.appendChild(labelName_input);
                label_listItem.appendChild(trash_button)
                label_listItem.className = "label"
                label_listItem.style.backgroundColor = label.colour
                labels_list.appendChild(label_listItem)

                //Event listener to update the colour and name of the label when the user changes the name
                labelName_input.addEventListener("change", function(e){
                    const label = e.target
                    const list_item = e.target.parentNode
                    currentCanvas.findLabel(label.id).config({
                        name: label.value
                    })
                    list_item.style.backgroundColor = currentCanvas.getLabelColour(label.id)
                })
               
            }
            break;

        case 1:
            break
    
        default:
            break
    }
})

/**
 * 
 */

function handle(file) {
    console.log(file)
    const reader = new FileReader()
    reader.onload = function() {
        console.log("Loaded file")
        const image = new Image()
        image.src = reader.result
        image.onload = function(){
            const newCanvas = new Canvas(window.innerWidth,window.innerHeight - 50,image)
            newCanvas.stage.on('click tap', function (e) {
                newCanvas.clickTap(e)
            })
            currentCanvas = newCanvas
            canvases.push(newCanvas)

        }
        
    }
    reader.readAsDataURL(file)
}



function handleImage(image){
    canvas = new Canvas(container_div.offsetWidth,container_div.offsetHeight,imageObject)
    canvas.stage.on('click tap', function (e) {
        canvas.clickTap(e)
    })
}