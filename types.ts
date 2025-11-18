
export interface ImageFile {
  base64: string;
  mimeType: string;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9",
  PHOTO_PORTRAIT = "3:4",
  PHOTO_LANDSCAPE = "4:3",
}

export enum LightingStyle {
  STUDIO = "Studio Light",
  NATURAL = "Natural Light",
  DRAMATIC = "Dramatic, High-contrast",
  CINEMATIC = "Cinematic, Moody",
  SOFT = "Soft, Diffused Light",
  VIBRANT = "Vibrant, Colorful",
}

export enum CameraPerspective {
  EYE_LEVEL = "Eye-level Shot",
  HIGH_ANGLE = "High-angle Shot",
  LOW_ANGLE = "Low-angle Shot",
  CLOSE_UP = "Macro, Close-up Shot",
  DUTCH_ANGLE = "Dutch Angle Shot",
  TOP_DOWN = "Top-down, Flat Lay",
}

export interface StyleOptions {
  aspectRatio: AspectRatio;
  lightingStyle: LightingStyle;
  cameraPerspective: CameraPerspective;
}
