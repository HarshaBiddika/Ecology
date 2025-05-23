import { match } from "assert";
import { useState,useEffect } from "react";

export function useMediaQuery (query:string):boolean {
    const [matches,setMatches]=useState(false);
    useEffect(()=>{
        const media=window.matchMedia(query);

        if(media.matches!=matches){
            setMatches(media.matches);
        }
        const Listener=()=>setMatches(media.matches);
        media.addListener(Listener);
        return()=>media.removeListener(Listener);

    },[matches,query]);

    return matches;
}