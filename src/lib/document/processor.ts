import { extractDocxText } from "./docx-extractor";

export const processDocument = async (
  file: File
): Promise<string> => {
  const bytes =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(bytes);

  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension !== "docx") {
    throw new Error(
      "Only DOCX files supported currently"
    );
  }

  return extractDocxText(
    buffer
  );
};