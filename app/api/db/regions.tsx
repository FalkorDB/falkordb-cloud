import { REGIONS_IDS } from "./redionsIDs"
import { EC2Client } from "@aws-sdk/client-ec2"
import { ECSClient } from "@aws-sdk/client-ecs"

export interface Region {
    id: string,
    name: string,
    clusterARN: string,
    subnets: string[],
    securityGroups: string[],
    ecsClient: ECSClient,
    ec2Client: EC2Client,
}

export const REGIONS = new Map<string, Region>([
    [REGIONS_IDS.USWest1, {
        id: REGIONS_IDS.USWest1,
        name: "US West (N. California)",
        clusterARN: `arn:aws:ecs:${REGIONS_IDS.USWest1}:119146126346:cluster/falkordb`,
        subnets: ["subnet-06f5cd0dac73758a3", "subnet-08906db1b84f86b9b"],
        securityGroups: ["sg-06a0e139cc306b538"],
        ecsClient: new ECSClient({ region: REGIONS_IDS.USWest1 }),
        ec2Client: new EC2Client({ region: REGIONS_IDS.USWest1 }),
    }],
    [REGIONS_IDS.USEast1, {
        id: REGIONS_IDS.USEast1,
        name: "US East (N. Virginia)",
        clusterARN: `arn:aws:ecs:${REGIONS_IDS.USEast1}:119146126346:cluster/falkordb`,
        subnets: ["subnet-064d4593bcc4281d3", "subnet-05b505fdd0c91c1ef", "subnet-0a6d6770f48073215",
         "subnet-0218d5f6d8d126cf8", "subnet-0f12661ea50f174af", "subnet-081dca44d75d682aa"],
        securityGroups: ["sg-001af2d061389f23d"],
        ecsClient: new ECSClient({ region: REGIONS_IDS.USEast1 }),
        ec2Client: new EC2Client({ region: REGIONS_IDS.USEast1 }),
    }],
    [REGIONS_IDS.EUNorth1, {
        id: REGIONS_IDS.EUNorth1,
        name: "EU (Stockholm)",
        clusterARN: `arn:aws:ecs:${REGIONS_IDS.EUNorth1}:119146126346:cluster/falkordb`,
        subnets: ["subnet-0ac7acfa826d2cf34", "subnet-0d30dcd35f5137131", "subnet-0e83c5e80342eba32"],
        securityGroups: ["sg-0ca5b0efa5707eb91"],
        ecsClient: new ECSClient({ region:REGIONS_IDS.EUNorth1 }),
        ec2Client: new EC2Client({ region: REGIONS_IDS.EUNorth1 }),
    }],
    [REGIONS_IDS.EUCentral1, {
        id: REGIONS_IDS.EUCentral1,
        name: "EU (Frankfurt)",
        clusterARN: `arn:aws:ecs:${REGIONS_IDS.EUCentral1}:119146126346:cluster/falkordb`,
        subnets: ["subnet-07543bc3c42504837", "subnet-03b9dbe2257177eda", "subnet-0453f0f79305ce7a6"],
        securityGroups: ["sg-0d45fcd27e08fa97f"],
        ecsClient: new ECSClient({ region: REGIONS_IDS.EUCentral1 }),
        ec2Client: new EC2Client({ region: REGIONS_IDS.EUCentral1 }),
    }],
    [REGIONS_IDS.APSouth1, {
        id: REGIONS_IDS.APSouth1,
        name: "Asia Pacific (Mumbai)",
        clusterARN: `arn:aws:ecs:${REGIONS_IDS.APSouth1}:119146126346:cluster/falkordb`,
        subnets: ["subnet-066c8eedfcba2ec04", "subnet-0f140bd96427b3de9", "subnet-0c867f841a2568541"],
        securityGroups: ["sg-0612316bbee7c5040"],
        ecsClient: new ECSClient({ region: REGIONS_IDS.APSouth1 }),
        ec2Client: new EC2Client({ region: REGIONS_IDS.APSouth1 }),
    }]
])

