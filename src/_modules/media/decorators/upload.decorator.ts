// export const UploadImage = (imagePath: string) => {
//   return applyDecorators(
//     UseInterceptors(FileInterceptor('image', uploadOptions(imagePath))),
//     ApiConsumes('multipart/form-data'),
//   );
// };

// export const UploadVideo = (videoPath: string) => {
//   return applyDecorators(
//     UseInterceptors(FileInterceptor('video', uploadOptions(videoPath))),
//   );
// };

// export const UploadMany = (
//   keys: {
//     name: string;
//     maxCount: number;
//   }[],
//   filesPath: string,
//   type?: UploadTypes,
// ) => {
//   const uploadManyOptions = keys.map((key) => ({
//     name: key.name,
//     maxCount: key.maxCount,
//   }));

//   return applyDecorators(
//     UseInterceptors(
//       FileFieldsInterceptor(
//         uploadManyOptions,
//         uploadOptions(filesPath, type || 'many'),
//       ),
//     ),
//     ApiConsumes('multipart/form-data'),
//   );
// };
