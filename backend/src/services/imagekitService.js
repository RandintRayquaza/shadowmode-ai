import ImageKit from "imagekit";

let _ik = null;

function getImageKit() {
  if (!_ik) {
    _ik = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _ik;
}

/**
 * Upload a Buffer or base64 string to ImageKit CDN
 * @param {Buffer|string} fileData - image data (Buffer or base64 string)
 * @param {string} fileName - desired file name on CDN
 * @param {string} [folder='/analyses'] - CDN folder path
 * @returns {Promise<{url: string, fileId: string, thumbnailUrl: string}>}
 */
export async function uploadImage(fileData, fileName, folder = "/analyses") {
  const ik = getImageKit();
  const fileBase64 =
    Buffer.isBuffer(fileData) ? fileData.toString("base64") : fileData;

  const result = await ik.upload({
    file: fileBase64,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  // Build a thumbnail URL via ImageKit URL transforms
  const thumbnailUrl = ik.url({
    path: result.filePath,
    transformation: [{ width: 300, height: 300, crop: "at_max" }],
  });

  return {
    url: result.url,
    fileId: result.fileId,
    thumbnailUrl,
  };
}
