import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  function cleanAmazonImageUrl(url: string): string | null {
    if (!url.includes("media-amazon") || url.includes("play-button"))
      return null;

    const match = url.match(/^(https:\/\/.*?\.jpg)(?:$|_)/);
    const base = match ? match[1] : null;

    if (!base) return null;

    const imageIdMatch = base.match(/\/I\/(.*?)\./);
    if (!imageIdMatch) return null;

    const imageId = imageIdMatch[1];
    return `https://m.media-amazon.com/images/I/${imageId}._SL675_.jpg`;
  }

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch page" },
        { status: res.status }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("#productTitle").text().trim();

    const price =
      $("#priceblock_ourprice").text().trim() ||
      $("#priceblock_dealprice").text().trim() ||
      $("#priceblock_saleprice").text().trim() ||
      $("span.a-price .a-offscreen").first().text().trim();

    const description = $("#productDescription").text().trim();

    const features: string[] = [];
    $("#feature-bullets ul li span").each((_, el) => {
      const text = $(el).text().trim();
      if (text) features.push(text);
    });

    const specifications: string[] = [];
    $("#productDetails_techSpec_section_1 tr").each((_, el) => {
      const key = $(el).find("th").text().trim();
      const value = $(el).find("td").text().trim();
      if (key && value) specifications.push(`${key}: ${value}`);
    });

    const rating =
      $("span[data-asin-rating]").first().text().trim() ||
      $("span.a-icon-alt").first().text().trim();

    const reviewsCount = $("#acrCustomerReviewText").text().trim();

    const asin =
      $("#ASIN").val() ||
      $('input[name="ASIN"]').attr("value") ||
      $('th:contains("ASIN")').next().text().trim();

    const brand =
      $("a#bylineInfo").text().trim() ||
      $('th:contains("Brand")').next().text().trim();

    const availability = $("#availability span").text().trim();
    const images: string[] = [];

    $("#altImages ul li img").each((_, el) => {
      const dynamic = $(el).attr("data-a-dynamic-image");

      if (dynamic) {
        try {
          const parsed = JSON.parse(dynamic);
          const urls = Object.keys(parsed);
          if (urls.length > 0) {
            const cleaned = cleanAmazonImageUrl(urls[0]);
            if (cleaned) images.push(cleaned);
            return;
          }
        } catch {}
      }

      const fallback = $(el).attr("data-src") || $(el).attr("src");
      if (fallback) {
        const cleaned = cleanAmazonImageUrl(fallback);
        if (cleaned) images.push(cleaned);
      }
    });

    const uniqueImages = Array.from(new Set(images));

    const productData = {
      title,
      price,
      description,
      features,
      specifications,
      rating,
      reviewsCount,
      asin,
      brand,
      availability,
      images: uniqueImages,
    };

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
