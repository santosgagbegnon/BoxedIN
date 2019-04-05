
const colours = ["#ff553f","#663ce6", "#7ceb40"]

/**
 * Class that represents a drawable canvas.
 * TODO:
 */
export default class Canvas{

    /**
     * Constructor for canvas 
     * @param {number} width width of the canvas.
     * @param {number} height height of the canvas.
     * @param {Image} image the base image that will be drawn on.
     */
    constructor(width,height,image){
        //Creating the stage for the canvas (object that will contain all of the layers)
        this.stage = new Konva.Stage({
            container: "container",
            width: width,
            height: height,
        })

        //Creates the baseline image of the canvas
        this.image = new Konva.Image({
            image: image,
            x: this.stage.width()/2,
            y: 0,
            width: image.width,
            height: image.height,
        })
        //Sets the offset of the image to be the center.
        this.image.offsetX(this.image.width()/2)

        this.labels = []

        //Base layer that only contains the image
        this.imageLayer = new Konva.Layer()

        //Scales the image to fit the canvas size
        const scale = this.scaleSize(this.stage, image)

        this.image.scale({
            x: scale,
            y: scale,
        })

        //adds image to imageLayer
        this.imageLayer.add(this.image)

        //adds imageLayer to stage
        this.stage.add(this.imageLayer)

        //The current rectangle being added to the screen
        this.currentRectangle = null

        //The total count of rectangles current on the screen
        this.numberOfRectangles = 0

        //The layer that contains all of the drawn rectangles
        this.rectangleLayer = new Konva.Layer()

        //adds the rectangle layer to the stage
        this.stage.add(this.rectangleLayer)

        this.shouldResize = false
    }
    //TODO: Rename, move and comments
    clickTap(e){
        if(!this.shouldResize){return}

        // if click on empty area - remove all transformers
        if (e.target === this.stage || e.target.getClassName() == "Image"){
            this.stage.find("Transformer").destroy()
            this.rectangleLayer.draw()
            return
        }
        // do nothing if clicked NOT on our rectangles
        if (e.target.getClassName() != "Rect") {
            return
        }
        // remove old transformers
        this.stage.find("Transformer").destroy();
    
        // create new transformer
        var transformer = new Konva.Transformer({
            rotateEnabled: false
        });

        this.rectangleLayer.add(transformer);
        transformer.attachTo(e.target);
        this.rectangleLayer.draw();
        console.log("(", e.target.width(), ",", e.target.height(), ")")

    }
    /**
     * Creates a new rectangle. This method is meant to be called when the canvas is clicked on.
     */
    createRectangle(){    
        //Creates new rectangle position at the location that was pressed on in the canvas
        this.currentRectangle = new Konva.Rect({
            name: "Rectangle",
            x: this.stage.getPointerPosition().x,
            y: this.stage.getPointerPosition().y,
            width: 0,
            height: 0,
            stroke: '#3b1b1f',
            strokeWidth: 2
          });
        
        //adds the rectangle to the layer
        this.rectangleLayer.add(this.currentRectangle)
        this.rectangleLayer.draw()
    }
    /**
     * Changes the size of the current rectangle being created according to the user's mouse location. This method is meant to be called when the user has moved their mouse while pressing on the left mouse button
     * @param {*} event the event that triggered this method
     */
    updateRectangle(event){
        if(event.which != 1){return}
        //Gets the current position of the mouse inside the canvas
        const position = this.stage.getPointerPosition();

        //Calculates the width & height of the rectangle by subtracting the current position from the original position that was saved in the createRectangle method
        const width = position.x - this.currentRectangle.x()
        const height = position.y - this.currentRectangle.y()

        //changes the size of the rectangle
        this.currentRectangle.size({
            width: width,
            height: height
        });
        //redraws the rectangle
        this.rectangleLayer.draw()
    }

    /**
     * If there is a current rectangle being created that is a width & height not equal to zero, it will give the update the object to take notice of the new rectangle. If the rectangle is saved, it's ID will be returned. Otherwise, it will remove the 
     * the current rectangle from the canvas and return null. 
     */
    finishCurrentRectangle(){
        //Checks if the rectangle exists and has a size
        if(this.currentRectangle == null || this.currentRectangle.width() == 0 || this.currentRectangle.height == 0){
            this.currentRectangle.destroy()
            return null
        }
        //Creates a unique ID for the new rectangle
        const rectangleName = "rectangle"+this.numberOfRectangles
        //Sets the name of the rectangle to the unique id created
        this.currentRectangle.name(rectangleName)

        //increases the number of rectangles present in the rectangleLayer
        this.numberOfRectangles ++

        //Add listener for transform event (called when a rectangle is being resized)
        this.currentRectangle.on("transform", function(e){
            const rectangle = e.currentTarget
            const scaleX = rectangle.scaleX()
            const scaleY = rectangle.scaleY()

            rectangle.size({
                width: rectangle.width() * scaleX,
                height: rectangle.height() * scaleY
            })

            rectangle.position({
                x: rectangle.x() + (scaleX - 1),
                y: rectangle.y() + (scaleY - 1)
            })

            rectangle.scale({
                x: 1,
                y: 1
            })
        })

        const rectangleLabel = new Label(rectangleName,null,null)
        this.labels.push(rectangleLabel)
     
        //resets the current rectangle to null
        this.currentRectangle = null
        return rectangleLabel
    }
    /**
     * Calculates the value to scale the image by to have it fill the stage while not being stretched
     * @param {Konva.Stage} stage the stage containing the image
     * @param {Image} imageObject image to be scaled
     */
    scaleSize(stage, imageObject){
        //calculates the stage:imageObject ratios
        const widthRatio = stage.width() / imageObject.width
        const heightRatio = stage.height() / imageObject.height
        return Math.max(widthRatio, heightRatio)
    }

