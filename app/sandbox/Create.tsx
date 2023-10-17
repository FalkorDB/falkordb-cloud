"use client"

import { Button } from "@/components/ui/button";
import { Combobox } from "@/app/components/combobox";
import { useState } from "react";
import { REGIONS_IDS } from "../api/db/redionsIDs";

const regions = Object.values(REGIONS_IDS)

export function Create(props: { onCreate: (region:string, tls: boolean)=>void }) {
    
    
    const [regionID, selectedRegion] = useState<string>(regions[0]);

    return (
        <>
            <Combobox className="text-1xl p-8 shadow-lg rounded-lg border border-gray-300 w-56"
                type={"Regions"}
                options={regions}
                selectedValue={regionID} 
                setSelectedValue={selectedRegion} />
            <Button className="bg-blue-600 text-4xl p-8 text-slate-50" onClick={()=>props.onCreate(regionID, false)}>Create Sandbox</Button>
            <Button className="bg-blue-600 text-4xl p-8 text-slate-50" onClick={()=>props.onCreate(regionID, true)}>Create Sandbox with TLS</Button>
        </>
    );
}

