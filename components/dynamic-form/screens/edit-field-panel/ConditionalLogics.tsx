'use client';

import React, {useEffect, useState} from "react";
import { Button } from "web-utils-components/button";
import { Card } from "web-utils-components/card";
import {Textarea} from "web-utils-components/textarea";
import {Label} from "web-utils-components/label";
import {Plus, Trash2} from "lucide-react";

interface ConditionalLogicsProps {
    logics: { trigger: string, action: string }[],
    onSave: (logics: { trigger: string, action: string }[]) => void;
}

export const ConditionalLogics: React.FC<ConditionalLogicsProps> = ({
    logics: logicsProp,
    onSave
}) => {
    const [logics, setLogics] = useState(
        logicsProp?.length ? logicsProp : [{ trigger: '', action: '' }]
    );

    useEffect(() => {
        if (logicsProp?.length) {
            setLogics(logicsProp);
        }
    }, [logicsProp]);

    const updateLogic = (index: number, key: string, value: string) => {
        setLogics((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [key]: value };
            return copy;
        });
    };

    const removeLogic = (index: number) => {
        setLogics((prev) => {
            return prev.filter((_, i) => i !== index) || [];
        });
    };

    const addLogic = () => {
        setLogics((prev) => {
            return [...prev, { trigger: '', action: '' }];
        });
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-medium">Custom logic</Label>
                        <p className="text-xs text-muted-foreground">
                            All the form values are available in the 'data' variable
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addLogic} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Logic
                    </Button>
                </div>
            </div>
            {(logics.map((logic, index) => (
                <Card key={index} className="p-4 border bg-card">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Trigger</Label>
                                <Textarea
                                    placeholder="return true"
                                    value={logic.trigger}
                                    onChange={(e) => updateLogic(index, 'trigger', e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Action</Label>
                                <Textarea
                                    placeholder="return {value: 'qwe', disabled: data.field1 === ''}"
                                    value={logic.action}
                                    onChange={(e) => updateLogic(index, 'action', e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLogic(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            )))}
            <Button
                onClick={() => onSave(logics.filter(logic => logic.trigger.length > 0 || logic.action.length > 0))}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500">
                Save
            </Button>
        </div>
    );
};