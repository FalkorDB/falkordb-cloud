"use client"

import { Button } from "@/components/ui/button";
import { Combobox } from "@/app/components/combobox";
import { useState } from "react";
import { REGIONS_IDS } from "../api/db/redionsIDs";
import { Checkbox } from "@/components/ui/checkbox";

const regions = Object.values(REGIONS_IDS)

export function Create(props: { onCreate: (region:string, tls: boolean)=>void }) {
    
    const [useTLS, setUseTLS] = useState(false)
    const [regionID, selectedRegion] = useState<string>(regions[0]);

    return (
        <div className="flex flex-wrap">
            <div className="flex items-center space-x-2 p-4 shadow-lg rounded-lg border border-gray-300 m-2 bg-white">
                <Checkbox id="use_tls " checked={useTLS} onCheckedChange={(value) => setUseTLS(value === true)}/>
                <label htmlFor="use_tls" className="text-1xl" >
                    Use TLS
                </label>
            </div>
            <Combobox className="text-1xl p-8 shadow-lg rounded-lg border border-gray-300 w-56 m-2"
                type={"Regions"}
                options={regions}
                selectedValue={regionID} 
                setSelectedValue={selectedRegion} />
            <Button className="bg-blue-600 text-2xl p-8 text-slate-50 m-2" onClick={()=>props.onCreate(regionID, useTLS)}>Create Sandbox</Button>
        </div>
    );
}

