function hi(){
    console.log("we are using a new file")
}

class Canvas{
    
    constructor(width,height,image){
        this.stage = new Konva.Stage({
            container: "container",
            width: width,
            height: height,
        })

        this.image = new Konva.Image({
            image: image,
            x: this.stage.width()/2,
            y: 0,
            width: image.width,
            height: image.height,
        })
        this.image.offsetX(this.image.width()/2)
        this.imageLayer = new Konva.Layer()
        
        const scale = this.scaleSize(this.stage, image)
        this.image.scale({
            x: scale,
            y: scale
        })
        this.imageLayer.add(this.image)
        this.stage.add(this.imageLayer)

        //temp variables
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

    createRectangle(event){    
        this.rectangle.position({
            x: this.stage.getPointerPosition().x,
            y: this.stage.getPointerPosition().y,
        })
        this.stage.add(this.rectangeLayer)
        this.rectangeLayer.add(this.rectangle)
        this.rectangeLayer.draw()
    }
    
    updateRectangle(event){
        if(event.which != 1){return}
        
        var pos = this.stage.getPointerPosition();
    
        const width = (pos.x - this.rectangle.x()) 
        const height = ( pos.y - this.rectangle.y())
    
        this.rectangle.size({
            width: width,
            height: height
        });
        this.rectangeLayer.draw()
    }

    scaleSize(stage, imageObject){
        const widthRatio = stage.width() / imageObject.width
        const heightRatio = stage.height() / imageObject.height
        console.log(Math.max(widthRatio, heightRatio))
        return Math.max(widthRatio, heightRatio)
    }
}

export default Canvas