import React, { useState } from 'react';
import { 
  PaintBucket, 
  Square, 
  Type, 
  Move, 
  Palette,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Minus,
  Plus,
  Circle,
  Maximize,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { Button } from 'web-utils-components/button';
import { Label } from 'web-utils-components/label';
import { Input } from 'web-utils-components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'web-utils-components/select';
import { Slider } from 'web-utils-components/slider';
import { Card, CardContent, CardHeader, CardTitle } from 'web-utils-components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'web-utils-components/tabs';

// Tailwind color palette with opacity support
const colorPalette = {
  transparent: { name: 'Transparent', value: 'transparent', color: 'transparent' },
  slate: {
    50: { name: 'Slate 50', value: 'slate-50', color: '#f8fafc' },
    100: { name: 'Slate 100', value: 'slate-100', color: '#f1f5f9' },
    200: { name: 'Slate 200', value: 'slate-200', color: '#e2e8f0' },
    300: { name: 'Slate 300', value: 'slate-300', color: '#cbd5e1' },
    400: { name: 'Slate 400', value: 'slate-400', color: '#94a3b8' },
    500: { name: 'Slate 500', value: 'slate-500', color: '#64748b' },
    600: { name: 'Slate 600', value: 'slate-600', color: '#475569' },
    700: { name: 'Slate 700', value: 'slate-700', color: '#334155' },
    800: { name: 'Slate 800', value: 'slate-800', color: '#1e293b' },
    900: { name: 'Slate 900', value: 'slate-900', color: '#0f172a' },
  },
  red: {
    50: { name: 'Red 50', value: 'red-50', color: '#fef2f2' },
    100: { name: 'Red 100', value: 'red-100', color: '#fee2e2' },
    200: { name: 'Red 200', value: 'red-200', color: '#fecaca' },
    300: { name: 'Red 300', value: 'red-300', color: '#fca5a5' },
    400: { name: 'Red 400', value: 'red-400', color: '#f87171' },
    500: { name: 'Red 500', value: 'red-500', color: '#ef4444' },
    600: { name: 'Red 600', value: 'red-600', color: '#dc2626' },
    700: { name: 'Red 700', value: 'red-700', color: '#b91c1c' },
    800: { name: 'Red 800', value: 'red-800', color: '#991b1b' },
    900: { name: 'Red 900', value: 'red-900', color: '#7f1d1d' },
  },
  blue: {
    50: { name: 'Blue 50', value: 'blue-50', color: '#eff6ff' },
    100: { name: 'Blue 100', value: 'blue-100', color: '#dbeafe' },
    200: { name: 'Blue 200', value: 'blue-200', color: '#bfdbfe' },
    300: { name: 'Blue 300', value: 'blue-300', color: '#93c5fd' },
    400: { name: 'Blue 400', value: 'blue-400', color: '#60a5fa' },
    500: { name: 'Blue 500', value: 'blue-500', color: '#3b82f6' },
    600: { name: 'Blue 600', value: 'blue-600', color: '#2563eb' },
    700: { name: 'Blue 700', value: 'blue-700', color: '#1d4ed8' },
    800: { name: 'Blue 800', value: 'blue-800', color: '#1e40af' },
    900: { name: 'Blue 900', value: 'blue-900', color: '#1e3a8a' },
  },
  green: {
    50: { name: 'Green 50', value: 'green-50', color: '#f0fdf4' },
    100: { name: 'Green 100', value: 'green-100', color: '#dcfce7' },
    200: { name: 'Green 200', value: 'green-200', color: '#bbf7d0' },
    300: { name: 'Green 300', value: 'green-300', color: '#86efac' },
    400: { name: 'Green 400', value: 'green-400', color: '#4ade80' },
    500: { name: 'Green 500', value: 'green-500', color: '#22c55e' },
    600: { name: 'Green 600', value: 'green-600', color: '#16a34a' },
    700: { name: 'Green 700', value: 'green-700', color: '#15803d' },
    800: { name: 'Green 800', value: 'green-800', color: '#166534' },
    900: { name: 'Green 900', value: 'green-900', color: '#14532d' },
  },
  yellow: {
    50: { name: 'Yellow 50', value: 'yellow-50', color: '#fefce8' },
    100: { name: 'Yellow 100', value: 'yellow-100', color: '#fef3c7' },
    200: { name: 'Yellow 200', value: 'yellow-200', color: '#fde68a' },
    300: { name: 'Yellow 300', value: 'yellow-300', color: '#fcd34d' },
    400: { name: 'Yellow 400', value: 'yellow-400', color: '#fbbf24' },
    500: { name: 'Yellow 500', value: 'yellow-500', color: '#f59e0b' },
    600: { name: 'Yellow 600', value: 'yellow-600', color: '#d97706' },
    700: { name: 'Yellow 700', value: 'text-yellow-700', color: '#b45309' },
    800: { name: 'Yellow 800', value: 'yellow-800', color: '#92400e' },
    900: { name: 'Yellow 900', value: 'yellow-900', color: '#78350f' },
  },
  purple: {
    50: { name: 'Purple 50', value: 'purple-50', color: '#faf5ff' },
    100: { name: 'Purple 100', value: 'purple-100', color: '#f3e8ff' },
    200: { name: 'Purple 200', value: 'purple-200', color: '#e9d5ff' },
    300: { name: 'Purple 300', value: 'purple-300', color: '#d8b4fe' },
    400: { name: 'Purple 400', value: 'purple-400', color: '#c084fc' },
    500: { name: 'Purple 500', value: 'purple-500', color: '#a855f7' },
    600: { name: 'Purple 600', value: 'purple-600', color: '#9333ea' },
    700: { name: 'Purple 700', value: 'purple-700', color: '#7c3aed' },
    800: { name: 'Purple 800', value: 'purple-800', color: '#6b21a8' },
    900: { name: 'Purple 900', value: 'purple-900', color: '#581c87' },
  },
  gray: {
    50: { name: 'Gray 50', value: 'gray-50', color: '#f9fafb' },
    100: { name: 'Gray 100', value: 'gray-100', color: '#f3f4f6' },
    200: { name: 'Gray 200', value: 'gray-200', color: '#e5e7eb' },
    300: { name: 'Gray 300', value: 'gray-300', color: '#d1d5db' },
    400: { name: 'Gray 400', value: 'gray-400', color: '#9ca3af' },
    500: { name: 'Gray 500', value: 'gray-500', color: '#6b7280' },
    600: { name: 'Gray 600', value: 'gray-600', color: '#4b5563' },
    700: { name: 'Gray 700', value: 'gray-700', color: '#374151' },
    800: { name: 'Gray 800', value: 'gray-800', color: '#1f2937' },
    900: { name: 'Gray 900', value: 'gray-900', color: '#111827' },
  },
};

// Spacing values (0px to 32px)
const spacingValues = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32];
const borderWidthValues = [0, 1, 2, 4, 8];
const borderRadiusValues = [
  { label: 'None', value: 'rounded-none', classes: '' },
  { label: 'XS', value: 'rounded-xs', classes: 'rounded-xs' },
  { label: 'SM', value: 'rounded-sm', classes: 'rounded-sm' },
  { label: 'MD', value: 'rounded-md', classes: 'rounded-md' },
  { label: 'LG', value: 'rounded-lg', classes: 'rounded-lg' },
  { label: 'XL', value: 'rounded-xl', classes: 'rounded-xl' },
  { label: '2XL', value: 'rounded-2xl', classes: 'rounded-2xl' },
  { label: '3XL', value: 'rounded-3xl', classes: 'rounded-3xl' },
  { label: 'Full', value: 'rounded-full', classes: 'rounded-full' },
];

