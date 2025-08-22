
// This assumes pdfjsLib is available globally from the script tag in index.html
declare const pdfjsLib: any;

export const extractText = async (file: File): Promise<string> => {
  const fileReader = new FileReader();
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file."));
      }
      
      const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
      
      try {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve(fullText);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        reject(new Error("Could not parse the PDF file. It might be corrupted or protected."));
      }
    };
    
    fileReader.onerror = (error) => {
      reject(new Error("Error reading file: " + error));
    };
    
    fileReader.readAsArrayBuffer(file);
  });
};
