
///Module imports

import Canvas from "./canvas.js";
import Label from "./canvas.js";

/*
Variables from the DOM.

Variables from the DOM are given the name NAME_item-type for clear distinction between variables representing items from the DOM and regular variables.
*/
//To run locally: python3 -m http.server 8001
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


/**
 * Event listener for the next button. 
 * Removes the current canvas being displayed (if any), removes labels (if any) and uses the already created
 * canvas if it exists, otherwise it will create a new canvas.
 */
next_button.addEventListener("click", function(e){
    imageNumber ++
    //Checks if there are anymore photos to display
    if(imageNumber >= files.length){
        console.log("@ the end of the photos")
        imageNumber --
        return
    }
    //detaches canvas
    detachCanvas()
    //removes labels on the right sidebar
    removeLabels()
    //If the put back canvas method fails, it will create a new canvas
    if(!putBackCanvasAt(imageNumber)){
        handle(files[imageNumber])
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
        console.log("@ the first image")
        imageNumber = 0
        return
    }
    //detaches the current canvas
    detachCanvas()
    //removes labels associated to the current canvas
    removeLabels()
    //If the put back canvas method fails, it will create a new canvas
    if(!putBackCanvasAt(imageNumber)){
        handle(files[imageNumber])
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
        handle(files[0])
    }
    else{
        console.log("no images found :(")
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
 * Event listener that listens for the window being resized.
 * When this occurs, the canvas stage's size is updated
 */
window.addEventListener("resize",function(e){
    currentCanvas.updateStage(window.innerWidth,window.innerHeight - 50)
})

/**
 * Event listener for key presses. 
 * Handles keyboard shortcuts 
 */

document.addEventListener("keypress", function(e){
    const unicode = e.which //gets the unicode of the button pressed
    switch (unicode) {
        //Pressed D/d
        case 68,100:
            //if the drawing tool is not already selected, it's selected and the canvas
            //is made uneditable.
            if(toolToggle_checkbox.checked){
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
        tool = 1
        currentCanvas.editable(true)
    }
    else{
        tool = 0
        currentCanvas.editable(false)
    }
})

//Adding event listeners

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
        divMouseMove(e)
    })
    container_div.addEventListener("mouseup", function(e){
        divMouseUp(e)
    })
    container_div.addEventListener("mouseleave", function(e){
        divMouseUp(e)
    })
    //adds the div to the content box to be visible to the user
    contentBox.appendChild(container_div)

    //updates the current canvas to the one at the given index
    currentCanvas = canvases[index]

    return true
}
var firstTime = true

/**
 * Takes in an image file and creates and displays a canvas for it. 
 * @param {File} file 
 */
function handle(file) {
    const reader = new FileReader()
    //method called once the data from the file is read
    reader.onload = function() {
        const image = new Image()
        image.src = reader.result
        //Called once the image is loaded from the file data
        image.onload = function(){
            if(firstTime){
                container_div.parentNode.removeChild(container_div)
                firstTime = false
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
            const newCanvas = new Canvas(window.innerWidth,window.innerHeight - 50,image)

            //method called when the user taps on the canvas
            newCanvas.stage.on('click tap', function (e) {
                console.log("click tap")
                newCanvas.clickTap(e)
            })
            //Sets the current canvas to the newly created one
            currentCanvas = newCanvas
            //adds the newly created div to the list of divs that contain canvases
            container_divs.push(container_div)
            //adds the newly created div to the list of canvases
            canvases.push(newCanvas)
        }
        
    }
    //Reads the data from the file (this is what will trigger the read.onload method)
    reader.readAsDataURL(file)
}