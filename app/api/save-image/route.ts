import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = path.join(process.cwd(), "public", "image.png");

  try {
    await writeFile(filePath, buffer);
    return NextResponse.json(
      { message: "Image saved successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error writing file:", err);
    return NextResponse.json(
      { message: "Failed to save image." },
      { status: 500 }
    );
  }
}