const shadowValues = [
  { label: 'None', value: 'shadow-none', classes: 'shadow-none' },
  { label: 'SM', value: 'shadow-sm', classes: 'shadow-sm' },
  { label: 'Base', value: 'shadow', classes: 'shadow' },
  { label: 'MD', value: 'shadow-md', classes: 'shadow-md' },
  { label: 'LG', value: 'shadow-lg', classes: 'shadow-lg' },
  { label: 'XL', value: 'shadow-xl', classes: 'shadow-xl' },
  { label: '2XL', value: 'shadow-2xl', classes: 'shadow-2xl' },
  { label: 'Inner', value: 'shadow-inner', classes: 'shadow-inner' },
];

interface StylePanelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  target: 'className' | 'containerClassName';
}

// Helper functions to extract and update Tailwind classes
const extractClasses = (classString: string, pattern: RegExp): string[] => {
  const matches = classString.match(pattern);
  return matches || [];
};

const removeClasses = (classString: string, pattern: RegExp): string => {
  return classString.replace(pattern, '').replace(/\s+/g, ' ').trim();
};

const updateClasses = (classString: string, pattern: RegExp, newClasses: string[]): string => {
  const cleaned = removeClasses(classString, pattern);
  const newClassString = newClasses.filter(cls => cls.trim()).join(' ');
  return [cleaned, newClassString].filter(s => s.trim()).join(' ').trim();
};

