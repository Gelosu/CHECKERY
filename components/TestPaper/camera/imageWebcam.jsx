import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import Jimp from 'jimp';
import axios from 'axios';

function ImageWebcam({ onImage }) {
  const webcamRef = useRef(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [showCropIndicator, setShowCropIndicator] = useState(false);
  const [indicatorPosition, setIndicatorPosition] = useState({ x: 0, y: 0 });
  const [retrievedImage, setRetrievedImage] = useState(null);


  useEffect(() => {
    if (webcamEnabled) {
      // Calculate the position of the "Enable Webcam" button
      const button = document.querySelector('.enable-webcam-button');
      if (button) {
        const buttonRect = button.getBoundingClientRect();

        // Calculate the position of the crop indicator relative to the button
        const indicatorX = buttonRect.left + buttonRect.width / 2;
        const indicatorY = buttonRect.top + buttonRect.height / 2;

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
  
      try {
        const processedImageSrc = await processImage(imageSrc);
        console.log(imageSrc)
        // Post the captured image for processing
        await postImage(processedImageSrc);
        console.log(processedImageSrc)
      } catch (error) {
        console.error('Error processing and posting image:', error);
      }
    }
  };
  
  // Function to post the processed image to your server
  const postImage = async (processedImage) => {
    if (!processedImage) {
      return;
    }
  
    const formData = new FormData();
    formData.append('image', processedImage);
  
    try {
      console.log("image processing....", formData)
      // Adjust the URL to match your server endpoint for posting images
      await axios.post('http://localhost:3002/post-image', processedImage, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // After posting, trigger the getImage function to retrieve the processed image
      getImage();
    } catch (error) {
      console.error('Error posting image:', error);
    }
  };
  
  // Function to retrieve the processed image from your server
  const getImage = async () => {
    try {
      // Adjust the URL to match your server endpoint for retrieving images
      const response = await axios.get('http://localhost:3002/get-image', {
        responseType: 'arraybuffer',
      });
  
      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);
      setRetrievedImage(imageUrl);
    } catch (error) {
      console.error('Error getting image:', error);
    }
  };
  

  const toggleWebcam = () => {
    setWebcamEnabled(!webcamEnabled);
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
                width: '300px', // Adjust the width of the indicator as needed
                height: '380px', // Adjust the height of the indicator as needed
                background: 'rgba(0, 0, 0, 0.2)', // Indicator background color
                border: '2px solid red', // Indicator border style
                top: `${indicatorPosition.y}px`, // Adjust the position
                left: `${indicatorPosition.x}px`, // Adjust the position
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