    scaleSizeTwo(stage, imageObject){
        //calculates the stage:imageObject ratios
        const widthRatio = stage.width() / imageObject.width
        const heightRatio = stage.height() / imageObject.height
        return Math.max(widthRatio, heightRatio)
    }
    /**
     * Sets whether or not the user is able to drag and resize rectangles
     * @param {boolean} shouldEdit true if the canvas should be editable, otherwise false
     */
    editable(shouldEdit){
        const rectangles = this.rectangleLayer.getChildren(function(node){
            return node.getClassName() === 'Rect'
        })

        if(shouldEdit){
            this.shouldResize = true
            for(var index = 0; index < rectangles.length; index++){
                rectangles[index].draggable(true)
            }
        }
        else{
            this.shouldResize = false
            for(var index = 0; index < rectangles.length; index++){
                rectangles[index].draggable(false)
            }
        }
        this.rectangleLayer.draw();
        
    }

    ///Methods that involve the labels array

    /**
     * Returns the rectangle with the given name. Null is returned if no rectangle with that name existd
     * Note: The name of a rectangle should correspond to the ID of a label
     * @param {string} name name of the rectangle to be returned 
     */
    findRectangle(name){
        const rectangles = this.rectangleLayer.getChildren(function(node){
            return node.getClassName() === 'Rect'
        })
        for(var index = 0;index < rectangles.length; index++){
            const rectangle = rectangles[index]
            if(name == rectangle.name()){
                return rectangle
            }
        }
       return null
    }

    destroyRectangle(name){
        this.findRectangle(name).destroy()
        this.rectangleLayer.draw()
    }

    /**
     * Returns the label with the given ID or null if no label with that ID currently exists
     * @param {string} labelID the ID of the label to be returned
     */
    findLabel(labelID){
        //Searches through the current labels and see if any IDs match the one provided.
        for(var index = 0; index < this.labels.length; index++){
            if(labelID == this.labels[index].id){
                return this.labels[index]
            }
        }
        return null
    }
 
    /**
     * Returns the correct colour of label.
     * If the label specificed has a name that matches an already existing one, that colour is returned. Otherwise, a new colour is returned.
     * For example: If the label 'Car' with the colour 'red' attached to it exists and you pass in the ID of a label whose name is 'Car' red is returned.
     * On the other hand, if you pass in the ID of a label with the name 'Person' and no other 'Person' label exists, a new colour which be returned and every 'Person label
     * following would have that label returned to them.
     * @param {string} id ID of the Label
     */
    getLabelColour(id){
        const targetLabel = this.findLabel(id) 
        let newColour = null
        if(targetLabel == null){
           return
        }
        //Looks for an existing colour by looping through the current labels and comparing their name
        for(var index = 0; index < this.labels.length; index++ ){
            const currentLabel = this.labels[index]
            //checks to see if the name of the labels match, but the IDs don't. This ensure that the currentLabel is not the exact same as the targetLabel
            if(currentLabel.name == targetLabel.name && currentLabel.id != targetLabel.id){
                newColour = currentLabel.colour
                break
           }
        }
        if(newColour == null) { colourCount += 1}
       
        //sets the new colour of the target label
        targetLabel.config({
            colour: newColour || colours[colourCount%3] 
        })
        //updates the colour of the rectangle
        const rectangle = this.findRectangle(id)
        if(rectangle != null){
            rectangle.stroke(newColour || colours[colourCount%3])
            this.rectangleLayer.draw()
        }
       return newColour || colours[colourCount%3] 
    }

    //TODO: Add comments
    updateStage(width,height){
        this.stage.size({
            width: width,
            height: height
        })

        //Scales the image to fit the canvas size
        const scale = this.scaleSize(this.stage, this.image.image())
        console.log("SCALE", scale)
        this.image.scale({
            x: scale,
            y: scale,
        })

        this.stage.draw()
    }
}

//Temporary
var colourCount = -1

/**
 * Label that represents the name of a single rectangle.
 * The the ID portion of the label should be the name of the rectangle it represents
 */
export class Label {
    /**
     * Creates a label
     * @param {string} id name of the rectangle that the label represents
     * @param {string} colour the colour associated to the object encapsulated by the rectangle
     * @param {string} name the name of the object that the rectangle encapsulates
     */
    constructor(id,colour,name){
        this.id = id
        this.colour = colour || "#3b1b1f" 
        this.name = name || ""
    }
    /**
     * Update the Label information 
     * @param {*} config an object containing the new 'name' and/or colour of the label
     */
    config(config){
        this.colour = config.colour || this.colour
        this.name = config.name || this.name
    }
}