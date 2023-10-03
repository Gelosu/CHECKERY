import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import Jimp from 'jimp';

function ImageWebcam({ onImage }) {
  const webcamRef = useRef(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [showCropIndicator, setShowCropIndicator] = useState(false);
  const [indicatorPosition, setIndicatorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (webcamEnabled) {
      // Calculate the position of the "Enable Webcam" button
      const button = document.querySelector('.enable-webcam-button');
      if (button) {
        const buttonRect = button.getBoundingClientRect();

        // Calculate the position of the crop indicator relative to the button
        const indicatorX = buttonRect.left;
        const indicatorY = buttonRect.top + buttonRect.height;

        // Set the indicator position
        setIndicatorPosition({ x: indicatorX, y: indicatorY });

        setShowCropIndicator(true);
      }
    } else {
      setShowCropIndicator(false);
    }
  }, [webcamEnabled]);

   const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setWebcamEnabled(true);

      // Convert the cropped image to grayscale
      const processedImageSrc = await processImage(imageSrc);

      // Call the callback function to pass the processed image data to the parent
      onImage(processedImageSrc);
    }
  };

  const toggleWebcam = () => {
    setWebcamEnabled(!webcamEnabled);
  };

  const cropImage = async (imageSrc) => {
    try {
      // Create a new HTML image element
      const img = new Image();
      img.src = imageSrc;
  
      // Create a canvas to manipulate the image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
  
      // Get the reference to the indicator element
      const indicatorElement = document.querySelector('.crop-indicator');
  
      // Calculate cropping coordinates and dimensions based on the indicator
      const cropX = indicatorElement.offsetLeft; // X coordinate of the indicator
      const cropY = indicatorElement.offsetTop; // Y coordinate of the indicator
      const cropWidth = indicatorElement.clientWidth; // Width of the indicator
      const cropHeight = indicatorElement.clientHeight; // Height of the indicator
  
      // Draw the cropped portion onto the canvas
      context.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  
      // Get the cropped image as a base64 data URL
      const croppedImageSrc = canvas.toDataURL('image/jpeg');
  
      return croppedImageSrc;
    } catch (error) {
      console.error('Error cropping image:', error);
      return imageSrc; // Return the original image if an error occurs
    }
  };
  

  const processImage = async (imageSrc) => {
    try {
      // Create a new HTML image element
      const img = new Image();
      img.src = imageSrc;

      // Create a canvas to manipulate the image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      context.drawImage(img, 0, 0, img.width, img.height);

      // Perform grayscale conversion by iterating through pixels
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3; // Calculate grayscale value
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // Update the canvas with the grayscale data
      context.putImageData(imageData, 0, 0);

      // Get the processed image as a base64 data URL
      const processedImageSrc = canvas.toDataURL('image/jpeg');

      return processedImageSrc;
    } catch (error) {
      console.error('Error processing image:', error);
      return imageSrc; // Return the original image if an error occurs
    }
  };

  return (
    <div>
      <button onClick={toggleWebcam} className="enable-webcam-button">
        {webcamEnabled ? 'Disable Webcam' : 'Enable Webcam'}
      </button>
      {webcamEnabled && (
        <div>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          {showCropIndicator && (
            <div
              className="crop-indicator"
              style={{
                position: 'absolute',
                border: '2px dashed red', // Customize the indicator style
                top: `${indicatorPosition.y + 55}px`, // Add 5 pixels to the y position
                left: `${indicatorPosition.x + 65}px`, // Add 5 pixels to the x position
                width: '400px', // Adjust the size as needed
                height: '250px', // Adjust the size as needed
                pointerEvents: 'none', // Make the indicator non-interactive
              }}
            ></div>
          )}
          <br />
          <button onClick={capture}>Capture and Process Image</button>
        </div>
      )}
    </div>
  );
}

export default ImageWebcam;