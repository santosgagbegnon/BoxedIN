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

//Regular Variables

const image = new Image()
image.src = "assets/default.jpg"
image.onload = imageLoaded

const context = canvas_canvas.getContext('2d');

function imageLoaded(){
    console.log("image loaded")
    const context = canvas_canvas.getContext("2d")
    canvas_canvas.width = image.width
    canvas_canvas.height = image.height
    context.drawImage(image,0,0);
}