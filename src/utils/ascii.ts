export function convertImageToAscii(
  file: File,
  width: number = 40
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate height to maintain aspect ratio
        // Multiply by 0.5 because ASCII characters are usually twice as tall as they are wide
        const height = Math.floor((img.height / img.width) * width * 0.55);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const chars = '@%#*+=-:. ';
        let ascii = '';

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = (r + g + b) / 3;
          
          const charIndex = Math.floor((avg / 255) * (chars.length - 1));
          ascii += chars[chars.length - 1 - charIndex];

          if ((i / 4 + 1) % width === 0) {
            ascii += '\n';
          }
        }

        resolve(ascii);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
