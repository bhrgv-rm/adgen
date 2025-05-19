import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export async function POST(req: Request) {
  const { prompt } = await req.json(); // Get the user prompt from the request body

  // Default prompt in case no prompt is provided
  const defaultPrompt =
    "Focus on just the product shown and give a single detailed image of it, with a red background, and no other objects in the image.";

  const imagePath = path.join(process.cwd(), "public/image.png");

  if (!fs.existsSync(imagePath)) {
    return NextResponse.json(
      { error: "Image file not found" },
      { status: 404 }
    );
  }

  const form = new FormData();
  const imageFile = fs.createReadStream(imagePath);

  form.append("image", imageFile);
  form.append("prompt", prompt || defaultPrompt); // Use user prompt or default if none
  form.append(
    "negative_prompt",
    "bad quality, blurry, low quality, text, logo"
  );
  form.append("strength", "0.75");
  form.append("width", "512");

  try {
    const response = await axios.post(
      "https://external.api.recraft.ai/v1/images/imageToImage",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.RECRAFT_API_KEY}`,
        },
      }
    );

    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error generating image:",
      error?.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 400 }
    );
  }
}
