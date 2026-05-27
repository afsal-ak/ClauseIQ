export const compareDocuments =
  async (
    oldFile: File,
    newFile: File
  ) => {
    const formData =
      new FormData();

    formData.append(
      "oldFile",
      oldFile
    );

    formData.append(
      "newFile",
      newFile
    );

    const response =
      await fetch(
        "/api/compare",
        {
          method:
            "POST",
          body: formData,
        }
      );

    return response.json();
  };