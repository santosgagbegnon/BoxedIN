
///Module imports

import Canvas from "./canvas.js";
import Label from "./canvas.js";

/*
Variables from the DOM.

Variables from the DOM are given the name NAME_item-type for clear distinction between variables representing items from the DOM and regular variables.
*/
//To run locally: python3 -m http.server 8001
const rightside = document.getElementById("rightSideWrapper")
const contentBox = document.querySelector(".ContentBox")
let container_div = document.getElementById("container")
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

let currentCanvas = null //Represents the canvas that is currently visible to the user 
let tool = 0 //Represents which tool is active, 0: Draw, 1: Move/Resizing
let imageNumber = 0 //Represents which image out of the images uploaded is currently being displayed
let canvases = [] //Contains all of the canvases created (one for each image)
let container_divs = [] //Contains all of the container divs that contain the canvases
var isFirstCanvas = true //true only while there has been no canvas added to the app yet.


undo_button.addEventListener("click", function(e){
    currentCanvas.rotate()
})
/**
 * Event listener for the next button. 
 * Removes the current canvas being displayed (if any), removes labels (if any) and uses the already created
 * canvas if it exists, otherwise it will create a new canvas.
 */
next_button.addEventListener("click", function(e){
    imageNumber ++
    //Checks if there are anymore photos to display
    if(imageNumber >= files.length){
        alert("This is the last image!")
        imageNumber --
        return
    }
    //detaches canvas
    detachCanvas()
    //removes labels on the right sidebar
    removeLabels()
    //If the put back canvas method fails, it will create a new canvas
    if(!putBackCanvasAt(imageNumber)){
        handleImage()
    }
})

/**
 * Event listener for the previous button.
 * Removes the current canvas being displayed (if any), removes labels (if any), and uses the already created
 * canvas if it exists, otherwise it will create a new canvas.
 */
previous_button.addEventListener("click", function(e){
    imageNumber --
    //Checks if the user is @ the first photo
    //todo: possibly make it loop back to the last image?
    if(imageNumber < 0){
        alert("This is the first image!")
        imageNumber = 0
        return
    }
    //detaches the current canvas
    detachCanvas()
    //removes labels associated to the current canvas
    removeLabels()
    //If the put back canvas method fails, it will create a new canvas
    if(!putBackCanvasAt(imageNumber)){
        handleImage()
    }
})

/**
 * Method called when the user clicks on the upload button and uploads a file.
 * @param {*} e the change event 
 */
imagesInput.onchange = function(e) {
    //Filters out the files to only contain those with the type 'image'
    files = Array.from(this.files).filter( function(s){ 
        return s.type.includes("image") ;
    });
    //Begins by handling the first image, if there are any.
    if(files.length > 0){
        handleImage()
    }
    else{
        alert("Hmm, there were no images found in the folder!")
    }
}
/**
 * Event listener that listens for the window being resized.
 * When this occurs, the canvas stage's size is updated
 */
window.addEventListener("resize",function(e){
    currentCanvas.updateStage(rightside.offsetWidth,window.innerHeight - 50)
    // container_div.style.width = rightside.offsetWidth
})

/**
 * Event listener for key presses. 
 * Handles keyboard shortcuts 
 */

document.addEventListener("keypress", function(e){
    //Checks if the keypress occured on an input. If it was, the keypress is ignored.
    if(e.target.className == "label-input"){
        return
    }
    const unicode = e.which //gets the unicode of the button pressed
    
    switch (unicode) {
        //Pressed D/d
        case 68,100:
            //if the drawing tool is not already selected, it's selected and the canvas
            //is made uneditable.
            if(toolToggle_checkbox.checked){
                document.getElementById("toggleLabel").innerText = "Drawing"
                toolToggle_checkbox.checked = false
                tool = 0
                currentCanvas.editable(false)
            }
            break
        //Pressed R/r
        case 82,114:
            //if the the resizing/moving tool is not already selected, it's selected and the canvas
            //is made editable/
            if(!toolToggle_checkbox.checked){
                document.getElementById("toggleLabel").innerText = "Editing"
                toolToggle_checkbox.checked = true
                tool = 1
                currentCanvas.editable(true)
            }
            break
        default:
            break
    }
})

/**
 * Event listener that lines for a change in the selected tool (drawing vs. resizing/moving)
 */
toolToggle_checkbox.addEventListener("change", function(e){
    if(e.target.checked){
        document.getElementById("toggleLabel").innerText = "Editing"
        tool = 1
        currentCanvas.editable(true)
    }
    else{
        document.getElementById("toggleLabel").innerText = "Drawing"
        tool = 0
        currentCanvas.editable(false)
    }
})

