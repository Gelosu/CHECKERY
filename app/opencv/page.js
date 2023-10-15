import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageInput = ({ onImageSelected }) => {
  const [image, setImage] = useState(null);
  const [retrievedImage, setRetrievedImage] = useState(null);

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  useEffect(() => {
    const postImage = async () => {
      if (!image) {
        return;
      }

      const formData = new FormData();
      formData.append('image', image);

      try {
        await axios.post('http://localhost:3002/post-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // After posting, trigger the getImage function
        getImage();
      } catch (error) {
        console.error('Error posting image:', error);
      }
    };

    const getImage = async () => {
      try {
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

    if (image) {
      postImage();
    }
  }, [image]);

  useEffect(() => {
    if (retrievedImage) {
      onImageSelected(retrievedImage); // Pass the retrieved image to the parent component
    }
  }, [retrievedImage, onImageSelected]);

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      
    </div>
  );
};

export default ImageInput;
