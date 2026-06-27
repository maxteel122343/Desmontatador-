/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType = 'avatar' | 'text' | 'image' | 'button' | 'icon' | 'container' | 'badge' | 'blur-cover';

export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string;
  x: number; // percentage or pixels? Percentages (0-100) make it highly responsive to canvas resizing
  y: number;
  width: number; // percentage of canvas width
  height: number; // percentage of canvas height
  rotation: number; // degrees (0-360)
  opacity: number; // 0 to 1
  zIndex: number;
  
  // Text specific properties
  text?: string;
  fontSize?: number; // px
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fontFamily?: 'Inter' | 'Space Grotesk' | 'JetBrains Mono' | 'Playfair Display';
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Style properties
  backgroundColor?: string;
  borderRadius?: number; // px
  borderColor?: string;
  borderWidth?: number; // px
  blur?: number; // px for CSS backdrop-filter or filter
  blurType?: 'full' | 'top' | 'bottom'; // Type of blur effect
  
  // Image/Icon specific
  imageUrl?: string;
  iconName?: string; // name of Lucide icon
  
  // Interactive action link/target
  actionLabel?: string;
}

export interface CanvasSettings {
  width: number; // px
  height: number; // px
  backgroundColor: string;
  borderRadius: number; // px
  boxShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  backgroundImage?: string;
  backgroundBlur?: number; // px
}

export interface PresetTemplate {
  name: string;
  description: string;
  category: string;
  settings: CanvasSettings;
  elements: CanvasElement[];
}
