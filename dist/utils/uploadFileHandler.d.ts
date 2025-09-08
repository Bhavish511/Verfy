export declare const uploadPath: string;
export declare const uploadFileHandler: (originalName: string, file: Express.Multer.File) => {
    success: boolean;
    data: {
        filePath: string;
        fileName: string;
    };
    message?: undefined;
} | {
    success: boolean;
    message: any;
    data?: undefined;
};
