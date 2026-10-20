export const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const maxWidth = 1080;
    const maxHeight = 1920;
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        //Scale down and maintain aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        //Draw image in hidden canvas to resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('failed to get canvas context'));
          return;
        }

        context.drawImage(img, 0, 0, width, height);

        //export as JPEG with 85% quality to stay light on the local storage
        const base64String = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64String);
      }

      img.onerror = (error) => reject(error);
    }

    reader.onerror = (error) => reject(error);
  })
}