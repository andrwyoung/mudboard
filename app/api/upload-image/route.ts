import { NextResponse } from "next/server";
import { r2 } from "@/lib/supabase/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DEFAULT_FILE_MIME } from "@/types/upload-settings";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // fields from client
    const file = form.get("file") as File;
    const name = form.get("name") as string;

    if (!file || !name) {
      return NextResponse.json(
        { error: "Missing file or name" },
        { status: 400 }
      );
    }

    // convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: "mudboard-images",
        Key: name,
        Body: buffer,
        ContentType: file.type || DEFAULT_FILE_MIME,
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
