import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractPdfText = async (
  buffer: Buffer
): Promise<string> => {
  const uint8Array =
    new Uint8Array(buffer);

  const pdf =
    await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

  let text = "";

  for (
    let pageNum = 1;
    pageNum <= pdf.numPages;
    pageNum++
  ) {
    const page =
      await pdf.getPage(pageNum);

    const content =
      await page.getTextContent();

    const pageText =
      content.items
        .map((item: any) =>
          "str" in item
            ? item.str
            : ""
        )
        .join(" ");

    text += pageText + "\n";
  }

  return text.trim();
};