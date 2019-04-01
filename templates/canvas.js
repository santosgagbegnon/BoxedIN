
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

        //temp variables (too remove)
        this.rectangeLayer = new Konva.Layer()
        this.rectangle = new Konva.Rect({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            stroke: 'red',
            strokeWidth: 2
          });
    }

    /**
     * Creates a new rectangle. This method is meant to be called when the canvas is clicked on.
     * @param {Event} event the event that triggered this method
     */
    createRectangle(event){    
        //Starts new rectangle position at the location that was pressed on in the canvas
        this.rectangle.position({
            x: this.stage.getPointerPosition().x,
            y: this.stage.getPointerPosition().y,
        })
        //adds the rectangle to the layer
        this.stage.add(this.rectangeLayer)
        this.rectangeLayer.add(this.rectangle)
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
        const width = position.x - this.rectangle.x()
        const height = position.y - this.rectangle.y()

        //changes the size of the rectangle
        this.rectangle.size({
            width: width,
            height: height
        });
        //redraws the rectangle
        this.rectangeLayer.draw()
    }
    /**
     * Calculates the value to scale the image by to have it fill the stage while not being stretched
     * @param {*} stage the stage containing the image
     * @param {*} imageObject image to be scaled
     */
    scaleSize(stage, imageObject){
        const widthRatio = stage.width() / imageObject.width
        const heightRatio = stage.height() / imageObject.height
        console.log(Math.max(widthRatio, heightRatio))
        return Math.max(widthRatio, heightRatio)
    }
}

export default Canvas