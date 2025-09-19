import React, { useEffect, useRef, useState } from "react";
import { FileText, Pencil } from "lucide-react";

interface EditableTitleProps {
  title: string;
  onChange: (updatedTitle: string) => void;
  className?: string;
  maxWidth?: string; // optional override
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  onChange,
  className = "",
  maxWidth = "max-w-[250px]" // default max width
}) => {
  const [editing, setEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (currentTitle.trim() !== title) {
      onChange(currentTitle.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setCurrentTitle(title);
      setEditing(false);
    }
  };

  return (
    <div className={`relative group ${maxWidth} ${className}`}>
        <div className="flex gap-2 items-center">
            <div className="w-auto">
                <FileText className="text-gray-800 dark:text-gray-200" strokeWidth={1.5} size={30} />
            </div>
            
            <div className="flex flex-col">
                {editing ? (
                    <div className={`flex items-center ${maxWidth}`}>
                        <input
                            ref={inputRef}
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className={`text-base font-semibold focus:outline-none bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-md px-2 py-1 text-gray-900 dark:text-gray-100 w-full`}
                        />
                    </div>
                    
                ) : (
                    <div 
                        className="cursor-pointer flex items-center group"
                        onClick={() => setEditing(true)}
                        >
                        
                        <span
                            className={`text-base font-semibold truncate overflow-hidden inline-block whitespace-nowrap ${maxWidth}`}
                            title={title}
                        >
                            {title}
                        </span>
                        <Pencil
                            size={16}
                            className="ml-1 opacity-0 group-hover:opacity-80 transition-opacity"
                        />
                    </div>
                )}
                
                <span className="text-sm text-muted-foreground">Draft • autosaved</span>
            </div>
        </div>
      
    </div>
  );
};

export default EditableTitle;
