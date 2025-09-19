'use client';

import { ToggleGroup, ToggleGroupItem } from "web-utils-components/toggle-group";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useState } from "react";
export enum Devices {
  NONE = 'none',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}
type DeviceToggleProps = {
  device?: Devices; 
  onDeviceChange?: (device: Devices) => void;
};

export const DeviceToggle: React.FC<DeviceToggleProps> = ({ device, onDeviceChange }) => {
  const [selectedDevice, setSelectedDevice] = useState<Devices>(device || Devices.NONE);

  return (
    <ToggleGroup
      type="single"
      value={selectedDevice}
      onValueChange={(value) => {
        const newValue = value === selectedDevice ? Devices.NONE : (value as Devices);
        setSelectedDevice(newValue);
        onDeviceChange?.(newValue);
      }}
      className="gap-1 p-1 bg-white/60 dark:bg-slate-700/60 backdrop-blur-md border border-white/30 dark:border-slate-600/30 rounded-lg"
    >
      <ToggleGroupItem className="h-7 w-7 p-0 data-[state=on]:bg-white/80 dark:data-[state=on]:bg-slate-800/80 data-[state=on]:backdrop-blur-sm" value={Devices.DESKTOP}>
        <Monitor size={14} />
      </ToggleGroupItem>
      <ToggleGroupItem className="h-7 w-7 p-0 data-[state=on]:bg-white/80 dark:data-[state=on]:bg-slate-800/80 data-[state=on]:backdrop-blur-sm" value={Devices.TABLET}>
        <Tablet size={14} />
      </ToggleGroupItem>
      <ToggleGroupItem className="h-7 w-7 p-0 data-[state=on]:bg-white/80 dark:data-[state=on]:bg-slate-800/80 data-[state=on]:backdrop-blur-sm" value={Devices.MOBILE}>
        <Smartphone size={14} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};