export_button.addEventListener("click", function(){
    const loader_div = document.createElement("div")
    loader_div.className = "loader"
    document.body.appendChild(loader_div)
    if(canvases.length < files.length){
        alert("You're exporting early. " + canvases.length + "/" + files.length + " of the images will be placed in the SFrame.")
    }
    let results = []
    for(var index = 0; index < canvases.length; index++){
        const data = canvases[index].exportData()
        results.push(data)
    }
    const data = {
        results :results
    }
    const request = new XMLHttpRequest()
    request.open("POST","/export")
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.send(JSON.stringify(data))
    request.responseType =  "arraybuffer"
    request.onload = function() {
        const zipFile = new Blob([request.response], {'type': 'application/zip'})
        const downloadButton = document.createElement("a")
        const url = URL.createObjectURL(zipFile)
        downloadButton.download = "dataset.zip"
        downloadButton.href = url
        downloadButton.style.display = "none"
        document.body.appendChild(downloadButton)
        downloadButton.click()
        document.body.removeChild(downloadButton)       
        document.body.removeChild(document.body.getElementsByClassName("loader")[0])
    }

})


//EVENT LISTENERS FOR CANVAS DIV

/**
 * Method called when there is a mouse down event on the canvas' div
 * @param {*} e mouse down event
 */
function canvasDivMouseDown(e){
    //prevents the default event of a mosue down
    e.preventDefault()
    //if there is no canvas on the div, return
    if(currentCanvas == null){return}
    //Checks which tool is currently selected
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
}

/**
 * Method called when there is a mosue move event on the canvas' div
 * @param {*} e mouse move event
 */
function canvasDivMouseMove(e){
    //if there is no canvas on the div, return
    if(currentCanvas == null){return}
    //Checks which tool is currently selected
    switch(tool){
        case 0:
            currentCanvas.updateRectangle(e)
            break;

        case 1:
            break
        
        default:
            break
    } 
}

/**
 * Method called when there is a mouse up event on the canvas' div
 * @param {*} e mouse up evnet
 */
function canvasDivMouseUp(e){
    //if there is no canvas on the div, return
    if(currentCanvas == null){return}
    //Checks which tool is currently selected
    switch(tool){
        case 0:
            const label = currentCanvas.finishCurrentRectangle()
            //Creates a new UI label if a rectangle was added to the canvas
            if(label != null){
                createLabelElement(label)
            }
            break;

        case 1:
            break
    
        default:
            break
    }

}

/**
 * Removes all of the labels from the right sidebar 
 */
function removeLabels(){
    while (labels_list.firstChild) {
        labels_list.removeChild(labels_list.firstChild);
    }
}
/**
 * Removes the current canvas from the content box by removing the whole div that contains the canvas
 */
function detachCanvas(){
    //Removes everything from the content box
    contentBox.removeChild(contentBox.querySelector("#container"))
}

/**
 * Places the labels associated to the canvas at the index provided 
 * @param {*} index index of the canvas to get the label data from
 */
function putBackLabelsFrom(index){
    //Checks if the given index is out of range
    if(index < 0 || index >= container_divs.length){return}
    //Removes any labels that may be visible.
    removeLabels()

    const labels = canvases[index].labels
    for(var index = 0; index < labels.length; index++){
        const label = labels[index]
        createLabelElement(label)

    }
}
/**
 * Checks if there is an existing canvas at the given index. If there is, that canvas is placed back
 * on display to the user. 
 * @param {number} index 
 * @returns true if a canvas was found and succesfully placed, otherwise false.
 */
function putBackCanvasAt(index){
    //Checks if the given index is out of range
    if(index < 0 || index >= container_divs.length){
        return false
    }

    //Gets the div that contains the index 
    const container_div = container_divs[index]

    //reattaches the event listeners to the div
    container_div.addEventListener("mousedown", function(e){
        canvasDivMouseDown(e)
    })
    container_div.addEventListener("mousemove", function(e){
        canvasDivMouseMove(e)
    })
    container_div.addEventListener("mouseup", function(e){
        canvasDivMouseUp(e)
    })
    container_div.addEventListener("mouseleave", function(e){
        canvasDivMouseUp(e)
    })
    //adds the div to the content box to be visible to the user
    contentBox.appendChild(container_div)

    const name = files[imageNumber].name
    imageTitle_h3.innerText = name + " (" + (imageNumber+1) + "/" + files.length + ")"

    //updates the current canvas to the one at the given index
    currentCanvas = canvases[index]
    
    //Updates the size according to the window size
    currentCanvas.updateStage(rightside.offsetWidth,window.innerHeight - 50)

    putBackLabelsFrom(index)
    return true
}
//temp
var width = 0
var height = 0
/**
 * Creates a canvas for the file located at the currnet imageNumber value
 */
