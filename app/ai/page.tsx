"use client";
import { type FormEvent, useState } from "react";
import html2canvas from "html2canvas-pro";
import { useRouter } from "next/navigation";

export default function AiPage() {
  const router = useRouter();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSaveImage = async () => {
    const imagesDiv = document.querySelector("#generated");
    if (!imagesDiv) {
      console.error("Image container not found");
      setError("Unable to find image container.");
      return;
    }

    try {
      const canvas = await html2canvas(imagesDiv as HTMLElement, {
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        setError("Failed to generate image.");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "generated.png");

      const response = await fetch("/api/save-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save image.");
      }

      router.push("/final");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the image.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt") as string;

    // Log the prompt for debugging
    console.log("Prompt sent to server:", prompt);

    setIsLoading(true);

    const response = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: prompt || undefined }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("API Response:", data);

    setIsLoading(false);

    // Check if data has a valid URL and update state
    if (data?.data && data.data.length > 0) {
      setGeneratedImageUrl(data.data[0].url);
    }
  };

  const handleDownloadImage = async () => {
    const imagesDiv = document.querySelector("#generated");
    if (!imagesDiv) return;

    const canvas = await html2canvas(imagesDiv as HTMLElement, {
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
    });
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "generated.png";
    link.click();
  };

  const handleRegenerate = () => {
    // Reset the state to start the process over
    setGeneratedImageUrl(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col justify-center gap-4 max-w-md mx-auto p-4">
      {/* Hide this image initially */}
      {!generatedImageUrl && (
        <p className="mb-2 text-gray-700">Saved image from Amazon</p>
      )}

      {/* Hide the initial image */}
      {generatedImageUrl === null && (
        <img
          src="/image.png"
          alt="Captured Product"
          className="w-full h-auto border border-gray-200 rounded-md shadow-sm"
        />
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          name="prompt"
          placeholder="Enter a prompt for the image"
          className="w-full border border-gray-300 rounded-md p-2 mt-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-md py-2 px-4 mt-2 font-medium transition-colors duration-200"
          disabled={isLoading}
        >
          Generate Image
        </button>
      </form>

      {/* Improved loading indicator */}
      {isLoading && (
        <div className="mt-4 flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p className="text-gray-600">Generating your image...</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}

      {/* Conditionally render the generated image */}
      {generatedImageUrl && !isLoading && (
        <div className="mt-4">
          <p className="text-gray-700 mb-2">Generated Image:</p>
          <img
            src={generatedImageUrl || "/placeholder.svg"}
            alt="Generated result"
            id="generated"
            className="w-full h-auto border border-gray-200 rounded-md shadow-md"
          />
          <button
            onClick={handleRegenerate}
            className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md py-2 px-4 font-medium transition-colors duration-200"
          >
            regenerate image
          </button>
          <button
            onClick={handleDownloadImage}
            className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md py-2 px-4 font-medium transition-colors duration-200"
          >
            download image
          </button>

          <button
            onClick={handleSaveImage}
            className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md py-2 px-4 font-medium transition-colors duration-200"
          >
            add text on image
          </button>
        </div>
      )}
    </div>
  );
}
