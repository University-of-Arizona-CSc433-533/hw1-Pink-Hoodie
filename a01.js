/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Modified by: Amir Mohammad Esmaieeli Sikaroudi
  Email: amesmaieeli@email.arizona.edu
  */


//access DOM elements we'll use
var input = document.getElementById("load_image");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d'); 

var ppm_img_data;

//Function to process upload
var upload = function () {
    if (input.files.length > 0) {
        var file = input.files[0];
        console.log("You chose", file.name);
        if (file.type) console.log("It has type", file.type);
        var fReader = new FileReader();
        fReader.readAsBinaryString(file);

        fReader.onload = function(e) {
            //if successful, file data has the contents of the uploaded file
            var file_data = fReader.result;
            parsePPM(file_data);
        }

        /*
        * TODO: ADD CODE HERE TO DO 2D TRANSFORMATION and ANIMATION
        * Modify any code if needed
        * Hint: Write a rotation method, and call WebGL APIs to reuse the method for animation
        */

      // TEST ROTATION
      var currentAngle = 0;

      for (let k = 0;; k+=30) { // Infinite Loop
        currentAngle = k;
        for (let i = 0; i < ppm_image_data.data.width; i++) {
          for (let j = 0; j < ppm_image_data.data.height; j++) {
            rotSource = new Vec3(i-ppm_image_data.data.width/2, j-ppm_image_data.data.width/2, 0); // Relative positions
            result1 = rotatePoint(rotSource, currentAngle);
            translateBack = new Vec3(ppm_image_data.data.width/2, ppm_image_data.data.width/2, 0); // Translate so that the center is correct
            pixelTarget = translateBack.plus(result1);
            
            pixelTarget = pixelTarget.clamp(0, 600); // Make sure that you are not outside the frame

            var targetCoordinate = pixelTarget.toArray();
            targetX = Math.round(targetCoordinate[0]);
            targetY = Math.round(targetCoordinate[1]);
            
            targetRed = ppm_image_data.data[3*(targetX*ppm_image_data.data.width+targetY)];
            targetGreen = ppm_image_data.data[3*(targetX*ppm_image_data.data.width+targetY)+1];
            targetBlue = ppm_image_data.data[3*(targetX*ppm_image_data.data.width+targetY)+2];
            // Set the output coordinates to the respective pixels
            
          }
        }
      }
      
}

}


function rotatePoint(source, angle) {
      // Get angles and trig constants
      const radians = (angle * Math.PI) / 180.0;
      sineRadians = Math.sin(radians);
      cosineRadians = Math.cos(radians);

      // Rotation Matrix Homogenous Coordinates
      rotationMatrixRow1 = new Vec3(cosineRadians, -sineRadians, 0);
      rotationMatrixRow2 = new Vec3(sineRadians, cosineRadians, 0);
      rotationMatrixRow3 = new Vec3(0,0,1);

      // Apply Rotation to the matrix
      rotationMatrixResult = new Vec3(source.dot(rotationMatrixRow1), source.dot(rotationMatrixRow2), source.dot(rotationMatrixRow3));
      return rotationMatrixResult;
}



// Load PPM Image to Canvas
function parsePPM(file_data){
    /*
   * Extract header
   */
    var format = "";
    var width = 0;
    var height = 0;
    var max_v = 0;
    var lines = file_data.split(/#[^\n]*\s*|\s+/); // split text by whitespace or text following '#' ending with whitespace
    var counter = 0;
    // get attributes
    for(var i = 0; i < lines.length; i ++){
        if(lines[i].length == 0) {continue;} //in case, it gets nothing, just skip it
        if(counter == 0){
            format = lines[i];
        }else if(counter == 1){
            width = lines[i];
        }else if(counter == 2){
            height = lines[i];
        }else if(counter == 3){
            max_v = Number(lines[i]);
        }else if(counter > 3){
            break;
        }
        counter ++;
    }
    console.log("Format: " + format);
    console.log("Width: " + width);
    console.log("Height: " + height);
    console.log("Max Value: " + max_v);
    /*
     * Extract Pixel Data
     */
    var bytes = new Uint8Array(3 * width * height);  // i-th R pixel is at 3 * i; i-th G is at 3 * i + 1; etc.
    // i-th pixel is on Row i / width and on Column i % width
    // Raw data must be last 3 X W X H bytes of the image file
    var raw_data = file_data.substring(file_data.length - width * height * 3);
    for(var i = 0; i < width * height * 3; i ++){
        // convert raw data byte-by-byte
        bytes[i] = raw_data.charCodeAt(i);
    }
    // update width and height of canvas
    document.getElementById("canvas").setAttribute("width", width);
    document.getElementById("canvas").setAttribute("height", height);
    // create ImageData object
    var image_data = ctx.createImageData(width, height);
    // fill ImageData
    for(var i = 0; i < image_data.data.length; i+= 4){
        let pixel_pos = parseInt(i / 4);
        image_data.data[i + 0] = bytes[pixel_pos * 3 + 0]; // Red ~ i + 0
        image_data.data[i + 1] = bytes[pixel_pos * 3 + 1]; // Green ~ i + 1
        image_data.data[i + 2] = bytes[pixel_pos * 3 + 2]; // Blue ~ i + 2
        image_data.data[i + 3] = 255; // A channel is deafult to 255
    }
    ctx.putImageData(image_data, canvas.width/2 - width/2, canvas.height/2 - height/2);
    ppm_img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//Connect event listeners
input.addEventListener("change", upload);
