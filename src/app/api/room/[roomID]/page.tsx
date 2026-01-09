"use client";

import { useParams } from "next/navigation";
import { format } from "path";
import { useState } from "react";

const Page = () =>{
    const params = useParams();
    const roomID = params.roomID as string;

    const [copystatus,setCopyStatus] = useState("COPY");
    const [timeremain,setTimeRemain] = useState<number|null>(null);

    const copyLink = ()=>{
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopyStatus("COPIED!");
        setTimeout(()=>{
            setCopyStatus("COPY");
        },2000);
    }

    const formatTime = (seconds:number)=>{
        const mins = Math.floor(seconds/60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <main className="flex flex-col h-screen max-h-screen overflow-hidden">
            <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase">
                            Room ID
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-green-500">
                                {roomID}
                            </span>
                            <button className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors" onClick={copyLink}>
                                {copystatus}
                            </button>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-zinc-800"/>
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase">
                            Self-Destruct
                        </span>
                        <span className={`text-sm font-bold flex items-center gap-2 ${timeremain !== null && timeremain <=60 ? 'text-red-500' : 'text-green-400'}`}>
                            {timeremain !== null ? formatTime(timeremain):"--:--"}
                        </span>
                    </div>

                </div>

            </header>
        </main>
    )
}

export default Page;