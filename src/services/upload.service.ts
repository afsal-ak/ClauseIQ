export const uploadDocument =
  async (file: File) => {
    const formData =
      new FormData();

    formData.append("file", file);

    const response = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    return response.json();
  };