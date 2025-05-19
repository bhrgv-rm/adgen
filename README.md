# Adgen

Generate images of Amazon Products with AI and add your own text to them.

## Installation

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## API Key from [Recraft](https://www.recraft.ai/)

- Create a `.env` file and add the API key you get from Recraft as `RECRAFT_API_KEY = YOUR-KEY`.
- To get the API key, go [here](https://www.recraft.ai/profile/api) and for reference docs, go [here](https://www.recraft.ai/docs).

## Getting Started

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Routes

- `/` - retrieves images of the Amazon Product
- `/ai` - generate a product image with an optional prompt given by the user.
- `/final` - allows users to add text anywhere on the image and download the image.
