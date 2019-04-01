
/**
 * Class that represents a drawable canvas.
 */
class Canvas{
    
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

        //Base layer that only contains the image
        this.imageLayer = new Konva.Layer()

        //Scales the image to fit the canvas size
        const scale = this.scaleSize(this.stage, image)
        this.image.scale({
            x: scale,
            y: scale
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
        this.rectangeLayer = new Konva.Layer()

        //adds the rectangle layer to the stage
        this.stage.add(this.rectangeLayer)
    }

    /**
     * Creates a new rectangle. This method is meant to be called when the canvas is clicked on.
     */
    createRectangle(){    
        //Creates new rectangle position at the location that was pressed on in the canvas
        this.currentRectangle = new Konva.Rect({
            x: this.stage.getPointerPosition().x,
            y: this.stage.getPointerPosition().y,
            width: 0,
            height: 0,
            stroke: 'red',
            strokeWidth: 2
          });
        
        //adds the rectangle to the layer
        this.rectangeLayer.add(this.currentRectangle)
        this.rectangeLayer.draw()
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
        this.rectangeLayer.draw()
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
        //Setss the name of the rectangle to the unique id created
        this.currentRectangle.name(rectangleName)
        //increases the number of rectangles present in the rectangleLayer
        this.numberOfRectangles ++
        //resets the current rectangle to null
        this.currentRectangle = null
        return rectangleName
    }
    /**
     * Calculates the value to scale the image by to have it fill the stage while not being stretched
     * @param {*} stage the stage containing the image
     * @param {*} imageObject image to be scaled
     */
    scaleSize(stage, imageObject){
        //calculates the stage:imageObject ratios
        const widthRatio = stage.width() / imageObject.width
        const heightRatio = stage.height() / imageObject.height
        return Math.max(widthRatio, heightRatio)
    }
}

export default Canvas