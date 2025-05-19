"use client";
import { useState, FormEvent } from "react";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";

type ProductData = {
  title: string;
  price: string;
  description: string;
  specifications: string[];
  images: string[];
};

export default function HomePage() {
  const [url, setUrl] = useState<string>("");
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("/api/amazon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product data.");
      }

      const result: ProductData = await response.json();
      setData(result);
    } catch (err) {
      setError(
        "Something went wrong. Please check the URL or try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSaveImage = async () => {
    const imagesDiv = document.querySelector("#images");
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
      formData.append("file", blob, "image.png");

      const response = await fetch("/api/save-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save image.");
      }

      router.push("/ai");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the image.");
    }
  };

  const handleDownloadImage = async () => {
    const imagesDiv = document.querySelector("#images");
    if (!imagesDiv) return;

    const canvas = await html2canvas(imagesDiv as HTMLElement, {
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
    });
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "product-images.png";
    link.click();
  };

  const handleChangeProduct = () => {
    setData(null);
    setUrl("");
  };
  return (
    <div>
      {!data && (
        <>
          <h1>paste the url of the amazon product</h1>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <input
              type="url"
              placeholder="product url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="border border-gray-300 rounded p-2 mt-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-500 text-white rounded py-2 mt-2 font-medium cursor-pointer"
            >
              get images of the product
            </button>
          </form>
        </>
      )}

      {loading && <p className="mt-3">Loading product data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h2 className="mt-4">
            title -{" "}
            <span className="font-light text-gray-300">{data.title}</span>
          </h2>
          <p className="mt-4">
            price-{" "}
            <span className="font-light text-gray-300">{data.price}</span>
          </p>
          {data.description ? (
            <>
              <p className="mt-4">description-</p>
              <span className="font-light text-gray-300">
                {data.description}
              </span>
            </>
          ) : (
            <p className="mt-4">no description available.</p>
          )}
          <div id="images" className="flex flex-wrap gap-2 mt-4">
            {data.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Image ${idx + 1}`}
                style={{ height: "200px" }}
                crossOrigin="anonymous" // Add this line
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              className="bg-indigo-500 text-white rounded py-2 px-4 mt-2 font-medium cursor-pointer"
              onClick={handleSaveImage}
            >
              use this image for ai image generation
            </button>
            <button
              className="bg-indigo-500 text-white rounded py-2 px-4 mt-2 font-medium cursor-pointer"
              onClick={handleDownloadImage}
            >
              download image
            </button>
            <button
              className="bg-indigo-500 text-white rounded py-2 px-4 mt-2 font-medium cursor-pointer"
              onClick={handleChangeProduct}
            >
              change product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
