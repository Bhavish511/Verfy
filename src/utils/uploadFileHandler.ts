import * as fs from 'fs';
import * as path from 'path';

//limit of 5 MB file size
const MaxFileSize = 5 * 1024 * 1024;

const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
export const uploadPath = path.join(baseDir, 'uploads');

export const uploadFileHandler = (
  originalName: string,
  file: Express.Multer.File,
) => {
  try {
    // ensure uploads directory exists (especially important on Vercel /tmp)
    const dir = path.dirname(path.join(uploadPath, 'placeholder'));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    //checking large file limit
    if (file.size > MaxFileSize) {
      return {
        success: false,
        message: 'File size exceeds the maximum limit of 5MB',
      };
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    const fileName = `${uniqueSuffix}-${originalName}`;

    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return { success: true, data: { filePath, fileName } };
  } catch (error) {
    console.error('Error while uploading file : ' + error.message);
    return { success: false, message: error.message };
  }
};
