import fs from "fs";
import path from "path";

export async function uploadImage(fileData, fileName, folder = "/analyses") {
  try {
    // Ensure the folder exists in public/uploads 
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert fileData to buffer if it's base64 string
    const buffer = Buffer.isBuffer(fileData) 
      ? fileData 
      : Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ""), "base64");

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Create a URL path that express.static can serve
    // Ensure we preserve the leading slash from the original folder variable format
    let urlPath = `/uploads${folder}/${fileName}`;
    if (!urlPath.startsWith('/')) urlPath = '/' + urlPath; // extra safety
    
    // Simulate imagekit response
    return {
      url: `http://localhost:3001${urlPath}`,
      fileId: `local-${Date.now()}`,
      thumbnailUrl: `http://localhost:3001${urlPath}`, // Using the original image as a thumbnail for simplicity 
    };
  } catch (err) {
    console.error("Local file upload error:", err);
    throw err;
  }
}

