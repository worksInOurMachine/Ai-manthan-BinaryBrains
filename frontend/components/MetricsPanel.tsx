"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Coffee, Eye, Percent } from "lucide-react";

type Props = {
    blinkRate?: number;
    confidence?: number; // 0..1
    nervousness?: number; // 0..1
    happy?: number; // 0..1
    sad?: number; // 0..1
};

export default function MetricsPanelCompact({
    blinkRate = 0,
    confidence = 0,
    nervousness = 0,
    happy = 0,
    sad = 0,
}: Props) {
    const confPct = Math.round((Number.isFinite(confidence) ? confidence : 0) * 100);
    const clamp = (v: number) => Math.max(0, Math.min(1, v || 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="w-full"
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* compact stat cards */}
                <Card className="py-2 px-3 h-16 flex items-center gap-3 shadow-sm flex-row justify-between">
                    <div className="w-8 h-8 rounded-md bg-muted/40 flex items-center justify-center">
                        <Eye size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">Blink Rate</div>
                        <div className="text-lg font-semibold">{blinkRate} / min</div>
                    </div>
                </Card>

                <Card className="py-2 px-3 h-16 flex items-center gap-3 shadow-sm flex-row justify-between">
                    <div className="w-8 h-8 rounded-md bg-muted/40 flex items-center justify-center">
                        <Percent size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">Confidence</div>
                        <div className="text-lg font-semibold">{confPct}%</div>
                    </div>
                </Card>

                <Card className="py-2 px-3 h-16 flex items-center gap-3 shadow-sm flex-row justify-between">
                    <div className="w-8 h-8 rounded-md bg-muted/40 flex items-center justify-center">
                        <Coffee size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">Nervous</div>
                        <div className="text-lg font-semibold">{Math.round(clamp(nervousness) * 100)}%</div>
                    </div>
                </Card>
            </div>

            {/* compact progress strip */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-3 h-20 flex-col gap-1 justify-between flex shadow-sm">
                    <CardHeader className="p-0">
                        <CardTitle className="text-[13px]">Nervousness</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex items-center gap-2">
                        <Progress value={clamp(nervousness) * 100} className="h-2 rounded-full" />
                        <div className="text-xs text-muted-foreground">{Math.round(clamp(nervousness) * 100)}%</div>
                    </CardContent>
                </Card>

                <Card className="p-3 h-20 flex-col gap-1 justify-between flex shadow-sm">
                    <CardHeader className="p-0">
                        <CardTitle className="text-[13px]">Happy</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex items-center gap-2">
                        <Progress value={clamp(happy) * 100} className="h-2 rounded-full" />
                        <div className="text-xs text-muted-foreground">{Math.round(clamp(happy) * 100)}%</div>
                    </CardContent>
                </Card>

                <Card className="p-3 h-20 flex-col gap-1 justify-between flex shadow-sm">
                    <CardHeader className="p-0">
                        <CardTitle className="text-[13px]">Sad</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0  flex items-center gap-2">
                        <Progress value={clamp(sad) * 100} className="h-2 rounded-full" />
                        <div className="text-xs text-muted-foreground">{Math.round(clamp(sad) * 100)}%</div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
