
const colours = ["#ff553f","#663ce6", "#7ceb40"]
const defaultColour = "#8de874"

/**
 * Class that represents a drawable canvas.
 */
export default class Canvas{
    static rectID = 0
    /**
     * Constructor for canvas 
     * @param {number} width width of the canvas.
     * @param {number} height height of the canvas.
     * @param {Image} image the base image that will be drawn on.
     */
    constructor(width,height,image){
        self = this
        //Scales the image to fit the canvas size
        const scale = this.scaleSize(width,height,image)

        //Creating the stage for the canvas (object that will contain all of the layers)
        this.stage = new Konva.Stage({
            id: "stage",
            container: "container",
            width: image.width * scale,
            height: image.height * scale,
        })

        //Creates the baseline image of the canvas
        this.image = new Konva.Image({
            image: image,
            x: this.stage.width()/2,
            y: this.stage.height()/2,
            width: image.width,
            height: image.height,
        })
        //Sets the offset of the image to be the center.
        this.image.offsetX(this.image.width()/2)

        this.image.offsetY(this.image.height()/2)        

        this.labels = []

        //Base layer that only contains the image
        this.imageLayer = new Konva.Layer()

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

    /**
     * Method that should be called when the user performs a click tap event on th canvas'stage. 
     * It will remove all transformers from the stage and if a rectangle was selected, a new transformer
     * will be added to that
     * @param {*} e Click tap event
     */
    handleTransformers(e){
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
            stroke: "#000000",
            strokeWidth: 2,
            dragBoundFunc: function(pos) {
                const maxX = this.getParent().getParent().width() - this.width()
                const maxY = this.getParent().getParent().height() - this.height()
                const newX = pos.x 
                const newY = pos.y
                if(newX < 0){
                    newX = 0
                }
                if(newX > maxX){
                    newX = maxX
                }
                if(newY < 0){
                    newY = 0
                }
                if(newY > maxY){
                    newY = maxY
                }
                return {
                  x: newX,
                  y: newY
                };
              }
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
        //Checks if a rectangle was created
        if(this.currentRectangle == null){ return null }

        //Checks if the rectangle has a size and width, if not it's destoryed.
        if(this.currentRectangle.width() == 0 || this.currentRectangle.height == 0){
            this.currentRectangle.destroy()
            return null
        }

        //Creates a unique ID for the new rectangle
        const rectangleName = "rectangle"+Canvas.rectID
        Canvas.rectID += 1
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
    scaleSize(width, height, imageObject){
        //calculates the stage:imageObject ratios
        const widthRatio = width / imageObject.width
        const heightRatio = height / imageObject.height
        return Math.min(widthRatio, heightRatio)
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
            this.stage.find("Transformer").destroy()
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
        this.removeLabel(this.findLabel(name))
        this.findLabel(name)
        this.stage.find("Transformer").destroy()
        this.rectangleLayer.draw()
    }

    removeLabel(label){
        var index = this.labels.indexOf(label);
        if (index <= -1) {return}
        this.labels.splice(index, 1);
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
     * Returns the colour assoicated to the name of the label provided.
     * For example: If the label 'Car' with the colour 'red' attached to it exists and you pass in the ID of a label whose name is 'Car' red is returned.
     * @param {string} id ID of the Label
     */
    getLabelColour(targetLabel){
       // const targetLabel = this.findLabel(id) 
        let newColour = null
        if(targetLabel == null){
           return
        }
        //Looks for an existing colour by looping through the current labels and comparing their name
        for(var index = 0; index < this.labels.length; index++ ){
            const currentLabel = this.labels[index]
            //checks to see if the name of the labels match
            if(currentLabel.name.trim().toLowerCase() == targetLabel.value.trim().toLowerCase() && currentLabel.id != targetLabel.id){
                newColour = currentLabel.colour
                break
           }
        }
        return newColour
    }

    /**
     * Updates a label colour
     * @param {string} id the id of the label to update
     * @param {string} colour the new colour to update the label with
     */
    updateLabelColour(id, colour){
        const label = this.findLabel(id)
        if(!label || !colour){return}
        label.config({
            colour: colour
        })
        const rectangle = this.findRectangle(id)
        if(rectangle != null){
            rectangle.stroke(colour)
            this.rectangleLayer.draw()
        }
    }

    //TODO: Add comments
    /**
     * Updates the stage's width/height and scales the image given an updated with and height. 
     * This width and height should come from the div that contains the stage.
     * @param {number} width 
     * @param {number} height 
     */
    updateStage(width,height){
        //Scales the image to fit the canvas size
        const scale = this.scaleSize(width, height, this.image.image())
        //Gets the list of rectangles drawn by the user
        const rectangles = this.rectangleLayer.getChildren(function(node){
            return node.getClassName() === 'Rect'
        })

        //Saves the stage's width and height before the new scale is applied
        const oldStageWidth = this.stage.width()
        const oldStageHeight = this.stage.height()

        //Resizes the stage according to the calculated scale
        this.stage.size({
            width: this.image.width()*scale,
            height: this.image.height()*scale
        })
      
        //Scales image to the new scale
        this.image.scale({
            x: scale,
            y: scale,
        })

        //Calculates the stage scale to be used by the rectangles by dividing the stage's new size by the old size
        const stageScaleX = this.stage.width() / oldStageWidth 
        const stageScaleY = this.stage.height() / oldStageHeight

        //Loops through each rectangle and resizes and respositions them
        for(var index = 0; index < rectangles.length; index++){
            const rectangle = rectangles[index]
            rectangle.x(rectangle.x() * stageScaleX)
            rectangle.y(rectangle.y() * stageScaleY)
            rectangle.size({
                width: rectangle.width()*stageScaleX,
                height: rectangle.height()*stageScaleY
            })
        }
        //Respoitions the image to be in the middle
        this.image.x(this.image.width()*scale/2)
        this.image.y(this.image.height()*scale/2)
        
        //Makes sure the new changes are visible by redrawing the stage
        this.stage.draw()
    }

    exportData(){
        //Scales the image to fit the canvas size
        const scale = this.scaleSize(this.image.image().width, this.image.image().height, this.image.image())
        //Gets the list of rectangles drawn by the user
        const rectangles = this.rectangleLayer.getChildren(function(node){
            return node.getClassName() === 'Rect'
        })

        //Saves the stage's width and height before the new scale is applied
        const oldStageWidth = this.stage.width()
        const oldStageHeight = this.stage.height()
        //needed
        const stageSize = {
            width: this.image.width()*scale,
            height: this.image.height()*scale
        }

        //Calculates the stage scale to be used by the rectangles by dividing the stage's new size by the old size
        const stageScaleX = stageSize.width / oldStageWidth 
        const stageScaleY = stageSize.height / oldStageHeight

        //CSV stuff
        let annotations = []
        for(var index = 0; index < rectangles.length; index++){
            const rectangle = rectangles[index]
            const label = this.findLabel(rectangle.name())
            if(!label){
                continue
            }
            const labelName = label.name 
            if(!labelName || labelName == ""){
                continue
            }

            const width = rectangle.width()*stageScaleX
            const height = rectangle.height()*stageScaleY

            const minX = rectangle.x() * stageScaleX
            const minY = rectangle.y() * stageScaleY

            const maxX = minX + width 
            const maxY = minY + height

            const midX = (minX + maxX)/2
            const midY = (minY + maxY)/2

            const annotation = {
                label: labelName,
                type: "rectangle",
                coordinates: {
                    height: height,
                    width: width,
                    x: midX,
                    y: midY
                }
            }
            annotations.push(annotation)
        }
        const row = {
            base64: this.image.image().toDataURL().split(",")[1],
            image : "Height: " + stageSize.height + " Width: " +stageSize.width,
            name: "image00"+count,
            label: "boxedIN",
            annotation: annotations
        }
        count = count +1
        return row 
    }
}

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
        this.colour = colour || "#000000"
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

 //temporary
 let count = 0 

