import dotenv from 'dotenv';
dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

const modelUrl = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment';


async function getSentiment(text) {
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });
  
    if (!response.ok) {
      console.error("Error response from API:", response.status, response.statusText);
      throw new Error("Failed to fetch sentiment from API");
    }
  
    const result = await response.json();
    console.log("Response from Hugging Face API:", result);
  
    if (!Array.isArray(result) || result.length === 0 || !Array.isArray(result[0])) {
      return "Unknown";
    }
  
    const top = result[0][0]; // Access the first element of the first array
    const label = top.label; // Get the label
    const score = top.score; // Get the score
  
    // Map labels to sentiment
    if (label === "LABEL_2") return "Positive"; // Adjust based on actual labels
    if (label === "LABEL_1") return "Neutral"; // Adjust based on actual labels
    if (label === "LABEL_0") return "Negative"; // Adjust based on actual labels
    console.log(label)
    return "Unknown"; // Fallback if no valid label is found
  }
  

export default getSentiment;