function handleImage() {
    if(imageNumber < 0 || imageNumber >= files.length) {
        return
    }
    const file = files[imageNumber]
    const reader = new FileReader()
    loadImage(file,function(image){
        width = image.width
        height = image.height
        //if this is the first canvas ever to be created, this means the container div contains the upload button.
        //Because of this, that container div must be removed before continuing on with the handling of the file.
        if(isFirstCanvas){
           container_div.parentNode.removeChild(container_div)
           isFirstCanvas = false
        }
        //Creates the div that will contain the new canvas
        container_div = document.createElement("div")
        container_div.id = "container"
        //Sets up the event listeners for the div
        container_div.addEventListener("mousedown", function(e){
            canvasDivMouseDown(e)
        })
        container_div.addEventListener("mousemove", function(e){
            canvasDivMouseMove(e)
        })
        container_div.addEventListener("mouseup", function(e){
            canvasDivMouseUp(e)
        })
        container_div.addEventListener("mouseleave", function(e){
            //mouseup and mouseleave provoke the same action.
            canvasDivMouseUp(e)
        })
        //adds the div to the content box inorder to make it visible to the user
        contentBox.appendChild(container_div)

        //creates a new canvas
        const newCanvas = new Canvas(rightside.offsetWidth,window.innerHeight - 50,image)

        //method called when the user taps on the canvas
        newCanvas.stage.on('click tap', function (e) {
            newCanvas.handleTransformers(e)
        })
        const name = files[imageNumber].name
        imageTitle_h3.innerText = name + " (" + (imageNumber+1) + "/" + files.length + ")"
        //Sets the current canvas to the newly created one
        currentCanvas = newCanvas
        //adds the newly created div to the list of divs that contain canvases
        container_divs.push(container_div)
        //adds the newly created div to the list of canvases
        canvases.push(newCanvas)
    }, {
        orientation:true
    })   
}
/**
 * Creates a label given a label object
 * @param {Label} label 
 */
function createLabelElement(label){
    //Creates a list item 
    const label_listItem = document.createElement("LI")

    //Creates an input element (used for the list item's text)
    const labelName_input = document.createElement("input")

    const trash_button = document.createElement("input")
    trash_button.className = "trash-button"
    trash_button.type = "image"
    trash_button.src = "../static/assets/trash.png"
    trash_button.addEventListener("click",function(e){
        const labelID = e.target.parentNode.querySelector(".label-input").id
        currentCanvas.destroyRectangle(labelID)
        e.target.parentNode.remove()
    })

    //Setting attributes of the input and combining the DOM elements
    labelName_input.className = "label-input"
    labelName_input.value = label.name|| "Unnamed"
    labelName_input.id = label.id || "Unnamed"//Label's ID matches the corresponding rectangle's name
    label_listItem.appendChild(labelName_input);
    label_listItem.appendChild(trash_button)
    label_listItem.className = "label"
    label_listItem.style.backgroundColor = label.colour || "#000000"
    labels_list.appendChild(label_listItem)
    //Event listener to update the colour and name of the label when the user changes the name
    labelName_input.addEventListener("change", function(e){
        const label = e.target
        const list_item = e.target.parentNode
        currentCanvas.findLabel(label.id).config({
            name: label.value
        })
        let colour = null
        for(var index = 0; index < canvases.length; index++){
            const currentColour = canvases[index].getLabelColour(label)
            if(currentColour){
                colour = currentColour
                break
            }
        }
        if(colour == null) { colourCount += 1}
        let defaultColour = null
        if(colourCount >= colours.length-1){
            defaultColour = '#'+Math.random().toString(16).substr(-6);
        }
        else if(colour == null){
            defaultColour = colours[colourCount]
        }
        colour = colour || defaultColour
        
        currentCanvas.updateLabelColour(label.id, colour)
        list_item.style.backgroundColor = colour
    })
    labelName_input.addEventListener("keydown", function(e){
        if(e.which == 13){
            this.blur()
        }
    })

}

const colours = ["#3BE2DA","#FFCC00","#B81365","#3610DC","#ff553f", "#7ceb40","#663ce6","#024E80","#009933","#A8350C","#FD427C"]
const defaultColour = "#8de874"
let colourCount = -1