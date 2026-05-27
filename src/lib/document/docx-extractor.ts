import mammoth from "mammoth";

export const extractDocxText = async (
  buffer: Buffer
): Promise<string> => {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value.trim();
};