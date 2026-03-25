import Tesseract from "tesseract.js";

export const extractTextFromImage = async (imageUrl: string) => {
  const result = await Tesseract.recognize(imageUrl, "eng");
  return result.data.text;
};

export const validateLawyerCertificate = (text: string) => {
  const keywords = [
    "Bar Council",
    "Advocate",
    "Enrollment",
    "Certificate"
  ];

  const score = keywords.filter(k => text.includes(k)).length;

  return score >= 3;
};

export const validateCA = (text: string) => {
  return text.includes("Institute of Chartered Accountants of India");
};

export const validateCS = (text: string) => {
  return text.includes("Institute of Company Secretaries of India");
};

export const verifyCertificate = async (imageUrl: string, type: string) => {
  const text = await extractTextFromImage(imageUrl);

  let isValid = false;

  if (type === "Lawyer") {
    isValid = validateLawyerCertificate(text);
  }

  if (type === "CA") {
    isValid = validateCA(text);
  }

  if (type === "CS") {
    isValid = validateCS(text);
  }

  return {
    isValid,
    extractedText: text
  };
};


