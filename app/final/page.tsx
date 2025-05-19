"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import html2canvas from "html2canvas-pro";

interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  styles: string[];
  color?: string; // Optional color property
}

const Page = () => {
  // State for text styling
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState(500);
  const [fontFamily, setFontFamily] = useState("inter");
  const [styles, setStyles] = useState<string[]>([]);
  const [posX, setPosX] = useState(300);
  const [posY, setPosY] = useState(300);
  const [textColor, setTextColor] = useState<string>("#FFFFFF");

  // State for text elements and selection
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Add container dimensions state
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(800);
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);

  // Refs
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const textRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

  // Get container dimensions
  useEffect(() => {
    if (imageContainerRef.current) {
      const updateDimensions = () => {
        const rect = imageContainerRef.current?.getBoundingClientRect();
        if (rect) {
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }
  }, []);

  // Update text dimensions when selected text changes
  useEffect(() => {
    if (selectedTextId && textRefs.current[selectedTextId]) {
      const textElement = textRefs.current[selectedTextId];
      if (textElement) {
        setTextWidth(textElement.offsetWidth);
        setTextHeight(textElement.offsetHeight);
      }
    }
  }, [selectedTextId, textElements]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if 'Ctrl' and 'Delete' are pressed
      if (event.ctrlKey && event.key === "Delete" && selectedTextId) {
        deleteSelectedText();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      const updateDimensions = () => {
        const rect = imageContainerRef.current?.getBoundingClientRect();
        if (rect) {
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      };
      window.removeEventListener("resize", updateDimensions);
    };
  }, [selectedTextId]);

  // Preload fonts for html2canvas
  useEffect(() => {
    // Create a function to preload fonts
    const preloadFonts = async () => {
      // Create a list of fonts to preload
      const fontsToLoad = [
        { family: "Roboto Slab", weight: 400 },
        { family: "Roboto Slab", weight: 700 },
        { family: "Inter", weight: 400 },
        { family: "Inter", weight: 700 },
        { family: "Instrument Serif", weight: 400 },
        { family: "Knewave", weight: 400 },
        { family: "Zeyada", weight: 400 },
      ];

      // Use the Font Loading API to preload fonts
      try {
        const fontPromises = fontsToLoad.map((font) =>
          document.fonts.load(`${font.weight} 16px "${font.family}"`)
        );
        await Promise.all(fontPromises);
        console.log("All fonts loaded successfully");
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    };

    preloadFonts();
  }, []);

  // Function to delete the selected text
  const deleteSelectedText = () => {
    setTextElements((prevTextElements) =>
      prevTextElements.filter((text) => text.id !== selectedTextId)
    );
    setSelectedTextId(null); // Deselect after deletion
  };

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    if (selectedTextId) {
      updateTextElement(selectedTextId, { fontSize: value[0] });
    }
  };

  // Handle font weight change
  const handleFontWeightChange = (value: number[]) => {
    setFontWeight(value[0]);
    if (selectedTextId) {
      updateTextElement(selectedTextId, { fontWeight: value[0] });
    }
  };

  // Handle X position change
  const handlePosXChange = (value: number[]) => {
    // Ensure text stays within container boundaries
    const newX = Math.max(0, Math.min(value[0], containerWidth - textWidth));
    setPosX(newX);
    if (selectedTextId) {
      updateTextElement(selectedTextId, { x: newX });
    }
  };

  // Handle Y position change
  const handlePosYChange = (value: number[]) => {
    // Ensure text stays within container boundaries
    const maxY = containerHeight - textHeight;
    const newY = Math.max(0, Math.min(value[0], maxY));
    setPosY(newY);
    if (selectedTextId) {
      updateTextElement(selectedTextId, { y: newY });
    }
  };

  // Handle font family change
  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    if (selectedTextId) {
      updateTextElement(selectedTextId, { fontFamily: value });
    }
  };

  // Handle styles change
  const handleStylesChange = (value: string[]) => {
    setStyles(value);
    if (selectedTextId) {
      updateTextElement(selectedTextId, { styles: value });
    }
  };
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;

    // Update color state immediately when the user types
    setTextColor(color);

    // If text is selected, update the text element with the new color (or remove color if empty)
    if (selectedTextId) {
      updateTextElement(selectedTextId, { color: color || undefined });
    }
  };

  // New function to handle Enter key press for input
  const handleColorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const color = event.currentTarget.value;

      // Trigger color change when Enter is pressed
      setTextColor(color);

      if (selectedTextId) {
        updateTextElement(selectedTextId, { color: color || undefined });
      }

      // Optionally, you can blur the input field after pressing Enter
      event.currentTarget.blur();
    }
  };

  // Add a new text element
  const addText = () => {
    if (!imageContainerRef.current) return;

    const newText: TextElement = {
      id: `text-${Date.now()}`,
      content: "Edit this text",
      x: posX,
      y: posY,
      fontSize,
      fontWeight,
      fontFamily,
      styles,
    };

    setTextElements([...textElements, newText]);
    setSelectedTextId(newText.id);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(
      textElements.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      )
    );
  };

  // Get CSS classes for text styling
  const getTextStyles = (textElement: TextElement) => {
    const styleClasses = [];

    // Add font family class
    switch (textElement.fontFamily) {
      case "roboto-slab":
        styleClasses.push("font-['Roboto_Slab']");
        break;
      case "inter":
        styleClasses.push("font-['Inter']");
        break;
      case "instrument-serif":
        styleClasses.push("font-['Instrument_Serif']");
        break;
      case "knewave":
        styleClasses.push("font-['Knewave']");
        break;
      case "zeyada":
        styleClasses.push("font-['Zeyada']");
        break;
      default:
        styleClasses.push("font-['Inter']");
    }

    if (textElement.styles.includes("italic")) styleClasses.push("italic");
    if (textElement.styles.includes("underline"))
      styleClasses.push("underline");
    if (textElement.styles.includes("strikethrough"))
      styleClasses.push("line-through");

    return styleClasses.join(" ");
  };

  // Get the actual font family name from the fontFamily value
  const getFontFamilyName = (fontFamily: string): string => {
    switch (fontFamily) {
      case "roboto-slab":
        return "Roboto Slab";
      case "inter":
        return "Inter";
      case "instrument-serif":
        return "Instrument Serif";
      case "knewave":
        return "Knewave";
      case "zeyada":
        return "Zeyada";
      default:
        return "Inter";
    }
  };

  // Download the image with text
  const downloadImage = async () => {
    if (!imageContainerRef.current) return;

    try {
      // Hide selection UI elements before capturing
      const selectedElement = document.querySelector(".text-selected");
      if (selectedElement) {
        selectedElement.classList.remove("text-selected");
      }

      // Make sure all fonts are loaded
      await document.fonts.ready;

      // Capture the image with improved settings
      const canvas = await html2canvas(imageContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        onclone: (clonedDoc) => {
          // Find all text elements in the cloned document
          const textElements = clonedDoc.querySelectorAll("p");

          // Apply inline font-family to each element to ensure it's captured correctly
          textElements.forEach((el) => {
            const fontFamily =
              el.style.fontFamily || window.getComputedStyle(el).fontFamily;
            if (fontFamily) {
              el.style.fontFamily = fontFamily;
            }
          });
        },
      });

      // Create download link
      const dataUrl = canvas.toDataURL("image/png");
      if (downloadRef.current) {
        downloadRef.current.href = dataUrl;
        downloadRef.current.download = `edited-image-${Date.now()}.png`;
        downloadRef.current.click();
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 w-full my-12">
      <div className="flex gap-4 w-full justify-between">
        <div
          ref={imageContainerRef}
          className="image flex rounded-lg justify-center items-center relative h-full aspect-square object-contain"
          style={{
            backgroundSize: "contain",
            position: "relative",
            height: "80vh",
            overflow: "hidden",
            backgroundImage: "url('/image.png')",
          }}
          onClick={() => {
            // Deselect when clicking on the background
            setSelectedTextId(null);
          }}
        >
          {textElements.map((text) => {
            const isSelected = selectedTextId === text.id;

            return (
              <p
                key={text.id}
                ref={(el) => {
                  textRefs.current[text.id] = el;
                }}
                className={`absolute cursor-pointer ${
                  isSelected ? "text-selected" : ""
                } ${getTextStyles(text)}`}
                style={{
                  left: `${text.x}px`,
                  top: `${text.y}px`,
                  fontSize: `${text.fontSize}px`,
                  fontWeight: text.fontWeight,
                  color: text.color || undefined,
                  fontFamily: getFontFamilyName(text.fontFamily),
                }}
                contentEditable={isSelected}
                suppressContentEditableWarning={true}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(text.id);
                  setPosX(text.x);
                  setPosY(text.y);

                  // Update text dimensions
                  if (textRefs.current[text.id]) {
                    setTextWidth(textRefs.current[text.id]!.offsetWidth);
                    setTextHeight(textRefs.current[text.id]!.offsetHeight);
                  }
                }}
                onBlur={(e) => {
                  if (isSelected) {
                    updateTextElement(text.id, {
                      content: e.currentTarget.textContent || text.content,
                    });

                    // Update text dimensions after content change
                    setTextWidth(e.currentTarget.offsetWidth);
                    setTextHeight(e.currentTarget.offsetHeight);
                  }
                }}
              >
                {text.content}
              </p>
            );
          })}
        </div>

        <div className="controls flex flex-1 flex-col gap-4 px-4 max-w-lg">
          <div className="flex gap-2">
            <Button onClick={addText}>Add Text</Button>
            <Button
              variant="destructive"
              onClick={deleteSelectedText}
              disabled={!selectedTextId}
            >
              Delete Text
            </Button>
          </div>

          <ToggleGroup
            type="multiple"
            className="w-full"
            value={styles}
            onValueChange={handleStylesChange}
            disabled={!selectedTextId}
          >
            <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
            <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
            <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
            <ToggleGroupItem value="strikethrough">Strike</ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={fontFamily}
            onValueChange={handleFontFamilyChange}
            disabled={!selectedTextId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roboto-slab">Roboto Slab</SelectItem>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="instrument-serif">Instrument Serif</SelectItem>
              <SelectItem value="knewave">Knewave</SelectItem>
              <SelectItem value="zeyada">Zeyada</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="font-size">Font Size</Label>
          <Slider
            name="font-size"
            value={[fontSize]}
            min={8}
            max={400}
            step={1}
            onValueChange={handleFontSizeChange}
            disabled={!selectedTextId}
          />

          <Label htmlFor="font-weight">Font Weight</Label>
          <Slider
            name="font-weight"
            value={[fontWeight]}
            min={100}
            max={900}
            step={100}
            onValueChange={handleFontWeightChange}
            disabled={!selectedTextId}
          />

          <Label htmlFor="pos-x">X Position</Label>
          <Slider
            name="pos-x"
            value={[posX]}
            min={0}
            max={containerWidth - textWidth}
            step={1}
            onValueChange={handlePosXChange}
            disabled={!selectedTextId}
          />

          <Label htmlFor="pos-y">Y Position</Label>
          <Slider
            name="pos-y"
            value={[posY]}
            min={0}
            max={containerHeight - textHeight}
            step={1}
            onValueChange={handlePosYChange}
            disabled={!selectedTextId}
          />
          <>
            <Label htmlFor="text-color">Text Color</Label>
            <input
              id="text-color"
              type="text"
              value={textColor}
              onChange={handleColorChange}
              onKeyDown={handleColorKeyDown} // Add this handler to listen for Enter key press
              placeholder="#FFFFFF"
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!selectedTextId}
            />
          </>

          <p className="text-sm">
            Tip: Press Ctrl+Del to delete the active text.
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={downloadImage} className="px-8">
          Download Image
        </Button>
        <a ref={downloadRef} className="hidden">
          Download
        </a>
      </div>
    </div>
  );
};

export default Page;
