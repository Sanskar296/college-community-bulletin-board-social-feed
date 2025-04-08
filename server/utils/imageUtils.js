import fs from 'fs/promises';

export const imageToBase64 = async (filePath) => {
  try {
    const image = await fs.readFile(filePath);
    return Buffer.from(image).toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

export const base64ToImage = (base64String, mimetype) => {
  return Buffer.from(base64String, 'base64');
};
