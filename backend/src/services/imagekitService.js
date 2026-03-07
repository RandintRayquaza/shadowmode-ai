import ImageKit from "imagekit";

let _ik = null;

function client() {
  if (!_ik) {
    _ik = new ImageKit({
      publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _ik;
}

export async function uploadImage(fileData, fileName, folder = "/analyses") {
  const ik = client();
  const file = Buffer.isBuffer(fileData) ? fileData.toString("base64") : fileData;

  const result = await ik.upload({ file, fileName, folder, useUniqueFileName: true });

  return {
    url: result.url,
    fileId: result.fileId,
    thumbnailUrl: ik.url({
      path: result.filePath,
      transformation: [{ width: 300, height: 300, crop: "at_max" }],
    }),
  };
}