const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  prefix: string;
  allowOpacity?: boolean;
}> = ({ value, onChange, prefix, allowOpacity = false }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorFamily, setSelectedColorFamily] = useState('');
  const [opacity, setOpacity] = useState(100);

  React.useEffect(() => {
    // Extract color and opacity from current value
    const opacityMatch = value.match(new RegExp(`${prefix}-(\\w+)-(\\d+)/(\\d+)`));
    const colorMatch = value.match(new RegExp(`${prefix}-(\\w+)-(\\d+)`));
    
    if (opacityMatch) {
      setSelectedColor(`${opacityMatch[1]}-${opacityMatch[2]}`);
      setSelectedColorFamily(opacityMatch[1]);
      setOpacity(parseInt(opacityMatch[3]));
    } else if (colorMatch) {
      setSelectedColor(`${colorMatch[1]}-${colorMatch[2]}`);
      setSelectedColorFamily(colorMatch[1]);
      setOpacity(100);
    } else {
      setSelectedColor('');
      setSelectedColorFamily('');
      setOpacity(100);
    }
  }, [value, prefix]);

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    const finalValue = allowOpacity && opacity < 100 
      ? `${prefix}-${colorValue}/${opacity}`
      : `${prefix}-${colorValue}`;
    onChange(finalValue);
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    if (selectedColor) {
      const finalValue = newOpacity < 100 
        ? `${prefix}-${selectedColor}/${newOpacity}`
        : `${prefix}-${selectedColor}`;
      onChange(finalValue);
    }
  };

  const getCurrentColor = () => {
    if (!selectedColor) return '#ffffff';
    const [colorName, shade] = selectedColor.split('-');
    const colorGroup = colorPalette[colorName as keyof typeof colorPalette];
    if (colorGroup && typeof colorGroup === 'object' && 'color' in colorGroup) {
      return colorGroup.color;
    }
    if (colorGroup && typeof colorGroup === 'object' && shade) {
      const shadeColor = (colorGroup as any)[shade];
      return shadeColor?.color || '#ffffff';
    }
    return '#ffffff';
  };

  const colorFamilies = Object.keys(colorPalette).slice(1); // Remove transparent

  return (
    <div className="space-y-3">
      {/* Current color preview */}
      <div className="flex items-center gap-3 p-2 border rounded-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div 
          className="w-6 h-6 border rounded" 
          style={{ backgroundColor: selectedColor ? getCurrentColor() : 'transparent' }}
        />
        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {selectedColor ? `${prefix}-${selectedColor}${allowOpacity && opacity < 100 ? `/${opacity}` : ''}` : 'No color'}
        </span>
      </div>

      {/* Color Family Selection */}
      <div className="space-y-2">
        <div className="flex gap-2 items-center justify-between">

          <Select value={selectedColorFamily} onValueChange={setSelectedColorFamily}>
            <SelectTrigger className="w-32 h-6 text-xs">
              <SelectValue placeholder="Pick color" />
            </SelectTrigger>
            <SelectContent>
              {colorFamilies.map((colorName) => (
                <SelectItem key={colorName} value={colorName} className="capitalize text-xs">
                  {colorName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedColor('');
              setSelectedColorFamily('');
              onChange('');
            }}
            className="h-6 text-xs"
            title="Remove color"
          >
            <Minus className="w-3 h-3" />
            None
          </Button>
        </div>
        
        {/* Color Shades - Only show if color family is selected */}
        {selectedColorFamily && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">Choose shade:</Label>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(colorPalette[selectedColorFamily as keyof typeof colorPalette] as any).map(([shade, info]: [string, any]) => (
                <button
                  key={`${selectedColorFamily}-${shade}`}
                  onClick={() => handleColorSelect(`${selectedColorFamily}-${shade}`)}
                  className={`w-7 h-7 border rounded hover:scale-110 transition-transform ${
                    selectedColor === `${selectedColorFamily}-${shade}` ? 'ring-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: info.color }}
                  title={`${info.name} (${info.value})`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {allowOpacity && selectedColor && (
        <div className="space-y-2 p-3 border rounded-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <Label className="text-xs font-medium">Opacity: {opacity}%</Label>
          <Slider
            value={[opacity]}
            onValueChange={(values) => handleOpacityChange(values[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const StylePanel: React.FC<StylePanelProps> = ({ label, value, onChange, target }) => {
  // Extract current values from the class string
  const extractSpacingValue = (prefix: string): number => {
    const match = value.match(new RegExp(`${prefix}-(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  };

  const extractBorderWidth = (): number => {
    const match = value.match(/border-(\d+)/);
    if (match) return parseInt(match[1]);
    return value.includes('border') && !value.includes('border-0') ? 1 : 0;
  };

  const extractBorderRadius = (): string => {
    const radiusMatch = value.match(/rounded(-\w+)?/);
    return radiusMatch ? radiusMatch[0] : 'rounded-none';
  };

  const extractShadow = (): string => {
    const shadowMatch = value.match(/shadow(-\w+)?/);
    return shadowMatch ? shadowMatch[0] : 'shadow-none';
  };

  const updateSpacing = (prefix: string, newValue: number) => {
    const pattern = new RegExp(`${prefix}-\\d+`, 'g');
    const newClass = newValue > 0 ? `${prefix}-${newValue}` : '';
    const updated = updateClasses(value, pattern, [newClass]);
    onChange(updated);
  };

  const updateBorderWidth = (newWidth: number) => {
    const pattern = /border(-\d+)?/g;
    const newClass = newWidth === 1 ? 'border' : newWidth > 1 ? `border-${newWidth}` : '';
    const updated = updateClasses(value, pattern, [newClass]);
    onChange(updated);
  };

  const updateBorderColor = (newColor: string) => {
    const pattern = /border-\w+-\d+(\/\d+)?/g;
    const updated = updateClasses(value, pattern, [newColor]);
    onChange(updated);
  };

  const updateBackgroundColor = (newColor: string) => {
    const pattern = /bg-\w+-\d+(\/\d+)?/g;
    const updated = updateClasses(value, pattern, [newColor]);
    onChange(updated);
  };

  const updateTextColor = (newColor: string) => {
    const pattern = /text-\w+-\d+(\/\d+)?/g;
    const updated = updateClasses(value, pattern, [newColor]);
    onChange(updated);
  };

  const updateBorderRadius = (newRadius: string) => {
    const pattern = /rounded(-\w+)?/g;
    const updated = updateClasses(value, pattern, [newRadius === 'rounded-none' ? '' : newRadius]);
    onChange(updated);
  };

  const updateShadow = (newShadow: string) => {
    const pattern = /shadow(-\w+)?/g;
    const updated = updateClasses(value, pattern, [newShadow === 'shadow-none' ? '' : newShadow]);
    onChange(updated);
  };

  return (
    <Card className="w-full gap-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/90 dark:border-gray-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="spacing" className="w-full">
          <TabsList className="grid grid-cols-4 w-full backdrop-blur-md dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50">
            <TabsTrigger value="spacing" className="dark:data-[state=active]:bg-gray-700/90">Layout</TabsTrigger>
            <TabsTrigger value="border" className="dark:data-[state=active]:bg-gray-700/90">Border</TabsTrigger>
            <TabsTrigger value="colors" className="dark:data-[state=active]:bg-gray-700/90">Colors</TabsTrigger>
            <TabsTrigger value="effects" className="dark:data-[state=active]:bg-gray-700/90">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="spacing" className="space-y-4">
            {/* Margin */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-orange-500" />
                  <Label className="text-xs font-medium">Margin</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">All sides:</Label>
                  <Select value={extractSpacingValue('m').toString()} onValueChange={(v) => updateSpacing('m', parseInt(v))}>
                    <SelectTrigger className="h-8 w-20 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Top</Label>
                  <Select value={extractSpacingValue('mt').toString()} onValueChange={(v) => updateSpacing('mt', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Left</Label>
                  <Select value={extractSpacingValue('ml').toString()} onValueChange={(v) => updateSpacing('ml', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Right</Label>
                  <Select value={extractSpacingValue('mr').toString()} onValueChange={(v) => updateSpacing('mr', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Bottom</Label>
                  <Select value={extractSpacingValue('mb').toString()} onValueChange={(v) => updateSpacing('mb', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {(extractSpacingValue('m') > 0 || extractSpacingValue('mt') > 0 || extractSpacingValue('mr') > 0 || extractSpacingValue('mb') > 0 || extractSpacingValue('ml') > 0) && (
                <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20 backdrop-blur-sm p-2 rounded">
                  <span className="text-yellow-700"><Info className='w-3 h-4' /> </span>Margin creates space outside the element
                </div>
              )}
            </div>

            {/* Padding */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-green-500" />
                  <Label className="text-xs font-medium">Padding</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">All sides:</Label>
                  <Select value={extractSpacingValue('p').toString()} onValueChange={(v) => updateSpacing('p', parseInt(v))}>
                    <SelectTrigger className="h-8 w-20 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Top</Label>
                  <Select value={extractSpacingValue('pt').toString()} onValueChange={(v) => updateSpacing('pt', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Left</Label>
                  <Select value={extractSpacingValue('pl').toString()} onValueChange={(v) => updateSpacing('pl', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Right</Label>
                  <Select value={extractSpacingValue('pr').toString()} onValueChange={(v) => updateSpacing('pr', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Bottom</Label>
                  <Select value={extractSpacingValue('pb').toString()} onValueChange={(v) => updateSpacing('pb', parseInt(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="0px" />
                    </SelectTrigger>
                    <SelectContent>
                      {spacingValues.map((val) => (
                        <SelectItem key={val} value={val.toString()}>{val}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
             
              {(extractSpacingValue('p') > 0 || extractSpacingValue('pt') > 0 || extractSpacingValue('pr') > 0 || extractSpacingValue('pb') > 0 || extractSpacingValue('pl') > 0) && (
                <div className="flex gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 backdrop-blur-sm p-2 rounded">
                  <span className="text-yellow-700"><Info className='w-3 h-4' /> </span>Padding creates space inside the element
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="border" className="space-y-4">
            {/* Border Width */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-purple-500" />
                <Label className="text-xs font-medium">Border Width</Label>
              </div>
              <Select value={extractBorderWidth().toString()} onValueChange={(v) => updateBorderWidth(parseInt(v))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="0px" />
                </SelectTrigger>
                <SelectContent>
                  {borderWidthValues.map((val) => (
                    <SelectItem key={val} value={val.toString()}>
                      {val === 0 ? 'No border' : `${val}px border`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
            </div>

            {/* Border Color - only show if border width > 0 */}
            {extractBorderWidth() > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-500" />
                  <Label className="text-xs font-medium">Border Color</Label>
                </div>
                <ColorPicker
                  value={value}
                  onChange={updateBorderColor}
                  prefix="border"
                  allowOpacity={true}
                />
              </div>
            )}

            {/* Border Radius */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CornerUpLeft className="w-4 h-4 text-purple-500" />
                <Label className="text-xs font-medium">Border Radius (Corner rounding)</Label>
              </div>
              <Select value={extractBorderRadius()} onValueChange={updateBorderRadius}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="No rounding" />
                </SelectTrigger>
                <SelectContent>
                  {borderRadiusValues.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label} {item.value !== 'rounded-none' && '(Rounded corners)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
             
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            {/* Background Color */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PaintBucket className="w-4 h-4 text-blue-500" />
                <Label className="text-xs font-medium">Background Color</Label>
              </div>
              <ColorPicker
                value={value}
                onChange={updateBackgroundColor}
                prefix="bg"
                allowOpacity={true}
              />
            </div>

            {/* Text Color */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <Label className="text-xs font-medium">Text Color</Label>
              </div>
              <ColorPicker
                value={value}
                onChange={updateTextColor}
                prefix="text"
                allowOpacity={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            {/* Box Shadow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <Label className="text-xs font-medium">Drop Shadow</Label>
              </div>
              <Select value={extractShadow()} onValueChange={updateShadow}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="No shadow" />
                </SelectTrigger>
                <SelectContent>
                  {shadowValues.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label} {item.value !== 'shadow-none' && '(Adds depth)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {extractShadow() !== 'shadow-none' && (
                <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded">
                  <span className="text-yellow-700"><Info className='w-3 h-4' /> </span>Drop shadow adds depth and makes elements appear elevated
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Advanced Custom Classes Input */}
        <div className="space-y-3 pt-4 border-t border-white/10 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Custom Classes (Advanced)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange('')}
              className="h-6 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              title="Clear all styles"
            >
              <Minus className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom Tailwind classes manually..."
            className="text-xs font-mono bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          />
          <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm p-2 rounded">
            <span className="text-yellow-700"><Info className='w-3 h-4' /> </span>You can type any Tailwind CSS classes here for advanced customization
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
